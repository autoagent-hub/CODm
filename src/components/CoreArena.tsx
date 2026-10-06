import React, { useState } from 'react';
import { UserProfile, Match } from '../types';
import {
  Swords, ShieldCheck, Trophy, Copy, Check, Share2, Upload,
  ArrowRight, AlertCircle, CheckCircle2, MessageCircle, Wallet,
  UserCheck, RefreshCw, Sparkles, Crosshair, Target, X, Plus,
  Flame, Zap, Users, Flag, Shield, Sliders, ChevronRight, Gamepad2, MapPin
} from 'lucide-react';

interface CoreArenaProps {
  currentUser: UserProfile;
  matches: Match[];
  onCreateBet: (data: { stakeAmount: number; gameMode: string; map: string; rules: string[] }) => Promise<void>;
  onJoinMatch: (matchId: string, opponentId: string) => Promise<void>;
  onSubmitResult: (matchId: string, claim: 'VICTORY' | 'DEFEAT', screenshotBase64?: string) => Promise<void>;
  onCancelMatch: (matchId: string) => Promise<void>;
  onOpenWallet: () => void;
  onRefresh: () => Promise<void>;
  onOpenNewUserOnboarding: (match?: Match) => void;
}

const QUICK_SUGGESTIONS = [
  { mode: '1v1 Sniper Only', map: 'Shipment' },
  { mode: '1v1 Gunfight', map: 'Killhouse' },
  { mode: 'Search & Destroy (S&D)', map: 'Standoff' },
  { mode: 'Hardpoint', map: 'Summit' },
  { mode: 'Domination', map: 'Firing Range' },
  { mode: '1v1 Battle Royale', map: 'Isolated' },
];

