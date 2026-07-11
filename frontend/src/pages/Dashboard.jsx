import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import Breadcrumb from "../components/Breadcrumb"
import { useAuth } from "../context/AuthContext"
import { api } from "../api/client"

export default function Dashboard() {
    const { user } = useAuth()

    const [data, setData] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!user) return

        api.getDashboard()
            .then(setData)
            .catch((e) => setError(e.message))
    }, [user])

    if (!user) {
        return (
            <Layout>
                <div className="max-w-xl">
                    <h1 className="text-3xl font-bold">
                        Progress Dashboard
                    </h1>

                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Please{" "}
                        <Link
                            to="/login"
                            className="text-green-800 font-medium"
                        >
                            login
                        </Link>{" "}
                        to view your progress.
                    </p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            {/* <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: "Progress" }
                ]}
            /> */}

            {/* <section className="rounded-2xl bg-green-800 text-white p-8">
                <h1 className="text-4xl font-bold">
                    Welcome back, {user.username}
                </h1>

                <p className="mt-3 text-green-100">
                    Track your preparation journey and improve your weak topics.
                </p>
            </section> */}

            {error && (
                <div className="mt-6 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
                    {error}
                </div>
            )}

            {!data && !error && (
                <div className="mt-8">
                    Loading...
                </div>
            )}

            {data && (
                <>
                    {/* Stats */}

                    <section className="mt-1">
                        <h2 className="text-2xl font-bold mb-4">
                            Overview
                        </h2>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                title="Quizzes Taken"
                                value={data.totalQuizzes}
                            />

                            <StatCard
                                title="Accuracy"
                                value={`${data.accuracy}%`}
                            />

                            <StatCard
                                title="Average Score"
                                value={data.averageScore}
                            />

                            <StatCard
                                title="Attempts"
                                value={data.totalAttempts}
                            />
                        </div>
                    </section>

                    {/* Weak Topics */}

                    <section className="mt-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">
                                Topics To Improve
                            </h2>

                            <span className="text-sm text-gray-500">
                                Focus here first
                            </span>
                        </div>

                        {data.weakTopics.length === 0 ? (
                            <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-6">
                                <p>
                                    Great start. Complete more quizzes to get
                                    personalized recommendations.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {data.weakTopics.map((topic) => (
                                    <div
                                        key={topic.topicId}
                                        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {topic.topicName}
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {topic.categoryName} •{" "}
                                                    {topic.subjectName}
                                                </p>
                                            </div>

                                            <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                                                {topic.accuracy}%
                                            </div>
                                        </div>

                                        <div className="mt-5 flex gap-2">
                                            <Link
                                                to={`/subjects/${topic.categorySlug}/${topic.subjectSlug}/${topic.topicSlug}`}
                                            >
                                                <button className="px-4 py-2 rounded-md bg-green-800 text-white hover:bg-green-800">
                                                    Practice
                                                </button>
                                            </Link>

                                            <Link
                                                to="/playground"
                                                state={{
                                                    topicId:
                                                        topic.topicId
                                                }}
                                            >
                                                <button className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700">
                                                    Quiz
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recent Activity */}

                    <section className="mt-10">
                        <h2 className="text-2xl font-bold mb-4">
                            Recent Quiz Activity
                        </h2>

                        {data.recentSessions.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                                No quizzes completed yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {data.recentSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {session.topic}
                                                </h3>

                                                <p className="text-sm text-gray-500">
                                                    {session.category} •{" "}
                                                    {session.subject}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-bold text-lg text-green-800">
                                                    {session.score}
                                                </div>

                                                <div className="text-xs text-gray-500">
                                                    points
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>
                                                    Correct Answers
                                                </span>

                                                <span>
                                                    {
                                                        session.correctAnswers
                                                    }
                                                    /
                                                    {
                                                        session.totalQuestions
                                                    }
                                                </span>
                                            </div>

                                            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-600"
                                                    style={{
                                                        width: `${
                                                            (session.correctAnswers /
                                                                session.totalQuestions) *
                                                            100
                                                        }%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </Layout>
    )
}

function StatCard({ title, value }) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <div className="text-sm text-gray-500">
                {title}
            </div>

            <div className="mt-2 text-3xl font-bold text-green-800">
                {value}
            </div>
        </div>
    )
}