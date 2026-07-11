import {
    createRoom,
    joinRoom,
    getRoom,
    removePlayer,
    clearTimer,
    publicRoom,
    QUESTION_SECONDS,
    setOnRoomDeleted
} from "./roomManager.js"
import { pickQuestionsForTopic } from "../services/quizService.js"
import {
    createMultiplayerSession,
    recordMultiplayerAttempt,
    completeMultiplayerSession
} from "../services/multiplayerService.js"

function roomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function pointsFor(difficulty, timeTaken) {
    const base = { EASY: 10, MEDIUM: 15, HARD: 20 }[difficulty] || 10
    return base + (timeTaken < 10 ? 5 : 0)
}

function clientQuestion(q, index, total) {
    return {
        id: q.id,
        questionText: q.questionText,
        options: q.options,
        difficulty: q.difficulty,
        index,
        total
    }
}

function sendQuestion(io, code, room) {
    room.players.forEach((p) => {
        p.answered = false
    })

    const q = room.questions[room.questionIndex]
    io.to(code).emit("question", clientQuestion(q, room.questionIndex + 1, room.questions.length))

    clearTimer(room)
    room.timer = setTimeout(() => goNext(io, code, room), QUESTION_SECONDS * 1000)
}

    function sendQuestionToPlayer(io, code, room, player) {
        if (!player || !player.connected || !player.socketId) return

        const qIndex = player.questionIndex
        const q = room.questions[qIndex]
        if (!q) return

        // mark as not answered for this player
        player.answered = false
        player.questionStart = Date.now()

        // send a targeted question with time limit and index info
        io.to(player.socketId).emit("question", {
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            difficulty: q.difficulty,
            index: qIndex + 1,
            total: room.questions.length,
            timeLimit: QUESTION_SECONDS,
            startedAt: player.questionStart
        })

        // no per-player timeout here; scoring uses questionStart and server-side bonus window
    }

    function evaluateBonusForQuestion(room, qIndex) {
        const subs = (room.answerSubmissions && room.answerSubmissions[qIndex]) || []
        // only consider correct submissions
        const correctSubs = subs.filter((s) => s.correct)
        // sort by timeTaken ascending
        correctSubs.sort((a, b) => a.timeTaken - b.timeTaken)
        const bonuses = [5, 3, 1]
        for (let i = 0; i < 3; i++) {
            const win = correctSubs[i]
            if (!win) continue
            const player = room.players.find((p) => p.playerId === win.playerId)
            if (!player) continue
            player.score += bonuses[i]
        }
    }

function leaderboard(room) {
    return [...room.players].sort((a, b) => b.score - a.score)
}

function goNext(io, code, room) {
    clearTimer(room)

    const q = room.questions[room.questionIndex]
    io.to(code).emit("answer-reveal", {
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
    })

    setTimeout(() => {
        room.questionIndex++

        if (room.questionIndex >= room.questions.length) {
            room.started = false
            io.to(code).emit("game-over", { leaderboard: leaderboard(room) })
            return
        }

        sendQuestion(io, code, room)
    }, 2500)
}

function maybeAdvance(io, code, room) {
    if (room.players.every((p) => p.answered)) {
        goNext(io, code, room)
    }
}

