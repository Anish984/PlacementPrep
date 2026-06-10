import { Router } from "express"
import { authMiddleware } from "../middleware/auth.js"
import {
    startQuizSession,
    submitQuizAnswer,
    completeQuizSession,
    getQuizHistory
} from "../services/quizService.js"

const router = Router()

router.use(authMiddleware)

router.post("/start", async (req, res) => {
    try {
        const { topicId, count = 10 } = req.body

        if (!topicId) {
            return res.status(400).json({ error: "topicId is required" })
        }

        const result = await startQuizSession(
            req.user.id,
            topicId,
            Math.min(Math.max(count, 5), 50)
        )

        res.json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post("/submit", async (req, res) => {
    try {
        const { sessionId, questionId, selectedAnswer, timeTakenSeconds } = req.body

        if (!sessionId || !questionId || selectedAnswer === undefined) {
            return res.status(400).json({ error: "Missing required fields" })
        }

        const result = await submitQuizAnswer({
            userId: req.user.id,
            sessionId,
            questionId,
            selectedAnswer,
            timeTakenSeconds
        })

        res.json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.post("/complete", async (req, res) => {
    try {
        const { sessionId } = req.body

        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" })
        }

        const result = await completeQuizSession(req.user.id, sessionId)
        res.json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get("/history", async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1
        const history = await getQuizHistory(req.user.id, page)
        res.json(history)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
