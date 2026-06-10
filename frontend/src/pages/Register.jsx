import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Card, CardContent } from "../components/ui/Card"
import { Button } from "../components/ui/button"
import { useAuth } from "../context/AuthContext"

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError("")
        setLoading(true)

        try {
            await register(username, email, password)
            navigate("/dashboard")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="page-container flex justify-center py-12">
                <Card className="w-full max-w-md shadow-[var(--shadow-md)]">
                    <CardContent className="pt-8">
                        <h1 className="text-2xl font-bold mb-1">Create account</h1>
                        <p className="text-sm text-[var(--muted-foreground)] mb-6">
                            Start practicing and build your personalised dashboard.
                        </p>

                        {error && (
                            <p className="text-sm text-[var(--destructive)] bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                {error}
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Username</label>
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    className="w-full border border-[var(--border)] rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]/30"
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? "Creating account..." : "Sign up"}
                            </Button>
                        </form>

                        <p className="text-sm text-center text-[var(--muted-foreground)] mt-6">
                            Already have an account?{" "}
                            <Link to="/login" className="text-[var(--primary)] font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    )
}
