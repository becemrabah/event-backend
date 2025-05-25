import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import eventRoutes from './routes/eventRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
const app = express()
app.use(express.json()); 
dotenv.config()
app.use(cors())
app.use(express.json())
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/dashboard', dashboardRoutes);

export default app
