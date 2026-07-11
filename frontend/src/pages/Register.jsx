import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../context/AuthContext"

export default function Register() {
    const { register, login } = useAuth()

    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    async function onSubmit(e) {
        e.preventDefault()

        setError("")

        try {
            await register(
                username,
                email,
                password
            )

            await login(email, password)

            navigate("/dashboard")
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <Layout>
            <div className="max-w-md mx-auto">
                <div className="rounded-2xl bg-green-700 text-white p-8 text-center">
                    <h1 className="text-3xl font-bold">
                        Create Account
                    </h1>

                    <p className="mt-3 text-green-100">
                        Start tracking your progress and
                        competing with others.
                    </p>
                </div>

                <form
                    onSubmit={onSubmit}
                    className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
                >
                    {error && (
                        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            Username
                        </label>

                        <input
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-3"
                            placeholder="Choose username"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 font-medium">
                            Email Address
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-3"
                            placeholder="Enter email"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            minLength={6}
                            required
                            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 px-4 py-3"
                            placeholder="Minimum 6 characters"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-green-700 hover:bg-green-800 text-white py-3 font-medium"
                    >
                        Create Account
                    </button>
                </form>

                <div className="text-center mt-6 text-gray-600 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-green-700 font-medium"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </Layout>
    )
}