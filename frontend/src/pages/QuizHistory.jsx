import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import Breadcrumb from "../components/Breadcrumb"
import Pagination from "../components/Pagination"
import { useAuth } from "../context/AuthContext"
import { api } from "../api/client"

export default function QuizHistory() {
    const { user } = useAuth()

    const [data, setData] = useState(null)
    const [multi, setMulti] = useState(null)

    const [page, setPage] = useState(1)

    useEffect(() => {
        if (!user) return

        api.getQuizHistory(page).then(setData)

        api.getMultiplayerHistory(page)
            .then(setMulti)
            .catch(() => {})
    }, [user, page])

    if (!user) {
        return (
            <Layout>
                <div className="max-w-xl">
                    <h1 className="text-3xl font-bold">
                        Quiz History
                    </h1>

                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Please{" "}
                        <Link
                            to="/login"
                            className="text-green-800 font-medium"
                        >
                            login
                        </Link>{" "}
                        to view your quiz history.
                    </p>
                </div>
            </Layout>
        )
    }

    const sessions = (
        ((data && data.sessions) || [])
            .concat(
                ((multi && multi.sessions) || [])
            )
            .sort(
                (a, b) =>
                    new Date(
                        b.completedAt ||
                            b.startedAt
                    ) -
                    new Date(
                        a.completedAt ||
                            a.startedAt
                    )
            )
    )

    return (
        <Layout>
            {/* <Breadcrumb
                items={[
                    {
                        label: "Home",
                        to: "/"
                    },
                    {
                        label: "History"
                    }
                ]}
            /> */}

            {/* Hero */}

            {/* <div className="rounded-2xl bg-green-800 text-white p-8">
                // <h1 className="text-4xl font-bold">
                //     Quiz History
                // </h1>

                <p className="mt-3 text-green-100">
                    Review your previous quiz
                    attempts and track your
                    improvement over time.
                </p>
            </div> */}
            <h1 className="text-3xl font-bold">
                    Quiz History
                 </h1>
            {!data && (
                <div className="mt-8">
                    Loading...
                </div>
            )}

            {data &&
                sessions.length === 0 && (
                    <div className="mt-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                        No quiz attempts yet.
                    </div>
                )}

            {sessions.length > 0 && (
                <>
                    <div className="mt-1 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {sessions.map(
                            (session) => {
                                const accuracy =
                                    Math.round(
                                        (session.correctAnswers /
                                            session.totalQuestions) *
                                            100
                                    )

                                let badge =
                                    "bg-red-100 text-red-700"

                                if (
                                    accuracy >= 80
                                ) {
                                    badge =
                                        "bg-green-100 text-green-800"
                                } else if (
                                    accuracy >= 60
                                ) {
                                    badge =
                                        "bg-yellow-100 text-yellow-700"
                                }

                                return (
                                    <div
                                        key={
                                            session.id
                                        }
                                        className="rounded-xl border border-gray-200 bg-white dark:border-gray-800  dark:bg-gray-900 p-5"
                                    >
                                        {/* Header */}

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {
                                                        session.topic
                                                    }
                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    {
                                                        session.category
                                                    }{" "}
                                                    •{" "}
                                                    {
                                                        session.subject
                                                    }
                                                </p>
                                            </div>

                                            <div
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${badge}`}
                                            >
                                                {
                                                    accuracy
                                                }
                                                %
                                            </div>
                                        </div>

                                        {/* Type */}

                                        <div className="mt-4">
                                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                                                {session.isMultiplayer
                                                    ? "Multiplayer"
                                                    : "Practice Quiz"}
                                            </span>
                                        </div>

                                        {/* Stats */}

                                        <div className="mt-5 grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-gray-500">
                                                    Score
                                                </div>

                                                <div className="text-2xl font-bold text-green-800">
                                                    {session.score ??
                                                        0}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs text-gray-500">
                                                    Correct
                                                </div>

                                                <div className="text-2xl font-bold">
                                                    {
                                                        session.correctAnswers
                                                    }
                                                    /
                                                    {
                                                        session.totalQuestions
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress */}

                                        <div className="mt-5">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span>
                                                    Accuracy
                                                </span>

                                                <span>
                                                    {
                                                        accuracy
                                                    }
                                                    %
                                                </span>
                                            </div>

                                            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-600"
                                                    style={{
                                                        width: `${accuracy}%`
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Date */}

                                        <div className="mt-5 text-sm text-gray-500">
                                            {new Date(
                                                session.completedAt ||
                                                    session.startedAt
                                            ).toLocaleString()}
                                        </div>

                                        {/* Leaderboard */}

                                        {session.isMultiplayer &&
                                            session.leaderboard &&
                                            session
                                                .leaderboard
                                                .length >
                                                0 && (
                                                <div className="mt-5 border-t border-gray-200 dark:border-gray-800 pt-4">
                                                    <div className="font-medium mb-3">
                                                        Top
                                                        Players
                                                    </div>

                                                    {session.leaderboard
                                                        .slice(
                                                            0,
                                                            3
                                                        )
                                                        .map(
                                                            (
                                                                player,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        player.username
                                                                    }
                                                                    className="flex justify-between py-1 text-sm"
                                                                >
                                                                    <span>
                                                                        #
                                                                        {index +
                                                                            1}{" "}
                                                                        {
                                                                            player.username
                                                                        }
                                                                    </span>

                                                                    <span>
                                                                        {
                                                                            player.score
                                                                        }{" "}
                                                                        pts
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                </div>
                                            )}
                                    </div>
                                )
                            }
                        )}
                    </div>

                    <div className="mt-8">
                        <Pagination
                            page={
                                data?.page ||
                                1
                            }
                            totalPages={
                                data?.totalPages ||
                                multi?.totalPages ||
                                1
                            }
                            onPageChange={
                                setPage
                            }
                        />
                    </div>
                </>
            )}
        </Layout>
    )
}