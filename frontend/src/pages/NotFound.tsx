import { Link } from 'wouter';

export function NotFound() {
    return (
        <div className="grid min-h-[100dvh] place-items-center bg-[#071219] text-center">
            <div>
                <div className="font-mono text-5xl text-cyan-300">404</div>
                <p className="mt-3 text-sm text-slate-500">Signal route not found.</p>
                <Link
                    href="/fleet"
                    className="mt-5 inline-block text-xs text-cyan-300"
                    data-testid="link-not-found-fleet"
                >
                    Return to fleet command
                </Link>
            </div>
        </div>
    );
}
