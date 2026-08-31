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
            className="panel p-4"
            data-testid={`kpi-${name.toLowerCase().replaceAll(' ', '-')}`}
        >
            <div className="font-mono text-[9px] tracking-[.15em] text-slate-600">
                {name}
            </div>
            <div className={`mt-2 text-2xl font-semibold ${color}`}>{value}</div>
            <div className="mt-1 text-[10px] text-slate-500">{note}</div>
        </div>
    );
}