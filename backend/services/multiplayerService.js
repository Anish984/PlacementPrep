import prisma from "../lib/prisma.js"

export async function createMultiplayerSession({ roomCode, topicId, hostPlayerId, totalQuestions }) {
    const session = await prisma.multiplayerSession.create({
        data: {
            roomCode,
            topicId,
            hostPlayerId,
            totalQuestions
        }
    })
    return session
}

export async function recordMultiplayerAttempt({ sessionId, playerId, username, questionId, selectedAnswer, isCorrect, timeTakenSeconds }) {
    const attempt = await prisma.multiplayerAttempt.create({
        data: {
            sessionId,
            playerId,
            username,
            questionId,
            selectedAnswer,
            isCorrect,
            timeTakenSeconds
        }
    })
    return attempt
}

export async function completeMultiplayerSession(sessionId) {
    const updated = await prisma.multiplayerSession.update({
        where: { id: sessionId },
        data: { completedAt: new Date() }
    })
    return updated
}

export async function getSessionAttempts(sessionId) {
    return prisma.multiplayerAttempt.findMany({ where: { sessionId } })
}

export async function getMultiplayerHistory(userId, username, page = 1, limit = 20) {
    const safePage = Math.max(1, page)
    const safeLimit = Math.min(Math.max(1, limit), 50)
    const skip = (safePage - 1) * safeLimit

    // Find sessions where this user participated (match by playerId or username)
    const whereClause = {
        attempts: {
            some: {
                OR: [{ username }, { playerId: userId }]
            }
        }
    }

    const [sessions, total] = await Promise.all([
        prisma.multiplayerSession.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            skip,
            take: safeLimit,
            include: {
                attempts: true,
                topic: {
                    include: {
                        subject: { include: { category: true } }
                    }
                }
            }
        }),
        prisma.multiplayerSession.count({ where: whereClause })
    ])

    const mapped = sessions.map((s) => {
        // build leaderboard from attempts
        const byPlayer = new Map()
        s.attempts.forEach((a) => {
            const key = a.playerId || a.username || `guest:${a.id}`
            const existing = byPlayer.get(key) || { playerId: a.playerId, username: a.username, score: 0, correct: 0 }
            if (a.isCorrect) {
                // approximate scoring: base 10 + quick bonus if < 10s
                const pts = 10 + (a.timeTakenSeconds !== null && a.timeTakenSeconds < 10 ? 5 : 0)
                existing.score += pts
                existing.correct += 1
            }
            byPlayer.set(key, existing)
        })

        const leaderboard = Array.from(byPlayer.values()).sort((x, y) => y.score - x.score || y.correct - x.correct)

        const yourAttempts = s.attempts.filter((a) => a.username === username || a.playerId === userId)
        const correct = yourAttempts.filter((a) => a.isCorrect).length
        const score = yourAttempts.reduce((acc, a) => acc + (a.isCorrect ? (a.timeTakenSeconds !== null && a.timeTakenSeconds < 10 ? 5 : 0) + 10 : 0), 0)

        return {
            id: s.id,
            score,
            correctAnswers: correct,
            totalQuestions: s.totalQuestions,
            startedAt: s.createdAt,
            completedAt: s.completedAt,
            category: s.topic?.subject?.category?.name,
            subject: s.topic?.subject?.name,
            topic: s.topic?.name,
            isMultiplayer: true,
            leaderboard
        }
    })

    return {
        sessions: mapped,
        total,
        page: safePage,
        totalPages: Math.ceil(total / safeLimit) || 1
    }
}
