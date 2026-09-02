import { Search } from 'lucide-react';

type SearchBoxProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    testId: string;
};

export function SearchBox({
    value,
    onChange,
    placeholder,
    testId,
}: SearchBoxProps) {
    return (
        <label className="flex h-9 items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/50 px-3 text-slate-500 transition-colors focus-within:border-cyan-400/60 focus-within:bg-slate-800/80 hover:border-slate-600">
            <Search size={14} />
            <input
                data-testid={testId}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
            />
        </label>
    );
}