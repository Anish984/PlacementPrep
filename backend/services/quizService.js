import prisma from "../lib/prisma.js"

const QUESTION_TIME_LIMIT_SECONDS = 30

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
 * Start a playground quiz session (saved to database).
 */
export async function startQuizSession(userId, topicId, count) {
    const topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
            subject: { include: { category: true } }
        }
    })

    if (!topic) {
        throw new Error("Topic not found")
    }

    const questions = await pickQuestionsForTopic(topicId, count)

    const session = await prisma.quizSession.create({
        data: {
            userId,
            topicId,
            totalQuestions: questions.length,
            correctAnswers: 0,
            score: 0
        }
    })

    return {
        sessionId: session.id,
        totalQuestions: questions.length,
        timeLimit: QUESTION_TIME_LIMIT_SECONDS,
        topic: {
            name: topic.name,
            slug: topic.slug,
            subject: topic.subject.name,
            category: topic.subject.category.name
        },
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
