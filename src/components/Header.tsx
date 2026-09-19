import { Music, Sparkles, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Music className="w-5 h-5 text-neutral-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-neutral-100">
                Free Music Player
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                100% Free
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden xs:block">
              Bina VIP • Bina Login • Unlimited Gaane Suno
            </p>
          </div>
        </div>

        {/* Free VIP-Free Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-xs font-medium text-neutral-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-neutral-300">No VIP • No Subscription •</span>
            <span className="text-emerald-400 font-semibold">100% Free</span>
          </div>
        </div>
      </div>
    </header>
  );
}