export const CoreArena: React.FC<CoreArenaProps> = ({
  currentUser,
  matches,
  onCreateBet,
  onJoinMatch,
  onSubmitResult,
  onCancelMatch,
  onOpenWallet,
  onRefresh,
  onOpenNewUserOnboarding,
}) => {
  // Wager Creator Freeform State
  const [betType, setBetType] = useState<'solo' | 'squad'>('solo');
  const [stakeAmount, setStakeAmount] = useState<number>(1000);
  const [gameModeInput, setGameModeInput] = useState<string>('1v1 Sniper Only');
  const [mapInput, setMapInput] = useState<string>('Shipment');
  const [rulesInput, setRulesInput] = useState<string>('Standard match rules. Scoreboard screenshot required.');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Result submission state
  const [selectedClaim, setSelectedClaim] = useState<'VICTORY' | 'DEFEAT'>('VICTORY');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Find active match where currentUser is a participant (creator or opponent)
  const myActiveMatch = matches.find(
    (m) =>
      (m.creator.id === currentUser.id || m.opponent?.id === currentUser.id) &&
      m.status !== 'CANCELLED'
  );

  // Open matches created by others that currentUser can join
  const openChallenges = matches.filter(
    (m) => m.status === 'PENDING_OPPONENT' && m.creator.id !== currentUser.id
  );

  const potAmount = stakeAmount * 2;
  const platformFee = Math.round(potAmount * 0.10);
  const winnerPayout = potAmount - platformFee;

  const handleCreate = async () => {
    if (stakeAmount < 1000) {
      setCreateError('Minimum stake is ₦1,000');
      return;
    }
    if (!gameModeInput.trim()) {
      setCreateError('Please enter a game mode');
      return;
    }
    if (!mapInput.trim()) {
      setCreateError('Please enter a map name');
      return;
    }
    if (currentUser.balance < stakeAmount) {
      setCreateError(`Insufficient balance (₦${currentUser.balance.toLocaleString()}). Please fund your wallet.`);
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      await onCreateBet({
        stakeAmount,
        gameMode: gameModeInput.trim(),
        map: mapInput.trim(),
        rules: [
          rulesInput.trim() || 'Custom CODM match rules agreed by players',
          'No cheat modifications or glitches',
          'Post-match scoreboard screenshot required for AI verification',
        ],
      });
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create wager');
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = (matchId: string) => {
    const url = `${window.location.origin}/?join=${matchId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResultSubmit = async (matchId: string) => {
    if (!screenshotPreview && selectedClaim === 'VICTORY') {
      setSubmitError('Please attach a victory scoreboard screenshot for verification');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmitResult(matchId, selectedClaim, screenshotPreview || undefined);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const winRate =
    currentUser.wins + currentUser.losses > 0
      ? Math.round((currentUser.wins / (currentUser.wins + currentUser.losses)) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. CODM LOBBY CALLING CARD & HUD BAR                          */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-amber-500/30 p-4 sm:p-6 shadow-2xl bg-tactical-grid">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-neutral-950/80 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-neutral-950 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* CODM Player Calling Card / Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.codmIgn}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-neutral-800 border-2 border-amber-400/80 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded bg-black/90 border border-amber-400/60 text-[9px] font-mono-nums font-black text-amber-400 shadow">
                LVL 150
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-white text-lg sm:text-2xl tracking-wide uppercase">
                  {currentUser.codmIgn}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] font-black tracking-wider">
                  LEGENDARY 🏆 8,420 XP
                </span>
              </div>

              <div className="text-xs text-neutral-400 font-mono-nums mt-0.5 flex flex-wrap items-center gap-2">
                <span>UID: {currentUser.codmUid}</span>
                <span>·</span>
                <span className="text-amber-400 font-bold">CLAN: [1V1_ELITE]</span>
              </div>

              {/* Combat Stats HUD */}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono-nums">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{currentUser.wins}W - {currentUser.losses}L ({winRate}% WR)</span>
                </div>
                <span className="text-neutral-600">|</span>
                <div className="text-amber-400 font-bold font-mono-nums">
                  Won: ₦{currentUser.totalWinnings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* CODM Wallet Currency HUD & Quick Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-neutral-950 border border-amber-500/50 hover:border-amber-400 transition-all cursor-pointer shadow-lg group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] text-amber-400/90 font-mono font-bold uppercase tracking-wider leading-none">
                  NAIRA ESCROW CREDITS
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-400 font-mono-nums leading-tight">
                  ₦{currentUser.balance.toLocaleString()}
                </div>
              </div>
              <div className="w-6 h-6 rounded-md bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-xs ml-1 shadow">
                +
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SCENARIO A: ACTIVE MATCH ROOM IN PROGRESS                  */}
      {/* ------------------------------------------------------------- */}
      {myActiveMatch && (
        <div className="p-6 rounded-2xl bg-neutral-900 border-2 border-amber-500/50 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Swords className="w-4 h-4" />
                <span>CODM CUSTOM LOBBY ROOM CODE</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl sm:text-4xl font-black font-mono-nums text-amber-400 tracking-wider">
                  {myActiveMatch.roomCode}
                </span>
                <button
                  onClick={() => copyCode(myActiveMatch.roomCode)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                  title="Copy custom room code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
                <div className="text-[10px] text-neutral-400 uppercase font-mono-nums">Total Pot</div>
                <div className="text-lg font-black text-amber-400 font-mono-nums">₦{myActiveMatch.potAmount.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
                <div className="text-[10px] text-neutral-400 uppercase font-mono-nums">Winner Payout</div>
                <div className="text-lg font-black text-emerald-400 font-mono-nums">₦{myActiveMatch.winnerPayout.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {myActiveMatch.status === 'PENDING_OPPONENT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-neutral-200 space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>₦{myActiveMatch.stakeAmount.toLocaleString()} Escrowed · Waiting for Opponent</span>
                </div>
                <p className="text-neutral-300">
                  Share your challenge link with your rival. Once they accept, ₦{myActiveMatch.stakeAmount.toLocaleString()} will be locked in escrow and the match room opens!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <label className="text-xs font-semibold text-neutral-300 block uppercase tracking-wider">
                  Challenge Invite Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?join=${myActiveMatch.id}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono-nums text-xs truncate focus:outline-none"
                  />
                  <button
                    onClick={() => copyInviteLink(myActiveMatch.id)}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-neutral-950" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`⚔️ CODM STAKE 1V1 CHALLENGE!\nI staked ₦${myActiveMatch.stakeAmount.toLocaleString()} in CODM.\nCustom Room Code: ${myActiveMatch.roomCode}\nAccept & lock in the ₦${myActiveMatch.potAmount.toLocaleString()} pot here: ${window.location.origin}/?join=${myActiveMatch.id}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Send on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      if (confirm('Cancel this bet and refund your ₦' + myActiveMatch.stakeAmount.toLocaleString() + ' back to your wallet?')) {
                        onCancelMatch(myActiveMatch.id);
                      }
                    }}
                    className="py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium hover:bg-rose-500/20 transition-colors cursor-pointer"
                  >
                    Cancel Wager
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Simulate Opponent Acceptance:
                </span>
                <div>
                  <button
                    onClick={() => onOpenNewUserOnboarding(myActiveMatch)}
                    className="w-full py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold transition-colors text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Open Opponent Acceptance & Register Rival & Lock ₦1,000</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {['READY_TO_PLAY', 'IN_PROGRESS', 'SUBMITTING_RESULTS', 'VERIFYING'].includes(myActiveMatch.status) && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/40 flex items-center gap-3">
                  <img src={myActiveMatch.creator.avatar} alt={myActiveMatch.creator.codmIgn} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold">TEAM ALPHA (CREATOR)</div>
                    <div className="font-bold text-white">{myActiveMatch.creator.codmIgn}</div>
                    <div className="text-[11px] text-emerald-400 font-mono-nums font-semibold">₦{myActiveMatch.stakeAmount.toLocaleString()} Locked</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/40 flex items-center gap-3">
                  <img src={myActiveMatch.opponent?.avatar || '/src/assets/images/codm_trophy_pot_1791303439079.jpg'} alt="Opponent" className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <div className="text-[10px] text-amber-400 font-mono font-bold">TEAM BRAVO (RIVAL)</div>
                    <div className="font-bold text-white">{myActiveMatch.opponent?.codmIgn || 'Rival Connected'}</div>
                    <div className="text-[11px] text-emerald-400 font-mono-nums font-semibold">₦{myActiveMatch.stakeAmount.toLocaleString()} Locked</div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                <h3 className="text-sm font-black text-white font-heading uppercase flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Upload Victory Scoreboard Screenshot</span>
                </h3>

                {submitError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-neutral-300 block">
                    Declare Outcome:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedClaim('VICTORY')}
                      className={`py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                        selectedClaim === 'VICTORY'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <Trophy className="w-4 h-4" />
                      <span>I WON THIS MATCH</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedClaim('DEFEAT')}
                      className={`py-3 px-4 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                        selectedClaim === 'DEFEAT'
                          ? 'bg-rose-500/20 border-rose-400 text-rose-400 shadow-md'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <span>I LOST / ADMIT DEFEAT</span>
                    </button>
                  </div>

                  {selectedClaim === 'VICTORY' && (
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-semibold text-neutral-300 block">
                        Attach CODM End-Game Scoreboard Image:
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-neutral-950 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setScreenshotPreview('/src/assets/images/codm_score_victory_1791303463892.jpg')}
                          className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          Use Demo Victory Screenshot
                        </button>
                      </div>

                      {screenshotPreview && (
                        <div className="mt-2 h-48 rounded-xl overflow-hidden border border-emerald-500/40 relative">
                          <img src={screenshotPreview} alt="Scoreboard Preview" className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 text-[10px] text-emerald-400 font-bold">
                            READY FOR AI REFEREE INSPECTION
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleResultSubmit(myActiveMatch.id)}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-sm transition-all shadow-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>AI Referee Inspecting Scoreboard...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit & Claim ₦{myActiveMatch.winnerPayout.toLocaleString()} Payout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {myActiveMatch.status === 'SETTLED' && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-neutral-950 border border-amber-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto text-xl">
                <Trophy className="w-6 h-6" />
              </div>

              <div className="text-xl font-black text-white font-heading">
                MATCH CONCLUDED · WINNER: <span className="text-amber-400">{myActiveMatch.winnerIgn}</span>
              </div>

              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                {myActiveMatch.winnerId === currentUser.id
                  ? `🏆 You won! ₦{myActiveMatch.winnerPayout.toLocaleString()} has been automatically credited to your wallet balance!`
                  : `Match completed. Winner took the ₦{myActiveMatch.winnerPayout.toLocaleString()} payout.`}
              </p>

              <div className="pt-2">
                <button
                  onClick={onRefresh}
                  className="px-5 py-2.5 bg-amber-400 text-neutral-950 font-black rounded-xl text-xs hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Create Another CODM Bet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. FREEFORM CUSTOM GAME MODE CREATOR (USER SETS GAME ON THEIR OWN) */}
      {/* ------------------------------------------------------------- */}
      {!myActiveMatch && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black font-heading text-white uppercase flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>Create Wager & Set Your Game</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Choose Solo (1v1) or Squad (Team), set your game mode and map, and lock stake in escrow.
              </p>
            </div>

            <span className="text-xs font-mono-nums font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30">
              Min ₦1,000
            </span>
          </div>

          {createError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          {/* 1. Only 2 Card Betting Options: Solo (1v1) & Squad (Team) */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-3">
              1. Choose Betting Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Solo 1v1 Card */}
              <button
                type="button"
                onClick={() => {
                  setBetType('solo');
                  setGameModeInput('1v1 Sniper Only');
                  setMapInput('Shipment');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                  betType === 'solo'
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg scale-[1.01]'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  betType === 'solo' ? 'bg-amber-400 text-neutral-950 font-black' : 'bg-neutral-900 text-neutral-400'
                }`}>
                  <Crosshair className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-black text-sm text-white uppercase">Solo (1v1)</div>
                  <div className="text-[11px] text-neutral-400">Direct 1v1 head-to-head duel</div>
                </div>
              </button>

              {/* Squad Team Card */}
              <button
                type="button"
                onClick={() => {
                  setBetType('squad');
                  setGameModeInput('Search & Destroy (S&D)');
                  setMapInput('Standoff');
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                  betType === 'squad'
                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-lg scale-[1.01]'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  betType === 'squad' ? 'bg-emerald-400 text-neutral-950 font-black' : 'bg-neutral-900 text-neutral-400'
                }`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-black text-sm text-white uppercase">Squad (Team)</div>
                  <div className="text-[11px] text-neutral-400">Team / squad tactical match</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Preset Suggestion Chips */}
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
              Quick Suggestions (Or type your own mode below):
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setGameModeInput(s.mode);
                    setMapInput(s.map);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{s.mode} ({s.map})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Freeform Game Mode Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>Custom Game Mode Name</span>
            </label>
            <input
              type="text"
              value={gameModeInput}
              onChange={(e) => setGameModeInput(e.target.value)}
              placeholder="e.g. 1v1 Sniper Only, Custom Search & Destroy, Trickshot 1v1"
              className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          {/* Freeform Map Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Map Name</span>
            </label>
            <input
              type="text"
              value={mapInput}
              onChange={(e) => setMapInput(e.target.value)}
              placeholder="e.g. Shipment, Standoff, Killhouse, Summit, Nuketown"
              className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>

          {/* Stake Amount Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Stake Amount (₦ Naira)
              </label>
              <span className="text-xs text-neutral-400 font-mono-nums">
                Available Wallet: <strong className="text-emerald-400">₦{currentUser.balance.toLocaleString()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              {[1000, 2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStakeAmount(amt)}
                  className={`py-3 rounded-xl text-xs font-black font-mono-nums transition-all cursor-pointer border ${
                    stakeAmount === amt
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-neutral-400 font-mono-nums">₦</span>
              <input
                type="number"
                min={1000}
                step={500}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Minimum stake is ₦1,000</div>
          </div>

          {/* Escrow Math Preview */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between font-mono-nums">
            <div>
              <span className="text-neutral-400">Total Pot: </span>
              <strong className="text-amber-400 text-sm">₦{potAmount.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-neutral-400">Platform Rake (10%): </span>
              <strong className="text-rose-400">-₦{platformFee.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-neutral-400">Winner Payout: </span>
              <strong className="text-emerald-400 text-sm">₦{winnerPayout.toLocaleString()}</strong>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-sm transition-all shadow-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            {isCreating ? (
              <span>Generating Room & Locking Escrow...</span>
            ) : (
              <>
                <Swords className="w-4 h-4 stroke-[2.5]" />
                <span>Create Wager & Lock ₦{stakeAmount.toLocaleString()} in Escrow</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. OPEN CHALLENGES MATCHMAKING TICKER                        */}
      {/* ------------------------------------------------------------- */}
      {openChallenges.length > 0 && !myActiveMatch && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Tactical Matches Searching for Opponents</span>
            </div>
            <span className="text-neutral-500 font-mono-nums">{openChallenges.length} Open Wagers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {openChallenges.map((m) => {
              const pot = m.stakeAmount * 2;
              const payout = pot - Math.round(pot * 0.10);
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-nums bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                      {m.roomCode}
                    </span>
                    <span className="text-xs font-mono-nums font-bold text-emerald-400">
                      ₦{m.stakeAmount.toLocaleString()} Stake
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{m.gameMode}</div>
                      <div className="text-[11px] text-neutral-400">Map: {m.map} · Host: {m.creator.codmIgn}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-500">Winner Takes</div>
                      <div className="font-bold text-amber-400 font-mono-nums text-xs">₦{payout.toLocaleString()}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onJoinMatch(m.id, currentUser.id)}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Accept Challenge & Lock ₦{m.stakeAmount.toLocaleString()}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
