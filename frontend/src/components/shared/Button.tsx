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
            ? 'border-cyan-300/70 bg-cyan-300 text-[#07151c] hover:bg-cyan-200'
            : variant === 'danger'
                ? 'border-rose-400/50 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20'
                : variant === 'ghost'
                    ? 'border-transparent text-slate-400 hover:border-slate-600 hover:text-slate-100'
                    : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-200';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex min-h-9 items-center justify-center gap-2 border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
            data-testid={testId}
        >
            {children}
        </button>
    );
}