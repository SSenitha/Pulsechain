import type { ReactNode } from 'react';

type SectionTitleProps = {
    eyebrow: string;
    title: string;
    action?: ReactNode;
};

export function SectionTitle({
    eyebrow,
    title,
    action,
}: SectionTitleProps) {
    return (
        <div className="mb-5 flex items-end justify-between gap-3">
            <div>
                <div className="font-mono text-[10px] tracking-[.2em] text-cyan-400/75">
                    {eyebrow}
                </div>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">
                    {title}
                </h1>
            </div>
            {action}
        </div>
    );
}