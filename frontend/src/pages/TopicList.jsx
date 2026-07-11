import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import Breadcrumb from "../components/Breadcrumb"
import { api } from "../api/client"

export default function TopicList() {
    const { categorySlug, subjectSlug } = useParams()

    const [data, setData] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        api.getTopics(categorySlug, subjectSlug)
            .then(setData)
            .catch((e) => setError(e.message))
    }, [categorySlug, subjectSlug])

    return (
        <Layout>
            <Breadcrumb
                items={[
                    {
                        label: "Home",
                        to: "/"
                    },
                    {
                        label: "Subjects",
                        to: "/subjects"
                    },
                    {
                        label:
                            data?.category.name ||
                            categorySlug,
                        to: `/subjects/${categorySlug}`
                    },
                    {
                        label:
                            data?.name ||
                            subjectSlug
                    }
                ]}
            />

            <div className="rounded-2xl bg-green-800 text-white p-8">
                <h1 className="text-4xl font-bold">
                    {data?.name || "Loading..."}
                </h1>

                <p className="mt-3 text-green-100">
                    Choose a topic and start learning through guided practice questions.
                </p>
            </div>

            {error && (
                <div className="mt-6 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
                    {error}
                </div>
            )}

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data?.topics.map((topic) => (
                    <Link
                        key={topic.id}
                        to={`/subjects/${categorySlug}/${subjectSlug}/${topic.slug}`}
                        className="group"
                    >
                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 h-full hover:border-green-500 transition">
                            <h2 className="text-lg font-semibold group-hover:text-green-800">
                                {topic.name}
                            </h2>

                            <div className="mt-3 text-sm text-gray-500">
                                {topic._count.questions} Questions
                            </div>

                            <div className="mt-5 flex justify-between items-center">
                                <span className="text-green-800 font-medium">
                                    Start Practice
                                </span>

                                <span className="text-green-800">
                                    →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </Layout>
    )
}