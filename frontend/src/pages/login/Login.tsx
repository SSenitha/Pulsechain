import { useState } from 'react';
import { ArrowRight, Link2, Truck } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/shared/Button';
import { Logo } from '@/components/shared/Logo';
import { useApp } from '@/context/AppContext';
import { LiveClock } from '@/components/shared/LiveClock';
import type { Role } from '@/types';

export function Login() {
    const { setRole } = useApp();
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState('mara.okafor@northstarlogistics.co');
    const [password, setPassword] = useState('guardian-demo');
    const [error, setError] = useState('');

    const enter = (role: Role) => {
        setRole(role);
        setLocation('/fleet');
    };

    return (
        <div className="min-h-[100dvh] overflow-hidden bg-[#071219] text-slate-200 signal-grid">
            <div className="mx-auto flex min-h-[100dvh] max-w-[1380px] flex-col lg:flex-row">

                {/* Brand Section - LHS */}
                <section className="relative flex flex-1 flex-col justify-between overflow-hidden border-b border-slate-800 p-6 md:p-10 lg:border-b-0 lg:border-r lg:p-16">
                    <div>
                        <Logo />
                        <div className="mt-20 max-w-xl reveal">
                            <div className="mb-5 flex items-center gap-2 font-mono text-[10px] tracking-[.24em] text-orange-300">
                                <span className="status-dot bg-orange-400" />
                                OPERATIONAL VISIBILITY SYSTEM / 04
                            </div>
                            <h1 className="text-5xl font-semibold leading-[.98] tracking-[-.05em] text-slate-100 md:text-7xl">
                                Keep the
                                <br />
                                <span className="text-cyan-300">cold chain</span>
                                <br />
                                in motion.
                            </h1>
                            <p className="mt-7 max-w-md text-sm leading-6 text-slate-500">
                                Pulsechain Guardian turns every temperature signal, door event,
                                and handoff into a decision your team can trust.
                            </p>
                        </div>
                    </div>
                    <div className="mt-16 flex flex-wrap gap-2 font-mono text-[11px] text-slate-300">
                        <Truck size={14} className="text-cyan-400" />
                        <span>12 ACTIVE ASSETS</span>
                        <span className="pl-3"><LiveClock /></span>
                    </div>
                    <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full border border-cyan-300/15" />
                    <div className="pointer-events-none absolute -bottom-16 -right-8 h-52 w-52 rounded-full border border-orange-300/10" />
                </section>

                {/* Login & PV link - RHS */}
                <section className="flex w-full items-center justify-center p-6 md:p-10 lg:w-[510px]">
                    <div className="w-full max-w-[370px] reveal-2">
                        <div className="mb-9">
                            <div className="font-mono text-[10px] tracking-[.2em] text-cyan-400">
                                SECURE ACCESS / PCG-01
                            </div>
                            <h2 className="mt-3 text-2xl font-semibold text-slate-100">
                                Enter command center
                            </h2>
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                email && password
                                    ? enter('Operator')
                                    : setError('Credentials required to establish session.');
                            }}
                            className="space-y-4"
                        >
                            <label className="block">
                                <span className="mb-2 block font-mono text-[10px] tracking-[.12em] text-slate-500">
                                    WORK EMAIL
                                </span>
                                <input
                                    data-testid="input-login-email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    type="email"
                                    className="h-11 w-full border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-400"
                                />
                            </label>
                            <label className="block">
                                <span className="mb-2 block font-mono text-[10px] tracking-[.12em] text-slate-500">
                                    ACCESS KEY
                                </span>
                                <input
                                    data-testid="input-login-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    type="password"
                                    className="h-11 w-full border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-400"
                                />
                            </label>
                            {error && (
                                <div
                                    className="border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200"
                                    data-testid="status-login-error"
                                >
                                    {error}
                                </div>
                            )}
                            <Button
                                type="submit"
                                variant="primary"
                                className="h-11 w-full"
                                testId="button-login-submit"
                            >
                                Establish session <ArrowRight size={15} />
                            </Button>
                        </form>

                        {/* Public tracker link */}
                        <Link
                            href="/track"
                            className="mt-7 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[.12em] text-cyan-400 hover:text-cyan-200"
                            data-testid="link-public-tracker"
                        >
                            <Link2 size={13} /> OPEN PUBLIC TRACKER
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
