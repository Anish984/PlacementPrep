import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import Layout from "../components/Layout"
import PageHeader from "../components/PageHeader"
import Pagination from "../components/Pagination"
import PracticeQuestion from "../components/PracticeQuestion"
import { api } from "../api/client"

const QUESTIONS_PER_PAGE = 5

export default function Practice() {
    const { categorySlug, subjectSlug, topicSlug } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const page = parseInt(searchParams.get("page") || "1", 10)

    const [data, setData] = useState(null)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        setError("")

        api.getPracticeQuestions(
            categorySlug,
            subjectSlug,
            topicSlug,
            page,
            QUESTIONS_PER_PAGE
        )
            .then(setData)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [categorySlug, subjectSlug, topicSlug, page])

    function handlePageChange(newPage) {
        setSearchParams({ page: String(newPage) })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const startingQuestionNumber = (page - 1) * QUESTIONS_PER_PAGE + 1

    return (
        <Layout>
            <div className="page-container">
                {data && (
                    <PageHeader
                        breadcrumb={[
                            { label: "Home", to: "/" },
                            { label: "Subjects", to: "/subjects" },
                            { label: data.topic.category, to: `/subjects/${categorySlug}` },
                            { label: data.topic.subject, to: `/subjects/${categorySlug}/${subjectSlug}` },
                            { label: data.topic.name }
                        ]}
                        title={data.topic.name}
                        description={`${data.topic.questionCount} questions · Page ${data.page} of ${data.totalPages} · Select an option to check your answer`}
                    />
                )}

                {loading && <p className="text-[var(--muted-foreground)]">Loading questions...</p>}
                {error && <p className="text-[var(--destructive)]">{error}</p>}

                {data && (
                    <>
                        <div className="space-y-5">
                            {data.questions.map((question, index) => (
                                <PracticeQuestion
                                    key={question.id}
                                    question={question}
                                    questionNumber={startingQuestionNumber + index}
                                />
                            ))}
                        </div>

                        <Pagination
                            page={data.page}
                            totalPages={data.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </Layout>
    )
}
