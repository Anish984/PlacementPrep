import { useState } from "react"
import { api } from "../api/client"

export default function PracticeQuestion({ question, questionNumber }) {
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    async function handleSelect(optionIndex) {
        if (selectedIndex !== null || loading) return

        setSelectedIndex(optionIndex)
        setLoading(true)

        try {
            const response = await api.checkPracticeAnswer(question.id, optionIndex)
            setResult(response)
        } catch (error) {
            setResult({
                isCorrect: false,
                correctAnswer: null,
                explanation: error.message
            })
        } finally {
            setLoading(false)
        }
    }

    function getOptionClass(optionIndex) {
        if (selectedIndex === null) {
            return "border-[var(--border)] bg-white hover:border-[var(--primary)] hover:bg-[var(--secondary)]/50 cursor-pointer"
        }

        if (result && optionIndex === result.correctAnswer) {
            return "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]"
        }

        if (optionIndex === selectedIndex && !result?.isCorrect) {
            return "border-[var(--destructive)] bg-red-50 text-[var(--destructive)]"
        }

        return "border-[var(--border)] bg-[var(--muted)]/40 opacity-60"
    }

    return (
        <article className="card-surface p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--primary)] text-white text-sm font-bold shrink-0">
                    {questionNumber}
                </span>
                <div className="flex-1 min-w-0">
                    <p className="text-base sm:text-lg leading-relaxed text-[var(--foreground)]">
                        {question.questionText}
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded">
                        {question.difficulty}
                    </span>
                </div>
            </div>

            <div className="space-y-2 ml-0 sm:ml-11">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        type="button"
                        disabled={selectedIndex !== null}
                        onClick={() => handleSelect(index)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${getOptionClass(index)}`}
                    >
                        <span className="font-semibold text-[var(--muted-foreground)] mr-2">
                            {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                    </button>
                ))}
            </div>

            {result && (
                <div
                    className={`mt-4 ml-0 sm:ml-11 p-3 rounded-lg text-sm border ${
                        result.isCorrect
                            ? "bg-[var(--success-bg)] border-[var(--success)]/30 text-[var(--success)]"
                            : "bg-red-50 border-red-200 text-[var(--destructive)]"
                    }`}
                >
                    <p className="font-semibold">
                        {result.isCorrect ? "Correct!" : "Incorrect"}
                    </p>
                    {result.explanation && (
                        <p className="mt-1 opacity-80">{result.explanation}</p>
                    )}
                </div>
            )}
        </article>
    )
}
