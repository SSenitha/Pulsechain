import type { Health } from '@/types';

export const tone = (health: Health) =>
    health === 'critical'
        ? 'text-rose-300 bg-rose-400/10 border-rose-400/25'
        : health === 'amber'
            ? 'text-amber-300 bg-amber-400/10 border-amber-400/25'
            : health === 'offline'
                ? 'text-slate-400 bg-slate-400/10 border-slate-400/20'
                : 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25';

export const label = (health: Health) =>
    health === 'critical'
        ? 'CRITICAL'
        : health === 'amber'
            ? 'PREDICTED WARNING'
            : health === 'offline'
                ? 'OFFLINE'
                : 'NOMINAL';

type StatusBadgeProps = {
    health: Health;
};

export function StatusBadge({ health }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[9px] tracking-[.08em] ${tone(health)}`}
            data-testid={`status-badge-${health}`}
        >
            <span className="status-dot bg-current" />
            {label(health)}
        </span>
    );
}