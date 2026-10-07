import React, { useState } from 'react';
import { UserProfile, Match } from '../types';
import {
  Swords, ShieldCheck, Trophy, Copy, Check, Share2, Upload,
  ArrowRight, AlertCircle, CheckCircle2, MessageCircle, Wallet,
  UserCheck, RefreshCw, Sparkles, Crosshair, Target, X, Plus,
  Flame, Zap, Users, Flag, Shield, Sliders, ChevronRight, Gamepad2, MapPin,
  TrendingUp, Award, Clock
} from 'lucide-react';
import { CODM_IMAGES } from '../assets/images';

interface CoreArenaProps {
  currentUser: UserProfile;
  matches: Match[];
  onCreateBet: (data: { stakeAmount: number; gameMode: string; map: string; rules: string[] }) => Promise<void>;
  onJoinMatch: (matchId: string, opponentId: string) => Promise<void>;
  onSubmitResult: (matchId: string, claim: 'VICTORY' | 'DEFEAT' | 'DRAW', screenshotBase64?: string) => Promise<void>;
  onCancelMatch: (matchId: string) => Promise<void>;
  onOpenWallet: () => void;
  onRefresh: () => Promise<void>;
  onOpenNewUserOnboarding: (match?: Match) => void;
  onOpenCreateBet?: (mode?: string, stake?: number) => void;
}

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
  onOpenCreateBet,
}) => {
  // Result submission state: supports VICTORY, DEFEAT, and DRAW
  const [selectedClaim, setSelectedClaim] = useState<'VICTORY' | 'DEFEAT' | 'DRAW'>('VICTORY');
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
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* ------------------------------------------------------------- */}
      {/* 1. ACTIVE MATCH ROOM (IF PARTICIPATING IN A WAGER)            */}
      {/* ------------------------------------------------------------- */}
      {myActiveMatch && (
        <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-amber-500/40 p-5 sm:p-6 shadow-xl space-y-5 group">
          {/* Authentic Match Room Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={CODM_IMAGES.matchRoomBg}
              alt="Active Match Room"
              className="w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = CODM_IMAGES.matchRoomBgFallback;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/90" />
            <div className="absolute inset-0 bg-radial from-transparent to-neutral-950/95" />
          </div>

          {/* Header Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-neutral-800/80">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ACTIVE MATCH</span>
              </div>
              <span className="text-xs font-bold text-white font-heading tracking-wide">
                {myActiveMatch.gameMode}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Map: <strong className="text-neutral-200">{myActiveMatch.map}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Room Code Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-950/90 border border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-mono">ROOM:</span>
                <span className="text-xs sm:text-sm font-black font-mono-nums text-amber-400">{myActiveMatch.roomCode}</span>
                <button
                  onClick={() => copyCode(myActiveMatch.roomCode)}
                  className="text-neutral-400 hover:text-white transition-colors ml-1 p-0.5 cursor-pointer"
                  title="Copy room code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Pot Chip */}
              <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono-nums text-emerald-400 font-bold">
                Pot: ₦{myActiveMatch.potAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Waiting for opponent state */}
          {myActiveMatch.status === 'PENDING_OPPONENT' && (
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>₦{myActiveMatch.stakeAmount.toLocaleString()} Escrowed · Waiting for Opponent to Join</span>
                </div>
                <div className="text-[11px] text-neutral-400 font-mono-nums">
                  Winner Payout: <strong className="text-emerald-400">₦{myActiveMatch.winnerPayout.toLocaleString()}</strong>
                </div>
              </div>

              {/* Invite Link & WhatsApp Share */}
              <div className="p-4 rounded-xl bg-neutral-950/90 border border-neutral-800/90 space-y-2.5">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block font-mono">
                  Challenge Invite Link
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?join=${myActiveMatch.id}`}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono-nums text-xs truncate focus:outline-none"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => copyInviteLink(myActiveMatch.id)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 uppercase"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`⚔️ CODM STAKE 1V1 CHALLENGE!\nI staked ₦${myActiveMatch.stakeAmount.toLocaleString()} in CODM.\nCustom Room Code: ${myActiveMatch.roomCode}\nAccept & lock in the ₦${myActiveMatch.potAmount.toLocaleString()} pot here: ${window.location.origin}/?join=${myActiveMatch.id}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none py-2.5 px-3.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action row: Simulate & Cancel */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                <button
                  onClick={() => onOpenNewUserOnboarding(myActiveMatch)}
                  className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate Opponent Acceptance</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Cancel this wager and refund ₦${myActiveMatch.stakeAmount.toLocaleString()} back to your wallet?`)) {
                      onCancelMatch(myActiveMatch.id);
                    }
                  }}
                  className="text-rose-400 hover:text-rose-300 transition-colors text-xs font-medium cursor-pointer"
                >
                  Cancel Wager & Refund ₦{myActiveMatch.stakeAmount.toLocaleString()}
                </button>
              </div>
            </div>
          )}

          {/* In progress / Submit results state */}
          {['READY_TO_PLAY', 'IN_PROGRESS', 'SUBMITTING_RESULTS', 'VERIFYING'].includes(myActiveMatch.status) && (
            <div className="relative z-10 space-y-4">
              {/* VS Calling Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-950/90 border border-amber-500/40 flex items-center gap-3">
                  <img src={myActiveMatch.creator.avatar} alt={myActiveMatch.creator.codmIgn} className="w-10 h-10 rounded-lg object-cover bg-neutral-800" referrerPolicy="no-referrer" />
                  <div>
                    <div className="text-[9px] text-amber-400 font-mono font-bold">TEAM ALPHA (HOST)</div>
                    <div className="font-bold text-white text-xs sm:text-sm">{myActiveMatch.creator.codmIgn}</div>
                    <div className="text-[10px] text-emerald-400 font-mono-nums">₦{myActiveMatch.stakeAmount.toLocaleString()} Locked</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/90 border border-amber-500/40 flex items-center gap-3">
                  <img src={myActiveMatch.opponent?.avatar || CODM_IMAGES.trophyPot} alt="Opponent" className="w-10 h-10 rounded-lg object-cover bg-neutral-800" referrerPolicy="no-referrer" />
                  <div>
                    <div className="text-[9px] text-amber-400 font-mono font-bold">TEAM BRAVO (RIVAL)</div>
                    <div className="font-bold text-white text-xs sm:text-sm">{myActiveMatch.opponent?.codmIgn || 'Rival Connected'}</div>
                    <div className="text-[10px] text-emerald-400 font-mono-nums">₦{myActiveMatch.stakeAmount.toLocaleString()} Locked</div>
                  </div>
                </div>
              </div>

              {/* Submit Results Section */}
              <div className="p-4 rounded-xl bg-neutral-950/95 border border-neutral-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-heading uppercase flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Post-Match Scoreboard Verification</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Winner: ₦{myActiveMatch.winnerPayout.toLocaleString()}</span>
                </div>

                {submitError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClaim('VICTORY')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 uppercase ${
                      selectedClaim === 'VICTORY'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>I Won</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedClaim('DEFEAT')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 uppercase ${
                      selectedClaim === 'DEFEAT'
                        ? 'bg-rose-500/20 border-rose-400 text-rose-400 shadow-md ring-1 ring-rose-400/50'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>I Lost</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedClaim('DRAW')}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center gap-1.5 uppercase ${
                      selectedClaim === 'DRAW'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Draw / Tie</span>
                  </button>
                </div>

                {selectedClaim === 'DRAW' && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Draw & Rematch Agreement</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">
                      If both combatants agree or match ends tied, <strong>100% of your ₦{myActiveMatch.stakeAmount.toLocaleString()} stake</strong> is immediately refunded back to your wallet with zero platform fee.
                    </p>
                  </div>
                )}

                {selectedClaim === 'VICTORY' && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full sm:w-auto text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-neutral-950 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setScreenshotPreview(CODM_IMAGES.scoreVictory)}
                        className="w-full sm:w-auto px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Use Demo Scoreboard
                      </button>
                    </div>

                    {screenshotPreview && (
                      <div className="h-36 rounded-xl overflow-hidden border border-emerald-500/40 relative">
                        <img
                          src={screenshotPreview}
                          alt="Scoreboard Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = CODM_IMAGES.scoreVictoryFallback;
                          }}
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[9px] text-emerald-400 font-bold border border-emerald-500/30 font-mono">
                          READY FOR AI INSPECTION
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleResultSubmit(myActiveMatch.id)}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  {isSubmitting ? (
                    <span>AI Referee Inspecting Scoreboard...</span>
                  ) : selectedClaim === 'DRAW' ? (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Confirm Draw & Refund ₦{myActiveMatch.stakeAmount.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit & Claim ₦{myActiveMatch.winnerPayout.toLocaleString()} Payout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Settled State */}
          {myActiveMatch.status === 'SETTLED' && (
            <div className="relative z-10 p-5 rounded-xl bg-gradient-to-b from-amber-500/15 to-neutral-950 border border-amber-500/40 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto">
                <Trophy className="w-5 h-5" />
              </div>

              <div className="text-lg sm:text-xl font-black text-white font-heading uppercase">
                {myActiveMatch.winnerIgn?.includes('DRAW') ? (
                  <span>MATCH CONCLUDED · <span className="text-amber-400">DRAW / TIE</span></span>
                ) : (
                  <span>MATCH CONCLUDED · WINNER: <span className="text-amber-400">{myActiveMatch.winnerIgn}</span></span>
                )}
              </div>

              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                {myActiveMatch.winnerIgn?.includes('DRAW')
                  ? `⚖️ Match ended in a draw. 100% of your ₦${myActiveMatch.stakeAmount.toLocaleString()} stake has been refunded to your wallet balance!`
                  : myActiveMatch.winnerId === currentUser.id
                  ? `🏆 Congratulations! ₦${myActiveMatch.winnerPayout.toLocaleString()} has been paid directly to your wallet!`
                  : `Match concluded. Winner received ₦${myActiveMatch.winnerPayout.toLocaleString()} payout.`}
              </p>

              <button
                onClick={onRefresh}
                className="px-5 py-2.5 bg-amber-400 text-neutral-950 font-black rounded-xl text-xs hover:bg-amber-300 transition-colors cursor-pointer uppercase"
              >
                Return to Battle Lobby
              </button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. STANDARD BATTLE FORMAT CARDS (SOLO 1V1 & SQUAD BATTLES)    */}
      {/* ------------------------------------------------------------- */}
      {!myActiveMatch && (
        <div className="space-y-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Swords className="w-4 h-4" />
                CREATE CODM WAGER
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide mt-1">
                CHOOSE YOUR BATTLE FORMAT
              </h2>
            </div>
            <div className="text-xs font-mono-nums font-bold text-neutral-400">
              Min Stake: <strong className="text-amber-400">₦1,000</strong> · 10% Escrow Rake
            </div>
          </div>

          {/* VISUAL FORMAT SELECTION CARDS WITH AUTHENTIC BACKGROUND IMAGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solo 1v1 Card (With Shipment Map Background) */}
            <div
              className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 hover:border-amber-400 bg-neutral-900 shadow-2xl transition-all flex flex-col justify-between min-h-[260px] group"
            >
              {/* Background Shipment Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={CODM_IMAGES.shipment1v1}
                  alt="1v1 Shipment Map"
                  className="w-full h-full object-cover object-center opacity-30 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CODM_IMAGES.shipment1v1Fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-transparent to-transparent" />
              </div>

              {/* Top Badge & Indicator */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                  <Crosshair className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono text-xs font-black">
                  SHIPMENT · 1V1 DUEL
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-2 mt-6">
                <h3 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide uppercase">
                  SOLO (1v1 DUEL)
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md">
                  Direct head-to-head duel. High-intensity quickscopes, snipers only, or gunfight on <strong>Shipment</strong> and <strong>Killhouse</strong>.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-mono-nums text-neutral-400">
                  <span className="text-amber-400 font-bold">1v1 Format</span>
                  <span>·</span>
                  <span>Instant Pot Escrow</span>
                  <span>·</span>
                  <span>AI Referee</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10 pt-4">
                <button
                  onClick={() => onOpenCreateBet && onOpenCreateBet('1v1 Sniper Only', 1000)}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Swords className="w-4 h-4 stroke-[2.5]" />
                  <span>Create 1v1 Wager (Shipment)</span>
                </button>
              </div>
            </div>

            {/* Squad Team Card (With Squad / Search & Destroy Tactical Background) */}
            <div
              className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 hover:border-emerald-400 bg-neutral-900 shadow-2xl transition-all flex flex-col justify-between min-h-[260px] group"
            >
              {/* Background Squad Image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={CODM_IMAGES.squadTactical}
                  alt="Squad Tactical Match"
                  className="w-full h-full object-cover object-center opacity-30 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CODM_IMAGES.squadTacticalFallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-transparent to-transparent" />
              </div>

              {/* Top Badge & Indicator */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg">
                  <Users className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-black">
                  STANDOFF · SQUAD
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 space-y-2 mt-6">
                <h3 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide uppercase">
                  SQUAD (TEAM BATTLE)
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md">
                  Tactical team match. Coordinated <strong>Search & Destroy</strong>, <strong>Hardpoint</strong>, or <strong>Domination</strong> on Standoff & Summit.
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs font-mono-nums text-neutral-400">
                  <span className="text-emerald-400 font-bold">Squad Tactical</span>
                  <span>·</span>
                  <span>Team Escrow</span>
                  <span>·</span>
                  <span>Objective Modes</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10 pt-4">
                <button
                  onClick={() => onOpenCreateBet && onOpenCreateBet('Search & Destroy (S&D)', 1000)}
                  className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-black rounded-2xl text-xs sm:text-sm transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
                >
                  <Swords className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Squad Wager (Standoff)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. LIVE OPEN CHALLENGES MATCHMAKING LOBBY */}
          {openChallenges.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Live Open Challenges (Ready to Join)</span>
                </div>
                <span className="text-amber-400 font-mono-nums">{openChallenges.length} Open Matches</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openChallenges.map((m) => {
                  const pot = m.stakeAmount * 2;
                  const payout = pot - Math.round(pot * 0.10);
                  return (
                    <div
                      key={m.id}
                      className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-400/60 transition-all space-y-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono-nums bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg font-black">
                          ROOM: {m.roomCode}
                        </span>
                        <span className="text-sm font-mono-nums font-black text-emerald-400">
                          ₦{m.stakeAmount.toLocaleString()} Stake
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-heading font-black text-white text-sm uppercase">{m.gameMode}</div>
                          <div className="text-xs text-neutral-400 font-medium mt-0.5">Map: <strong className="text-neutral-200">{m.map}</strong> · Host: <strong className="text-amber-400">{m.creator.codmIgn}</strong></div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-400 uppercase font-mono">Winner Pot</div>
                          <div className="font-black text-amber-400 font-mono-nums text-sm">₦{payout.toLocaleString()}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => onJoinMatch(m.id, currentUser.id)}
                        className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide shadow-md"
                      >
                        <Swords className="w-4 h-4 stroke-[2.5]" />
                        <span>Accept Challenge & Lock ₦{m.stakeAmount.toLocaleString()}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
