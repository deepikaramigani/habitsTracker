import React, { useState, useEffect } from 'react'
import { fetchRewards, claimReward, getUserRewards } from '../api'

export default function RewardsPage({ userId }) {
  const [rewards, setRewards] = useState([])
  const [userRewards, setUserRewards] = useState({ points: 0, badges: [] })
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [rewardsRes, userRes] = await Promise.all([
        fetchRewards(),
        getUserRewards(userId)
      ])
      setRewards(rewardsRes.data)
      setUserRewards(userRes.data)
    } catch (err) {
      console.error('[RewardsPage] loadData error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleClaim = async (rewardId) => {
    try {
      setClaiming(rewardId)
      await claimReward(userId, rewardId)
      // Reload user rewards and available rewards
      await loadData()
      alert('🎉 Reward claimed!')
    } catch (err) {
      console.error('[RewardsPage] handleClaim error', err)
      const msg = err?.response?.data?.message || 'Failed to claim reward'
      alert(msg)
    } finally {
      setClaiming(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading rewards...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* User Stats */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="text-3xl font-bold">{userRewards.points || 0}</div>
        <div className="text-sm opacity-90">Total Points Available</div>
      </div>

      {/* Claimed Badges */}
      {userRewards.badges && userRewards.badges.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3">🏆 Claimed Badges</h2>
          <div className="flex flex-wrap gap-2">
            {userRewards.badges.map((badge, idx) => (
              <div key={idx} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Rewards */}
      <div>
        <h2 className="text-xl font-bold mb-3">🎁 Available Rewards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const canAfford = (userRewards.points || 0) >= reward.costPoints
            const isClaiming = claiming === reward._id

            return (
              <div key={reward._id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                <div className="text-4xl mb-2">{reward.icon || '🎁'}</div>
                <h3 className="font-bold text-slate-800">{reward.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-600">{reward.costPoints} pts</span>
                  <button
                    onClick={() => handleClaim(reward._id)}
                    disabled={!canAfford || isClaiming}
                    className={`px-3 py-1 rounded text-sm font-semibold transition ${
                      canAfford
                        ? 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isClaiming ? 'Claiming...' : canAfford ? 'Claim' : 'Need More'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
