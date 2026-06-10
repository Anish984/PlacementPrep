import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Layout from "../components/Layout"
import PageHeader from "../components/PageHeader"
import { api } from "../api/client"
import { ChevronRight, FolderOpen } from "lucide-react"

export default function SubjectList() {
    const { categorySlug } = useParams()
    const [data, setData] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getSubjects(categorySlug)
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [categorySlug])

    return (
        <Layout>
            <div className="page-container">
                <PageHeader
                    breadcrumb={[
                        { label: "Home", to: "/" },
                        { label: "Subjects", to: "/subjects" },
                        { label: data?.name || categorySlug }
                    ]}
                    title={data?.name || "Subjects"}
                    description="Select a subject to view its topics."
                />

                {loading && <p className="text-[var(--muted-foreground)]">Loading...</p>}
                {error && <p className="text-[var(--destructive)]">{error}</p>}

                <div className="grid sm:grid-cols-2 gap-4">
                    {data?.subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            to={`/subjects/${categorySlug}/${subject.slug}`}
                            className="card-surface card-surface-hover p-5 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-[#fdeee6] text-[var(--accent)] flex items-center justify-center">
                                    <FolderOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">{subject.name}</h2>
                                    <p className="text-sm text-[var(--muted-foreground)]">
                                        {subject._count.topics} topics
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
