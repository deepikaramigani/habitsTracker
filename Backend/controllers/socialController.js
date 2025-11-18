import User from '../models/User.js'

// Send a friend request from :id to target user
export const sendFriendRequest = async (req, res) => {
  try {
    const { id } = req.params // from
    const { to } = req.body
    const fromUser = await User.findById(id)
    const toUser = await User.findById(to)
    if (!fromUser || !toUser) return res.status(404).json({ message: 'User not found' })

    toUser.friendRequests = toUser.friendRequests || []
    toUser.friendRequests.push({ from: fromUser._id, status: 'pending' })
    await toUser.save()

    res.json({ message: 'Request sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const respondFriendRequest = async (req, res) => {
  try {
    const { id } = req.params // user responding
    const { from, action } = req.body // action: accept|reject
    const user = await User.findById(id)
    const other = await User.findById(from)
    if (!user || !other) return res.status(404).json({ message: 'User not found' })

    // find request
    const reqObj = (user.friendRequests || []).find(r => r.from.toString() === from)
    if (!reqObj) return res.status(404).json({ message: 'Request not found' })

    if (action === 'accept') {
      user.friends = user.friends || []
      other.friends = other.friends || []
      if (!user.friends.includes(other._id)) user.friends.push(other._id)
      if (!other.friends.includes(user._id)) other.friends.push(user._id)
      reqObj.status = 'accepted'
      await other.save()
    } else {
      reqObj.status = 'rejected'
    }

    await user.save()
    res.json({ message: 'Response recorded' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const listFriends = async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).populate('friends', 'name email')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ friends: user.friends || [], requests: user.friendRequests || [] })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