export default function socketHandler(io) {
    // emit a global event when a room is finally deleted after grace period
    setOnRoomDeleted((code) => {
        io.emit("room-removed", { roomCode: code })
    })
    io.on("connection", (socket) => {
        socket.on("create-room", ({ username, playerId }, cb) => {
            const code = roomCode()
            const room = createRoom(code, { socketId: socket.id, username, playerId })
            socket.join(code)
            const player = room.players.find((p) => p.socketId === socket.id)
            cb({ roomCode: code, room: publicRoom(room), playerId: player?.playerId })
            io.to(code).emit("room-update", publicRoom(room))
        })

        socket.on("join-room", ({ roomCode: code, username, playerId }, cb) => {
            const res = joinRoom(code, { socketId: socket.id, username, playerId })
            if (res?.error) {
                const map = {
                    not_found: "Room not found",
                    started: "Quiz already started",
                    full: "Room is full",
                    already_connected: "Player already connected",
                    duplicate_username: "Name already taken in room"
                }
                cb({ error: map[res.error] || "Unable to join room" })
                return
            }

            const room = res.room
            socket.join(code)
            // find the player entry for this socket so client can persist playerId
            const player = room.players.find((p) => p.socketId === socket.id)
            cb({ room: publicRoom(room), playerId: player?.playerId })
            io.to(code).emit("room-update", publicRoom(room))
        })

        socket.on("get-room", (code, cb) => {
            const room = getRoom(code)
            cb(room ? publicRoom(room) : null)
        })

        socket.on("set-config", ({ roomCode: code, topicId, questionCount }, cb) => {
            const room = getRoom(code)
            if (!room || room.hostSocketId !== socket.id) {
                cb?.({ error: "Only host can set config" })
                return
            }
            room.topicId = topicId
            room.questionCount = Math.min(Math.max(questionCount || 10, 5), 20)
            cb?.({ ok: true })
            io.to(code).emit("room-update", publicRoom(room))
        })

        socket.on("start-quiz", async (code, cb) => {
            const room = getRoom(code)
            if (!room || room.hostSocketId !== socket.id) {
                cb?.({ error: "Only host can start" })
                return
            }
            if (!room.topicId) {
                cb?.({ error: "Pick a topic first" })
                return
            }

            try {
                    const picked = await pickQuestionsForTopic(room.topicId, room.questionCount)
                    room.questions = picked
                    room.started = true

                    // initialize per-player progress and answer submission tracking
                    room.answerSubmissions = {}
                    room.bonusTimers = {}

                    room.players.forEach((p) => {
                        p.questionIndex = 0
                        p.finished = false
                        p.answered = false
                        p.questionStart = null
                    })

                    // persist multiplayer session
                    try {
                        const hostPid = room.hostPlayerId || (room.players[0] && room.players[0].playerId)
                        const m = await createMultiplayerSession({
                            roomCode: code,
                            topicId: room.topicId,
                            hostPlayerId: hostPid,
                            totalQuestions: room.questions.length
                        })
                        room.multiplayerSessionId = m.id
                    } catch (e) {
                        // non-fatal — continue without persistence
                        console.error("Failed to create multiplayer session", e)
                    }

                    cb?.({ ok: true })

                    // send first question to each connected player individually
                    room.players.forEach((p) => {
                        if (p.connected && p.socketId) sendQuestionToPlayer(io, code, room, p)
                    })
            } catch (err) {
                cb?.({ error: err.message })
            }
        })

            socket.on("submit-answer", async ({ roomCode: code, answer }) => {
            const room = getRoom(code)
            if (!room || !room.started) return

            const player = room.players.find((p) => p.socketId === socket.id)
            if (!player || player.answered || player.finished) return

            const qIndex = player.questionIndex
            const q = room.questions[qIndex]
            if (!q) return

            player.answered = true

            const timeTakenMs = Date.now() - (player.questionStart || Date.now())
            const timeTaken = Math.max(0, Math.round(timeTakenMs / 1000))

            const correct = answer === q.correctAnswer
            let points = 0
            if (correct) {
                points = pointsFor(q.difficulty, timeTaken)
                player.score += points
            }

            // persist attempt to DB if session exists
            if (room.multiplayerSessionId) {
                try {
                    await recordMultiplayerAttempt({
                        sessionId: room.multiplayerSessionId,
                        playerId: player.playerId,
                        username: player.username,
                        questionId: q.id,
                        selectedAnswer: answer,
                        isCorrect: correct,
                        timeTakenSeconds: timeTaken
                    })
                } catch (e) {
                    console.error("Failed to record multiplayer attempt", e)
                }
            }

            // record submission for potential per-question bonuses
            room.answerSubmissions[qIndex] = room.answerSubmissions[qIndex] || []
            room.answerSubmissions[qIndex].push({ playerId: player.playerId, timeTaken, correct })

            // start bonus window timer when the first submission for this question arrives
            if (!room.bonusTimers[qIndex]) {
                room.bonusTimers[qIndex] = setTimeout(() => {
                    evaluateBonusForQuestion(room, qIndex)
                    // after awarding bonuses, emit updated leaderboard
                    io.to(code).emit("leaderboard", leaderboard(room))
                    // clear timer
                    clearTimeout(room.bonusTimers[qIndex])
                    room.bonusTimers[qIndex] = null
                }, QUESTION_SECONDS * 1000)
            }

            // send immediate personal result (without bonus)
            socket.emit("your-result", { correct, points })

            // emit updated leaderboard to everyone
            io.to(code).emit("leaderboard", leaderboard(room))

            // advance this player to next question
            player.questionIndex++
            player.answered = false

            if (player.questionIndex >= room.questions.length) {
                player.finished = true
                // send personal game over with current leaderboard snapshot of finished candidates
                const finished = room.players
                    .filter((pl) => pl.finished)
                    .map((pl) => ({ playerId: pl.playerId, username: pl.username, score: pl.score }))
                socket.emit("personal-game-over", { leaderboard: finished, yourScore: player.score })

                // if all players finished, emit room-level game-over
                const allFinished = room.players.every((pl) => pl.finished)
                if (allFinished) {
                    io.to(code).emit("game-over", { leaderboard: leaderboard(room) })
                    if (room.multiplayerSessionId) {
                        try {
                            await completeMultiplayerSession(room.multiplayerSessionId)
                        } catch (e) {
                            console.error("Failed to complete multiplayer session", e)
                        }
                    }
                }
            } else {
                // send next question to this player
                sendQuestionToPlayer(io, code, room, player)
            }
        })

        socket.on("disconnect", () => {
            const result = removePlayer(socket.id)
            if (result?.room) {
                io.to(result.code).emit("room-update", publicRoom(result.room))
            }
        })
    })
}
