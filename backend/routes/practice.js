import { Router } from "express"
import { checkPracticeAnswer } from "../services/practiceService.js"

const router = Router()

/**
 * Check an answer during practice mode. Nothing is persisted.
 */
router.post("/check", async (req, res) => {
    try {
        const { questionId, selectedAnswer } = req.body

        if (!questionId || selectedAnswer === undefined) {
            return res.status(400).json({ error: "questionId and selectedAnswer are required" })
        }

        const result = await checkPracticeAnswer(questionId, selectedAnswer)
        res.json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

export default router
