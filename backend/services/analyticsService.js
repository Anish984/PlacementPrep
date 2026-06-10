import prisma from "../lib/prisma.js"

const MIN_ATTEMPTS_FOR_WEAK_TOPIC = 2

/**
 * Build per-topic accuracy from all quiz attempts.
 */
function groupAttemptsByTopic(attempts) {
    const topicStats = {}

    for (const attempt of attempts) {
        const topic = attempt.question.topic
        const topicId = topic.id

        if (!topicStats[topicId]) {
            topicStats[topicId] = {
                topicId,
                topicName: topic.name,
                topicSlug: topic.slug,
                subjectName: topic.subject.name,
                subjectSlug: topic.subject.slug,
                categoryName: topic.subject.category.name,
                categorySlug: topic.subject.category.slug,
                totalAttempts: 0,
                correctAttempts: 0
            }
        }

        topicStats[topicId].totalAttempts++
        if (attempt.isCorrect) {
            topicStats[topicId].correctAttempts++
        }
    }

    return Object.values(topicStats)
}

/**
 * Predict weak topics: lowest accuracy first, only topics with enough data.
 */
export async function getWeakTopics(userId, limit = 5) {
    const attempts = await prisma.quizAttempt.findMany({
        where: { userId },
        include: {
            question: {
                include: {
                    topic: {
                        include: {
                            subject: { include: { category: true } }
                        }
                    }
                }
            }
        }
    })

    return groupAttemptsByTopic(attempts)
        .filter((topic) => topic.totalAttempts >= MIN_ATTEMPTS_FOR_WEAK_TOPIC)
        .map((topic) => {
            const accuracy = Math.round(
                (topic.correctAttempts / topic.totalAttempts) * 100
            )

            return {
                ...topic,
                accuracy,
                weaknessScore: 100 - accuracy
            }
        })
        .sort((a, b) => {
            if (a.accuracy !== b.accuracy) {
                return a.accuracy - b.accuracy
            }
            return b.totalAttempts - a.totalAttempts
        })
        .slice(0, limit)
}

/**
 * Dashboard overview: stats, weak topics, recent quizzes.
 */
export async function getDashboardOverview(userId) {
    const [completedSessions, attemptGroups, weakTopics, recentSessions] =
        await Promise.all([
            prisma.quizSession.count({
                where: { userId, completedAt: { not: null } }
            }),
            prisma.quizAttempt.groupBy({
                by: ["isCorrect"],
                where: { userId },
                _count: true
            }),
            getWeakTopics(userId, 5),
            prisma.quizSession.findMany({
                where: { userId, completedAt: { not: null } },
                orderBy: { completedAt: "desc" },
                take: 5,
                include: {
                    topic: {
                        include: {
                            subject: { include: { category: true } }
                        }
                    }
                }
            })
        ])

    const correctCount =
        attemptGroups.find((group) => group.isCorrect)?._count ?? 0
    const incorrectCount =
        attemptGroups.find((group) => !group.isCorrect)?._count ?? 0
    const totalAttempts = correctCount + incorrectCount

    const scoredSessions = await prisma.quizSession.findMany({
        where: { userId, completedAt: { not: null } },
        select: { score: true }
    })

    const averageScore =
        scoredSessions.length > 0
            ? Math.round(
                  scoredSessions.reduce((sum, s) => sum + s.score, 0) /
                      scoredSessions.length
              )
            : 0

    return {
        totalQuizzes: completedSessions,
        totalAttempts,
        correctAttempts: correctCount,
        accuracy:
            totalAttempts > 0
                ? Math.round((correctCount / totalAttempts) * 100)
                : 0,
        averageScore,
        weakTopics,
        recentSessions: recentSessions.map((session) => ({
            id: session.id,
            score: session.score,
            correctAnswers: session.correctAnswers,
            totalQuestions: session.totalQuestions,
            completedAt: session.completedAt,
            category: session.topic.subject.category.name,
            subject: session.topic.subject.name,
            topic: session.topic.name
        }))
    }
}
