import { Router } from "express"
import { authMiddleware } from "../middleware/auth.js"
import {
    startQuizSession,
    submitQuizAnswer,
    completeQuizSession,
    getQuizHistory
} from "../services/quizService.js"
import { getMultiplayerHistory } from "../services/multiplayerService.js"

const router = Router()

router.use(authMiddleware)

router.post("/start", async (req, res) => {
    try {
        const { topicId, subjectId, categoryId, count = 10 } = req.body

        // require at least a category or more specific scope
        if (!categoryId && !subjectId && !topicId) {
            return res.status(400).json({ error: "categoryId, subjectId or topicId is required" })
        }

        const safeCount = Math.min(Math.max(count, 5), 100)

        const result = await startQuizSession(
            req.user.id,
            { categoryId, subjectId, topicId },
            safeCount
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

router.get("/multiplayer/history", async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1
        const history = await getMultiplayerHistory(req.user.id, req.user.username, page)
        res.json(history)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
