import React, { useEffect, useState } from 'react'
import { fetchHabitStats } from '../api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function Charts({ habitId, range = 30 }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchHabitStats(habitId, range)
        // backend returns array {date, count}
        setData(res.data || [])
      } catch (err) {
        console.error('[Charts] load error', err)
      } finally {
        setLoading(false)
      }
    }
    if (habitId) load()
  }, [habitId, range])

  if (!habitId) return <div className="p-4 text-sm text-slate-500">Select a habit to view chart.</div>
  if (loading) return <div className="p-4">Loading chart...</div>

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Progress (last {range} days)</h3>
      <div style={{ height: 220 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
