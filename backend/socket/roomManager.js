const rooms = new Map()

// Grace period (ms) to keep an empty room before final deletion
const ROOM_GRACE_PERIOD_MS = 30 * 1000

let onRoomDeleted = null

export function setOnRoomDeleted(fn) {
    onRoomDeleted = fn
}

function generatePlayerId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function createRoom(roomCode, player) {
    if (!player.playerId) player.playerId = generatePlayerId()

    const room = {
        roomCode,
        hostPlayerId: player.playerId,
        hostSocketId: player.socketId,
        players: [
            {
                playerId: player.playerId,
                socketId: player.socketId,
                username: player.username,
                score: 0,
                answered: false,
                connected: true
            }
        ],
        questions: [],
        questionIndex: 0,
        started: false,
        topicId: null,
        questionCount: 10,
        timer: null,
        pendingDeleteTimer: null
    }
    rooms.set(roomCode, room)
    return room
}

export function joinRoom(roomCode, player) {
    const room = rooms.get(roomCode)
    if (!room) return { error: "not_found" }
    if (room.started) return { error: "started" }

    const connectedCount = room.players.filter((p) => p.connected).length
    if (connectedCount >= 8) return { error: "full" }

    // If there's a pending delete timer (grace period), cancel it — someone is rejoining
    if (room.pendingDeleteTimer) {
        clearTimeout(room.pendingDeleteTimer)
        room.pendingDeleteTimer = null
    }

    // If client supplied a playerId and we have a matching disconnected player, restore them
    if (player.playerId) {
        const existing = room.players.find((p) => p.playerId === player.playerId)
        if (existing) {
            if (existing.connected) return { error: "already_connected" } // already connected elsewhere

            existing.socketId = player.socketId
            existing.username = player.username
            existing.connected = true

            // if this is the host, restore hostSocketId
            if (room.hostPlayerId === existing.playerId) {
                room.hostSocketId = player.socketId
            }

            return { room }
        }
    }

    // prevent duplicate usernames among connected players
    if (room.players.some((p) => p.connected && p.username === player.username)) return { error: "duplicate_username" }

    // create a new player entry
    const pid = player.playerId || generatePlayerId()
    room.players.push({
        playerId: pid,
        socketId: player.socketId,
        username: player.username,
        score: 0,
        answered: false,
        connected: true
    })

    return { room }
}

export function getRoom(roomCode) {
    return rooms.get(roomCode)
}

export function removePlayer(socketId) {
    for (const [code, room] of rooms) {
        const p = room.players.find((pl) => pl.socketId === socketId)
        if (!p) continue

        // mark disconnected but keep the player object for possible reconnection
        p.socketId = null
        p.connected = false
        clearTimer(room)

        // if the host disconnected, clear hostSocketId (hostPlayerId remains)
        if (room.hostSocketId === socketId) {
            room.hostSocketId = null
        }

        const anyConnected = room.players.some((pl) => pl.connected)
        if (!anyConnected) {
            // schedule deletion after a short grace period to allow quick refresh/reconnect
            if (room.pendingDeleteTimer) {
                clearTimeout(room.pendingDeleteTimer)
            }
            room.pendingDeleteTimer = setTimeout(() => {
                rooms.delete(code)
                if (onRoomDeleted) onRoomDeleted(code)
            }, ROOM_GRACE_PERIOD_MS)

            return { code, room: null, scheduledForDeletion: true }
        }

        return { code, room }
    }
    return null
}

export function clearTimer(room) {
    if (room.timer) {
        clearTimeout(room.timer)
        room.timer = null
    }
}

export function publicRoom(room) {
    return {
        roomCode: room.roomCode,
        hostPlayerId: room.hostPlayerId,
        hostSocketId: room.hostSocketId,
        started: room.started,
        topicId: room.topicId,
        questionCount: room.questionCount,
        questionIndex: room.questionIndex,
        players: room.players
            .filter((p) => p.connected)
            .map((p) => ({
                playerId: p.playerId,
                socketId: p.socketId,
                username: p.username,
                score: p.score
            }))
    }
}

export const QUESTION_SECONDS = 30
