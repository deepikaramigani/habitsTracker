import mongoose from 'mongoose'

const rewardSchema = new mongoose.Schema({
  title: String,
  description: String,
  costPoints: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Reward', rewardSchema)
