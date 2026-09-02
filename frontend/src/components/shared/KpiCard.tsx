type KpiCardProps = {
    name: string;
    value: string;
    note: string;
    accent?: 'cyan' | 'orange' | 'rose' | 'emerald';
};

export function KpiCard({
    name,
    value,
    note,
    accent = 'cyan',
}: KpiCardProps) {
    const color =
        accent === 'orange'
            ? 'text-orange-300'
            : accent === 'rose'
                ? 'text-rose-300'
                : accent === 'emerald'
                    ? 'text-emerald-300'
                    : 'text-cyan-300';

    return (
        <div
            className="panel p-5 transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
            data-testid={`kpi-${name.toLowerCase().replaceAll(' ', '-')}`}
        >
            <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                {name}
            </div>
            <div className={`mt-2 text-3xl font-semibold tracking-tight ${color}`}>{value}</div>
            <div className="mt-1 text-xs text-slate-400">{note}</div>
        </div>
    );
}