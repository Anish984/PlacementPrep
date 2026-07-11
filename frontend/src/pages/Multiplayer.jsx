import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { socket } from "../socket/socket"

export default function Multiplayer() {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [username, setUsername] = useState(
        user?.username ||
        localStorage.getItem("mp_name") ||
        ""
    )

    const [roomCode, setRoomCode] = useState("")
    const [error, setError] = useState("")

    function connect() {
        if (!socket.connected) {
            socket.connect()
        }
    }

    function createRoom() {
        if (!username.trim()) {
            setError("Enter your name")
            return
        }

        setError("")

        connect()

        const finalName =
            user?.username ||
            username.trim()

        if (!user) {
            localStorage.setItem(
                "mp_name",
                username.trim()
            )
        }

        const playerId =
            localStorage.getItem(
                "mp_playerId"
            ) || undefined

        socket.emit(
            "create-room",
            {
                username: finalName,
                playerId
            },
            (res) => {
                if (res?.playerId) {
                    localStorage.setItem(
                        "mp_playerId",
                        res.playerId
                    )
                }

                navigate(
                    `/room/${res.roomCode}`
                )
            }
        )
    }

    function joinRoom() {
        if (
            !username.trim() ||
            !roomCode.trim()
        ) {
            setError(
                "Enter your name and room code"
            )
            return
        }

        setError("")

        connect()

        const finalName =
            user?.username ||
            username.trim()

        if (!user) {
            localStorage.setItem(
                "mp_name",
                username.trim()
            )
        }

        const playerId =
            localStorage.getItem(
                "mp_playerId"
            ) || undefined

        socket.emit(
            "join-room",
            {
                roomCode:
                    roomCode
                        .trim()
                        .toUpperCase(),
                username: finalName,
                playerId
            },
            (res) => {
                if (res.error) {
                    setError(res.error)
                    return
                }

                if (res?.playerId) {
                    localStorage.setItem(
                        "mp_playerId",
                        res.playerId
                    )
                }

                navigate(
                    `/room/${roomCode
                        .trim()
                        .toUpperCase()}`
                )
            }
        )
    }

    return (
        <Layout>
            {/* Hero */}

            {/* <div className="rounded-xl bg-green-800 text-white p-8">
                <h1 className="text-3xl font-bold">
                    Multiplayer Quiz Arena
                </h1>

                <p className="mt-3 text-green-100">
                    Challenge friends in real-time
                    placement quizzes. Create a
                    room or join an existing one.
                </p>
            </div> */}

            {error && (
                <div className="mt-6 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
                    {error}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mt-8">
                {/* Create Room */}

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="text-4xl mb-4">
                        🎯
                    </div>

                    <h2 className="text-2xl font-bold">
                        Create Room
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Become the host and invite
                        friends.
                    </p>

                    <div className="mt-5">
                        <label className="block mb-2 font-medium">
                            Your Name
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            placeholder={
                                user?.username
                                    ? "Using account name"
                                    : "Enter name"
                            }
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3"
                        />
                    </div>

                    <button
                        onClick={createRoom}
                        className="mt-6 w-full bg-green-800 hover:bg-green-800 text-white py-3 rounded-xl font-medium"
                    >
                        Create Room
                    </button>
                </div>

                {/* Join Room */}

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="text-4xl mb-4">
                        🚀
                    </div>

                    <h2 className="text-2xl font-bold">
                        Join Room
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Enter a room code shared by
                        your friends.
                    </p>

                    <div className="mt-5">
                        <label className="block mb-2 font-medium">
                            Your Name
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block mb-2 font-medium">
                            Room Code
                        </label>

                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) =>
                                setRoomCode(
                                    e.target.value.toUpperCase()
                                )
                            }
                            placeholder="ABC123"
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3 uppercase tracking-widest font-bold"
                        />
                    </div>

                    <button
                        onClick={joinRoom}
                        className="mt-6 w-full border border-green-800 text-green-800 hover:bg-green-50 py-3 rounded-xl font-medium"
                    >
                        Join Room
                    </button>
                </div>
            </div>

            {/* Info Section */}

            <div className="mt-10 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-8">
                <h2 className="text-2xl font-bold">
                    How Multiplayer Works
                </h2>

                <div className="mt-6 grid md:grid-cols-4 gap-4">
                    <Step
                        number="1"
                        title="Create"
                        desc="Host creates room"
                    />

                    <Step
                        number="2"
                        title="Invite"
                        desc="Share room code"
                    />

                    <Step
                        number="3"
                        title="Compete"
                        desc="Answer together"
                    />

                    <Step
                        number="4"
                        title="Win"
                        desc="Top the leaderboard"
                    />
                </div>
            </div>
        </Layout>
    )
}

function Step({
    number,
    title,
    desc
}) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-10 w-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold">
                {number}
            </div>

            <div className="mt-4 font-semibold">
                {title}
            </div>

            <div className="text-sm text-gray-500 mt-1">
                {desc}
            </div>
        </div>
    )
}