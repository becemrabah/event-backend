import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const register = async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body)

    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'Email already exists' })

    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = new User({ email, passwordHash })
    await newUser.save()

    res.status(201).json({ message: 'User registered' })
  } catch (error) {
    res.status(400).json({ message: error.errors || error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' })

    res.json({ token, user: { email: user.email, id: user._id } })
  } catch (error) {
    res.status(400).json({ message: error.errors || error.message })
  }
}
