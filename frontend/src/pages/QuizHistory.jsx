import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import PageHeader from "../components/PageHeader"
import Pagination from "../components/Pagination"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { useAuth } from "../context/AuthContext"
import { api } from "../api/client"
import { Calendar } from "lucide-react"

export default function QuizHistory() {
    const { user } = useAuth()
    const [history, setHistory] = useState(null)
    const [page, setPage] = useState(1)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        setLoading(true)
        api.getQuizHistory(page)
            .then(setHistory)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [user, page])

    if (!user) {
        return (
            <Layout>
                <div className="page-container text-center py-20">
                    <p className="text-[var(--muted-foreground)] mb-4">Login to view quiz history.</p>
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
                    breadcrumb={[{ label: "Home", to: "/" }, { label: "Quiz history" }]}
                    title="Quiz history"
                    description="All completed playground sessions and scores."
                />

                {loading && <p className="text-[var(--muted-foreground)]">Loading...</p>}
                {error && <p className="text-[var(--destructive)]">{error}</p>}

                {history?.sessions.length === 0 && (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <p className="text-[var(--muted-foreground)] mb-4">
                                No completed quizzes yet.
                            </p>
                            <Button asChild>
                                <Link to="/playground">Take your first quiz</Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {history && history.sessions.length > 0 && (
                    <>
                        <div className="space-y-3">
                            {history.sessions.map((session) => (
                                <Card key={session.id}>
                                    <CardContent className="py-4 flex flex-wrap justify-between items-center gap-4">
                                        <div>
                                            <p className="font-semibold">{session.topic}</p>
                                            <p className="text-sm text-[var(--muted-foreground)]">
                                                {session.category} → {session.subject}
                                            </p>
                                            <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(session.completedAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-[var(--success)]">
                                                {session.score} pts
                                            </p>
                                            <p className="text-sm text-[var(--muted-foreground)]">
                                                {session.correctAnswers}/{session.totalQuestions} correct
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Pagination
                            page={history.page}
                            totalPages={history.totalPages}
                            onPageChange={setPage}
                        />
                    </>
                )}
            </div>
        </Layout>
    )
}
