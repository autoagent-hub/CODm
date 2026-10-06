import React, { useState } from 'react';
import { UserProfile, Transaction } from '../types';
import { X, Wallet, ArrowDownLeft, ArrowUpRight, ShieldCheck, Check, AlertCircle, Building2, CreditCard } from 'lucide-react';

interface WalletModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string) => Promise<void>;
  onWithdraw: (amount: number, bankDetails: { bankName: string; accountNumber: string; accountName: string }) => Promise<void>;
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
];

export const WalletModal: React.FC<WalletModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onDeposit,
  onWithdraw,
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [depositMethod, setDepositMethod] = useState<string>('Instant Bank Transfer (OPay/GTB)');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [selectedBank, setSelectedBank] = useState<string>(NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState<string>('0123456789');
  const [accountName, setAccountName] = useState<string>(`${currentUser.codmIgn.toUpperCase()} ESQ.`);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    setLoading(true);
    setMessage(null);
    try {
      await onDeposit(depositAmount, depositMethod);
      setMessage({ type: 'success', text: `Successfully funded ₦${depositAmount.toLocaleString()} to your wallet!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Deposit failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;
    if (withdrawAmount > currentUser.balance) {
      setMessage({ type: 'error', text: 'Withdrawal amount exceeds available balance' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await onWithdraw(withdrawAmount, {
        bankName: selectedBank,
        accountNumber,
        accountName,
      });
      setMessage({
        type: 'success',
        text: `Withdrawal of ₦${withdrawAmount.toLocaleString()} sent to ${selectedBank} (${accountNumber})!`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Withdrawal failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-white">Naira Escrow Wallet</h2>
              <p className="text-xs text-neutral-400">Manage balances, top-ups and cashouts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Overview Card */}
        <div className="p-5 bg-neutral-950/60 border-b border-neutral-800">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 uppercase font-mono-nums">Available</div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono-nums">
                ₦{currentUser.balance.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 uppercase font-mono-nums">In Escrow</div>
              <div className="text-lg sm:text-xl font-black text-amber-400 font-mono-nums">
                ₦{currentUser.escrowBalance.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-[10px] text-neutral-400 uppercase font-mono-nums">Total Won</div>
              <div className="text-lg sm:text-xl font-black text-white font-mono-nums">
                ₦{currentUser.totalWinnings.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Segmented Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('deposit'); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'deposit' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Fund Wallet</span>
            </button>

            <button
              onClick={() => { setActiveTab('withdraw'); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'withdraw' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw ₦</span>
            </button>

            <button
              onClick={() => { setActiveTab('history'); setMessage(null); }}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'history' ? 'bg-amber-400 text-neutral-950 shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {message && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}>
              {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'deposit' && (
            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Deposit Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400 font-mono-nums">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums text-base font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[1000, 2000, 5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-1.5 text-xs font-bold rounded-lg border font-mono-nums transition-colors cursor-pointer ${
                        depositAmount === amt
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'Instant Bank Transfer (OPay/GTB)', name: 'Instant Bank Transfer (OPay / GTBank / Zenith)' },
                    { id: 'Paystack Debit Card', name: 'Paystack Card Payment (Mastercard / Visa / Verve)' },
                    { id: 'USSD *737# / *966#', name: 'Instant USSD Banking' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setDepositMethod(m.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        depositMethod === m.id
                          ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {m.name}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing Instant Deposit...' : `Deposit ₦${depositAmount.toLocaleString()} to Wallet`}
              </button>
            </form>
          )}

          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Withdrawal Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400 font-mono-nums">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={1000}
                    max={currentUser.balance}
                    step={500}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums text-base font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Available to withdraw: <strong className="text-emerald-400 font-mono-nums">₦{currentUser.balance.toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Select Nigerian Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                >
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  10-Digit NUBAN Account Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono-nums text-sm focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-neutral-300 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || currentUser.balance < withdrawAmount}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing Instant Payout...' : `Withdraw ₦${withdrawAmount.toLocaleString()} to Bank`}
              </button>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Recent Escrow & Wallet Ledger
              </div>

              {currentUser.transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No transaction history recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-neutral-800 rounded-xl bg-neutral-950/80 border border-neutral-800 overflow-hidden">
                  {currentUser.transactions.map((tx) => {
                    const isCredit = tx.type === 'DEPOSIT' || tx.type === 'MATCH_WIN_PAYOUT' || tx.type === 'ESCROW_REFUND';
                    return (
                      <div key={tx.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-neutral-200">{tx.description}</div>
                          <div className="text-[10px] text-neutral-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>

                        <div className={`font-mono-nums font-bold text-right ${
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
          )}
        </div>
      </div>
    </div>
  );
};
