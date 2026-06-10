import { Router } from "express"
import authRoutes from "./auth.js"
import contentRoutes from "./content.js"
import practiceRoutes from "./practice.js"
import quizRoutes from "./quiz.js"
import analyticsRoutes from "./analytics.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/content", contentRoutes)
router.use("/practice", practiceRoutes)
router.use("/quiz", quizRoutes)
router.use("/analytics", analyticsRoutes)

export default router
