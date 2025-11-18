import express from 'express'
import { createChallenge, joinChallenge, listChallenges, leaderboard } from '../controllers/challengeController.js'

const router = express.Router()

router.post('/', createChallenge)
router.post('/:id/join', joinChallenge)
router.get('/', listChallenges)
router.get('/:id/leaderboard', leaderboard)

export default router
