export const Metric = (value: string | number, unit = "") => (
    <span className="font-mono text-sm text-slate-100">
        {value}
        <small className="ml-1 text-[10px] text-slate-500">{unit}</small>
    </span>
);