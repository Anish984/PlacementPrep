import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { api } from "../api/client"

export default function Quiz() {
    const location = useLocation()
    const navigate = useNavigate()

    const sessionId = location.state?.sessionId
    const questions = location.state?.questions || []
    const topic = location.state?.topic
    const timeLimit = location.state?.timeLimit || 30

    const [idx, setIdx] = useState(0)
    const [picked, setPicked] = useState(null)
    const [feedback, setFeedback] = useState(null)

    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [t0, setT0] = useState(Date.now())

    const q = questions[idx]

    useEffect(() => {
        if (!q || picked !== null || feedback) return

        const timer = setInterval(() => {
            setTimeLeft((prev) =>
                prev <= 1 ? 0 : prev - 1
            )
        }, 1000)

        return () => clearInterval(timer)
    }, [q, picked, feedback])

    useEffect(() => {
        if (
            timeLeft === 0 &&
            picked === null &&
            q
        ) {
            submit(-1)
        }
    }, [timeLeft])

    async function submit(answer) {
        if (picked !== null || !q) return

        setPicked(answer)

        try {
            const result =
                await api.submitQuizAnswer({
                    sessionId,
                    questionId: q.id,
                    selectedAnswer: answer,
                    timeTakenSeconds: Math.round(
                        (Date.now() - t0) / 1000
                    )
                })

            setFeedback(result)
        } catch (e) {
            setFeedback({
                isCorrect: false,
                explanation: e.message
            })
        }
    }

    async function nextQuestion() {
        if (idx + 1 >= questions.length) {
            const result =
                await api.completeQuiz(sessionId)

            navigate("/results", {
                state: result
            })

            return
        }

        setIdx((prev) => prev + 1)
        setPicked(null)
        setFeedback(null)
        setTimeLeft(timeLimit)
        setT0(Date.now())
    }

    if (!sessionId || !q) {
        return (
            <Layout>
                <div className="max-w-xl">
                    <h1 className="text-3xl font-bold">
                        No Quiz Found
                    </h1>

                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        Start a new quiz from the
                        playground.
                    </p>

                    <Link
                        to="/playground"
                        className="inline-block mt-4 text-green-800 font-medium"
                    >
                        Go To Playground →
                    </Link>
                </div>
            </Layout>
        )
    }

    const progress =
        ((idx + 1) / questions.length) * 100

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Topic */}

                {topic && (
                    <div className="mb-4 text-sm text-gray-500">
                        {topic.category} •{" "}
                        {topic.subject} • {topic.name}
                    </div>
                )}

                {/* Progress */}

                <div className="mb-4">
                    <div className="flex justify-between mb-2 text-sm">
                        <span>
                            Question {idx + 1} of{" "}
                            {questions.length}
                        </span>

                        <span>
                            {Math.round(progress)}%
                            Complete
                        </span>
                    </div>

                    <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-green-800"
                            style={{
                                width: `${progress}%`
                            }}
                        />
                    </div>
                </div>

                {/* Timer */}

                <div className="mb-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Answer before time runs
                        out
                    </div>

                    <div
                        className={`
                        px-4 py-2 rounded-full font-semibold
                        ${
                            timeLeft <= 10
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-800"
                        }
                    `}
                    >
                        ⏱ {timeLeft}s
                    </div>
                </div>

                {/* Question */}

                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm">
                            {q.difficulty}
                        </span>
                    </div>

                    <h1 className="text-2xl font-semibold leading-relaxed">
                        {q.questionText}
                    </h1>

                    {/* Options */}

                    <div className="mt-8">
                        {q.options.map((option, i) => {
                            let styles =
                                "border-gray-200 dark:border-gray-700"

                            if (
                                picked !== null &&
                                feedback
                            ) {
                                if (
                                    i ===
                                    feedback.correctAnswer
                                ) {
                                    styles =
                                        "border-green-500 bg-green-50 dark:bg-green-950/20"
                                } else if (
                                    i === picked &&
                                    !feedback.isCorrect
                                ) {
                                    styles =
                                        "border-red-500 bg-red-50 dark:bg-red-950/20"
                                }
                            }

                            return (
                                <button
                                    key={i}
                                    disabled={
                                        picked !== null
                                    }
                                    onClick={() =>
                                        submit(i)
                                    }
                                    className={`
                                    w-full
                                    text-left
                                    rounded-xl
                                    border
                                    p-4
                                    mb-3
                                    transition
                                    hover:border-green-600
                                    ${styles}
                                `}
                                >
                                    <div className="flex gap-4">
                                        <div className="font-bold text-green-800">
                                            {String.fromCharCode(
                                                65 +
                                                    i
                                            )}
                                            .
                                        </div>

                                        <div>
                                            {option}
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Feedback */}

                    {feedback && (
                        <div className="mt-8">
                            <div
                                className={`
                                rounded-xl
                                p-4
                                border
                                ${
                                    feedback.isCorrect
                                        ? "bg-green-50 border-green-200 text-green-800"
                                        : "bg-red-50 border-red-200 text-red-700"
                                }
                            `}
                            >
                                <div className="font-semibold">
                                    {feedback.isCorrect
                                        ? "✓ Correct Answer"
                                        : "✗ Incorrect Answer"}
                                </div>

                                {feedback.points !==
                                    undefined && (
                                    <div className="mt-1 text-sm">
                                        Score Earned:{" "}
                                        {
                                            feedback.points
                                        }
                                    </div>
                                )}
                            </div>

                            {feedback.explanation && (
                                <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
                                    <div className="font-semibold mb-2">
                                        Explanation
                                    </div>

                                    <p className="text-gray-700 dark:text-gray-300">
                                        {
                                            feedback.explanation
                                        }
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={
                                    nextQuestion
                                }
                                className="mt-6 bg-green-800 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-medium"
                            >
                                {idx + 1 >=
                                questions.length
                                    ? "Finish Quiz"
                                    : "Next Question"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}