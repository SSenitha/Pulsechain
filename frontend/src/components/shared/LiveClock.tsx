import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

export function getCurrentTimeWithZone(timeZone?: string) {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat(undefined, {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'short',
    });

    const parts = formatter.formatToParts(now);
    const time = parts
        .filter((part) => part.type !== 'timeZoneName')
        .map((part) => part.value)
        .join('')
        .trim();

    const zone = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'Local';

    return { time, zone };
}

export function LiveClock() {
    const [_, setNow] = useState(new Date());

    useEffect(() => {
        //const interval = window.setInterval(() => setNow(new Date()), 1000);
        const interval = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const { time, zone } = getCurrentTimeWithZone();

    return (
        <div
            className="hidden items-center gap-2 border-l border-slate-700 pl-4 sm:flex"
            data-testid="text-live-clock"
        >
            <Clock3 size={14} className="text-cyan-400" />
            <span className="font-mono text-[11px] text-slate-300"> {time} {zone} </span>
        </div>
    );
}