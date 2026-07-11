import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import Breadcrumb from "../components/Breadcrumb"
import { useAuth } from "../context/AuthContext"
import { api } from "../api/client"

export default function Playground() {
    const { user } = useAuth()

    const navigate = useNavigate()
    const location = useLocation()

    const [tree, setTree] = useState([])

    const [categoryId, setCategoryId] = useState("")
    const [subjectId, setSubjectId] = useState("")
    const [topicId, setTopicId] = useState(
        location.state?.topicId || ""
    )

    const [count, setCount] = useState(10)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        api.getContentTree().then((data) => {
            setTree(data)

            if (location.state?.topicId) {
                for (const category of data) {
                    for (const subject of category.subjects) {
                        const topic = subject.topics.find(
                            (t) =>
                                t.id ===
                                location.state.topicId
                        )

                        if (topic) {
                            setCategoryId(category.id)
                            setSubjectId(subject.id)
                            setTopicId(topic.id)
                            return
                        }
                    }
                }
            }
        })
    }, [location.state?.topicId])

    const category = tree.find(
        (c) => c.id === categoryId
    )

    const subject = category?.subjects.find(
        (s) => s.id === subjectId
    )

    const selectedTopic = subject?.topics.find(
        (t) => t.id === topicId
    )

    const maxQuestions =
        selectedTopic?._count?.questions || 50

    async function startQuiz() {
        if (!user) {
            navigate("/login")
            return
        }

        if (!categoryId) {
            setError(
                "Please choose a category first."
            )
            return
        }

        try {
            setLoading(true)
            setError("")

            const result =
                await api.startQuiz({
                    categoryId,
                    subjectId:
                        subjectId || undefined,
                    topicId:
                        topicId || undefined,
                    count
                })

            navigate("/quiz", {
                state: result
            })
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <Layout>
                <div className="max-w-xl">
                    <h1 className="text-3xl font-bold">
                        Quiz Playground
                    </h1>

                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Please{" "}
                        <Link
                            to="/login"
                            className="text-green-800 font-medium"
                        >
                            login
                        </Link>{" "}
                        to start quizzes.
                    </p>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            {/* <Breadcrumb
                items={[
                    {
                        label: "Home",
                        to: "/"
                    },
                    {
                        label: "Quiz Playground"
                    }
                ]}
            /> */}

            {/* <div className="max-w-2xl">
                <h1 className="text-3xl font-bold">
                    Quiz Playground
                </h1>

                <p className="mt-3 text-gray-600 dark:text-gray-400">
                    Create a custom quiz and test your
                    placement preparation.
                </p>
            </div> */}

            {error && (
                <div className="mt-1 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
                    {error}
                </div>
            )}

            <div className="mt-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                {/* Step 1 */}

                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-8 rounded-full bg-green-800 text-white flex items-center justify-center text-sm font-bold">
                            1
                        </div>

                        <h2 className="font-semibold text-lg">
                            Choose Category
                        </h2>
                    </div>

                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(
                                e.target.value
                            )
                            setSubjectId("")
                            setTopicId("")
                        }}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3"
                    >
                        <option value="">
                            Select Category
                        </option>

                        {tree.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Step 2 */}

                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-8 rounded-full bg-green-800 text-white flex items-center justify-center text-sm font-bold">
                            2
                        </div>

                        <h2 className="font-semibold text-lg">
                            Choose Subject
                        </h2>
                    </div>

                    <select
                        value={subjectId}
                        disabled={!categoryId}
                        onChange={(e) => {
                            setSubjectId(
                                e.target.value
                            )
                            setTopicId("")
                        }}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3"
                    >
                        <option value="">
                            All Subjects
                        </option>

                        {category?.subjects.map(
                            (subject) => (
                                <option
                                    key={subject.id}
                                    value={
                                        subject.id
                                    }
                                >
                                    {subject.name}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Step 3 */}

                <div className="mt-8">
                    <div className="flex items-center gap-4 mb-1">
                        <div className="h-8 w-8 rounded-full bg-green-800 text-white flex items-center justify-center text-sm font-bold">
                            3
                        </div>

                        <h2 className="font-semibold text-lg">
                            Choose Topic
                        </h2>
                    </div>

                    <select
                        value={topicId}
                        disabled={!subjectId}
                        onChange={(e) =>
                            setTopicId(
                                e.target.value
                            )
                        }
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-3"
                    >
                        <option value="">
                            All Topics
                        </option>

                        {subject?.topics.map(
                            (topic) => (
                                <option
                                    key={topic.id}
                                    value={
                                        topic.id
                                    }
                                >
                                    {topic.name} (
                                    {
                                        topic
                                            ._count
                                            .questions
                                    }{" "}
                                    Questions)
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* Step 4 */}

                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-green-800 text-white flex items-center justify-center text-sm font-bold">
                            4
                        </div>

                        <h2 className="font-semibold text-lg">
                            Number of Questions
                        </h2>
                    </div>

                    <input
                        type="range"
                        min={5}
                        max={Math.min(
                            maxQuestions,
                            100
                        )}
                        value={count}
                        onChange={(e) =>
                            setCount(
                                Number(
                                    e.target.value
                                )
                            )
                        }
                        className="w-full"
                    />

                    <div className="mt-3 text-green-800 font-semibold">
                        {count} Questions
                    </div>
                </div>

                {/* Summary */}

               {/* <div className="mt-10 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-5">
                    <h3 className="font-semibold">
                        Quiz Summary
                    </h3>

                    <div className="mt-3 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                        <p>
                            Questions: {count}
                        </p>

                        <p>
                            Time Limit: 30 seconds
                            per question
                        </p>

                        <p>
                            Results will be saved to
                             your history.
                        </p>
                    </div>
                </div> */}

                <button
                    onClick={startQuiz}
                    disabled={loading}
                    className="mt-8 w-full bg-green-800 hover:bg-green-800 text-white py-4 rounded-xl font-semibold"
                >
                    {loading
                        ? "Starting Quiz..."
                        : "Start Quiz"}
                </button>
            </div>
        </Layout>
    )
}