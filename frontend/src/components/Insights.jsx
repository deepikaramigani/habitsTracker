import React, { useEffect, useState } from 'react'
import { fetchHabits } from '../api'

export default function Insights({ userId }) {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchHabits(userId)
        setHabits(res.data || [])
      } catch (err) {
        console.error('[Insights] load error', err)
      } finally {
        setLoading(false)
      }
    }
    if (userId) load()
  }, [userId])

  if (loading) return <div className="p-4">Loading insights...</div>

  const total = habits.length
  const avgCurrentStreak = total ? Math.round(habits.reduce((s, h) => s + (h.currentStreak || 0), 0) / total) : 0

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-slate-500">Total Habits</div>
          <div className="text-2xl font-bold">{total}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-slate-500">Avg Current Streak</div>
          <div className="text-2xl font-bold">{avgCurrentStreak}</div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Habits Overview</h3>
        <div className="flex flex-col gap-2">
          {habits.map((h) => (
            <div key={h._id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{h.name}</div>
                <div className="text-sm text-slate-500">{h.category || 'General'}</div>
              </div>
              <div className="text-sm text-slate-600">🔥 {h.currentStreak || 0} • ⭐ {h.longestStreak || 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
