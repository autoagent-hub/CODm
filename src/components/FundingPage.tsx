import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  Wallet, ArrowDownLeft, ShieldCheck, CheckCircle2, Copy, Check,
  CreditCard, Building2, Smartphone, AlertCircle, ArrowRight, Swords
} from 'lucide-react';

interface FundingPageProps {
  currentUser: UserProfile;
  onDeposit: (amount: number, method: string) => Promise<void>;
  onNavigateToArena: () => void;
  onOpenCreateBet: () => void;
}

export const FundingPage: React.FC<FundingPageProps> = ({
  currentUser,
  onDeposit,
  onNavigateToArena,
  onOpenCreateBet,
}) => {
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<'transfer' | 'card' | 'ussd'>('transfer');
  const [loading, setLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<{ amount: number; txId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Simulated virtual account for instant transfer
  const virtualAccount = {
    bank: 'Wema Bank / Moniepoint',
    accountNumber: '9048201948',
    accountName: `CODM-STAKE / ${currentUser.codmIgn.toUpperCase()}`,
    expiresIn: '29 mins',
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(virtualAccount.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleDepositSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (amount < 500) {
      setError('Minimum deposit amount is ₦500 (Minimum bet is ₦1,000)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessReceipt(null);
    try {
      const methodName =
        method === 'transfer'
          ? 'Instant Bank Transfer (Wema/Moniepoint)'
          : method === 'card'
          ? 'Debit Card (Paystack)'
          : 'USSD Banking';

      await onDeposit(amount, methodName);
      setSuccessReceipt({
        amount,
        txId: `tx_dep_${Date.now().toString().slice(-6)}`,
      });
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>Instant Naira Funding Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">
          FUND YOUR CODM ESCROW WALLET
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
          Add funds to place ₦1,000+ 1v1 bets or competitive team matches. Zero deposit fees.
        </p>
      </div>

      {/* Success Receipt Banner */}
      {successReceipt && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-center space-y-3 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="text-lg font-black text-white font-heading">
            WALLET SUCCESSFULLY FUNDED WITH ₦{successReceipt.amount.toLocaleString()}!
          </div>
          <p className="text-xs text-neutral-300">
            Transaction Reference: <strong className="font-mono-nums">{successReceipt.txId}</strong>. Your updated available balance is{' '}
            <strong className="text-emerald-400 font-mono-nums">₦{currentUser.balance.toLocaleString()}</strong>.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={onOpenCreateBet}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
            >
              <Swords className="w-4 h-4" />
              <span>Create ₦1,000 Bet Now</span>
            </button>
            <button
              onClick={onNavigateToArena}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Go to Arena Lobby
            </button>
          </div>
        </div>
      )}

      {/* Main Funding Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Amount Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-neutral-300 uppercase tracking-wider">
              1. Choose Funding Amount (₦)
            </label>
            <span className="text-neutral-400">
              Current Balance: <strong className="text-emerald-400 font-mono-nums">₦{currentUser.balance.toLocaleString()}</strong>
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-neutral-400 font-mono-nums">
              ₦
            </span>
            <input
              type="number"
              min={500}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums font-black text-2xl focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Quick presets */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[1000, 2000, 5000, 10000, 20000, 50000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`py-2 text-xs font-black rounded-xl border font-mono-nums transition-all cursor-pointer ${
                  amount === amt
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md scale-105'
                    : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400">
            ₦1,000 is the minimum wager required to create or join 1v1 challenges.
          </p>
        </div>

        {/* Step 2: Payment Method */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
            2. Select Payment Method
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMethod('transfer')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                method === 'transfer'
                  ? 'bg-amber-500/10 border-amber-400 text-white'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Building2 className={`w-5 h-5 ${method === 'transfer' ? 'text-amber-400' : 'text-neutral-500'}`} />
              <div>
                <div className="font-bold text-xs text-white">Bank Transfer</div>
                <div className="text-[10px] text-neutral-400">Instant virtual account</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                method === 'card'
                  ? 'bg-amber-500/10 border-amber-400 text-white'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${method === 'card' ? 'text-amber-400' : 'text-neutral-500'}`} />
              <div>
                <div className="font-bold text-xs text-white">Debit Card (Paystack)</div>
                <div className="text-[10px] text-neutral-400">Mastercard, Visa, Verve</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('ussd')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                method === 'ussd'
                  ? 'bg-amber-500/10 border-amber-400 text-white'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${method === 'ussd' ? 'text-amber-400' : 'text-neutral-500'}`} />
              <div>
                <div className="font-bold text-xs text-white">USSD Transfer</div>
                <div className="text-[10px] text-neutral-400">*737#, *966#, *919#</div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 3: Payment Details Section */}
        {method === 'transfer' && (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Transfer exact amount to dynamic account:</span>
              <span className="text-amber-400 font-mono-nums font-bold">Expires in {virtualAccount.expiresIn}</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-neutral-400 uppercase font-mono-nums">{virtualAccount.bank}</div>
                <div className="text-xl font-mono-nums font-black text-white">{virtualAccount.accountNumber}</div>
                <div className="text-xs text-neutral-300 font-semibold">{virtualAccount.accountName}</div>
              </div>

              <button
                type="button"
                onClick={handleCopyAccount}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Simulation / Confirmation Action */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => handleDepositSubmit()}
            disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-2xl text-base shadow-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Simulating Instant Gateway Confirmation...</span>
            ) : (
              <>
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                <span>Simulate Instant Deposit of ₦{amount.toLocaleString()}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Simulated instant sandbox credit · 100% verified ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
