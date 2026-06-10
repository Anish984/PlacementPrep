export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) {
        return null
    }

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-10">
            <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-sm font-medium disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
            >
                Prev
            </button>

            {pages.map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    className={`min-w-[2.25rem] px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                        pageNumber === page
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                            : "border-[var(--border)] bg-white hover:bg-[var(--muted)]"
                    }`}
                >
                    {pageNumber}
                </button>
            ))}

            <button
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-sm font-medium disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
            >
                Next
            </button>
        </div>
    )
}
