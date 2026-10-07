import React from 'react';
import { UserProfile } from '../types';
import { Swords, Wallet, Clock, User, Plus, LogOut } from 'lucide-react';
import { NavigationTab } from './Navbar';

interface BottomNavbarProps {
  currentUser: UserProfile;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  currentUser,
  currentTab,
  setCurrentTab,
}) => {
  // Navigation tabs in exact requested order:
  // 1. Dashboard
  // 2. Wallet & Funding (unified)
  // 3. History
  // 4. Profile
  const navItems = [
    {
      id: 'arena' as NavigationTab,
      label: 'Dashboard',
      icon: Swords,
    },
    {
      id: 'wallet_dashboard' as NavigationTab,
      label: 'Wallet & Fund',
      icon: Wallet,
    },
    {
      id: 'history' as NavigationTab,
      label: 'History',
      icon: Clock,
    },
    {
      id: 'profile' as NavigationTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="App Navigation"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto"
    >
      <div className="flex items-center justify-around sm:justify-center gap-2 sm:gap-4 px-4 py-2.5 rounded-2xl bg-neutral-950/90 backdrop-blur-xl border border-neutral-800 shadow-2xl shadow-black/80 ring-1 ring-white/5">
        {/* Nav Items in order: Dashboard -> Wallet & Fund -> History -> Profile */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'wallet_dashboard' && currentTab === 'funding');

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-2 px-3 sm:px-5 rounded-xl transition-all duration-200 cursor-pointer group ${
                isActive
                  ? 'bg-amber-400/15 text-amber-400 border border-amber-500/40 shadow-md shadow-amber-500/10'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
              }`}
              title={item.label}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-amber-400 stroke-[2.5]' : 'text-neutral-400'
                }`}
              />
              <span className={`text-[10px] font-bold tracking-tight mt-1 font-heading uppercase ${
                isActive ? 'text-amber-400' : 'text-neutral-400'
              }`}>
                {item.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
