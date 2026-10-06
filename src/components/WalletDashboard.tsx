import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types';
import {
  Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, Trophy,
  Clock, CheckCircle2, AlertCircle, Building2, CreditCard,
  Plus, Swords, Filter, RefreshCw
} from 'lucide-react';

interface WalletDashboardProps {
  currentUser: UserProfile;
  onNavigateToFunding: () => void;
  onOpenCreateBet: () => void;
  onWithdraw: (amount: number, bankDetails: { bankName: string; accountNumber: string; accountName: string }) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Kuda Bank',
  'OPay Digital Services',
  'PalmPay',
  'Stanbic IBTC Bank',
  'Moniepoint MFB',
];

export const WalletDashboard: React.FC<WalletDashboardProps> = ({
  currentUser,
  onNavigateToFunding,
  onOpenCreateBet,
  onWithdraw,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [selectedBank, setSelectedBank] = useState<string>(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState<string>('0123456789');
  const [accountName, setAccountName] = useState<string>(`${currentUser.codmIgn.toUpperCase()} ESQ.`);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const filteredTransactions = currentUser.transactions.filter((tx) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'DEPOSIT') return tx.type === 'DEPOSIT';
    if (filterType === 'PAYOUT') return tx.type === 'MATCH_WIN_PAYOUT';
    if (filterType === 'ESCROW') return tx.type === 'ESCROW_LOCK' || tx.type === 'ESCROW_REFUND';
    if (filterType === 'WITHDRAWAL') return tx.type === 'WITHDRAWAL';
    return true;
  });

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;
    if (withdrawAmount > currentUser.balance) {
      setWithdrawError('Withdrawal amount exceeds available balance');
      return;
    }
    setWithdrawLoading(true);
    setWithdrawError(null);
    setWithdrawSuccess(null);
    try {
      await onWithdraw(withdrawAmount, {
        bankName: selectedBank,
        accountNumber,
        accountName,
      });
      setWithdrawSuccess(`₦${withdrawAmount.toLocaleString()} successfully withdrawn to ${selectedBank} (${accountNumber})!`);
      setTimeout(() => setShowWithdrawModal(false), 2000);
    } catch (err: any) {
      setWithdrawError(err.message || 'Withdrawal failed');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Wallet className="w-4 h-4" />
            <span>Financial Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
            NAIRA ESCROW WALLET DASHBOARD
          </h1>
          <p className="text-xs text-neutral-400">
            Real-time balance, escrow locks, and instant Nigerian bank withdrawals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToFunding}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Fund Wallet (Deposit)</span>
          </button>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Withdraw ₦</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono-nums">
            ₦{currentUser.balance.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400">Ready to stake or cash out</div>
        </div>

        {/* Escrow Held */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>In Escrow (Locked)</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono-nums">
            ₦{currentUser.escrowBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400">Secured in active matches</div>
        </div>

        {/* Total Winnings */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Total Escrow Won</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono-nums">
            ₦{currentUser.totalWinnings.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400">Verified match prize payouts</div>
        </div>

        {/* Wager Combat Record */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Wager Record</span>
            <Swords className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono-nums flex items-center gap-2">
            <span className="text-emerald-400">{currentUser.wins}W</span>
            <span className="text-neutral-600">-</span>
            <span className="text-rose-400">{currentUser.losses}L</span>
          </div>
          <div className="text-[11px] text-neutral-400">
            Win Rate: {currentUser.wins + currentUser.losses > 0 ? Math.round((currentUser.wins / (currentUser.wins + currentUser.losses)) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Escrow Guarantee Callout */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Automated Escrow Security</div>
            <div className="text-xs text-neutral-400">
              When a bet is placed, ₦1,000+ is held in trust. Winners receive 90% of the pot upon verified screenshot submission.
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCreateBet}
          className="hidden sm:flex px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Create Wager</span>
        </button>
      </div>

      {/* Comprehensive Transaction Ledger */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-heading text-white">Transaction Statement Ledger</h2>
            <p className="text-xs text-neutral-400">Complete immutable record of all deposits, escrow locks, winnings & withdrawals</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {['ALL', 'DEPOSIT', 'PAYOUT', 'ESCROW', 'WITHDRAWAL'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500 space-y-1">
            <div>No transactions matching the selected filter.</div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'DEPOSIT' || tx.type === 'MATCH_WIN_PAYOUT' || tx.type === 'ESCROW_REFUND';
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between text-xs hover:bg-neutral-900/50 transition-colors">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white text-sm">{tx.description}</div>
                    <div className="text-[11px] text-neutral-500 font-mono-nums">
                      {new Date(tx.timestamp).toLocaleString()} · ID: {tx.id}
                    </div>
                  </div>

                  <div className={`font-mono-nums font-black text-base ${
                    isCredit ? 'text-emerald-400' : 'text-neutral-400'
                  }`}>
                    {isCredit ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instant Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold font-heading text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                <span>Withdraw to Nigerian Bank</span>
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {withdrawSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            {withdrawError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{withdrawError}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Withdrawal Amount (₦)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={currentUser.balance}
                  step={500}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums font-bold text-base focus:border-amber-400 focus:outline-none"
                />
                <div className="text-[11px] text-neutral-400 mt-1">
                  Available: <strong className="text-emerald-400 font-mono-nums">₦{currentUser.balance.toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Select Nigerian Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  10-Digit Account Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-300 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={withdrawLoading || currentUser.balance < withdrawAmount}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black rounded-xl text-sm transition-all shadow-lg cursor-pointer disabled:opacity-50"
              >
                {withdrawLoading ? 'Processing Instant Payout...' : `Confirm Cashout of ₦${withdrawAmount.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
