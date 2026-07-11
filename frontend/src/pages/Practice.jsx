import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import Layout from "../components/Layout"
import Breadcrumb from "../components/Breadcrumb"
import Pagination from "../components/Pagination"
import PracticeQuestion from "../components/PracticeQuestion"
import { api } from "../api/client"

const PER_PAGE = 5

export default function Practice() {
    const { categorySlug, subjectSlug, topicSlug } =
        useParams()

    const [searchParams, setSearchParams] =
        useSearchParams()

    const page = parseInt(
        searchParams.get("page") || "1",
        10
    )

    const [data, setData] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        api.getPracticeQuestions(
            categorySlug,
            subjectSlug,
            topicSlug,
            page,
            PER_PAGE
        )
            .then(setData)
            .catch((e) =>
                setError(e.message)
            )
    }, [
        categorySlug,
        subjectSlug,
        topicSlug,
        page
    ])

    const startNum =
        (page - 1) * PER_PAGE + 1

    return (
        <Layout>
            {data && (
                <>
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
                                    data.topic
                                        .category,
                                to: `/subjects/${categorySlug}`
                            },
                            {
                                label:
                                    data.topic
                                        .subject,
                                to: `/subjects/${categorySlug}/${subjectSlug}`
                            },
                            {
                                label:
                                    data.topic.name
                            }
                        ]}
                    />

                    {/* Hero */}

                    <div className="rounded-2xl bg-green-800 text-white p-8">
                        <h1 className="text-2xl font-bold">
                            {data.topic.name}
                        </h1>

                        <p className="mt-3 text-green-100">
                            Practice
                            questions,
                            understand
                            explanations,
                            and strengthen
                            your concepts.
                        </p>

                        <div className="mt-5 flex gap-3 flex-wrap">
                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                                {
                                    data
                                        .topic
                                        .questionCount
                                }{" "}
                                Questions
                            </span>

                            <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                                Page {page} /
                                {
                                    data.totalPages
                                }
                            </span>
                        </div>
                    </div>
                </>
            )}

            {error && (
                <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-8 space-y-6">
                {data?.questions.map(
                    (question, index) => (
                        <PracticeQuestion
                            key={
                                question.id
                            }
                            question={
                                question
                            }
                            questionNumber={
                                startNum +
                                index
                            }
                        />
                    )
                )}
            </div>

            {data && (
                <div className="mt-10">
                    <Pagination
                        page={data.page}
                        totalPages={
                            data.totalPages
                        }
                        onPageChange={(
                            p
                        ) => {
                            setSearchParams({
                                page: String(
                                    p
                                )
                            })

                            window.scrollTo(
                                0,
                                0
                            )
                        }}
                    />
                </div>
            )}
        </Layout>
    )
}