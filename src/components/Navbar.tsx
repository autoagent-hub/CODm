import React from 'react';
import { UserProfile } from '../types';
import { Wallet, Swords, ArrowDownLeft, Plus, Home, Target, LogOut } from 'lucide-react';

export type NavigationTab = 'landing' | 'auth' | 'arena' | 'wallet_dashboard' | 'funding' | 'active_bets';

interface NavbarProps {
  currentUser: UserProfile;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  openCreateBetModal: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  setCurrentTab,
  openCreateBetModal,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element brand wordmark + Back to Landing button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('arena')}
            className="flex items-center gap-2 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
              <span className="font-heading font-black text-lg tracking-wider">1v1</span>
            </div>
            <div>
              <span className="font-heading font-black text-lg tracking-wide text-white group-hover:text-amber-400 transition-colors">
                CODM STAKE
              </span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('landing')}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-semibold text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            title="Return to the public landing page"
          >
            <span>← Landing Page</span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('arena')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'arena' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Dashboard / Arena
          </button>

          <button
            onClick={() => setCurrentTab('wallet_dashboard')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'wallet_dashboard' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Wallet Dashboard
          </button>

          <button
            onClick={() => setCurrentTab('funding')}
            className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'funding' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-emerald-300'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Fund Wallet (₦)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & User HUD */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Bet Button */}
          <button
            onClick={openCreateBetModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-black text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Bet</span>
          </button>

          {/* Available Balance Shortcut */}
          <button
            onClick={() => setCurrentTab('wallet_dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 transition-colors text-left group cursor-pointer"
            title="Open Wallet Dashboard"
          >
            <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 font-mono-nums uppercase leading-none">Balance</span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono-nums">
                ₦{currentUser.balance.toLocaleString()}
              </span>
            </div>
          </button>

          {/* User Profile Badge (No switch account) */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.codmIgn}
              className="w-7 h-7 rounded-lg object-cover bg-neutral-800"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block text-left pr-1">
              <div className="font-bold text-white text-xs leading-tight">{currentUser.codmIgn}</div>
              <div className="text-[10px] text-neutral-400 font-mono-nums">UID: {currentUser.codmUid}</div>
            </div>
          </div>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out to Landing Page"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-900 bg-neutral-950 px-2 py-2 text-xs">
        <button
          onClick={() => setCurrentTab('landing')}
          className={`py-1 px-2 rounded ${currentTab === 'landing' ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}
        >
          Home
        </button>
        <button
          onClick={() => setCurrentTab('arena')}
          className={`py-1 px-2 rounded ${currentTab === 'arena' ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}
        >
          Arena
        </button>
        <button
          onClick={() => setCurrentTab('wallet_dashboard')}
          className={`py-1 px-2 rounded ${currentTab === 'wallet_dashboard' ? 'text-amber-400 font-bold' : 'text-neutral-400'}`}
        >
          Wallet
        </button>
        <button
          onClick={() => setCurrentTab('funding')}
          className={`py-1 px-2 rounded ${currentTab === 'funding' ? 'text-emerald-400 font-bold' : 'text-neutral-400'}`}
        >
          Fund ₦
        </button>
      </div>
    </header>
  );
};
