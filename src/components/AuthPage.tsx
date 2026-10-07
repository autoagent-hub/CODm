import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Swords, ShieldCheck, Mail, Lock, Eye, EyeOff, Crosshair, Target,
  ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Wallet, Sparkles, UserCheck
} from 'lucide-react';
import { CODM_IMAGES } from '../assets/images';
import { signInWithGoogle } from '../firebase/config';
import { getUserFromFirestore, syncUserToFirestore } from '../firebase/service';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onSignUp: (data: {
    email: string;
    password: string;
    codmIgn: string;
    codmUid: string;
    initialDeposit: number;
  }) => Promise<void>;
  onSignIn: (data: {
    identifier: string;
    password: string;
  }) => Promise<void>;
  onBackToLanding: () => void;
  demoUsers?: Record<string, UserProfile>;
  onGoogleSuccess?: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signup',
  onSignUp,
  onSignIn,
  onBackToLanding,
  demoUsers,
  onGoogleSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Sign Up Form State
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupCodmIgn, setSignupCodmIgn] = useState('');
  const [signupCodmUid, setSignupCodmUid] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Sign In Form State
  const [signinIdentifier, setSigninIdentifier] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [showSigninPassword, setShowSigninPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (!signupCodmIgn.trim()) {
      setError('Please enter your Call of Duty: Mobile username (IGN)');
      return;
    }
    if (!signupCodmUid.trim()) {
      setError('Please enter your Call of Duty: Mobile ID (UID)');
      return;
    }

    setLoading(true);
    try {
      await onSignUp({
        email: signupEmail.trim(),
        password: signupPassword,
        codmIgn: signupCodmIgn.trim(),
        codmUid: signupCodmUid.trim(),
        initialDeposit: 0,
      });
    } catch (err: any) {
      setError(err.message || 'Account registration failed');
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signinIdentifier.trim()) {
      setError('Please enter your registered email or CODM username');
      return;
    }

    setLoading(true);
    try {
      await onSignIn({
        identifier: signinIdentifier.trim(),
        password: signinPassword,
      });
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (user: UserProfile) => {
    setError(null);
    setLoading(true);
    try {
      await onSignIn({
        identifier: user.codmIgn,
        password: 'password123',
      });
    } catch (err: any) {
      setError(err.message || 'Demo sign in failed');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        let profile = await getUserFromFirestore(fbUser.uid);
        if (!profile) {
          const defaultIgn = fbUser.displayName?.replace(/\s+/g, '_') || fbUser.email?.split('@')[0] || 'CODM_OPERATOR';
          profile = {
            id: fbUser.uid,
            username: defaultIgn,
            codmIgn: defaultIgn,
            codmUid: '68' + Math.floor(10000000000000 + Math.random() * 90000000000000),
            email: fbUser.email || '',
            phone: fbUser.phoneNumber || '',
            balance: 0,
            escrowBalance: 0,
            totalWinnings: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
            tier: 'ROOKIE I',
            clan: '[SOLO]',
            transactions: [],
          };
          await syncUserToFirestore(profile);
        }
        if (onGoogleSuccess) {
          onGoogleSuccess(profile);
        }
      }
    } catch (err: any) {
      if (!err.message?.includes('popup-closed-by-user')) {
        setError(err.message || 'Firebase Google authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between relative overflow-hidden bg-tactical-grid selection:bg-amber-500 selection:text-black py-8 px-4 sm:px-6">
      {/* Background CODM Action Hero overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <img
          src={CODM_IMAGES.heroAction}
          alt="CODM Action Background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = CODM_IMAGES.heroActionFallback;
          }}
        />
        <div className="absolute inset-0 bg-neutral-950/85" />
      </div>

      {/* Top Header Bar */}
      <div className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-amber-400 text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>

        <div className="flex items-center gap-3">
          <img
            src={CODM_IMAGES.appLogo}
            alt="CODM Stake"
            className="w-10 h-10 object-contain drop-shadow-md"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = CODM_IMAGES.appLogoFallback;
            }}
          />
          <div>
            <span className="font-heading font-black text-lg tracking-wide text-white">
              CODM STAKE
            </span>
            <div className="text-[10px] text-neutral-400 font-mono-nums leading-none">
              ESPORTS ESCROW ARENA
            </div>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 max-w-lg w-full mx-auto my-auto bg-neutral-900/95 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-950/80 border-b border-neutral-800">
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-3 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider ${
              mode === 'signup'
                ? 'bg-amber-400 text-neutral-950 shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Create Account</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`py-3 text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider ${
              mode === 'signin'
                ? 'bg-amber-400 text-neutral-950 shadow-lg'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-white tracking-wide uppercase">
              {mode === 'signup' ? 'Create CODM Stake Account' : 'Sign In to Your Account'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {mode === 'signup'
                ? 'Register with your email, password, and Call of Duty: Mobile username & ID to start wagering.'
                : 'Access your wallet, open match rooms, and battle arena.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Firebase Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-neutral-950 border border-neutral-700 hover:border-amber-400 text-white font-bold text-xs flex items-center justify-center gap-3 transition-all hover:bg-neutral-900 cursor-pointer shadow-md disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google (Firebase)</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px bg-neutral-800 flex-1" />
            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">or continue below</span>
            <div className="h-px bg-neutral-800 flex-1" />
          </div>

          {/* ===================== SIGN UP FORM ===================== */}
          {mode === 'signup' ? (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email Address <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. soldier@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password <span className="text-rose-400">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password (min 4 characters)"
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Call of Duty: Mobile User Name (IGN) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call of Duty: Mobile Username (IGN) <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={signupCodmIgn}
                  onChange={(e) => setSignupCodmIgn(e.target.value)}
                  placeholder="e.g. Ghost_Sniper99"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-neutral-400 block">
                  Your exact in-game gamer tag as displayed in CODM
                </span>
              </div>

              {/* Call of Duty: Mobile ID (UID) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call of Duty: Mobile ID (Player UID) <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={signupCodmUid}
                  onChange={(e) => setSignupCodmUid(e.target.value)}
                  placeholder="e.g. 6829471928371902"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums text-sm focus:border-emerald-400 focus:outline-none transition-colors"
                />
                <span className="text-[10px] text-neutral-400 block">
                  Copy from your CODM in-game Profile tab (Numeric Player ID)
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-black rounded-2xl text-sm transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                {loading ? (
                  <span>Registering Profile...</span>
                ) : (
                  <>
                    <Swords className="w-4 h-4 stroke-[2.5]" />
                    <span>Create CODM Stake Account</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Already registered? <span className="text-amber-400 font-bold underline">Sign In instead</span>
                </button>
              </div>
            </form>
          ) : (
            /* ===================== SIGN IN FORM ===================== */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Identifier */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email or CODM Username (IGN) <span className="text-rose-400">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={signinIdentifier}
                  onChange={(e) => setSigninIdentifier(e.target.value)}
                  placeholder="e.g. Ghost_NG or ghost@lagos-codm.com"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password <span className="text-rose-400">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type={showSigninPassword ? 'text' : 'password'}
                    required
                    value={signinPassword}
                    onChange={(e) => setSigninPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSigninPassword(!showSigninPassword)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showSigninPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-black rounded-2xl text-sm transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="text-xs text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Don't have an account yet? <span className="text-amber-400 font-bold underline">Create one now</span>
                </button>
              </div>

              {/* Quick 1-Click Demo Profiles */}
              {demoUsers && Object.keys(demoUsers).length > 0 && (
                <div className="pt-4 border-t border-neutral-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instant 1-Click Demo Profiles</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.values(demoUsers).slice(0, 2).map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(user)}
                        className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/60 transition-all flex items-center justify-between text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatar}
                            alt={user.codmIgn}
                            className="w-7 h-7 rounded-lg object-cover bg-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                              {user.codmIgn}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono-nums">
                              ₦{user.balance.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 max-w-5xl w-full mx-auto text-center pt-6 text-xs text-neutral-500">
        Call of Duty: Mobile Esports Escrow Arena · Minimum Wager ₦1,000 · 10% Platform Rake
      </div>
    </div>
  );
};
