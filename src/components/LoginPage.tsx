import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Swords, ShieldCheck, Film, ArrowRight, UserCheck, Lock, Mail, Phone, Wallet, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  allUsers: Record<string, UserProfile>;
  onLoginUser: (userId: string) => void;
  onRegisterUser: (userData: {
    codmIgn: string;
    codmUid?: string;
    email: string;
    phone: string;
    initialDeposit: number;
  }) => Promise<void>;
  onReplayVideo: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  allUsers,
  onLoginUser,
  onRegisterUser,
  onReplayVideo,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [ign, setIgn] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 8');
  const [initialDeposit, setInitialDeposit] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim()) {
      setError('Please enter your CODM In-Game Name (IGN)');
      return;
    }

    // Look for matching user
    const existing = Object.values(allUsers).find(
      (u) => u.codmIgn.toLowerCase() === ign.trim().toLowerCase() || u.email.toLowerCase() === ign.trim().toLowerCase()
    );

    if (existing) {
      onLoginUser(existing.id);
    } else {
      // Auto-create or login as new
      onRegisterUser({
        codmIgn: ign.trim(),
        email: `${ign.trim().toLowerCase()}@gamer.ng`,
        phone: '+234 800 000 0000',
        initialDeposit: 5000,
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ign.trim()) {
      setError('Please provide your CODM In-Game Name (IGN)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onRegisterUser({
        codmIgn: ign.trim(),
        email: email.trim() || `${ign.trim().toLowerCase()}@gamer.ng`,
        phone: phone.trim(),
        initialDeposit,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-between relative overflow-hidden bg-tactical-grid py-8 px-4 sm:px-6">
      {/* Background Graphic Asset */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <img
          src="/src/assets/images/codm_hero_action_1791303425231.jpg"
          alt="CODM Action Background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-neutral-950/85" />
      </div>

      {/* Top Bar with Replay Video Button */}
      <div className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-black text-xl text-white tracking-wider">
              CODM STAKE <span className="text-amber-400">1V1</span>
            </span>
            <div className="text-[11px] text-neutral-400 font-mono-nums">
              ESPORTS ESCROW ARENA · NIGERIAN NAIRA
            </div>
          </div>
        </div>

        <button
          onClick={onReplayVideo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
        >
          <Film className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Replay Animated Intro Video</span>
          <span className="sm:hidden">Video</span>
        </button>
      </div>

      {/* Main Login / Register Card */}
      <div className="relative z-10 max-w-md w-full mx-auto my-auto bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Header Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1">
          <button
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Log In to Account
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setError(null); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register Gamer Tag
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            <div className="space-y-4">
              <form onSubmit={handleCustomLogin} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    CODM In-Game Name (IGN) or Email
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ghost_NG"
                    value={ign}
                    onChange={(e) => setIgn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Password / PIN
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Sign In & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick 1-Click Profile Login Options */}
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-center">
                  Or Instant 1-Click Login (Demo Profiles)
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => onLoginUser('user_ghost')}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/60 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={allUsers.user_ghost?.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150'}
                        alt="Ghost_NG"
                        className="w-8 h-8 rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          Ghost_NG (Host / Creator)
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono-nums">14W - 3L</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono-nums font-bold text-emerald-400">
                      ₦{allUsers.user_ghost?.balance.toLocaleString()}
                    </span>
                  </button>

                  <button
                    onClick={() => onLoginUser('user_shadow')}
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/60 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={allUsers.user_shadow?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt="ShadowSniper"
                        className="w-8 h-8 rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          ShadowSniper (Rival / Opponent)
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono-nums">8W - 5L</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono-nums font-bold text-emerald-400">
                      ₦{allUsers.user_shadow?.balance.toLocaleString()}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  CODM In-Game Name (IGN) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DeltaSniper_NG"
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="gamer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  WhatsApp / Phone
                </label>
                <input
                  type="tel"
                  placeholder="+234 812 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-300">
                    Initial Wallet Deposit (₦)
                  </label>
                  <span className="text-[11px] text-amber-400 font-mono-nums">Min ₦1,000 for bets</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInitialDeposit(amt)}
                      className={`py-1.5 text-xs font-bold rounded-lg border font-mono-nums transition-colors cursor-pointer ${
                        initialDeposit === amt
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deposit held safely in your wallet. Lock it into 1v1 wagers whenever you're ready!</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Profile & Funding Wallet...' : `Sign Up & Fund ₦${initialDeposit.toLocaleString()}`}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="relative z-10 max-w-5xl w-full mx-auto text-center pt-6 text-xs text-neutral-500">
        Call of Duty: Mobile 1v1 Escrow Platform · Minimum Wager ₦1,000 · 10% Platform Referee Fee
      </div>
    </div>
  );
};
