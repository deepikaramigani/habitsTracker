import express from 'express'
import { sendFriendRequest, respondFriendRequest, listFriends } from '../controllers/socialController.js'

const router = express.Router()

router.post('/:id/request', sendFriendRequest)
router.post('/:id/respond', respondFriendRequest)
router.get('/:id/friends', listFriends)

export default router
