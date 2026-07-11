import { Link, useLocation } from "react-router-dom"
import Layout from "../components/Layout"

export default function Result() {
    const result = useLocation().state

    if (!result) {
        return (
            <Layout>
                <div className="max-w-xl">
                    <h1 className="text-3xl font-bold">
                        No Results Found
                    </h1>

                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        Complete a quiz to see your results.
                    </p>

                    <Link
                        to="/playground"
                        className="inline-block mt-4 text-green-800 font-medium"
                    >
                        Start Quiz →
                    </Link>
                </div>
            </Layout>
        )
    }

    const accuracy = Math.round(
        (result.correctAnswers /
            result.totalQuestions) *
            100
    )

    let performance = "Needs Improvement"
    let performanceColor =
        "bg-red-100 text-red-700"

    if (accuracy >= 80) {
        performance = "Excellent"
        performanceColor =
            "bg-green-100 text-green-800"
    } else if (accuracy >= 60) {
        performance = "Good"
        performanceColor =
            "bg-yellow-100 text-yellow-700"
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Hero */}

                <div className="rounded-2xl bg-green-200 text-black dark:bg-green-800 dark:text-white p-8 text-center">
                    <div className="text-6xl mb-4">
                        🎉
                    </div>

                    <h1 className="text-4xl font-bold">
                        Quiz Completed
                    </h1>

                    <p className="mt-3 text-green-100">
                        Great effort. Keep practicing
                        to improve your placement
                        preparation.
                    </p>
                </div>

                {/* Topic */}

                <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                    {result.category} •{" "}
                    {result.subject} •{" "}
                    {result.topic}
                </div>

                {/* Main Stats */}

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                        <div className="text-sm text-gray-500">
                            Score
                        </div>

                        <div className="mt-2 text-4xl font-bold text-green-800">
                            {result.score}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                        <div className="text-sm text-gray-500">
                            Correct Answers
                        </div>

                        <div className="mt-2 text-4xl font-bold text-green-800">
                            {result.correctAnswers}
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                        <div className="text-sm text-gray-500">
                            Accuracy
                        </div>

                        <div className="mt-2 text-4xl font-bold text-green-800">
                            {accuracy}%
                        </div>
                    </div>
                </div>

                {/* Accuracy Bar */}

                <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                    <div className="flex justify-between mb-3">
                        <span className="font-medium">
                            Accuracy
                        </span>

                        <span>
                            {accuracy}%
                        </span>
                    </div>

                    <div className="h-4 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-green-800"
                            style={{
                                width: `${accuracy}%`
                            }}
                        />
                    </div>
                </div>

                {/* Breakdown */}

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-6">
                        <div className="text-sm text-green-800">
                            Correct
                        </div>

                        <div className="mt-2 text-3xl font-bold text-green-800">
                            {result.correctAnswers}
                        </div>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-6">
                        <div className="text-sm text-red-700">
                            Incorrect
                        </div>

                        <div className="mt-2 text-3xl font-bold text-red-700">
                            {result.totalQuestions -
                                result.correctAnswers}
                        </div>
                    </div>
                </div>

                {/* Performance */}

                <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
                    <div className="text-sm text-gray-500">
                        Performance Level
                    </div>

                    <div
                        className={`inline-block mt-4 px-4 py-2 rounded-full font-semibold ${performanceColor}`}
                    >
                        {performance}
                    </div>
                </div>

                {/* Actions */}

                <div className="mt-8 flex flex-wrap gap-3 justify-center">
                    <Link to="/playground">
                        <button className="bg-green-800 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-medium">
                            Take Another Quiz
                        </button>
                    </Link>

                    <Link to="/dashboard">
                        <button className="border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-xl font-medium">
                            View Progress
                        </button>
                    </Link>

                    <Link to="/history">
                        <button className="border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-xl font-medium">
                            Quiz History
                        </button>
                    </Link>
                </div>
            </div>
        </Layout>
    )
}