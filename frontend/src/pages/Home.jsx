import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/button"

export default function Home() {
    const { user } = useAuth()

    return (
        <Layout>
            {/* Hero */}

            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="bg-green-200 text-black dark:bg-green-800 dark:text-white p-8 md:p-12">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            Master Placement Preparation
                        </h1>

                        <p className="mt-4 text-green-800 text-lg dark:text-green-100">
                            Practice aptitude, reasoning, verbal and technical
                            questions through topic-wise learning, timed quizzes
                            and multiplayer challenges.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/subjects">
                                <Button
                                    className="bg-white text-green-800 hover:bg-gray-100"
                                >
                                    Start Learning
                                </Button>
                            </Link>

                            <Link to="/playground">
                                <Button
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-green-800"
                                >
                                    Take Quiz
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 bg-green-50 dark:bg-gray-900">
                    <div className="p-6">
                        <div className="text-3xl font-bold text-green-800">
                            1500+
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            Practice Questions
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="text-3xl font-bold text-green-800">
                            100+
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            Topics Covered
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="text-3xl font-bold text-green-800">
                            Live
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                            Multiplayer Quizzes
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}

            <section className="mt-10">
                <h2 className="text-2xl font-bold mb-5">
                    Popular Categories
                </h2>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <CategoryCard
                        icon="🧮"
                        title="Aptitude"
                        description="Percentages, profit & loss, time & work, probability and more."
                    />

                    <CategoryCard
                        icon="🧠"
                        title="Reasoning"
                        description="Logical reasoning, puzzles, seating arrangements and coding-decoding."
                    />

                    <CategoryCard
                        icon="💻"
                        title="Programming"
                        description="C, C++, Java, Python, JavaScript and computer science topics."
                    />

                    <CategoryCard
                        icon="📝"
                        title="Verbal"
                        description="Grammar, vocabulary, comprehension and communication skills."
                    />
                </div>
            </section>

            {/* How It Works */}

            <section className="mt-12">
                <h2 className="text-2xl font-bold mb-5">
                    How LetsQuiz Works
                </h2>

                <div className="grid gap-4 md:grid-cols-3">
                    <StepCard
                        number="1"
                        title="Learn"
                        description="Browse subjects and study topic-wise questions with explanations."
                    />

                    <StepCard
                        number="2"
                        title="Practice"
                        description="Take timed quizzes and strengthen weak areas."
                    />

                    <StepCard
                        number="3"
                        title="Improve"
                        description="Track your performance and focus on topics needing improvement."
                    />
                </div>
            </section>

            {/* Logged In */}

            {user && (
                <section className="mt-12">
                    <div className="rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-6">
                        <h2 className="text-xl font-semibold">
                            Welcome back, {user.username}
                        </h2>

                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Continue your preparation journey and improve your
                            placement readiness.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link to="/dashboard">
                                <Button>
                                    View Progress
                                </Button>
                            </Link>

                            <Link to="/history">
                                <Button variant="outline">
                                    Quiz History
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </Layout>
    )
}

function CategoryCard({ icon, title, description }) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="text-4xl mb-3">
                {icon}
            </div>

            <h3 className="font-semibold text-lg">
                {title}
            </h3>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {description}
            </p>
        </div>
    )
}

function StepCard({ number, title, description }) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="h-10 w-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold">
                {number}
            </div>

            <h3 className="mt-4 font-semibold text-lg">
                {title}
            </h3>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
                {description}
            </p>
        </div>
    )
}