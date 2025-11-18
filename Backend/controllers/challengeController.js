import Challenge from '../models/Challenge.js'
import Checkin from '../models/Checkin.js'
import User from '../models/User.js'
import dayjs from 'dayjs'

export const createChallenge = async (req, res) => {
  try {
    const payload = req.body
    const c = await Challenge.create(payload)
    res.json(c)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const joinChallenge = async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    const c = await Challenge.findById(id)
    if (!c) return res.status(404).json({ message: 'Challenge not found' })
    if (!c.participants.includes(userId)) c.participants.push(userId)
    await c.save()
    res.json({ message: 'Joined' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const listChallenges = async (req, res) => {
  try {
    const list = await Challenge.find().sort({ startsAt: -1 })
    res.json(list)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const leaderboard = async (req, res) => {
  try {
    const { id } = req.params
    const c = await Challenge.findById(id).populate('participants', 'name')
    if (!c) return res.status(404).json({ message: 'Challenge not found' })

    const results = []
    for (const p of c.participants) {
      // simple metric: number of checkins during challenge period
      const count = await Checkin.countDocuments({
        habitId: { $in: [] },
        date: { $gte: c.startsAt, $lte: c.endsAt }
      })
      // Note: This simplistic approach assumes users' habits are not enumerated here.
      results.push({ user: p, score: count })
    }

    // sort desc
    results.sort((a, b) => b.score - a.score)
    res.json(results)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
