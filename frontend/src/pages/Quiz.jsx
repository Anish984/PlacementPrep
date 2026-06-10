import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { api } from "../api/client"
import { Clock } from "lucide-react"

const DEFAULT_TIME_LIMIT = 30

export default function Quiz() {
    const location = useLocation()
    const navigate = useNavigate()

    const sessionId = location.state?.sessionId
    const questions = location.state?.questions || []
    const topicInfo = location.state?.topic
    const timeLimit = location.state?.timeLimit || DEFAULT_TIME_LIMIT

    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [feedback, setFeedback] = useState(null)
    const [timeLeft, setTimeLeft] = useState(timeLimit)
    const [questionStartTime, setQuestionStartTime] = useState(Date.now())
    const [submitting, setSubmitting] = useState(false)

    const currentQuestion = questions[currentIndex]
    const isLastQuestion = currentIndex + 1 >= questions.length

    useEffect(() => {
        if (!sessionId || !currentQuestion || selectedIndex !== null || feedback) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1))
        }, 1000)

        return () => clearInterval(timer)
    }, [currentIndex, selectedIndex, feedback, sessionId, currentQuestion])

    useEffect(() => {
        if (timeLeft === 0 && selectedIndex === null && currentQuestion && !submitting) {
            handleAnswer(-1)
        }
    }, [timeLeft])

    async function handleAnswer(answerIndex) {
        if (submitting || feedback || !currentQuestion) return

        setSubmitting(true)
        setSelectedIndex(answerIndex)

        const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)

        try {
            const result = await api.submitQuizAnswer({
                sessionId,
                questionId: currentQuestion.id,
                selectedAnswer: answerIndex,
                timeTakenSeconds: timeTaken
            })
            setFeedback(result)
        } catch (error) {
            setFeedback({
                isCorrect: false,
                explanation: error.message,
                correctAnswer: null,
                points: 0
            })
        } finally {
            setSubmitting(false)
        }
    }

    async function handleNext() {
        if (isLastQuestion) {
            const result = await api.completeQuiz(sessionId)
            navigate("/results", { state: result })
            return
        }

        setCurrentIndex((index) => index + 1)
        setSelectedIndex(null)
        setFeedback(null)
        setTimeLeft(timeLimit)
        setQuestionStartTime(Date.now())
    }

    function getOptionClass(optionIndex) {
        if (selectedIndex === null) {
            return "border-[var(--border)] bg-white hover:border-[var(--primary)] cursor-pointer"
        }
        if (feedback && optionIndex === feedback.correctAnswer) {
            return "border-[var(--success)] bg-[var(--success-bg)]"
        }
        if (optionIndex === selectedIndex && !feedback?.isCorrect) {
            return "border-[var(--destructive)] bg-red-50"
        }
        return "border-[var(--border)] opacity-50"
    }

    if (!sessionId || questions.length === 0) {
        return (
            <Layout>
                <div className="page-container text-center py-20">
                    <p className="text-[var(--muted-foreground)] mb-4">No active quiz session.</p>
                    <Button asChild>
                        <Link to="/playground">Go to Playground</Link>
                    </Button>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="page-container max-w-2xl">
                {topicInfo && (
                    <p className="text-sm text-[var(--muted-foreground)] mb-4">
                        {topicInfo.category} → {topicInfo.subject} → {topicInfo.name}
                    </p>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm text-[var(--muted-foreground)]">Progress</p>
                        <p className="font-bold text-lg">
                            Question {currentIndex + 1}{" "}
                            <span className="text-[var(--muted-foreground)] font-normal">
                                of {questions.length}
                            </span>
                        </p>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
                            timeLeft <= 5
                                ? "bg-red-50 text-[var(--destructive)]"
                                : "bg-[var(--secondary)] text-[var(--primary)]"
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        {timeLeft}s
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <span className="text-xs font-medium text-[var(--primary)] bg-[var(--secondary)] px-2 py-1 rounded">
                            {currentQuestion.difficulty}
                        </span>

                        <h2 className="text-xl font-[family-name:var(--font-serif)] font-semibold mt-4 mb-6 leading-snug">
                            {currentQuestion.questionText}
                        </h2>

                        <div className="space-y-2.5">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    disabled={selectedIndex !== null}
                                    onClick={() => handleAnswer(index)}
                                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition ${getOptionClass(index)}`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {feedback && (
                            <div className="mt-6 space-y-4">
                                <div
                                    className={`p-4 rounded-lg border text-sm ${
                                        feedback.isCorrect
                                            ? "bg-[var(--success-bg)] border-[var(--success)]/30 text-[var(--success)]"
                                            : "bg-red-50 border-red-200 text-[var(--destructive)]"
                                    }`}
                                >
                                    <p className="font-semibold">
                                        {feedback.isCorrect
                                            ? `Correct! +${feedback.points} points`
                                            : "Incorrect"}
                                    </p>
                                    {feedback.explanation && (
                                        <p className="mt-1 opacity-80">{feedback.explanation}</p>
                                    )}
                                </div>

                                <Button onClick={handleNext} className="w-full">
                                    {isLastQuestion ? "View results" : "Next question"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}
