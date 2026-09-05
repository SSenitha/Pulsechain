import { useState } from 'react';
import { ArrowRight, Link2, Truck, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/shared/Button';
import { Logo } from '@/components/shared/Logo';
import { useApp } from '@/context/AppContext';
import { LiveClock } from '@/components/shared/LiveClock';
import { authService } from '@/services/authService';
import type { Role } from '@/types';

export function Login() {
    const { setUser } = useApp();
    const [, setLocation] = useLocation();
    const [email, setEmail] = useState('mara.okafor@northstarlogistics.co');
    const [password, setPassword] = useState('guardian-demo');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSigningUp, setIsSigningUp] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!email.trim() || !password.trim()) {
            setError('Work email and access key are required.');
            return;
        }

        setIsLoggingIn(true);
        try {
            const loggedUser = await authService.login({ email: email.trim(), password: password.trim() });
            setUser({
                name: loggedUser.name || loggedUser.email.split('@')[0],
                email: loggedUser.email,
                role: (loggedUser.role as Role) || 'Operator',
                status: loggedUser.status || 'Active',
            });
            setLocation('/fleet');
        } catch (err: any) {
            // Fallback for dev build: universal password 'guardian-demo' for all usernames
            if (password === 'guardian-demo') {
                const isSuperAdmin = email.toLowerCase().includes('mara') || email.toLowerCase().includes('admin') || email.toLowerCase().includes('priya');
                setUser({
                    name: email === 'mara.okafor@northstarlogistics.co' ? 'Mara Okafor' : email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                    email: email,
                    role: isSuperAdmin ? 'Super Admin' : 'Operator',
                    status: 'Active',
                });
                setLocation('/fleet');
            } else {
                setError(err.message || 'Authentication failed.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleSignUp = async () => {
        setError('');
        setSuccessMsg('');

        if (!fullName.trim()) {
            setError('Full Name is required for new account registration.');
            return;
        }
        if (!email.trim() || !password.trim()) {
            setError('Work email and access key are required for registration.');
            return;
        }

        setIsSigningUp(true);
        try {
            await authService.register({
                name: fullName.trim(),
                email: email.trim(),
                password: password.trim(),
            });
            setSuccessMsg('Account request submitted successfully! Your account is pending admin approval.');
            setFullName('');
        } catch (err: any) {
            setError(err.message || 'Failed to submit account request.');
        } finally {
            setIsSigningUp(false);
        }
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
                        <div className="mb-7">
                            <div className="font-mono text-[10px] tracking-[.2em] text-cyan-400">
                                SECURE ACCESS / PCG-01
                            </div>
                            <h2 className="mt-2 text-2xl font-semibold text-slate-100">
                                Enter command center
                            </h2>
                        </div>

                        {error && (
                            <div
                                className="mb-4 border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200"
                                data-testid="status-login-error"
                            >
                                {error}
                            </div>
                        )}

                        {successMsg && (
                            <div
                                className="mb-4 flex items-start gap-2 border border-emerald-500/40 bg-emerald-950/40 p-3 font-mono text-xs text-emerald-300"
                                data-testid="status-login-success"
                            >
                                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <label className="block">
                                <span className="mb-1.5 block font-mono text-[10px] tracking-[.12em] text-slate-500">
                                    WORK EMAIL
                                </span>
                                <input
                                    data-testid="input-login-email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    type="email"
                                    required
                                    className="h-10 w-full border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-400"
                                />
                            </label>

                            <label className="block">
                                <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-[.12em]">
                                    <span className="text-slate-500">ACCESS KEY</span>
                                    <span className="text-cyan-400/90 font-medium">DEV KEY: guardian-demo</span>
                                </div>
                                <input
                                    data-testid="input-login-password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    type="password"
                                    required
                                    className="h-10 w-full border border-slate-700 bg-slate-900/70 px-3 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-400"
                                />
                            </label>

                            <Button
                                type="submit"
                                variant="primary"
                                className="h-11 w-full"
                                disabled={isLoggingIn || isSigningUp}
                                testId="button-login-submit"
                            >
                                {isLoggingIn ? <Loader2 size={15} className="animate-spin" /> : <>Establish session <ArrowRight size={15} /></>}
                            </Button>
                        </form>

                        {/* Account Creation Section */}
                        <div className="mt-6 border-t border-slate-800/80 pt-5">
                            <div className="mb-3 font-mono text-[10px] tracking-[.16em] text-slate-500 uppercase">
                                New User Registration
                            </div>

                            <label className="block mb-3">
                                <span className="mb-1.5 block font-mono text-[10px] tracking-[.12em] text-slate-500">
                                    FULL NAME (FOR SIGN UP)
                                </span>
                                <input
                                    data-testid="input-register-name"
                                    value={fullName}
                                    onChange={(event) => setFullName(event.target.value)}
                                    placeholder="e.g. Alex Morgan"
                                    type="text"
                                    className="h-10 w-full border border-slate-700/80 bg-slate-900/40 px-3 text-sm text-slate-200 outline-none transition-colors focus:border-cyan-400"
                                />
                            </label>

                            <Button
                                type="button"
                                onClick={handleSignUp}
                                className="h-10 w-full border-slate-700/80 bg-slate-800/40 text-slate-300 hover:bg-slate-700/60 hover:text-white"
                                disabled={isLoggingIn || isSigningUp}
                                testId="button-signup-submit"
                            >
                                {isSigningUp ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <UserPlus size={14} className="text-cyan-400" />
                                )}
                                Request Account / Sign Up
                            </Button>
                        </div>

                        {/* Public tracker link */}
                        <Link
                            href="/track"
                            className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[.12em] text-cyan-400 hover:text-cyan-200"
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

