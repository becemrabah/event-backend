import Event from '../models/Event.js'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  location: z.string().min(1),
  participants: z.number().int().nonnegative(),
})

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id }).sort({ date: 1 })
    res.json(events)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createEvent = async (req, res) => {
  try {
    const data = eventSchema.parse(req.body)
    const event = new Event({ ...data, date: new Date(data.date), user: req.user.id })
    await event.save()
    res.status(201).json(event)
  } catch (error) {
    res.status(400).json({ message: error.errors || error.message })
  }
}

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    res.json({ message: 'Event deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
