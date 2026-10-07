import React from 'react';
import { UserProfile } from '../types';
import { Wallet, Swords, ArrowDownLeft, Plus, Target, LogOut, Clock, User } from 'lucide-react';
import { CODM_IMAGES } from '../assets/images';

export type NavigationTab = 'landing' | 'auth' | 'arena' | 'history' | 'wallet_dashboard' | 'funding' | 'profile' | 'active_bets';

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
        {/* Zone 1: Single text element brand wordmark with Official Logo Emblem */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('arena')}
            className="flex items-center gap-2.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-500/10 border border-amber-500/40 group-hover:border-amber-400 transition-all p-0.5 shadow-md shadow-amber-500/10">
              <img
                src={CODM_IMAGES.appLogo}
                alt="CODM Stake"
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = CODM_IMAGES.appLogoFallback;
                }}
              />
            </div>
            <div>
              <span className="font-heading font-black text-lg sm:text-xl tracking-wider text-white group-hover:text-amber-400 transition-colors">
                CODM STAKE
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('arena')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'arena' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'history' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
          </button>

          <button
            onClick={() => setCurrentTab('wallet_dashboard')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentTab === 'wallet_dashboard' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Wallet
          </button>

          <button
            onClick={() => setCurrentTab('profile')}
            className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'profile' ? 'text-amber-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setCurrentTab('funding')}
            className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'funding' ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-emerald-300'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Fund ₦</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions & User HUD */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Bet Button */}
          <button
            onClick={openCreateBetModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-black text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden xs:inline">Create Bet</span>
            <span className="xs:hidden">Bet</span>
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

          {/* User Profile Badge (Clickable to open profile) */}
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
              currentTab === 'profile'
                ? 'bg-amber-500/15 border-amber-400'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
            }`}
            title="View Player Profile"
          >
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
          </button>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-rose-500/50 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Sign Out to Sign In / Landing Page"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-900 bg-neutral-950 px-2 py-2 text-xs">
        <button
          onClick={() => setCurrentTab('arena')}
          className={`py-1 px-2.5 rounded-lg ${currentTab === 'arena' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-neutral-400'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setCurrentTab('history')}
          className={`py-1 px-2.5 rounded-lg ${currentTab === 'history' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-neutral-400'}`}
        >
          History
        </button>
        <button
          onClick={() => setCurrentTab('wallet_dashboard')}
          className={`py-1 px-2.5 rounded-lg ${currentTab === 'wallet_dashboard' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-neutral-400'}`}
        >
          Wallet
        </button>
        <button
          onClick={() => setCurrentTab('profile')}
          className={`py-1 px-2.5 rounded-lg ${currentTab === 'profile' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30' : 'text-neutral-400'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setCurrentTab('funding')}
          className={`py-1 px-2.5 rounded-lg ${currentTab === 'funding' ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'text-neutral-400'}`}
        >
          Fund ₦
        </button>
      </div>
    </header>
  );
};
