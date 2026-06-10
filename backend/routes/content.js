import { Router } from "express"
import {
    listCategories,
    listSubjectsByCategorySlug,
    listTopicsBySlugs,
    findTopicBySlugs,
    listPracticeQuestions,
    getContentTree
} from "../services/contentService.js"

const router = Router()

router.get("/categories", async (_req, res) => {
    try {
        const categories = await listCategories()
        res.json(categories)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get("/tree", async (_req, res) => {
    try {
        const tree = await getContentTree()
        res.json(tree)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get("/categories/:categorySlug/subjects", async (req, res) => {
    try {
        const result = await listSubjectsByCategorySlug(req.params.categorySlug)

        if (!result) {
            return res.status(404).json({ error: "Category not found" })
        }

        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.get(
    "/categories/:categorySlug/subjects/:subjectSlug/topics",
    async (req, res) => {
        try {
            const { categorySlug, subjectSlug } = req.params
            const result = await listTopicsBySlugs(categorySlug, subjectSlug)

            if (!result) {
                return res.status(404).json({ error: "Subject not found" })
            }

            res.json(result)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
)

router.get(
    "/categories/:categorySlug/subjects/:subjectSlug/topics/:topicSlug/questions",
    async (req, res) => {
        try {
            const { categorySlug, subjectSlug, topicSlug } = req.params
            const page = parseInt(req.query.page, 10) || 1
            const limit = parseInt(req.query.limit, 10) || 5

            const topic = await findTopicBySlugs(
                categorySlug,
                subjectSlug,
                topicSlug
            )

            if (!topic) {
                return res.status(404).json({ error: "Topic not found" })
            }

            const questions = await listPracticeQuestions(topic.id, page, limit)

            res.json({
                topic: {
                    id: topic.id,
                    name: topic.name,
                    slug: topic.slug,
                    questionCount: topic._count.questions,
                    subject: topic.subject.name,
                    category: topic.subject.category.name
                },
                ...questions
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
)

export default router
