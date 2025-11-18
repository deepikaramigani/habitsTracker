import Checkin from '../models/Checkin.js'
import Habit from '../models/Habit.js'
import dayjs from 'dayjs'

// Return daily counts for the past `range` days (default 7)
export const getStats = async (req, res) => {
  try {
    const { id } = req.params
    const range = parseInt(req.query.range) || 7
    const end = dayjs().endOf('day').toDate()
    const start = dayjs().startOf('day').subtract(range - 1, 'day').toDate()

    const pipeline = [
      { $match: { habitId: new (require('mongoose')).Types.ObjectId(id), date: { $gte: start, $lte: end } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]

    const agg = await Checkin.aggregate(pipeline)
    // Build full array of dates
    const result = []
    for (let i = range - 1; i >= 0; i--) {
      const day = dayjs().startOf('day').subtract(i, 'day').format('YYYY-MM-DD')
      const found = agg.find(a => a._id === day)
      result.push({ date: day, count: found ? found.count : 0 })
    }

    res.json({ habitId: id, stats: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProgress = async (req, res) => {
  try {
    const { id } = req.params // habit id
    const habit = await Habit.findById(id)
    if (!habit) return res.status(404).json({ message: 'Habit not found' })

    // Compute progress depending on goal
    const todayStart = dayjs().startOf('day').toDate()
    const weekStart = dayjs().startOf('week').toDate()

    let completed = 0
    let goal = 1

    if (habit.goal && habit.goal.type === 'timesPerWeek') {
      goal = habit.goal.value || 1
      completed = await Checkin.countDocuments({ habitId: id, date: { $gte: weekStart } })
    } else if (habit.goal && habit.goal.type === 'weekly') {
      goal = 1
      completed = await Checkin.countDocuments({ habitId: id, date: { $gte: weekStart } })
    } else {
      // daily
      goal = 1
      const exists = await Checkin.findOne({ habitId: id, date: todayStart })
      completed = exists ? 1 : 0
    }

    res.json({ habitId: id, completed, goal })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
