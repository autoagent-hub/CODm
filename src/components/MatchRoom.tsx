import React, { useState, useRef } from 'react';
import { Match, UserProfile, ChatMessage } from '../types';
import {
  Swords, ShieldCheck, Trophy, Copy, Check, Upload, Send, AlertTriangle,
  CheckCircle2, Clock, Sparkles, MessageSquare, ArrowLeft, RefreshCw, FileText
} from 'lucide-react';

interface MatchRoomProps {
  match: Match;
  currentUser: UserProfile;
  onBackToLobby: () => void;
  onSubmitResult: (claim: 'VICTORY' | 'DEFEAT', screenshotBase64?: string) => Promise<void>;
  onSendChat: (text: string) => Promise<void>;
  onRefreshMatch: () => Promise<void>;
  onSimulateOpponentResult?: (claim: 'VICTORY' | 'DEFEAT') => Promise<void>;
  onAdminResolve?: (winnerId: string) => Promise<void>;
}

export const MatchRoom: React.FC<MatchRoomProps> = ({
  match,
  currentUser,
  onBackToLobby,
  onSubmitResult,
  onSendChat,
  onRefreshMatch,
  onSimulateOpponentResult,
  onAdminResolve,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<'VICTORY' | 'DEFEAT'>('VICTORY');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCreator = match.creator.id === currentUser.id;
  const isOpponent = match.opponent?.id === currentUser.id;
  const isParticipant = isCreator || isOpponent;

  const myClaim = isCreator ? match.creator.resultClaim : match.opponent?.resultClaim;
  const myScreenshot = isCreator ? match.creator.screenshotUrl : match.opponent?.screenshotUrl;
  const myAnalysis = isCreator ? match.creator.screenshotAnalysis : match.opponent?.screenshotAnalysis;

  const opponentObj = isCreator ? match.opponent : match.creator;
  const isWinner = match.status === 'SETTLED' && match.winnerId === currentUser.id;
  const isLoser = match.status === 'SETTLED' && match.winnerId && match.winnerId !== currentUser.id;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(match.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

  const useSampleVictoryScreenshot = () => {
    // High-fidelity victory banner asset
    setScreenshotPreview('/src/assets/images/codm_score_victory_1791303464940.jpg');
    setSelectedClaim('VICTORY');
  };

  const useSampleDefeatScreenshot = () => {
    setScreenshotPreview('/src/assets/images/codm_sniper_shipment_1791303451126.jpg');
    setSelectedClaim('DEFEAT');
  };

  const handleResultSubmit = async () => {
    if (!screenshotPreview && selectedClaim === 'VICTORY') {
      setSubmitError('Please attach or select a scoreboard screenshot showing your Victory');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmitResult(selectedClaim, screenshotPreview || undefined);
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    try {
      await onSendChat(text);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRefreshMatch()}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Refresh match status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <span className="text-xs px-2.5 py-1 rounded font-mono-nums font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {match.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Settle Banner / Winner Announcement */}
      {match.status === 'SETTLED' && (
        <div className={`p-6 rounded-2xl border shadow-2xl relative overflow-hidden text-center space-y-3 ${
          isWinner
            ? 'bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-950 border-amber-500/50'
            : 'bg-neutral-900 border-neutral-800'
        }`}>
          <div className="w-14 h-14 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-400 flex items-center justify-center mx-auto text-2xl">
            <Trophy className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-heading tracking-wide text-white">
            {isWinner ? (
              <span className="text-amber-400">VICTORY! ₦{match.winnerPayout.toLocaleString()} PAID OUT</span>
            ) : (
              <span>MATCH CONCLUDED · WINNER: <span className="text-amber-400">{match.winnerIgn}</span></span>
            )}
          </h2>

          <p className="text-sm text-neutral-300 max-w-xl mx-auto">
            {match.resolutionNotes}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono-nums">
            <span className="text-neutral-400">Total Pot: <strong>₦{match.potAmount.toLocaleString()}</strong></span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-400">Platform Fee (10%): <strong>₦{match.platformFee.toLocaleString()}</strong></span>
            <span className="text-neutral-400">·</span>
            <span className="text-emerald-400 font-bold">Winner Payout: ₦{match.winnerPayout.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Dispute Alert Banner */}
      {match.status === 'DISPUTED' && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-neutral-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold font-heading text-lg">
            <AlertTriangle className="w-5 h-5" />
            <span>DISPUTED MATCH · CONFLICTING CLAIMS</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Both players claimed Victory with conflicting screenshots. The match is currently under referee review.
          </p>
          {onAdminResolve && (
            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs text-neutral-400">Referee Test Decision:</span>
              <button
                onClick={() => onAdminResolve(match.creator.id)}
                className="px-3 py-1 bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg hover:bg-amber-300 transition-colors"
              >
                Award Win to {match.creator.codmIgn}
              </button>
              {match.opponent && (
                <button
                  onClick={() => onAdminResolve(match.opponent!.id)}
                  className="px-3 py-1 bg-neutral-800 text-neutral-200 font-bold text-xs rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Award Win to {match.opponent.codmIgn}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Battle Header & Room Tracking Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              Official Game Room Tracking Code
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono-nums text-amber-400 tracking-wider">
                {match.roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Copy room code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
              <div className="text-[10px] text-neutral-400 font-mono-nums uppercase">Escrow Pot</div>
              <div className="text-xl font-black text-amber-400 font-mono-nums">₦{match.potAmount.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-right">
              <div className="text-[10px] text-neutral-400 font-mono-nums uppercase">Winner Payout</div>
              <div className="text-xl font-black text-emerald-400 font-mono-nums">₦{match.winnerPayout.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Head-to-Head Contenders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Creator Profile */}
          <div className={`p-4 rounded-xl border transition-all ${
            match.winnerId === match.creator.id
              ? 'bg-amber-500/10 border-amber-400/80 shadow-md'
              : 'bg-neutral-950/70 border-neutral-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Host / Creator
              </span>
              <span className="text-xs font-mono-nums font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                🔒 ₦{match.stakeAmount.toLocaleString()} Staked
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={match.creator.avatar}
                alt={match.creator.codmIgn}
                className="w-12 h-12 rounded-xl object-cover bg-neutral-800"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-white truncate flex items-center gap-2">
                  <span>{match.creator.codmIgn}</span>
                  {match.winnerId === match.creator.id && (
                    <Trophy className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="text-xs text-neutral-400 font-mono-nums truncate">
                  UID: {match.creator.codmUid}
                </div>
              </div>
            </div>

            {match.creator.resultClaim && (
              <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Result Submitted:</span>
                <span className={`font-bold ${
                  match.creator.resultClaim === 'VICTORY' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {match.creator.resultClaim}
                </span>
              </div>
            )}
          </div>

          {/* Opponent Profile */}
          <div className={`p-4 rounded-xl border transition-all ${
            match.winnerId === match.opponent?.id
              ? 'bg-amber-500/10 border-amber-400/80 shadow-md'
              : 'bg-neutral-950/70 border-neutral-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Opponent / Rival
              </span>
              {match.opponent ? (
                <span className="text-xs font-mono-nums font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  🔒 ₦{match.stakeAmount.toLocaleString()} Staked
                </span>
              ) : (
                <span className="text-xs text-amber-400 font-medium">Awaiting Join...</span>
              )}
            </div>

            {match.opponent ? (
              <div className="flex items-center gap-3">
                <img
                  src={match.opponent.avatar}
                  alt={match.opponent.codmIgn}
                  className="w-12 h-12 rounded-xl object-cover bg-neutral-800"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-white truncate flex items-center gap-2">
                    <span>{match.opponent.codmIgn}</span>
                    {match.winnerId === match.opponent.id && (
                      <Trophy className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 font-mono-nums truncate">
                    UID: {match.opponent.codmUid}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-neutral-400">
                Opponent has not accepted yet. Share the invite link with them!
              </div>
            )}

            {match.opponent?.resultClaim && (
              <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <span className="text-neutral-400">Result Submitted:</span>
                <span className={`font-bold ${
                  match.opponent.resultClaim === 'VICTORY' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {match.opponent.resultClaim}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Game Setup & Proof Submission (Left) + Chat & Ref (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Match Rules & Result Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* In-Game Instructions */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <h3 className="text-sm font-bold font-heading uppercase text-white flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>CODM Private Match Instructions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                <div className="font-bold text-white">1. Create Custom Room in CODM</div>
                <p className="text-neutral-400">
                  Host opens CODM &gt; Multiplayer &gt; Private Match. Map: <strong>{match.map}</strong>. Mode: <strong>{match.gameMode}</strong>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                <div className="font-bold text-white">2. Add Opponent via Tag</div>
                <p className="text-neutral-400">
                  Search opponent's IGN: <strong>{opponentObj ? opponentObj.codmIgn : 'Opponent'}</strong> and invite to your lobby.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                <div className="font-bold text-white">3. Follow Agreed Rules</div>
                <p className="text-neutral-400">
                  Sniper Only. No Operator Skills, No Scorestreaks. First to 10 kills or 5 rounds.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-1">
                <div className="font-bold text-white">4. Screenshot Match End</div>
                <p className="text-neutral-400">
                  Capture final scoreboard showing Victory/Defeat badge with both player names visible.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Card (Only active when match is in progress or awaiting results) */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Submit Post-Game Result & Proof</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Upload your end-game victory/defeat screenshot for automated AI verification and instant payout.
                </p>
              </div>

              {myClaim && (
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  You Claimed: {myClaim}
                </span>
              )}
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {submitError}
              </div>
            )}

            {match.status === 'SETTLED' ? (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">Match Resolved & Paid Out</div>
                <p className="text-xs text-neutral-400">
                  This wager has concluded. Check your wallet balance for credited funds.
                </p>
              </div>
            ) : myClaim ? (
              /* Already submitted, waiting for opponent or settlement */
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Your Screenshot & Claim Received!</span>
                  </div>
                  <span className="text-xs text-neutral-400">Claim: <strong>{myClaim}</strong></span>
                </div>

                {myScreenshot && (
                  <div className="relative rounded-lg overflow-hidden max-h-48 border border-neutral-800 bg-black">
                    <img src={myScreenshot} alt="Submitted Proof" className="w-full h-full object-contain" />
                  </div>
                )}

                {myAnalysis && (
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs space-y-1">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Verification Result: {myAnalysis.detectedOutcome} ({Math.round((myAnalysis.confidence || 0.95) * 100)}% Confidence)</span>
                    </div>
                    <p className="text-neutral-300">{myAnalysis.reasoning}</p>
                  </div>
                )}

                <div className="text-xs text-neutral-400 text-center pt-2 border-t border-neutral-800">
                  Waiting for opponent ({opponentObj?.codmIgn || 'Opponent'}) to submit their proof...
                </div>
              </div>
            ) : (
              /* Submission Form */
              <div className="space-y-4">
                {/* Claim Selection */}
                <div>
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                    Select Your Match Outcome:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedClaim('VICTORY')}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        selectedClaim === 'VICTORY'
                          ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <Trophy className="w-4 h-4" />
                      <span>I Won (Victory)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedClaim('DEFEAT')}
                      className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        selectedClaim === 'DEFEAT'
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span>I Lost (Defeat)</span>
                    </button>
                  </div>
                </div>

                {/* Screenshot Upload / Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      CODM Scoreboard Screenshot
                    </label>
                    <span className="text-[11px] text-neutral-400">PNG, JPG up to 10MB</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {screenshotPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-black group max-h-60">
                      <img
                        src={screenshotPreview}
                        alt="Scoreboard preview"
                        className="w-full h-full object-contain max-h-60"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Change Screenshot</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 rounded-xl border border-dashed border-neutral-700 hover:border-amber-400/60 bg-neutral-950/60 transition-colors text-center cursor-pointer space-y-2"
                    >
                      <Upload className="w-8 h-8 text-neutral-500 mx-auto" />
                      <div className="text-xs font-bold text-neutral-200">
                        Click to Upload Match Scoreboard Screenshot
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Must show victory/defeat banner with kill counts
                      </p>
                    </div>
                  )}

                  {/* Quick Test Demo Screenshot Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[11px] text-neutral-400">Quick Test Proofs:</span>
                    <button
                      type="button"
                      onClick={useSampleVictoryScreenshot}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Use Sample Victory Screen
                    </button>
                    <button
                      type="button"
                      onClick={useSampleDefeatScreenshot}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Use Sample Defeat Screen
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleResultSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Verifying Screenshot with AI Referee...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Submit {selectedClaim} & Claim Payout</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Test Action Bar for 1-device demonstration */}
          {onSimulateOpponentResult && match.status !== 'SETTLED' && (
            <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Opponent Proof (For Fast Testing)</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Trigger opponent submission without opening a second tab:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onSimulateOpponentResult('DEFEAT')}
                  className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Opponent Submits Defeat (You Win ₦{match.winnerPayout.toLocaleString()})
                </button>
                <button
                  onClick={() => onSimulateOpponentResult('VICTORY')}
                  className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-rose-400 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Opponent Claims Victory (Trigger Dispute)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Match Chat & Referee Feed */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold font-heading text-white">Live Match Chat</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {match.chatMessages.map((msg) => {
                const isSys = msg.senderId === 'SYSTEM';
                const isMe = msg.senderId === currentUser.id;

                if (isSys) {
                  return (
                    <div key={msg.id} className="p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 text-[11px] text-neutral-300">
                      <span className="font-bold text-amber-400 block mb-0.5">{msg.senderName}</span>
                      <span>{msg.text}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[10px] text-neutral-400 mb-0.5">
                      {isMe ? 'You' : msg.senderName}
                    </div>
                    <div
                      className={`p-2.5 rounded-xl text-xs max-w-[85%] break-words ${
                        isMe
                          ? 'bg-amber-400 text-neutral-950 font-medium'
                          : 'bg-neutral-800 text-neutral-200'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Chat Prompts */}
            <div className="flex flex-wrap gap-1.5 py-2 border-t border-neutral-800 text-[10px]">
              {['I created the private room', 'Invite sent in CODM', 'Ready to start!', 'GG!'].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onSendChat(prompt)}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Message opponent..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
