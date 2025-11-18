import Reward from "../models/Reward.js";
import User from "../models/User.js";

// Get all available rewards
export const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Claim a reward (deduct points from user)
export const claimReward = async (req, res) => {
  try {
    const { userId, rewardId } = req.body;

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has enough points
    if ((user.points || 0) < reward.costPoints) {
      return res.status(400).json({ message: "Not enough points to claim this reward" });
    }

    // Deduct points
    user.points -= reward.costPoints;

    // Add badge/reward to user (track claimed rewards)
    if (!user.badges) user.badges = [];
    user.badges.push(`${reward.title} (${new Date().toLocaleDateString()})`);

    await user.save();

    res.json({ message: "Reward claimed successfully", user, reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's claimed rewards/badges
export const getUserRewards = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ badges: user.badges || [], points: user.points || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
