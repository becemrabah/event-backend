import express from 'express'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const router = express.Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

// Validation avec Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

router.post('/register', async (req, res) => {
  try {

    const { email, password } = registerSchema.parse(req.body)

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'Email déjà utilisé' })


    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)


    const newUser = new User({ email, passwordHash })
    await newUser.save()

   
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.status(201).json({ token, email: newUser.email })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: "Email ou mot de passe invalide" })

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: "Email ou mot de passe invalide" })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })

    res.json({ token, email: user.email })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors })
    }
    console.error(err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
})

export default router
