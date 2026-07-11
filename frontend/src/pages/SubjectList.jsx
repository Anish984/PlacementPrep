import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import Breadcrumb from "../components/Breadcrumb"
import { api } from "../api/client"

export default function SubjectList() {
    const { categorySlug } = useParams()

    const [data, setData] = useState(null)
    const [error, setError] = useState("")
    const [expanded, setExpanded] = useState({})
    const [topicsBySubject, setTopicsBySubject] = useState({})

    useEffect(() => {
        api.getSubjects(categorySlug)
            .then(setData)
            .catch((e) => setError(e.message))
    }, [categorySlug])

    return (
        <Layout>
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: "Subjects", to: "/subjects" },
                    { label: data?.name || categorySlug }
                ]}
            />

            <div className="rounded-2xl bg-green-800 text-white p-8">
                <h1 className="text-4xl font-bold">
                    {data?.name || "Loading..."}
                </h1>

                <p className="mt-3 text-green-100">
                    Select a subject and begin practicing topic-wise questions.
                </p>
            </div>

            {error && (
                <div className="mt-6 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
                    {error}
                </div>
            )}

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data?.subjects.map((subject) => (
                    <div key={subject.id} className="group">
                        <div className="rounded-xl border p-5 h-full hover:border-green-500 transition box-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold group-hover:text-green-800">
                                        <Link to={`/subjects/${categorySlug}/${subject.slug}`}>{subject.name}</Link>
                                    </h2>

                                    <div className="mt-3 text-sm text-gray-500">
                                        {subject._count.topics} Topics
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <button
                                        type="button"
                                        className="text-sm px-3 py-1 rounded bg-green-50 text-green-800"
                                        onClick={async (e) => {
                                            e.preventDefault()
                                            const key = subject.slug
                                            setExpanded((s) => ({ ...s, [key]: !s[key] }))
                                            if (!topicsBySubject[key] && !expanded[key]) {
                                                try {
                                                    const t = await api.getTopics(categorySlug, subject.slug)
                                                    setTopicsBySubject((m) => ({ ...m, [key]: t.topics }))
                                                } catch (err) {
                                                    // ignore fetch errors for topics
                                                }
                                            }
                                        }}
                                    >
                                        {expanded[subject.slug] ? 'Hide topics' : 'Show topics'}
                                    </button>

                                    <div className="mt-3 text-green-800 font-medium">
                                        <Link to={`/subjects/${categorySlug}/${subject.slug}`}>Explore →</Link>
                                    </div>
                                </div>
                            </div>

                            {expanded[subject.slug] && (
                                <div className="mt-4 border-t pt-4">
                                    <ul className="space-y-2">
                                        {(topicsBySubject[subject.slug] || []).map((topic) => (
                                            <li key={topic.id}>
                                                <Link
                                                    to={`/subjects/${categorySlug}/${subject.slug}/${topic.slug}`}
                                                    className="text-sm text-gray-800 dark:text-gray-200 hover:text-green-800"
                                                >
                                                    {topic.name} <span className="text-xs text-gray-500">({topic._count.questions} questions)</span>
                                                </Link>
                                            </li>
                                        ))}
                                        {(!topicsBySubject[subject.slug] || topicsBySubject[subject.slug].length === 0) && (
                                            <li className="text-sm text-gray-500">Loading topics…</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    )
}