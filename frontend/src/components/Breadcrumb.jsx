import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"

export default function Breadcrumb({ items }) {
    return (
        <nav className="text-sm text-[var(--muted-foreground)] mb-4 flex flex-wrap items-center gap-1">
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-1">
                    {index > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                    {item.to ? (
                        <Link
                            to={item.to}
                            className="hover:text-[var(--primary)] transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-[var(--foreground)] font-medium">
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    )
}
