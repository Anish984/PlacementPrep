import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui/button"
import { useEffect, useState } from "react"

export default function Layout({ children }) {
    const { user, logout } = useAuth()
    const location = useLocation()

    const [menuOpen, setMenuOpen] = useState(false)

    function applyTheme(theme) {
        document.documentElement.classList.toggle(
            "dark",
            theme === "dark"
        )
    }

    function toggleTheme() {
        const current =
            localStorage.getItem("theme") || "light"

        const next =
            current === "light"
                ? "dark"
                : "light"

        localStorage.setItem("theme", next)
        applyTheme(next)
    }

    useEffect(() => {
        const saved =
            localStorage.getItem("theme") || "light"

        applyTheme(saved)
    }, [])

    function isActive(path) {
        return (
            location.pathname === path ||
            location.pathname.startsWith(
                path + "/"
            )
        )
    }

    function navClass(path) {
        return `
            px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${
                isActive(path)
                    ? "bg-green-100 text-green-100 dark:bg-green-900 dark:text-green-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-green-500 dark:hover:bg-green-200"
            }
        `
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--text)' }}>
            {/* Header */}

            <header
                className="sticky top-0 z-50"
                style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}
            >
                <div className="max-w-7xl mx-auto px-4 lg:px-6">
                    <div className="h-18 flex items-center justify-between">
                        {/* Logo */}

                        <Link
                            to="/"
                            className="flex items-center gap-3"
                        >
                            <div className="h-10 w-10 rounded-lg bg-green-800 text-white flex items-center justify-center font-bold">
                                LQ
                            </div>

                            <div>
                                <div className="font-bold text-2xl">
                                    LetsQuiz
                                </div>

                                <div className="text-xs text-gray-800">
                                    Placement Preparation
                                </div>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}

                        <nav className="hidden lg:flex items-center gap-2">
                            <Link
                                to="/subjects"
                                className={navClass(
                                    "/subjects"
                                )}
                            >
                                Subjects
                            </Link>

                            <Link
                                to="/playground"
                                className={navClass(
                                    "/playground"
                                )}
                            >
                                Practice
                            </Link>

                            <Link
                                to="/multiplayer"
                                className={navClass(
                                    "/multiplayer"
                                )}
                            >
                                Quiz Arena
                            </Link>

                            {user && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={navClass(
                                            "/dashboard"
                                        )}
                                    >
                                        Progress
                                    </Link>

                                    <Link
                                        to="/history"
                                        className={navClass(
                                            "/history"
                                        )}
                                    >
                                        History
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Desktop Right */}

                        <div className="hidden lg:flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={toggleTheme}
                            >
                                🌙
                            </Button>

                            {user ? (
                                <>
                                    <div className="text-sm">
                                        <span className="text-gray-500">
                                            Welcome,
                                        </span>{" "}
                                        <span className="font-semibold">
                                            {
                                                user.username
                                            }
                                        </span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={
                                            logout
                                        }
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button variant="outline">
                                            Login
                                        </Button>
                                    </Link>

                                    <Link to="/register">
                                        <Button>
                                            Register
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Button */}

                        <button
                            onClick={() =>
                                setMenuOpen(
                                    !menuOpen
                                )
                            }
                            className="lg:hidden p-2 rounded-md border border-gray-300 dark:border-gray-700"
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}

                {menuOpen && (
                    <div className="lg:hidden border-t border-gray-200 dark:border-gray-800">
                        <div className="p-4 flex flex-col gap-2">
                            <Link
                                to="/subjects"
                                className={navClass(
                                    "/subjects"
                                )}
                                onClick={() =>
                                    setMenuOpen(
                                        false
                                    )
                                }
                            >
                                Subjects
                            </Link>

                            <Link
                                to="/playground"
                                className={navClass(
                                    "/playground"
                                )}
                                onClick={() =>
                                    setMenuOpen(
                                        false
                                    )
                                }
                            >
                                Practice
                            </Link>

                            <Link
                                to="/multiplayer"
                                className={navClass(
                                    "/multiplayer"
                                )}
                                onClick={() =>
                                    setMenuOpen(
                                        false
                                    )
                                }
                            >
                                Quiz Arena
                            </Link>

                            {user && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={navClass(
                                            "/dashboard"
                                        )}
                                    >
                                        Progress
                                    </Link>

                                    <Link
                                        to="/history"
                                        className={navClass(
                                            "/history"
                                        )}
                                    >
                                        History
                                    </Link>
                                </>
                            )}

                            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                                {user ? (
                                    <Button
                                        variant="outline"
                                        onClick={
                                            logout
                                        }
                                    >
                                        Logout
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Link to="/login">
                                            <Button variant="outline">
                                                Login
                                            </Button>
                                        </Link>

                                        <Link to="/register">
                                            <Button>
                                                Register
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}

            <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
                {children}
            </main>
        </div>
    )
}