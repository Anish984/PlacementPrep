import { Router } from "express"
import { authMiddleware } from "../middleware/auth.js"
import {
    getDashboardOverview,
    getWeakTopics
} from "../services/analyticsService.js"

const router = Router()

router.use(authMiddleware)

router.get("/dashboard", async (req, res) => {
    try {
        const overview = await getDashboardOverview(req.user.id)
        res.json(overview)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get("/weak-topics", async (req, res) => {
    try {
        const topics = await getWeakTopics(req.user.id)
        res.json(topics)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
