import React, { useEffect, useState } from 'react'
import { fetchChallenges, createChallenge, joinChallenge } from '../api'

export default function ChallengesPage({ userId }) {
  const [challenges, setChallenges] = useState([])
  const [title, setTitle] = useState('')
  const [goalType, setGoalType] = useState('daily')
  const [goalValue, setGoalValue] = useState(1)

  const load = async () => {
    try {
      const res = await fetchChallenges()
      setChallenges(res.data || [])
    } catch (err) {
      console.error('[ChallengesPage] load', err)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createChallenge({ title, creator: userId, goalType, goalValue })
      setTitle('')
      load()
      alert('Challenge created')
    } catch (err) {
      console.error('[ChallengesPage] create', err)
    }
  }

  const handleJoin = async (id) => {
    try {
      await joinChallenge(id, userId)
      alert('Joined')
      load()
    } catch (err) {
      console.error('[ChallengesPage] join', err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Challenges</h2>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Challenge title" className="border p-2 rounded flex-1" />
        <select value={goalType} onChange={(e) => setGoalType(e.target.value)} className="border p-2 rounded">
          <option value="daily">Daily</option>
          <option value="timesPerWeek">Times / Week</option>
        </select>
        <input type="number" min={1} value={goalValue} onChange={(e) => setGoalValue(e.target.value)} className="border p-2 rounded w-24" />
        <button className="bg-rose-500 text-white px-4 py-2 rounded">Create</button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        {challenges.length === 0 ? <div className="text-slate-500">No challenges</div> : (
          <div className="flex flex-col gap-2">
            {challenges.map(c => (
              <div key={c._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-slate-500">By {c.creatorName || c.creator}</div>
                </div>
                <div>
                  <button onClick={() => handleJoin(c._id)} className="bg-emerald-500 text-white px-3 py-1 rounded">Join</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
