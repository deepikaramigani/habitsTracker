import express from 'express'
import { getStats, getProgress } from '../controllers/habitStatsController.js'

const router = express.Router()

router.get('/:id/stats', getStats)
router.get('/:id/progress', getProgress)

export default router
