import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import PageHeader from "../components/PageHeader"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { useAuth } from "../context/AuthContext"
import { api } from "../api/client"

export default function Playground() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const [tree, setTree] = useState([])
    const [categoryId, setCategoryId] = useState("")
    const [subjectId, setSubjectId] = useState("")
    const [topicId, setTopicId] = useState(location.state?.topicId || "")
    const [questionCount, setQuestionCount] = useState(10)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        api.getContentTree()
            .then((contentTree) => {
                setTree(contentTree)

                if (location.state?.topicId) {
                    preselectTopic(contentTree, location.state.topicId)
                }
            })
            .catch((err) => setError(err.message))
    }, [location.state?.topicId])

    function preselectTopic(contentTree, targetTopicId) {
        for (const category of contentTree) {
            for (const subject of category.subjects) {
                const topic = subject.topics.find((t) => t.id === targetTopicId)
                if (topic) {
                    setCategoryId(category.id)
                    setSubjectId(subject.id)
                    setTopicId(topic.id)
                    return
                }
            }
        }
    }

    const selectedCategory = tree.find((c) => c.id === categoryId)
    const selectedSubject = selectedCategory?.subjects.find((s) => s.id === subjectId)
    const selectedTopic = selectedSubject?.topics.find((t) => t.id === topicId)
    const maxQuestions = selectedTopic?._count?.questions || 50

    async function handleStart() {
        if (!user) {
            navigate("/login")
            return
        }

        if (!topicId) {
            setError("Please select a topic")
            return
        }

        setLoading(true)
        setError("")

        try {
            const result = await api.startQuiz(topicId, questionCount)
            navigate("/quiz", {
                state: {
                    sessionId: result.sessionId,
                    questions: result.questions,
                    topic: result.topic,
                    timeLimit: result.timeLimit
                }
            })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <Layout>
                <div className="page-container text-center py-20">
                    <p className="text-[var(--muted-foreground)] mb-4">
                        Sign in to use the timed Playground.
                    </p>
                    <Button asChild>
                        <Link to="/login">Login</Link>
                    </Button>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="page-container max-w-xl">
                <PageHeader
                    breadcrumb={[{ label: "Home", to: "/" }, { label: "Playground" }]}
                    title="Playground"
                    description="Configure a timed quiz. Your score and answers are saved to your history and dashboard."
                />

                {error && (
                    <p className="text-[var(--destructive)] bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm">
                        {error}
                    </p>
                )}

                <Card>
                    <CardContent className="pt-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value)
                                    setSubjectId("")
                                    setTopicId("")
                                }}
                                className="w-full bg-white border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
                            >
                                <option value="">Select category</option>
                                {tree.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Subject</label>
                            <select
                                value={subjectId}
                                onChange={(e) => {
                                    setSubjectId(e.target.value)
                                    setTopicId("")
                                }}
                                disabled={!categoryId}
                                className="w-full bg-white border border-[var(--border)] rounded-lg p-3 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
                            >
                                <option value="">Select subject</option>
                                {selectedCategory?.subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Topic</label>
                            <select
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                                disabled={!subjectId}
                                className="w-full bg-white border border-[var(--border)] rounded-lg p-3 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
                            >
                                <option value="">Select topic</option>
                                {selectedSubject?.topics.map((topic) => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name} ({topic._count.questions} questions)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Questions: <span className="text-[var(--primary)]">{questionCount}</span>
                            </label>
                            <input
                                type="range"
                                min={5}
                                max={Math.min(maxQuestions, 50)}
                                value={questionCount}
                                onChange={(e) => setQuestionCount(Number(e.target.value))}
                                disabled={!topicId}
                                className="w-full accent-[var(--primary)]"
                            />
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                30 seconds per question · difficulty-based scoring
                            </p>
                        </div>

                        <Button
                            onClick={handleStart}
                            disabled={loading || !topicId}
                            className="w-full"
                            size="lg"
                        >
                            {loading ? "Starting..." : "Start quiz"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}
