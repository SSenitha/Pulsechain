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
        <div className="mb-6 flex items-end justify-between gap-3">
            <div>
                <div className="text-[11px] font-medium tracking-widest text-cyan-400/70 uppercase">
                    {eyebrow}
                </div>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-100 leading-tight">
                    {title}
                </h1>
            </div>
            {action}
        </div>
    );
}