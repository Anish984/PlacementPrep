import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import PageHeader from "../components/PageHeader"
import { api } from "../api/client"
import { ChevronRight, Layers } from "lucide-react"

export default function CategoryList() {
    const [categories, setCategories] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    return (
        <Layout>
            <div className="page-container">
                <PageHeader
                    breadcrumb={[{ label: "Home", to: "/" }, { label: "Subjects" }]}
                    title="Subjects"
                    description="Choose a category to explore subjects, topics, and practice questions."
                />

                {loading && <p className="text-[var(--muted-foreground)]">Loading...</p>}
                {error && <p className="text-[var(--destructive)]">{error}</p>}

                <div className="grid sm:grid-cols-2 gap-4">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/subjects/${category.slug}`}
                            className="card-surface card-surface-hover p-5 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg">{category.name}</h2>
                                    <p className="text-sm text-[var(--muted-foreground)]">
                                        {category._count.subjects} subjects
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
