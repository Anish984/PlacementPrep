import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui/button"
import {
    BookOpen,
    LayoutDashboard,
    History,
    Gamepad2,
    GraduationCap,
    LogOut
} from "lucide-react"

const NAV_LINKS = [
    { to: "/subjects", label: "Subjects", icon: BookOpen },
    { to: "/playground", label: "Playground", icon: Gamepad2 },
    { to: "/history", label: "History", icon: History, auth: true }
]

export default function Layout({ children }) {
    const { user, logout } = useAuth()
    const location = useLocation()

    function isActive(path) {
        return location.pathname === path || location.pathname.startsWith(path + "/")
    }

    return (
        <div className="min-h-screen flex flex-col hero-pattern">
            <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-[var(--foreground)]">
                            LetsQuiz
                        </span>
                    </Link>

                    <nav className="hidden sm:flex items-center gap-1">
                        {NAV_LINKS.filter((link) => !link.auth || user).map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive(link.to)
                                        ? "bg-[var(--secondary)] text-[var(--primary)]"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                                }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        ))}
                        {user && (
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive("/dashboard")
                                        ? "bg-[var(--secondary)] text-[var(--primary)]"
                                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                                }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                        )}
                    </nav>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <>
                                <span className="hidden md:inline text-sm text-[var(--muted-foreground)]">
                                    {user.username}
                                </span>
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link to="/login">Login</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link to="/register">Sign up</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-[var(--border)] bg-white/60 mt-auto">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-[var(--muted-foreground)]">
                    LetsQuiz — Practice placement aptitude & technical questions
                </div>
            </footer>
        </div>
    )
}
