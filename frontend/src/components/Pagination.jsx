export default function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    const pages = []
    for (let i = 1; i <= totalPages; i++) pages.push(i)

    return (
        <p className="pager">
            {page > 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => onPageChange(page - 1)}>
                    Prev
                </button>
            )}
            {pages.map((n) =>
                n === page ? (
                    <strong key={n} style={{ marginRight: 6 }}>
                        [{n}]
                    </strong>
                ) : (
                    <button
                        key={n}
                        type="button"
                        className="btn btn-secondary"
                        style={{ marginRight: 4 }}
                        onClick={() => onPageChange(n)}
                    >
                        {n}
                    </button>
                )
            )}
            {page < totalPages && (
                <button type="button" className="btn btn-secondary" onClick={() => onPageChange(page + 1)}>
                    Next
                </button>
            )}
        </p>
    )
}
