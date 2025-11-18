import express from "express";
import { getRewards, claimReward, getUserRewards } from "../controllers/rewardController.js";

const router = express.Router();

router.get("/", getRewards);
router.post("/claim", claimReward);
router.get("/:userId", getUserRewards);

export default router;
