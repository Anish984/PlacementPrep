import { useEffect, useState, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import { socket } from "../socket/socket"
import { api } from "../api/client"
import { useAuth } from "../context/AuthContext"
import RoomQuiz from "../components/multiplayer/RoomQuiz"
import RoomPlayers from "../components/multiplayer/RoomPlayer"
import RoomLeaderboard from "../components/multiplayer/RoomLeaderBoard"
import RoomFinished from "../components/multiplayer/RoomFinished"
import RoomGameOver from "../components/multiplayer/RoomGameOver"

export default function Room() {
    const { roomCode } = useParams()

    const [room, setRoom] = useState(null)
    const [tree, setTree] = useState([])
    const [topicId, setTopicId] = useState("")
    const [questionCount, setQuestionCount] = useState(10)
    const [error, setError] = useState("")

    const [question, setQuestion] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [selected, setSelected] = useState(null)
    const [yourResult, setYourResult] = useState(null)
    const [reveal, setReveal] = useState(null)
    const [gameOver, setGameOver] = useState(null)
    const [personalFinished, setPersonalFinished] = useState(null)
    const [timeLeft, setTimeLeft] = useState(null)

    const localPlayerId = localStorage.getItem("mp_playerId")
    const { user } = useAuth()
    const isHost = room?.hostPlayerId && localPlayerId === room.hostPlayerId

    const intervalRef = useRef(null)

    // keep a ref to previous leaderboard to detect top-3 changes
    const leaderboardRef = useRef([])

    useEffect(() => { leaderboardRef.current = leaderboard }, [leaderboard])

    const [animatedTop, setAnimatedTop] = useState([])
    const [toastMessage, setToastMessage] = useState("")

    useEffect(() => {
        api.getContentTree().then(setTree).catch(() => {})

        if (!socket.connected) socket.connect()

        const storedName = user?.username || localStorage.getItem("mp_name")
        const storedPlayerId = localStorage.getItem("mp_playerId")

        if (storedName) {
            socket.emit(
                "join-room",
                { roomCode, username: storedName, playerId: storedPlayerId },
                (res) => {
                    if (res?.error) {
                        socket.emit("get-room", roomCode, (r) => {
                            if (!r) {
                                setError("Room not found")
                                return
                            }
                            setRoom(r)
                            if (r.topicId) setTopicId(r.topicId)
                            if (r.questionCount) setQuestionCount(r.questionCount)
                        })
                        return
                    }
                    if (res?.playerId) localStorage.setItem("mp_playerId", res.playerId)
                    setRoom(res.room)
                    if (res.room.topicId) setTopicId(res.room.topicId)
                    if (res.room.questionCount) setQuestionCount(res.room.questionCount)
                }
            )
        } else {
            socket.emit("get-room", roomCode, (r) => {
                if (!r) {
                    setError("Room not found")
                    return
                }
                setRoom(r)
                if (r.topicId) setTopicId(r.topicId)
                if (r.questionCount) setQuestionCount(r.questionCount)
            })
        }

        socket.on("room-update", setRoom)

        socket.on("question", (q) => {
            setQuestion(q)
            setSelected(null)
            setYourResult(null)
            setReveal(null)

            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }

            if (q?.startedAt && q?.timeLimit) {
                const update = () => {
                    const left = Math.max(0, Math.ceil((q.startedAt + q.timeLimit * 1000 - Date.now()) / 1000))
                    setTimeLeft(left)
                }
                update()
                intervalRef.current = setInterval(update, 250)
            } else {
                setTimeLeft(null)
            }
        })

        socket.on("personal-game-over", (payload) => {
            setPersonalFinished(payload)
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            setTimeLeft(null)
        })

        // leaderboard with animation detection
        socket.on("leaderboard", (lb) => {
            try {
                const prev = leaderboardRef.current || []
                const idsPrev = prev.map((p) => p.playerId || p.socketId)
                const idsNew = lb.map((p) => p.playerId || p.socketId)
                const top3 = idsNew.slice(0, 3)
                const changed = top3.some((id, i) => id !== idsPrev[i])
                setLeaderboard(lb)
                if (changed) {
                    setAnimatedTop(top3)
                    setToastMessage("Speed bonuses awarded!")
                    setTimeout(() => setToastMessage(""), 1800)
                    setTimeout(() => setAnimatedTop([]), 1400)
                }
            } catch (e) {
                setLeaderboard(lb)
            }
        })

        socket.on("your-result", setYourResult)
        socket.on("answer-reveal", setReveal)
        socket.on("game-over", setGameOver)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            socket.off("room-update")
            socket.off("question")
            socket.off("personal-game-over")
            socket.off("leaderboard")
            socket.off("your-result")
            socket.off("answer-reveal")
            socket.off("game-over")
        }
    }, [roomCode])

    function saveConfig() {
        socket.emit("set-config", { roomCode, topicId, questionCount }, (res) => {
            if (res?.error) setError(res.error)
            else setError("")
        })
    }

    function startQuiz() {
        socket.emit("start-quiz", roomCode, (res) => {
            if (res?.error) setError(res.error)
        })
    }

    function submitAnswer(index) {
        if (selected !== null) return
        setSelected(index)
        socket.emit("submit-answer", { roomCode, answer: index })
    }

    function copyRoomCode() {
        try { navigator.clipboard.writeText(roomCode) } catch (e) {}
    }

    // Render branches
    if (error && !room) {
        return (
            <Layout>
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Link to="/multiplayer" className="text-indigo-600 dark:text-indigo-400">Back</Link>
            </Layout>
        )
    }

    if (!room) {
        return (
            <Layout>
                <p className="text-gray-600 dark:text-gray-300">Loading room…</p>
            </Layout>
        )
    }

    if (personalFinished) {
        return (
            <Layout>
                <RoomFinished personalFinished={personalFinished} />
            </Layout>
        )
    }

    if (gameOver) {
        return (
            <Layout>
                <RoomGameOver roomCode={roomCode} gameOver={gameOver} />
            </Layout>
        )
    }

    if (question) {
        return (
            <Layout>
                <RoomQuiz
                    question={question}
                    roomCode={roomCode}
                    selected={selected}
                    submitAnswer={submitAnswer}
                    reveal={reveal}
                    yourResult={yourResult}
                    timeLeft={timeLeft}
                    leaderboard={leaderboard}
                    animatedTop={animatedTop}
                />
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Room {roomCode}</h1>
                    <p className="text-gray-600 dark:text-gray-300">Share this code so others can join.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-700 text-sm px-3 py-1 rounded">{roomCode}</div>
                    <button type="button" className="text-sm text-indigo-600 dark:text-indigo-400" onClick={copyRoomCode}>Copy</button>
                </div>
            </div>

            {error && <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>}

            <div className="mt-4 grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <RoomPlayers players={room.players} hostPlayerId={room.hostPlayerId} />

                    {isHost && !room.started && (
                        <div className="mt-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                            <h3 className="font-semibold mb-2">Quiz setup</h3>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Topic</label>
                                <select className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
                                    <option value="">Select…</option>
                                    {tree.flatMap((cat) =>
                                        cat.subjects.flatMap((sub) =>
                                            sub.topics.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {cat.name} › {sub.name} › {t.name}
                                                </option>
                                            ))
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Questions: {questionCount}</label>
                                <input
                                    type="range"
                                    min={5}
                                    max={20}
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button type="button" className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-sm" onClick={saveConfig}>
                                    Save
                                </button>
                                <button type="button" className="px-4 py-2 rounded bg-indigo-600 text-white text-sm" onClick={startQuiz}>
                                    Start quiz
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <aside>
                    <RoomLeaderboard leaderboard={leaderboard} animatedTop={animatedTop} />
                </aside>
            </div>
        </Layout>
    )
}


// import { useEffect, useState, useRef } from "react"
// import { Link, useParams } from "react-router-dom"
// import Layout from "../components/Layout"
// import { socket } from "../socket/socket"
// import { api } from "../api/client"
// import { useAuth } from "../context/AuthContext"
// import RoomQuiz from "../components/multiplayer/RoomQuiz"
// import RoomGameOver from "@/components/multiplayer/RoomGameOver"
// export default function Room() {
//     const { roomCode } = useParams()

//     const [room, setRoom] = useState(null)
//     const [tree, setTree] = useState([])
//     const [topicId, setTopicId] = useState("")
//     const [questionCount, setQuestionCount] = useState(10)
//     const [error, setError] = useState("")

//     const [question, setQuestion] = useState(null)
//     const [leaderboard, setLeaderboard] = useState([])
//     const [selected, setSelected] = useState(null)
//     const [yourResult, setYourResult] = useState(null)
//     const [reveal, setReveal] = useState(null)
//     const [gameOver, setGameOver] = useState(null)
//     const [personalFinished, setPersonalFinished] = useState(null)
//     const [timeLeft, setTimeLeft] = useState(null)

//     const localPlayerId = localStorage.getItem("mp_playerId")
//     const { user } = useAuth()
//     const isHost = room?.hostPlayerId && localPlayerId === room.hostPlayerId

//     const intervalRef = useRef(null)

//     useEffect(() => {
//         api.getContentTree().then(setTree).catch(() => {})

//         if (!socket.connected) socket.connect()

//         // try to rejoin the room with stored name/playerId so server can re-associate us
//         const storedName = user?.username || localStorage.getItem("mp_name")
//         const storedPlayerId = localStorage.getItem("mp_playerId")

//         if (storedName) {
//             socket.emit(
//                 "join-room",
//                 { roomCode, username: storedName, playerId: storedPlayerId },
//                 (res) => {
//                     if (res?.error) {
//                         // fallback to get-room to at least show info
//                         socket.emit("get-room", roomCode, (r) => {
//                             if (!r) {
//                                 setError("Room not found")
//                                 return
//                             }
//                             setRoom(r)
//                             if (r.topicId) setTopicId(r.topicId)
//                             if (r.questionCount) setQuestionCount(r.questionCount)
//                         })
//                         return
//                     }
//                     if (res?.playerId) localStorage.setItem("mp_playerId", res.playerId)
//                     setRoom(res.room)
//                     if (res.room.topicId) setTopicId(res.room.topicId)
//                     if (res.room.questionCount) setQuestionCount(res.room.questionCount)
//                 }
//             )
//         } else {
//             socket.emit("get-room", roomCode, (r) => {
//                 if (!r) {
//                     setError("Room not found")
//                     return
//                 }
//                 setRoom(r)
//                 if (r.topicId) setTopicId(r.topicId)
//                 if (r.questionCount) setQuestionCount(r.questionCount)
//             })
//         }

//         socket.on("room-update", setRoom)
//         socket.on("question", (q) => {
//             setQuestion(q)
//             setSelected(null)
//             setYourResult(null)
//             setReveal(null)

//             // clear any existing interval to avoid duplicate timers (fix flicker)
//             if (intervalRef.current) {
//                 clearInterval(intervalRef.current)
//                 intervalRef.current = null
//             }

//             // start countdown based on server sent startedAt and timeLimit
//             if (q?.startedAt && q?.timeLimit) {
//                 const update = () => {
//                     const left = Math.max(0, Math.ceil((q.startedAt + q.timeLimit * 1000 - Date.now()) / 1000))
//                     setTimeLeft(left)
//                 }
//                 update()
//                 intervalRef.current = setInterval(update, 250)
//             } else {
//                 setTimeLeft(null)
//             }
//         })
//         socket.on("personal-game-over", (payload) => {
//             // payload: { leaderboard: [...finished players], yourScore }
//             setPersonalFinished(payload)
//             // clear any running timer
//             if (intervalRef.current) {
//                 clearInterval(intervalRef.current)
//                 intervalRef.current = null
//             }
//             setTimeLeft(null)
//         })
//         socket.on("leaderboard", (lb) => {
//             // animate top-3 when leaderboard updates (bonus may have been awarded)
//             try {
//                 const prev = leaderboardRef.current || []
//                 const idsPrev = prev.map((p) => p.playerId || p.socketId)
//                 const idsNew = lb.map((p) => p.playerId || p.socketId)
//                 const top3 = idsNew.slice(0, 3)
//                 // if top3 changed or leaderboard length increased, trigger animation
//                 const changed = top3.some((id, i) => id !== idsPrev[i])
//                 setLeaderboard(lb)
//                 if (changed) {
//                     setAnimatedTop(top3)
//                     setToastMessage("Speed bonuses awarded!")
//                     setTimeout(() => setToastMessage(""), 1800)
//                     setTimeout(() => setAnimatedTop([]), 1400)
//                 }
//             } catch (e) {
//                 setLeaderboard(lb)
//             }
//         })
//         socket.on("your-result", setYourResult)
//         socket.on("answer-reveal", setReveal)
//         socket.on("game-over", setGameOver)

//         return () => {
//             if (intervalRef.current) {
//                 clearInterval(intervalRef.current)
//                 intervalRef.current = null
//             }
//             socket.off("room-update")
//             socket.off("question")
//             socket.off("personal-game-over")
//             socket.off("leaderboard")
//             socket.off("your-result")
//             socket.off("answer-reveal")
//             socket.off("game-over")
//         }
//     }, [roomCode])

//     // keep a ref to previous leaderboard to detect changes
//     const leaderboardRef = useRef([])
//     useEffect(() => { leaderboardRef.current = leaderboard }, [leaderboard])

//     const [animatedTop, setAnimatedTop] = useState([])
//     const [toastMessage, setToastMessage] = useState("")

//     function saveConfig() {
//         socket.emit("set-config", { roomCode, topicId, questionCount }, (res) => {
//             if (res?.error) setError(res.error)
//             else setError("")
//         })
//     }

//     function startQuiz() {
//         socket.emit("start-quiz", roomCode, (res) => {
//             if (res?.error) setError(res.error)
//         })
//     }

//     function submitAnswer(index) {
//         if (selected !== null) return
//         setSelected(index)
//         socket.emit("submit-answer", { roomCode, answer: index })
//     }

//     if (error && !room) {
//         return (
//             <Layout>
//                 <p className="text-red-600 dark:text-red-400">{error}</p>
//                 <Link to="/multiplayer" className="text-indigo-600 dark:text-indigo-400">Back</Link>
//             </Layout>
//         )
//     }

//     if (!room) {
//         return (
//             <Layout>
//                 <p className="text-gray-600 dark:text-gray-300">Loading room…</p>
//             </Layout>
//         )
//     }

//     function copyRoomCode() {
//         try {
//             navigator.clipboard.writeText(roomCode)
//         } catch (e) {}
//     }

//     if (personalFinished) {
//         return (
//             <Layout>
//                 <h1 className="text-2xl font-semibold">Finished</h1>
//                 <p className="text-gray-600 dark:text-gray-300">Your score: {personalFinished.yourScore}</p>
//                 <h2 className="mt-4 text-lg font-medium">Finished players</h2>
//                 <ol className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
//                     {personalFinished.leaderboard.map((p, i) => (
//                         <li key={p.playerId} className="flex justify-between">
//                             <span>#{i + 1} {p.username}</span>
//                             <span className="text-sm text-gray-500 dark:text-gray-400">{p.score} pts</span>
//                         </li>
//                     ))}
//                 </ol>
//                 <p className="mt-4">
//                     <Link to="/multiplayer" className="text-indigo-600 dark:text-indigo-400">New room</Link> · <Link to="/" className="text-indigo-600 dark:text-indigo-400">Home</Link>
//                 </p>
//             </Layout>
//         )
//     }

//     if (gameOver) {
//         return (
//             <Layout>
//                 <h1 className="text-2xl font-semibold">Game over</h1>
//                 <p className="text-gray-600 dark:text-gray-300">Room {roomCode}</p>
//                 <h2 className="mt-4 text-lg font-medium">Final scores</h2>
//                 <ol className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
//                     {gameOver.leaderboard.map((p, i) => (
//                         <li key={p.playerId || p.socketId} className="flex justify-between">
//                             <span>#{i + 1} {p.username}</span>
//                             <span className="text-sm text-gray-500 dark:text-gray-400">{p.score} pts</span>
//                         </li>
//                     ))}
//                 </ol>
//                 <p className="mt-4">
//                     <Link to="/multiplayer" className="text-indigo-600 dark:text-indigo-400">New room</Link> · <Link to="/" className="text-indigo-600 dark:text-indigo-400">Home</Link>
//                 </p>
//             </Layout>
//         )
//     }

//   if (question) {
//     return (
//         <Layout>
//             <RoomQuiz
//                 question={question}
//                 roomCode={roomCode}
//                 selected={selected}
//                 submitAnswer={submitAnswer}
//                 reveal={reveal}
//                 yourResult={yourResult}
//                 timeLeft={timeLeft}
//                 leaderboard={leaderboard}
//                 animatedTop={animatedTop}
//             />
//         </Layout>
//     )
// }

//     return (
//         <Layout>
//             <div className="flex items-center justify-between gap-4">
//                 <div>
//                     <h1 className="text-2xl font-semibold">Room {roomCode}</h1>
//                     <p className="text-gray-600 dark:text-gray-300">Share this code so others can join.</p>
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <div className="bg-gray-100 dark:bg-gray-700 text-sm px-3 py-1 rounded">{roomCode}</div>
//                     <button type="button" className="text-sm text-indigo-600 dark:text-indigo-400" onClick={copyRoomCode}>Copy</button>
//                 </div>
//             </div>

//             {error && <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>}

//             <h2 className="mt-4 text-lg font-medium">Players ({room.players.length}/8)</h2>
//             <ul className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow p-3 space-y-2">
//                 {room.players.map((p) => (
//                     <li key={p.playerId} className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="font-medium">{p.username}</div>
//                             {p.playerId === room.hostPlayerId && <span className="text-xs bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded">Host</span>}
//                         </div>
//                         <div className="text-sm text-gray-500 dark:text-gray-400">{p.connected ? 'Online' : 'Offline'}</div>
//                     </li>
//                 ))}
//             </ul>

//             {isHost && !room.started && (
//                 <>
//                     <h2 className="mt-4 text-lg font-medium">Quiz setup</h2>
//                     <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
//                         <div className="mb-3">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Topic</label>
//                             <select className="w-full border border-gray-200 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-900" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
//                                 <option value="">Select…</option>
//                                 {tree.flatMap((cat) =>
//                                     cat.subjects.flatMap((sub) =>
//                                         sub.topics.map((t) => (
//                                             <option key={t.id} value={t.id}>
//                                                 {cat.name} › {sub.name} › {t.name}
//                                             </option>
//                                         ))
//                                     )
//                                 )}
//                             </select>
//                         </div>
//                         <div className="mb-3">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Questions: {questionCount}</label>
//                             <input
//                                 type="range"
//                                 min={5}
//                                 max={20}
//                                 value={questionCount}
//                                 onChange={(e) => setQuestionCount(Number(e.target.value))}
//                                 className="w-full"
//                             />
//                         </div>
//                         <div className="flex gap-2">
//                             <button type="button" className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-700 text-sm" onClick={saveConfig}>
//                                 Save
//                             </button>
//                             <button type="button" className="px-4 py-2 rounded bg-indigo-600 text-white text-sm" onClick={startQuiz}>
//                                 Start quiz
//                             </button>
//                         </div>
//                     </div>
//                 </>
//             )}

//             {!isHost && !room.started && (
//                 <p className="text-gray-600 dark:text-gray-300 mt-4">Waiting for host to start…</p>
//             )}

//             {leaderboard.length > 0 && (
//                 <>
//                     <h2 className="mt-4 text-lg font-medium">Scores</h2>
//                     <ol className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow p-3 space-y-2">
//                         {leaderboard.map((p, i) => (
//                             <li key={p.playerId || p.socketId} className="flex justify-between">
//                                 <span>{i + 1}. {p.username}</span>
//                                 <span className="text-sm text-gray-500 dark:text-gray-400">{p.score}</span>
//                             </li>
//                         ))}
//                     </ol>
//                 </>
//             )}
//         </Layout>
//     )
// }
