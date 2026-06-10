import { Link, useLocation } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { Trophy, RotateCcw, LayoutDashboard } from "lucide-react"

export default function Result() {
    const location = useLocation()
    const result = location.state

    if (!result) {
        return (
            <Layout>
                <div className="page-container text-center py-20">
                    <p className="text-[var(--muted-foreground)] mb-4">No results to display.</p>
                    <Button asChild>
                        <Link to="/playground">Start a new quiz</Link>
                    </Button>
                </div>
            </Layout>
        )
    }

    const accuracy = Math.round(
        (result.correctAnswers / result.totalQuestions) * 100
    )

    return (
        <Layout>
            <div className="page-container max-w-lg text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-8 h-8" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Quiz complete!</h1>
                <p className="text-[var(--muted-foreground)] mb-8">
                    {result.category} → {result.subject} → {result.topic}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                    <Card>
                        <CardContent className="pt-5 text-center">
                            <p className="text-2xl font-bold text-[var(--success)]">{result.score}</p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">Score</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 text-center">
                            <p className="text-2xl font-bold text-[var(--primary)]">
                                {result.correctAnswers}/{result.totalQuestions}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">Correct</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-5 text-center">
                            <p className="text-2xl font-bold text-[var(--accent)]">{accuracy}%</p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">Accuracy</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild>
                        <Link to="/playground">
                            <RotateCcw className="w-4 h-4" />
                            Play again
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/dashboard">
                            <LayoutDashboard className="w-4 h-4" />
                            View dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </Layout>
    )
}
