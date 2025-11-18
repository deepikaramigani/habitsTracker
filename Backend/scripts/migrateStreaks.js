import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Checkin from '../models/Checkin.js'
import Habit from '../models/Habit.js'
import User from '../models/User.js'
import dayjs from 'dayjs'

dotenv.config()

const compute = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to DB for migration')

  const habits = await Habit.find()
  for (const h of habits) {
    const checkins = await Checkin.find({ habitId: h._id }).sort({ date: 1 })
    let longest = 0
    let current = 0
    let prev = null
    for (const c of checkins) {
      const d = dayjs(c.date).startOf('day')
      if (!prev) { current = 1 }
      else {
        if (d.diff(prev, 'day') === 1) current += 1
        else if (d.isSame(prev, 'day')) { /* ignore duplicates */ }
        else current = 1
      }
      if (current > longest) longest = current
      prev = d
    }

    // current streak: check if last checkin was yesterday or today
    let lastCheckin = checkins.length ? checkins[checkins.length - 1].date : null
    let curStreak = 0
    if (lastCheckin) {
      const last = dayjs(lastCheckin).startOf('day')
      const today = dayjs().startOf('day')
      if (last.isSame(today)) {
        // count back
        let idx = checkins.length - 1
        let cnt = 0
        let cur = dayjs(checkins[idx].date).startOf('day')
        while (idx >= 0 && (today.diff(cur, 'day') === cnt)) {
          cnt++
          idx--
          if (idx >= 0) cur = dayjs(checkins[idx].date).startOf('day')
        }
        curStreak = cnt
      } else if (last.isSame(today.subtract(1, 'day'))) {
        // yesterday
        // compute similarly
        let idx = checkins.length - 1
        let cnt = 0
        let cur = dayjs(checkins[idx].date).startOf('day')
        const yesterday = dayjs().startOf('day').subtract(1, 'day')
        while (idx >= 0 && cur.isSame(yesterday.subtract(cnt, 'day'))) {
          cnt++
          idx--
          if (idx >= 0) cur = dayjs(checkins[idx].date).startOf('day')
        }
        curStreak = cnt
      }
    }

    h.longestStreak = longest
    h.currentStreak = curStreak
    h.lastCheckinAt = checkins.length ? checkins[checkins.length - 1].date : null
    await h.save()
    console.log('Updated habit', h._id.toString(), 'current', curStreak, 'longest', longest)
  }

  // compute basic user points as 10 points per checkin
  const users = await User.find()
  for (const u of users) {
    const userCheckins = await Checkin.countDocuments({})
    // WARNING: this is a simplistic global computation; a better approach is to sum per user's habits
    const habitsOfUser = await Habit.find({ userId: u._id })
    let totalCheckins = 0
    for (const h of habitsOfUser) {
      totalCheckins += await Checkin.countDocuments({ habitId: h._id })
    }
    u.points = totalCheckins * 10
    await u.save()
    console.log('Updated user', u._id.toString(), 'points', u.points)
  }

  console.log('Migration complete')
  process.exit(0)
}

compute()
