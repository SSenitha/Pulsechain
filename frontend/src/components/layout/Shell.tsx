import { useState, type ReactNode } from 'react';
import { Activity, Bell, Box, ChevronDown, LogOut, Menu, Send, Shield, Truck } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/shared/Button';
import { LiveClock } from '@/components/shared/LiveClock';
import { Logo } from '@/components/shared/Logo';
import { useApp } from '@/context/AppContext';

export const metric = (value: string | number, unit = '') => (
    <span className="font-mono text-sm text-slate-100">
        {value}
        <small className="ml-1 text-[10px] text-slate-500">{unit}</small>
    </span>
);

export function Shell({ children }: { children: ReactNode }) {
    const { user, logout, role } = useApp();
    const [location, setLocation] = useLocation();
    const [open, setOpen] = useState(false);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const handleLogout = () => {
        logout();
        setLocation('/login');
    };

    const nav = [
        { href: '/fleet', label: 'Fleet Dashboard', icon: Truck },
        { href: '/packages', label: 'Package Dashboard', icon: Box },
        { href: '/analytics', label: 'Analytics', icon: Activity },
        ...(role !== 'Viewer'
            ? [{ href: '/operations', label: 'Operations', icon: Send }]
            : []),
        ...(role === 'Super Admin'
            ? [{ href: '/admin', label: 'Admin Dashboard', icon: Shield }]
            : []),
    ];

    return (
        <div className="min-h-[100dvh] bg-[#071219] text-slate-200 signal-grid">

            {/* aside tag --> for content that doesn't affect main context. eg: sidebar */}
            <aside
            className={`fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col border-r border-slate-800 bg-[#061017] rounded-r-2xl
                    transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Pulsechain Logo - refer to logo.tsx to find the logo banner */}
                <div className="flex h-[76px] items-center border-b border-slate-800 px-5">
                    <Logo />
                </div>

                {/* Navigation deck */}
                <div className="px-4 pt-7">
                    <div className="mb-3 px-2 font-mono text-[9px] tracking-[.2em] text-slate-600">
                        COMMAND DECK
                    </div>

                    {nav.map(({ href, label: itemLabel, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`group mb-1 flex h-10 items-center gap-3 rounded-xl border px-3 text-xs transition-all duration-150
                                ${location === href ? 'border-cyan-400/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.08)]' :
                                    'border-transparent text-slate-500 hover:border-slate-700/80 hover:bg-slate-800/60 hover:text-slate-200'}`}
                            data-testid={`link-nav-${href.slice(1)}`}
                        >
                            <Icon
                                size={15}
                                className={
                                    location === href
                                        ? 'text-cyan-300'
                                        : 'text-slate-600 group-hover:text-slate-300'
                                }
                            />
                            <span>{itemLabel}</span>

                            {location === href && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Navigation footer --> Should make dynamic (later) */}
                <div className="mt-auto border-t border-slate-800 p-4">
                    <div className="font-mono text-[9px] leading-5 text-slate-600">
                        INGEST / 6 ACTIVE FLEET
                        <br />
                        TELEMETRY / 1.0 SEC STREAM
                        <br />
                        REGION / SRI LANKA
                    </div>
                </div>
            </aside>

            {open && (
                <button
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-20 bg-[#02070a]/70 md:hidden"
                    data-testid="button-close-navigation"
                />
            )}

            {/* Top Ribbon  --> For status content */}
            <main className="min-h-[100dvh] md:pl-[248px]">
                <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b
                border-slate-800/80 bg-[#071219]/90 px-4 backdrop-blur-md md:px-7 shadow-[0_1px_0_rgba(255,255,255,0.03)]">

                    <div className="flex items-center gap-3">
                        {/* Hamburger button for MOBILE navigation --> Hidden for PC*/}
                        <Button
                            variant="ghost"
                            className="px-2 md:hidden"
                            onClick={() => setOpen(true)}
                            testId="button-open-navigation"
                        >
                            <Menu size={18} />
                        </Button>

                        <div className="hidden font-mono text-[10px] tracking-[.18em] text-slate-500 sm:block">
                            PULSECHAIN/ COLD-CHAIN CONTROL
                        </div>
                        <LiveClock />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Notification button --> Should make dynamic (later) */}
                        <button
                            className="relative rounded-xl border border-transparent p-2 text-slate-500 transition-all hover:border-slate-700/80 hover:bg-slate-800/60 hover:text-slate-200"
                            data-testid="button-notifications"
                        >
                            <Bell size={16} />
                            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
                        </button>

                        {/* User Profile Badge */}
                        <div className="relative">
                            <div
                                className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/50 px-2.5 py-1.5 text-left"
                                data-testid="user-profile-badge"
                            >
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-orange-400/15 font-mono text-[10px] font-semibold text-orange-300">
                                    {getInitials(user?.name)}
                                </span>
                                <span className="hidden sm:block">
                                    <span className="block text-[10px] font-medium text-slate-200">
                                        {user?.name || 'Mara Okafor'}
                                    </span>
                                    <span className="block font-mono text-[9px] text-cyan-400">
                                        {role.toUpperCase()}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Logout button */}
                        <Button
                            variant="ghost"
                            className="px-2 hover:text-rose-300"
                            onClick={handleLogout}
                            testId="button-logout"
                        >
                            <LogOut size={15} />
                        </Button>
                    </div>

                </header>
                <div className="mx-auto max-w-[1600px] p-4 md:p-7">{children}</div>
            </main>

        </div>
    );
}
