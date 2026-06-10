import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/Card"
import {
    BookOpen,
    Gamepad2,
    LayoutDashboard,
    History,
    CheckCircle2,
    Clock,
    BarChart3
} from "lucide-react"

const FEATURES = [
    {
        icon: BookOpen,
        title: "Topic-wise practice",
        description:
            "Browse Category → Subject → Topic and work through questions page by page, IndiaBix style."
    },
    {
        icon: Gamepad2,
        title: "Timed playground",
        description:
            "Take scored quizzes with a countdown timer. Every session is saved to your history."
    },
    {
        icon: BarChart3,
        title: "Weak topic insights",
        description:
            "Your dashboard highlights topics where accuracy is low so you know what to revise next."
    }
]

const QUICK_LINKS = [
    {
        to: "/subjects",
        icon: BookOpen,
        title: "Subjects",
        description: "Explore the question bank by category and topic.",
        color: "bg-[var(--secondary)] text-[var(--primary)]"
    },
    {
        to: "/playground",
        icon: Gamepad2,
        title: "Playground",
        description: "Configure and start a timed quiz session.",
        color: "bg-[#fdeee6] text-[var(--accent)]"
    },
    {
        to: "/dashboard",
        icon: LayoutDashboard,
        title: "Dashboard",
        description: "Stats, weak topics, and recent performance.",
        color: "bg-[var(--success-bg)] text-[var(--success)]",
        auth: true
    },
    {
        to: "/history",
        icon: History,
        title: "Quiz history",
        description: "Review scores from past playground sessions.",
        color: "bg-[var(--muted)] text-[var(--foreground)]",
        auth: true
    }
]

export default function Home() {
    const { user } = useAuth()

    return (
        <Layout>
            <section className="page-container pb-4">
                <div className="grid lg:grid-cols-2 gap-10 items-center py-8 lg:py-14">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)] mb-3">
                            Placement preparation
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-[var(--foreground)]">
                            Master aptitude &amp; technical interviews
                        </h1>
                        <p className="mt-5 text-lg text-[var(--muted-foreground)] leading-relaxed">
                            Practice thousands of questions, take timed quizzes, and let your
                            dashboard point you to the topics that need the most work.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-8">
                            <Button size="lg" asChild>
                                <Link to="/subjects">Browse subjects</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link to={user ? "/playground" : "/register"}>
                                    {user ? "Start quiz" : "Get started free"}
                                </Link>
                            </Button>
                        </div>

                        <ul className="mt-8 space-y-2">
                            {["Aptitude & technical question bank", "Instant answer feedback in practice", "Personal weak-topic dashboard"].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                                    <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative">
                        <Card className="overflow-hidden shadow-[var(--shadow-lg)]">
                            <div className="h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)]" />
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--muted-foreground)]">
                                        Sample question
                                    </span>
                                    <span className="flex items-center gap-1 text-xs bg-[var(--warning-bg)] text-[var(--warning)] px-2 py-1 rounded-full font-medium">
                                        <Clock className="w-3 h-3" />
                                        Playground mode
                                    </span>
                                </div>
                                <p className="font-[family-name:var(--font-serif)] text-lg leading-snug">
                                    What is the time complexity of binary search on a sorted array?
                                </p>
                                <div className="space-y-2">
                                    {["O(n)", "O(log n)", "O(n²)", "O(1)"].map((opt, i) => (
                                        <div
                                            key={opt}
                                            className={`px-4 py-2.5 rounded-lg border text-sm ${
                                                i === 1
                                                    ? "border-[var(--success)] bg-[var(--success-bg)] text-[var(--success)]"
                                                    : "border-[var(--border)] bg-[var(--muted)]/40"
                                            }`}
                                        >
                                            {opt}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            <section className="page-container py-10 border-t border-[var(--border)]">
                <h2 className="text-2xl font-bold mb-6">How it works</h2>
                <div className="grid md:grid-cols-3 gap-5">
                    {FEATURES.map((feature) => (
                        <Card key={feature.title} className="card-surface-hover">
                            <CardContent className="pt-5">
                                <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center mb-4">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="page-container py-10">
                <h2 className="text-2xl font-bold mb-6">Quick access</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {QUICK_LINKS.filter((link) => !link.auth || user).map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="card-surface card-surface-hover p-5 flex gap-4"
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${link.color}`}>
                                <link.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{link.title}</h3>
                                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                                    {link.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </Layout>
    )
}
