import logoImage from '../../assets/Pulsechain_logo.svg';

export function Logo() {
    return (
        <div className="flex items-center gap-3" data-testid="brand-pulsechain">
            <img src={logoImage} alt="Company Logo" className="h-12 w-12" />

            <div>
                <div className="text-[13px] font-semibold tracking-[.18em] text-slate-100">
                    PULSECHAIN
                </div>
                <div className="font-mono text-[9px] tracking-[.24em] text-cyan-400/80">
                    COLD-CHAIN CONTROL
                </div>
            </div>
        </div>
    );
}