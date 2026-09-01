import { useState } from 'react';
import { ArrowRight, LockKeyhole, MapPin, Search } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/shared/Button';
import { Logo } from '@/components/shared/Logo';
import { SearchBox } from '@/components/shared/SearchBox';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useApp } from '@/context/AppContext';

export function Track() {
    const { packages } = useApp();
    const [query, setQuery] = useState('PKG-VAX-881');
    const [searched, setSearched] = useState('PKG-VAX-881');
    const pkg = packages.find(
        (item) => item.id.toLowerCase() === searched.toLowerCase(),
    );

    return (
        <div className="min-h-[100dvh] bg-[#071219] text-slate-200 signal-grid">
            <header className="flex h-[76px] items-center justify-between border-b border-slate-800 bg-[#061017] px-5 md:px-10">
                <Logo />
                <Link
                    href="/login"
                    className="flex items-center gap-2 font-mono text-[10px] text-slate-500 hover:text-cyan-300"
                    data-testid="link-tracker-login"
                >
                    <LockKeyhole size={13} /> OPERATIONS LOGIN
                </Link>
            </header>
            <main className="mx-auto max-w-[920px] px-5 py-12 md:py-20">
                <div className="max-w-xl">
                    <div className="font-mono text-[10px] tracking-[.2em] text-cyan-400">
                        PUBLIC CHAIN-OF-CUSTODY
                    </div>
                    <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em] text-slate-100 md:text-6xl">
                        Know where
                        <br />
                        <span className="text-cyan-300">your cold chain</span> stands.
                    </h1>
                    <p className="mt-5 text-sm leading-6 text-slate-500">
                        Enter a consignment identifier to see its verified handoffs and
                        thermal integrity status.
                    </p>
                </div>
                <div className="mt-10 flex gap-2">
                    <SearchBox
                        value={query}
                        onChange={setQuery}
                        placeholder="Package ID, e.g. PKG-VAX-881"
                        testId="input-public-package-search"
                    />
                    <Button
                        variant="primary"
                        onClick={() => setSearched(query.trim())}
                        testId="button-public-package-search"
                    >
                        Track <ArrowRight size={14} />
                    </Button>
                </div>
                {pkg ? (
                    <div className="mt-8 grid gap-5 md:grid-cols-[1fr_290px]">
                        <section className="panel p-5 md:p-7 reveal">
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
                                <div>
                                    <div className="font-mono text-[10px] text-slate-600">
                                        VERIFIED CONSIGNMENT
                                    </div>
                                    <h2
                                        className="mt-2 font-mono text-xl text-slate-100"
                                        data-testid="text-public-package-id"
                                    >
                                        {pkg.id}
                                    </h2>
                                    <div className="mt-1 text-xs text-slate-500">
                                        {pkg.product} · LOT {pkg.lot}
                                    </div>
                                </div>
                                <StatusBadge health={pkg.health} />
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div>
                                    <div className="font-mono text-[9px] text-slate-600">
                                        THERMAL INTEGRITY
                                    </div>
                                    <div
                                        className={`mt-2 text-lg ${pkg.health === 'critical' ? 'text-rose-300' : 'text-emerald-300'}`}
                                        data-testid="status-public-thermal"
                                    >
                                        {pkg.health === 'critical' ? 'COMPROMISED' : 'INTACT'}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-mono text-[9px] text-slate-600">
                                        LAST VERIFIED
                                    </div>
                                    <div className="mt-2 font-mono text-sm text-slate-200">
                                        {pkg.updated}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <div className="mb-5 font-mono text-[10px] tracking-[.15em] text-slate-500">
                                    CHAIN OF CUSTODY
                                </div>
                                <div className="space-y-5">
                                    {[
                                        [
                                            '08:24:42',
                                            'ORIGIN SCAN',
                                            pkg.origin,
                                            'Verified at source facility',
                                        ],
                                        [
                                            '09:16:08',
                                            'SEALED HANDOFF',
                                            `Asset ${pkg.truck}`,
                                            'Seal and sensor pair verified',
                                        ],
                                        ['11:08:31', 'IN TRANSIT', pkg.destination, `ETA ${pkg.eta}`],
                                        [
                                            'NOW',
                                            'CURRENT STATUS',
                                            pkg.health === 'critical' ? 'REVIEW REQUIRED' : 'MONITORING',
                                            'Pulsechain telemetry active',
                                        ],
                                    ].map(([time, event, place, detail], i) => (
                                        <div
                                            className="flex gap-4"
                                            key={time + event}
                                            data-testid={`row-public-timeline-${i}`}
                                        >
                                            <div className="w-14 shrink-0 font-mono text-[9px] text-slate-600">
                                                {time}
                                            </div>
                                            <div className="relative border-l border-slate-700 pl-5">
                                                <span
                                                    className={`absolute -left-[4px] top-0.5 h-2 w-2 ${i === 3 && pkg.health === 'critical' ? 'bg-rose-300' : 'bg-cyan-300'}`}
                                                />
                                                <div className="font-mono text-[10px] text-cyan-200">
                                                    {event}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-300">
                                                    {place}
                                                </div>
                                                <div className="mt-1 text-[10px] text-slate-600">
                                                    {detail}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                        <aside className="space-y-5">
                            <div className="panel p-5">
                                <div className="font-mono text-[10px] tracking-[.15em] text-slate-500">
                                    TEMPERATURE WINDOW
                                </div>
                                <div className="mt-5 flex items-end justify-between">
                                    <span className="font-mono text-2xl text-cyan-300">
                                        {pkg.actual.toFixed(1)}°C
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-500">
                                        {pkg.tempMin}° — {pkg.tempMax}°
                                    </span>
                                </div>
                                <div className="mt-3 h-2 bg-slate-800">
                                    <div
                                        className={`h-full ${pkg.actual > pkg.tempMax ? 'bg-rose-400' : 'bg-emerald-400'}`}
                                        style={{
                                            width: `${Math.min(100, Math.max(12, ((pkg.actual - pkg.tempMin) / (pkg.tempMax - pkg.tempMin)) * 100))}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="panel p-5">
                                <div className="font-mono text-[10px] tracking-[.15em] text-slate-500">
                                    CARRIER ROUTE
                                </div>
                                <div className="mt-4 flex items-start gap-3">
                                    <MapPin size={15} className="mt-0.5 text-orange-300" />
                                    <div>
                                        <div className="text-xs text-slate-200">{pkg.origin}</div>
                                        <div className="my-2 ml-1 h-5 border-l border-dashed border-slate-700" />
                                        <div className="text-xs text-slate-200">
                                            {pkg.destination}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 border-t border-slate-800 pt-3 font-mono text-[10px] text-slate-500">
                                    {pkg.truck} · {pkg.carrier}
                                </div>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <div
                        className="panel mt-8 p-16 text-center reveal"
                        data-testid="empty-public-tracker"
                    >
                        <Search size={28} className="mx-auto text-slate-700" />
                        <div className="mt-4 text-sm text-slate-300">
                            No verified movement found
                        </div>
                        <p className="mt-2 text-xs text-slate-600">
                            Check the identifier and try again.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
