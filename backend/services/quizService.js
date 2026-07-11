import prisma from "../lib/prisma.js"

const QUESTION_TIME_LIMIT_SECONDS = 10

const POINTS_BY_DIFFICULTY = {
    EASY: 10,
    MEDIUM: 15,
    HARD: 20
}

function shuffle(array) {
    const copy = [...array]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

function stripAnswer(question) {
    return {
        id: question.id,
        questionText: question.questionText,
        options: question.options,
        difficulty: question.difficulty,
        timeLimit: QUESTION_TIME_LIMIT_SECONDS
    }
}

function calculatePoints(difficulty, timeTakenSeconds) {
    const base = POINTS_BY_DIFFICULTY[difficulty] ?? 10
    const speedBonus =
        timeTakenSeconds !== null && timeTakenSeconds < 10 ? 5 : 0
    return base + speedBonus
}

/**
 * Pick random questions for a playground session.
 */
export async function pickQuestionsForTopic(topicId, count) {
    const allQuestions = await prisma.question.findMany({
        where: { topicId }
    })

    if (allQuestions.length === 0) {
        throw new Error("No questions found for this topic")
    }

    const questionCount = Math.min(count, allQuestions.length)
    return shuffle(allQuestions).slice(0, questionCount)
}

/**
 * Pick questions for a broader scope: topic, subject or category.
 * scope: { topicId?, subjectId?, categoryId? }
 */
export async function pickQuestionsForScope(scope, count) {
    if (scope.topicId) {
        return pickQuestionsForTopic(scope.topicId, count)
    }

    let where = {}
    if (scope.subjectId) {
        where = { topic: { subjectId: scope.subjectId } }
    } else if (scope.categoryId) {
        where = { topic: { subject: { categoryId: scope.categoryId } } }
    }

    const allQuestions = await prisma.question.findMany({
        where,
        include: { topic: true }
    })

    if (!allQuestions || allQuestions.length === 0) {
        throw new Error("No questions found for the selected scope")
    }

    const questionCount = Math.min(count, allQuestions.length)
    return shuffle(allQuestions).slice(0, questionCount)
}

/**
 * Start a playground quiz session (saved to database).
 */
export async function startQuizSession(userId, scope, count) {
    // scope can be { topicId } or { subjectId } or { categoryId }
    // pick questions accordingly
    const questions = await pickQuestionsForScope(scope, count)

    // determine a representative topic for the session record (use first question's topic)
    const firstTopicId = questions[0].topicId || questions[0].topic?.id
    let topicInfo = { name: "Mixed topics", slug: "mixed", subject: "", category: "" }

    if (scope.topicId) {
        const topic = await prisma.topic.findUnique({
            where: { id: scope.topicId },
            include: { subject: { include: { category: true } } }
        })
        if (!topic) throw new Error("Topic not found")
        topicInfo = {
            name: topic.name,
            slug: topic.slug,
            subject: topic.subject.name,
            category: topic.subject.category.name
        }
    } else if (scope.subjectId) {
        const subject = await prisma.subject.findUnique({
            where: { id: scope.subjectId },
            include: { category: true }
        })
        if (!subject) throw new Error("Subject not found")
        topicInfo = { name: `All topics in ${subject.name}`, slug: `subject-${subject.id}`, subject: subject.name, category: subject.category.name }
    } else if (scope.categoryId) {
        const category = await prisma.category.findUnique({ where: { id: scope.categoryId } })
        if (!category) throw new Error("Category not found")
        topicInfo = { name: `All topics in ${category.name}`, slug: `category-${category.id}`, subject: "", category: category.name }
    }

    const session = await prisma.quizSession.create({
        data: {
            userId,
            topicId: firstTopicId,
            totalQuestions: questions.length,
            correctAnswers: 0,
            score: 0
        }
    })

    return {
        sessionId: session.id,
        totalQuestions: questions.length,
        timeLimit: QUESTION_TIME_LIMIT_SECONDS,
        topic: topicInfo,
        questions: questions.map(stripAnswer)
    }
}

/**
 * Submit one answer during a playground session.
 */
export async function submitQuizAnswer({
    userId,
    sessionId,
    questionId,
    selectedAnswer,
    timeTakenSeconds
}) {
    const session = await prisma.quizSession.findFirst({
        where: { id: sessionId, userId }
    })

    if (!session) {
        throw new Error("Session not found")
    }

    if (session.completedAt) {
        throw new Error("Session already completed")
    }

    const question = await prisma.question.findUnique({
        where: { id: questionId }
    })

    if (!question) {
        throw new Error("Question not found")
    }

    const alreadyAnswered = await prisma.quizAttempt.findFirst({
        where: { sessionId, questionId }
    })

    if (alreadyAnswered) {
        throw new Error("Question already answered in this session")
    }

    const isCorrect = selectedAnswer === question.correctAnswer
    const points = isCorrect
        ? calculatePoints(question.difficulty, timeTakenSeconds)
        : 0

    await prisma.quizAttempt.create({
        data: {
            userId,
            sessionId,
            questionId,
            selectedAnswer,
            isCorrect,
            timeTakenSeconds
        }
    })

    await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
            correctAnswers: { increment: isCorrect ? 1 : 0 },
            score: { increment: points }
        }
    })

    return {
        isCorrect,
        points,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation
    }
}

/**
 * Mark a playground session as complete.
 */
export async function completeQuizSession(userId, sessionId) {
    const session = await prisma.quizSession.findFirst({
        where: { id: sessionId, userId },
        include: {
            topic: {
                include: {
                    subject: { include: { category: true } }
                }
            }
        }
    })

    if (!session) {
        throw new Error("Session not found")
    }

    if (session.completedAt) {
        return formatSessionResult(session)
    }

    const updated = await prisma.quizSession.update({
        where: { id: sessionId },
        data: { completedAt: new Date() },
        include: {
            topic: {
                include: {
                    subject: { include: { category: true } }
                }
            }
        }
    })

    return formatSessionResult(updated)
}

/**
 * Paginated quiz history for the logged-in user.
 */
export async function getQuizHistory(userId, page = 1, limit = 20) {
    const safePage = Math.max(1, page)
    const safeLimit = Math.min(Math.max(1, limit), 50)
    const skip = (safePage - 1) * safeLimit

    const [sessions, total] = await Promise.all([
        prisma.quizSession.findMany({
            where: { userId, completedAt: { not: null } },
            orderBy: { completedAt: "desc" },
            skip,
            take: safeLimit,
            include: {
                topic: {
                    include: {
                        subject: { include: { category: true } }
                    }
                }
            }
        }),
        prisma.quizSession.count({
            where: { userId, completedAt: { not: null } }
        })
    ])

    return {
        sessions: sessions.map(formatSessionResult),
        total,
        page: safePage,
        totalPages: Math.ceil(total / safeLimit) || 1
    }
}

function formatSessionResult(session) {
    return {
        id: session.id,
        score: session.score,
        correctAnswers: session.correctAnswers,
        totalQuestions: session.totalQuestions,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        category: session.topic.subject.category.name,
        subject: session.topic.subject.name,
        topic: session.topic.name
    }
}
