import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  date: { type: Date, required: true },
  lieu: { type: String, required: true },
  nbParticipants: { type: Number, required: true, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})


export default mongoose.model('Event', eventSchema)
