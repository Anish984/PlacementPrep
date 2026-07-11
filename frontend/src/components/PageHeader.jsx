import Breadcrumb from "./Breadcrumb"

export default function PageHeader({ breadcrumb, title, description, action }) {
    return (
        <div className="mb-8">
            {breadcrumb && <Breadcrumb items={breadcrumb} />}
            <div className="flex flex-wrap items-start justify-between gap-4 mt-2">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-(--foreground)">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-2 text-(--muted-foreground) max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>
        </div>
    )
}
