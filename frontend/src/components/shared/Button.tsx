import type { ReactNode } from 'react';

type ButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    className?: string;
    type?: 'button' | 'submit';
    disabled?: boolean;
    testId?: string;
};

export function Button({
    children,
    onClick,
    variant = 'secondary',
    className = '',
    type = 'button',
    disabled = false,
    testId = 'button-action',
}: ButtonProps) {
    const styles =
        variant === 'primary'
            ? 'border-cyan-400/60 bg-cyan-300 text-[#07151c] hover:bg-cyan-200 shadow-[0_0_16px_rgba(103,232,249,0.25)] hover:shadow-[0_0_22px_rgba(103,232,249,0.35)] active:scale-[.97]'
            : variant === 'danger'
                ? 'border-rose-400/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 active:scale-[.97]'
                : variant === 'ghost'
                    ? 'border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 active:scale-[.97]'
                    : 'border-slate-700/80 bg-slate-800/60 text-slate-200 hover:border-cyan-400/40 hover:bg-slate-700/60 hover:text-cyan-200 active:scale-[.97]';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-full border px-4 text-xs font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
            data-testid={testId}
        >
            {children}
        </button>
    );
}