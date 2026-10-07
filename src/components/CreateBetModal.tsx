import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  X, Swords, ShieldCheck, AlertCircle, Crosshair, Target, Zap,
  Flame, Users, Flag, MapPin, Gamepad2
} from 'lucide-react';
import { CODM_IMAGES } from '../assets/images';
import { calculateMatchEconomics } from '../utils/pricing';

interface CreateBetModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  initialMode?: string;
  initialStake?: number;
  onClose: () => void;
  onSubmit: (data: {
    stakeAmount: number;
    gameMode: string;
    map: string;
    rules: string[];
  }) => Promise<void>;
  onOpenWallet: () => void;
}

export const CreateBetModal: React.FC<CreateBetModalProps> = ({
  currentUser,
  isOpen,
  initialMode,
  initialStake,
  onClose,
  onSubmit,
  onOpenWallet,
}) => {
  const [betType, setBetType] = useState<'solo' | 'squad'>('solo');
  const [stakeAmount, setStakeAmount] = useState<number>(1000);
  const [gameModeInput, setGameModeInput] = useState<string>('1v1 Sniper Only');
  const [mapInput, setMapInput] = useState<string>('Shipment');
  const [rulesInput, setRulesInput] = useState<string>('Standard 1v1 rules. No scorestreaks/operators. Screenshot proof required.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial mode and stake when opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialStake && initialStake >= 1000) {
        setStakeAmount(initialStake);
      }
      if (initialMode) {
        setGameModeInput(initialMode);
      }
    }
  }, [isOpen, initialMode, initialStake]);

  if (!isOpen) return null;

  const { potAmount, rakePercentFormatted, platformFee, winnerPayout } = calculateMatchEconomics(stakeAmount);
  const isInsufficient = currentUser.balance < stakeAmount;

  const handleCreate = async () => {
    if (stakeAmount < 1000) {
      setError('Minimum stake amount is ₦1,000');
      return;
    }
    if (!gameModeInput.trim()) {
      setError('Please enter a game mode');
      return;
    }
    if (!mapInput.trim()) {
      setError('Please enter a map name');
      return;
    }
    if (isInsufficient) {
      setError(`Insufficient balance. You have ₦${currentUser.balance.toLocaleString()}. Please fund your wallet first.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        stakeAmount,
        gameMode: gameModeInput.trim(),
        map: mapInput.trim(),
        rules: [
          rulesInput.trim() || 'Custom CODM match rules agreed by players',
          'No cheat modifications or glitches',
          'Post-match scoreboard screenshot required for AI verification',
        ],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create bet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-white">Create Custom Match Wager</h2>
              <p className="text-xs text-neutral-400">Set your own game mode, map, and rules in escrow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Only 2 Card Betting Options: Solo (1v1) & Squad (Team) */}
          <div>
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2.5">
              1. Choose Betting Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Solo 1v1 Card with Shipment Background */}
              <button
                type="button"
                onClick={() => {
                  setBetType('solo');
                  setGameModeInput('1v1 Sniper Only');
                  setMapInput('Shipment');
                }}
                className={`relative overflow-hidden p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-24 ${
                  betType === 'solo'
                    ? 'bg-neutral-900 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={CODM_IMAGES.shipment1v1}
                  alt="Shipment"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CODM_IMAGES.shipment1v1Fallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    betType === 'solo' ? 'bg-amber-400 text-neutral-950 font-black' : 'bg-neutral-900 text-neutral-400'
                  }`}>
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  {betType === 'solo' && (
                    <span className="w-4 h-4 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center font-bold text-[9px]">
                      ✓
                    </span>
                  )}
                </div>

                <div className="relative z-10">
                  <div className="font-heading font-black text-xs text-white uppercase">Solo (1v1)</div>
                  <div className="text-[10px] text-neutral-400">Shipment 1v1 Duel</div>
                </div>
              </button>

              {/* Squad Team Card with Squad Background */}
              <button
                type="button"
                onClick={() => {
                  setBetType('squad');
                  setGameModeInput('Search & Destroy (S&D)');
                  setMapInput('Standoff');
                }}
                className={`relative overflow-hidden p-3.5 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-24 ${
                  betType === 'squad'
                    ? 'bg-neutral-900 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={CODM_IMAGES.squadTactical}
                  alt="Squad"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = CODM_IMAGES.squadTacticalFallback;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    betType === 'squad' ? 'bg-emerald-400 text-neutral-950 font-black' : 'bg-neutral-900 text-neutral-400'
                  }`}>
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  {betType === 'squad' && (
                    <span className="w-4 h-4 rounded-full bg-emerald-400 text-neutral-950 flex items-center justify-center font-bold text-[9px]">
                      ✓
                    </span>
                  )}
                </div>

                <div className="relative z-10">
                  <div className="font-heading font-black text-xs text-white uppercase">Squad (Team)</div>
                  <div className="text-[10px] text-neutral-400">Team Tactical Match</div>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Game Mode Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Game Mode Name</span>
            </label>
            <input
              type="text"
              value={gameModeInput}
              onChange={(e) => setGameModeInput(e.target.value)}
              placeholder="e.g. 1v1 Sniper Only, Custom S&D, Trickshot Lobby"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          {/* Custom Map Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Map Name</span>
            </label>
            <input
              type="text"
              value={mapInput}
              onChange={(e) => setMapInput(e.target.value)}
              placeholder="e.g. Shipment, Standoff, Killhouse, Nuketown"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>

          {/* Custom Rules Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Match Rules & Conditions</span>
            </label>
            <input
              type="text"
              value={rulesInput}
              onChange={(e) => setRulesInput(e.target.value)}
              placeholder="e.g. No scorestreaks, DL Q33 only, First to 10"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-300 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Stake Amount Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Stake Amount (₦ Naira)
              </label>
              <span className="text-xs text-neutral-400 font-mono-nums">
                Available: <span className="text-emerald-400 font-bold">₦{currentUser.balance.toLocaleString()}</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {[1000, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setStakeAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-black font-mono-nums transition-all cursor-pointer border ${
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
              <span className="absolute left-3.5 top-2.5 text-xs text-neutral-400 font-mono-nums">₦</span>
              <input
                type="number"
                min={1000}
                step={500}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Math.max(1000, parseInt(e.target.value) || 1000))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">Minimum stake is ₦1,000 · Tiered Rake (10% down to 5%)</div>
          </div>

          {/* Escrow Math Preview with Tiered Rake */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5 font-mono-nums">
            <div className="flex items-center justify-between text-neutral-400">
              <span>Total Escrow Pot (2x Stake):</span>
              <span className="text-amber-400 font-bold text-sm">₦{potAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>Tiered Platform Rake ({rakePercentFormatted}):</span>
              <span className="text-rose-400">-₦{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-bold pt-1 border-t border-neutral-800">
              <span>Winner Payout:</span>
              <span className="text-sm">₦{winnerPayout.toLocaleString()}</span>
            </div>
          </div>

          {isInsufficient && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <span className="text-amber-300 font-medium">Insufficient balance for ₦{stakeAmount.toLocaleString()} stake</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWallet();
                }}
                className="px-3 py-1.5 bg-amber-400 text-neutral-950 font-bold rounded-lg cursor-pointer hover:bg-amber-300 transition-colors"
              >
                Fund Wallet Now
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <span>Locking Escrow...</span>
            ) : (
              <>
                <Swords className="w-4 h-4 stroke-[2.5]" />
                <span>Create Wager & Lock ₦{stakeAmount.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
