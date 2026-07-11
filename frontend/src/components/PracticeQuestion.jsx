import { useState } from "react"
import { api } from "../api/client"

export default function PracticeQuestion({
    question,
    questionNumber
}) {
    const [showAnswer, setShowAnswer] = useState(false)
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null)
    const [checking, setChecking] = useState(false)
    const [checkError, setCheckError] = useState("")
    const [eliminated, setEliminated] = useState([])
    const [checkingIndex, setCheckingIndex] = useState(null)

    const difficultyColor = {
        Easy: "bg-green-100 text-green-800",
        Medium:
            "bg-yellow-100 text-yellow-700",
        Hard: "bg-red-100 text-red-700"
    }

    // correctAnswer is not included in the practice question payload (server excludes it).
    // We'll obtain it from the practice check API when the user reveals the answer.

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            {/* Header */}

            <div className="border-b border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <div className="text-sm text-gray-500">
                            Question{" "}
                            {
                                questionNumber
                            }
                        </div>

                        <h2 className="font-semibold text-lg mt-1">
                            Practice
                            Question
                        </h2>
                    </div>

                    {question.difficulty && (
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                difficultyColor[
                                    question
                                        .difficulty
                                ] ||
                                "bg-gray-100"
                            }`}
                        >
                            {
                                question.difficulty
                            }
                        </span>
                    )}
                </div>
            </div>

            {/* Question */}

            <div className="p-6">
                <h3 className="text-xl leading-relaxed font-medium">
                    {
                        question.questionText
                    }
                </h3>

                {/* Options */}

                <div className="mt-6 space-y-3">
                    {question.options.map((option, index) => {
                        // Determine correctness from server result when available
                        const isCorrect = result ? index === Number(result.correctAnswer) : false
                        const isSelected = selected === index

                        // Determine classes based on selection and reveal state
                        let baseClass = "rounded-xl border p-4 cursor-pointer"
                        let stateClass = "border-gray-200 dark:border-gray-700"

                        if (showAnswer && result) {
                            if (isCorrect) {
                                stateClass = "border-green-500 bg-green-50 dark:bg-green-950/20"
                            } else if (isSelected && !isCorrect) {
                                stateClass = "border-red-500 bg-red-50 dark:bg-red-950/10"
                            }
                        } else if (isSelected) {
                            // highlight selected before reveal
                            stateClass = "ring-2 ring-green-200 dark:ring-green-800"
                        }

                        const isEliminated = eliminated.includes(index)

                        const handleClick = async () => {
                            if (showAnswer) return
                            if (isEliminated) return

                            setSelected(index)
                            setCheckError("")
                            setCheckingIndex(index)
                            try {
                                const res = await api.checkPracticeAnswer(question.id, index)
                                setResult(res)
                                if (res.isCorrect) {
                                    setShowAnswer(true)
                                } else {
                                    setEliminated((s) => Array.from(new Set([...s, index])))
                                }
                            } catch (e) {
                                setCheckError(e.message || "Failed to check answer")
                            } finally {
                                setCheckingIndex(null)
                            }
                        }

                        const combinedClass = `${baseClass} ${stateClass} ${isEliminated ? 'opacity-50 pointer-events-none line-through' : ''}`

                        return (
                            <div
                                key={index}
                                role="button"
                                tabIndex={0}
                                onClick={handleClick}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault()
                                        handleClick()
                                    }
                                }}
                                className={combinedClass}
                                aria-pressed={isSelected}
                            >
                                <div className="flex gap-3">
                                    <span className="font-bold text-green-800">
                                        {String.fromCharCode(65 + index)}.
                                    </span>

                                    <span style={{ color: 'var(--text)' }}>{option}</span>

                                    {showAnswer && isCorrect && (
                                        <span className="ml-auto text-sm font-semibold text-green-800">✓ Correct</span>
                                    )}

                                    {!showAnswer && checkingIndex === index && (
                                        <span className="ml-auto text-sm text-gray-500">Checking…</span>
                                    )}

                                    {showAnswer && isSelected && !isCorrect && (
                                        <span className="ml-auto text-sm font-semibold text-red-600">✕</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Show Answer */}

                <div className="mt-6 flex items-center gap-3">
                    <button
                        onClick={async () => {
                            if (selected === null) {
                                setCheckError("Please select an option first")
                                return
                            }

                            setChecking(true)
                            setCheckError("")
                            try {
                                const res = await api.checkPracticeAnswer(question.id, selected)
                                setResult(res)
                                setShowAnswer(true)
                            } catch (e) {
                                setCheckError(e.message || "Failed to check answer")
                            } finally {
                                setChecking(false)
                            }
                        }}
                        className="mt-0 bg-green-800 hover:bg-green-800 text-white px-5 py-3 rounded-xl"
                    >
                        {checking ? "Checking…" : showAnswer ? "Hide Answer" : "Show Answer"}
                    </button>

                    {showAnswer && (
                        <button
                            onClick={() => {
                                setShowAnswer(false)
                                setResult(null)
                            }}
                            className="mt-0 px-4 py-2 border rounded"
                        >
                            Reset
                        </button>
                    )}

                    {checkError && (
                        <div className="text-sm text-red-600">{checkError}</div>
                    )}
                </div>

                {/* Explanation */}

                {showAnswer && result && (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-5">
                        <h4 className="font-semibold text-green-800">
                            Correct Answer
                        </h4>

                        <p className="mt-2" style={{ color: 'var(--text)' }}>
                            {Number.isFinite(Number(result.correctAnswer)) && question.options[Number(result.correctAnswer)]
                                ? question.options[Number(result.correctAnswer)]
                                : "(no answer available)"}
                        </p>

                        {result.explanation && (
                            <>
                                <h4 className="font-semibold mt-5">
                                    Explanation
                                </h4>

                                <p className="mt-2" style={{ color: 'var(--text)' }}>
                                    {result.explanation}
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}