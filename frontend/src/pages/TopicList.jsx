import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import PageHeader from "../components/PageHeader"
import { api } from "../api/client"
import { ChevronRight, FileQuestion } from "lucide-react"

export default function TopicList() {
    const { categorySlug, subjectSlug } = useParams()
    const [data, setData] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getTopics(categorySlug, subjectSlug)
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [categorySlug, subjectSlug])

    return (
        <Layout>
            <div className="page-container">
                <PageHeader
                    breadcrumb={[
                        { label: "Home", to: "/" },
                        { label: "Subjects", to: "/subjects" },
                        { label: data?.category.name || categorySlug, to: `/subjects/${categorySlug}` },
                        { label: data?.name || subjectSlug }
                    ]}
                    title={data?.name || "Topics"}
                    description="Pick a topic to start practicing questions."
                />

                {loading && <p className="text-[var(--muted-foreground)]">Loading...</p>}
                {error && <p className="text-[var(--destructive)]">{error}</p>}

                <div className="space-y-3">
                    {data?.topics.map((topic) => (
                        <Link
                            key={topic.id}
                            to={`/subjects/${categorySlug}/${subjectSlug}/${topic.slug}`}
                            className="card-surface card-surface-hover p-5 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-[var(--success-bg)] text-[var(--success)] flex items-center justify-center">
                                    <FileQuestion className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">{topic.name}</h2>
                                    <p className="text-sm text-[var(--muted-foreground)]">
                                        {topic._count.questions} questions available
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    )
}
