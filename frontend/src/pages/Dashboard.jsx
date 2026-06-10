import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import { Card, CardContent, CardHeader } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { useAuth } from "../context/AuthContext"
import { api } from "../api/client"
import {
    Target,
    Trophy,
    Brain,
    TrendingUp,
    AlertTriangle,
    ArrowRight,
    BookOpen
} from "lucide-react"

export default function Dashboard() {
    const { user } = useAuth()
    const [data, setData] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        api.getDashboard()
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [user])

    if (!user) {
        return (
            <Layout>
                <div className="page-container text-center py-20">
                    <p className="text-[var(--muted-foreground)] mb-4">
                        Sign in to view your learning dashboard.
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
            <div className="page-container">
                <PageHeader
                    breadcrumb={[
                        { label: "Home", to: "/" },
                        { label: "Dashboard" }
                    ]}
                    title={`Hello, ${user.username}`}
                    description="Track your progress, spot weak topics, and focus your practice where it matters most."
                    action={
                        <Button asChild>
                            <Link to="/playground">Start a quiz</Link>
                        </Button>
                    }
                />

                {loading && (
                    <p className="text-[var(--muted-foreground)]">Loading dashboard...</p>
                )}
                {error && (
                    <p className="text-[var(--destructive)] bg-red-50 border border-red-200 rounded-lg p-4">
                        {error}
                    </p>
                )}

                {data && (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard
                                label="Quizzes completed"
                                value={data.totalQuizzes}
                                icon={Trophy}
                                tone="accent"
                            />
                            <StatCard
                                label="Overall accuracy"
                                value={`${data.accuracy}%`}
                                icon={Target}
                                tone="success"
                            />
                            <StatCard
                                label="Average score"
                                value={data.averageScore}
                                hint="points per quiz"
                                icon={TrendingUp}
                            />
                            <StatCard
                                label="Questions attempted"
                                value={data.totalAttempts}
                                icon={Brain}
                            />
                        </div>

                        <div className="grid lg:grid-cols-5 gap-6">
                            <Card className="lg:col-span-3">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-[var(--accent)]" />
                                        <h2 className="text-xl font-bold">Weak topics</h2>
                                    </div>
                                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                                        Topics where your accuracy is lowest — practice these first.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {data.weakTopics.length === 0 ? (
                                        <div className="text-center py-10 px-4">
                                            <p className="text-[var(--muted-foreground)] mb-4">
                                                Complete a few playground quizzes to unlock weak-topic
                                                predictions.
                                            </p>
                                            <Button variant="outline" asChild>
                                                <Link to="/playground">Take a quiz</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.weakTopics.map((topic) => (
                                                <WeakTopicRow key={topic.topicId} topic={topic} />
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <h2 className="text-xl font-bold">Recent quizzes</h2>
                                </CardHeader>
                                <CardContent>
                                    {data.recentSessions.length === 0 ? (
                                        <p className="text-sm text-[var(--muted-foreground)] py-6 text-center">
                                            No quizzes yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {data.recentSessions.map((session) => (
                                                <div
                                                    key={session.id}
                                                    className="flex justify-between items-center p-3 rounded-lg bg-[var(--muted)]/60"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {session.topic}
                                                        </p>
                                                        <p className="text-xs text-[var(--muted-foreground)] truncate">
                                                            {session.category} · {session.subject}
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-3">
                                                        <p className="font-bold text-[var(--success)]">
                                                            {session.score}
                                                        </p>
                                                        <p className="text-xs text-[var(--muted-foreground)]">
                                                            {session.correctAnswers}/
                                                            {session.totalQuestions}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Button variant="ghost" className="w-full mt-4" asChild>
                                        <Link to="/history">
                                            View all history
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    )
}

function WeakTopicRow({ topic }) {
    const practicePath = `/subjects/${topic.categorySlug}/${topic.subjectSlug}/${topic.topicSlug}`

    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/30">
            <div className="flex flex-wrap justify-between gap-3 mb-3">
                <div>
                    <p className="font-semibold">{topic.topicName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                        {topic.categoryName} → {topic.subjectName}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-[var(--accent)]">
                        {topic.accuracy}%
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                        {topic.correctAttempts}/{topic.totalAttempts} correct
                    </p>
                </div>
            </div>

            <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden mb-3">
                <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all"
                    style={{ width: `${topic.accuracy}%` }}
                />
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link to={practicePath}>
                        <BookOpen className="w-3.5 h-3.5" />
                        Practice
                    </Link>
                </Button>
                <Button size="sm" asChild>
                    <Link
                        to="/playground"
                        state={{ topicId: topic.topicId }}
                    >
                        Quiz this topic
                    </Link>
                </Button>
            </div>
        </div>
    )
}
