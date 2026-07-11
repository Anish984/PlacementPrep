import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import Breadcrumb from "../components/Breadcrumb"
import { api } from "../api/client"

export default function CategoryList() {
    const [categories, setCategories] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        api.getCategories()
            .then(setCategories)
            .catch((e) => setError(e.message))
    }, [])

    const icons = [
        "🧮",
        "🧠",
        "💻",
        "📝",
        "📊",
        "⚡",
        "📚",
        "🎯"
    ]

    return (
        <Layout>
            {/* <Breadcrumb
                items={[
                    {
                        label: "Home",
                        to: "/"
                    },
                    {
                        label: "Subjects"
                    }
                ]}
            />

            {/* Hero */}

            {/* <div className="rounded-2xl bg-green-900 text-white p-8">
                <h1 className="text-4xl font-bold">
                    Explore Subjects
                </h1>

                <p className="mt-3 text-green-100 max-w-2xl">
                    Choose a category and start building
                    your placement preparation journey
                    through structured practice and quizzes.
                </p>
            </div> */} 
              <h1 className="text-2xl font-bold">
                    Explore Subjects
                </h1>
            {error && (
                <div className="mt-6 rounded-xl border border-red-300 bg-red-50 text-red-700 p-4">
                    {error}
                </div>
            )}

            {/* Categories */}

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {categories.map((category, index) => (
                    <Link
                        key={category.id}
                        to={`/subjects/${category.slug}`}
                        className="group"
                    >
                        <div className="h-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800  dark:bg-gray-900 p-6 hover:border-green-500 transition-all hover:-translate-y-1">
                            <div className="text-5xl">
                                {icons[index % icons.length]}
                            </div>

                            <h2 className="mt-5 text-xl font-semibold group-hover:text-green-800">
                                {category.name}
                            </h2>


                            <div className="mt-2 text-sm text-gray-500">
                                {category._count.subjects} Subjects
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-green-800 font-medium">
                                    Start Learning
                                </span>

                                <span className="text-green-800 text-lg">
                                    →
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Learning Flow */}

            {/* <div className="mt-12 rounded-2xl border border-green-200 dark:border-green-900 bg-green-400 dark:bg-green-950/20 p-8">
                <h2 className="text-2xl font-bold">
                    How Learning Works
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                    <Step
                        number="1"
                        title="Choose"
                        desc="Select a category"
                    />

                    <Step
                        number="2"
                        title="Study"
                        desc="Browse topics"
                    />

                    <Step
                        number="3"
                        title="Practice"
                        desc="Solve questions"
                    />

                    <Step
                        number="4"
                        title="Improve"
                        desc="Track progress"
                    />
                </div> */}
            {/* </div> */}
        </Layout>
    )
}

function Step({ number, title, desc }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
            <div className="h-10 w-10 rounded-full bg-green-800 text-white flex items-center justify-center font-bold">
                {number}
            </div>

            <div className="mt-4 font-semibold">
                {title}
            </div>

            <div className="mt-1 text-sm text-gray-500">
                {desc}
            </div>
        </div>
    )
}