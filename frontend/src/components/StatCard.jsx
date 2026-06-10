import { Card, CardContent } from "./ui/Card"

export default function StatCard({ label, value, hint, icon: Icon, tone = "default" }) {
    const tones = {
        default: "bg-[var(--secondary)] text-[var(--primary)]",
        accent: "bg-[#fdeee6] text-[var(--accent)]",
        success: "bg-[var(--success-bg)] text-[var(--success)]"
    }

    return (
        <Card>
            <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
                        <p className="text-2xl font-bold mt-1 font-[family-name:var(--font-serif)]">
                            {value}
                        </p>
                        {hint && (
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                {hint}
                            </p>
                        )}
                    </div>
                    {Icon && (
                        <div className={`p-2.5 rounded-xl ${tones[tone]}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
