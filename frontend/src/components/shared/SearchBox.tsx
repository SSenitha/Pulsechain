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
        <label className="flex h-9 items-center gap-2 border border-slate-700 bg-slate-900/60 px-3 text-slate-500 focus-within:border-cyan-400/70">
            <Search size={14} />
            <input
                data-testid={testId}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
            />
        </label>
    );
}