import React from 'react';
import { Swords, Wallet, Trophy, Flame, Plus, ShieldCheck, Home } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'lobby' | 'active_bets' | 'wallet' | 'rules' | 'leaderboard';
  setCurrentTab: (tab: 'lobby' | 'active_bets' | 'wallet' | 'rules' | 'leaderboard') => void;
  openCreateBetModal: () => void;
  activeBetsCount: number;
  walletBalance: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openCreateBetModal,
  activeBetsCount,
  walletBalance,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 border-t border-neutral-800/80 backdrop-blur-lg px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Lobby */}
        <button
          onClick={() => setCurrentTab('lobby')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px] ${
            currentTab === 'lobby' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'lobby' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Lobby</span>
        </button>

        {/* Active Bets */}
        <button
          onClick={() => setCurrentTab('active_bets')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px] relative ${
            currentTab === 'active_bets' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Swords className={`w-5 h-5 ${currentTab === 'active_bets' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Bets</span>
          {activeBetsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-neutral-950" />
          )}
        </button>

        {/* Central Plus Create Bet Button */}
        <button
          onClick={openCreateBetModal}
          className="flex flex-col items-center justify-center -mt-5 p-3 rounded-full bg-amber-400 text-neutral-950 font-black shadow-lg shadow-amber-400/20 active:scale-95 transition-transform"
          title="Create Bet"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Wallet */}
        <button
          onClick={() => setCurrentTab('wallet')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px] ${
            currentTab === 'wallet' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Wallet className={`w-5 h-5 ${currentTab === 'wallet' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight font-mono-nums">Wallet</span>
        </button>

        {/* Leaderboard */}
        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all min-w-[56px] ${
            currentTab === 'leaderboard' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Trophy className={`w-5 h-5 ${currentTab === 'leaderboard' ? 'scale-110' : ''}`} />
          <span className="text-[10px] mt-1 tracking-tight">Ranks</span>
        </button>
      </div>
    </nav>
  );
};
