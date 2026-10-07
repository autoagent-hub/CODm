import React, { useState, useEffect } from 'react';
import { UserProfile, Match } from './types';
import {
  fetchUser, fetchMatches, fetchMatch, createMatch, joinMatch,
  cancelMatch, submitMatchResult, depositWallet, withdrawWallet,
  createUser, signUpUser, signInUser, DEFAULT_USERS
} from './services/api';
import { auth, firebaseSignOut } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { syncUserToFirestore, getUserFromFirestore, syncMatchToFirestore } from './firebase/service';
import { Navbar, NavigationTab } from './components/Navbar';
import { BottomNavbar } from './components/BottomNavbar';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { CoreArena } from './components/CoreArena';
import { WalletDashboard } from './components/WalletDashboard';
import { FundingPage } from './components/FundingPage';
import { ProfilePage } from './components/ProfilePage';
import { HistoryPage } from './components/HistoryPage';
import { CreateBetModal } from './components/CreateBetModal';
import { OpponentOnboardingModal } from './components/OpponentOnboardingModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USERS.user_ghost);
  const [allUsers, setAllUsers] = useState<Record<string, UserProfile>>(DEFAULT_USERS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Modals & configuration
  const [isCreateBetOpen, setIsCreateBetOpen] = useState(false);
  const [createBetInitialMode, setCreateBetInitialMode] = useState<string | undefined>(undefined);
  const [createBetInitialStake, setCreateBetInitialStake] = useState<number | undefined>(undefined);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [onboardingTargetMatch, setOnboardingTargetMatch] = useState<Match | null>(null);

  // Initial Data Fetch & URL Deep Link Check
  useEffect(() => {
    loadData();

    // Check URL query parameters for ?join=MATCH_ID
    const urlParams = new URLSearchParams(window.location.search);
    const joinMatchId = urlParams.get('join');
    if (joinMatchId) {
      handleDeepLinkJoin(joinMatchId);
    }

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserFromFirestore(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setAllUsers((prev) => ({ ...prev, [profile.id]: profile }));
          }
        } catch (e) {
          console.error('Failed to load profile from Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const u = await fetchUser(currentUser.id);
      setCurrentUser(u);
      const mList = await fetchMatches();
      setMatches(mList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeepLinkJoin = async (matchId: string) => {
    try {
      const match = await fetchMatch(matchId);
      if (match && match.status === 'PENDING_OPPONENT') {
        setOnboardingTargetMatch(match);
        setIsOnboardingModalOpen(true);
      } else if (match) {
        setCurrentTab('arena');
      }
    } catch (err) {
      console.error('Deep link match lookup error:', err);
    }
  };



  const handleOpenCreateBet = (mode?: string, stake?: number) => {
    setCreateBetInitialMode(mode);
    setCreateBetInitialStake(stake);
    setIsCreateBetOpen(true);
  };

  const handleCreateBet = async (data: {
    stakeAmount: number;
    gameMode: string;
    map: string;
    rules: string[];
  }) => {
    await createMatch({
      creatorId: currentUser.id,
      stakeAmount: data.stakeAmount,
      gameMode: data.gameMode,
      map: data.map,
      rules: data.rules,
    });

    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
    setIsCreateBetOpen(false);
    setCreateBetInitialMode(undefined);
    setCreateBetInitialStake(undefined);
    setCurrentTab('arena'); // Navigate immediately into active room view
  };

  const handleJoinMatch = async (matchId: string, opponentId: string) => {
    try {
      await joinMatch(matchId, opponentId);
      const updatedUser = await fetchUser(currentUser.id);
      setCurrentUser(updatedUser);
      setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
      await loadData();
      setCurrentTab('arena');
    } catch (err: any) {
      alert(err.message || 'Failed to join match');
    }
  };

  const handleCompleteOnboarding = async (userData: {
    codmIgn: string;
    codmUid?: string;
    email: string;
    phone: string;
    initialDeposit?: number;
  }) => {
    // 1. Create new user profile with ₦0 initial deposit
    const newUser = await createUser({
      ...userData,
      initialDeposit: userData.initialDeposit || 0,
    });

    // 2. Set as active user
    setAllUsers((prev) => ({ ...prev, [newUser.id]: newUser }));
    setCurrentUser(newUser);

    await loadData();
    setOnboardingTargetMatch(null);
    setCurrentTab('arena');
  };

  const handleSubmitResult = async (matchId: string, claim: 'VICTORY' | 'DEFEAT' | 'DRAW', screenshotBase64?: string) => {
    await submitMatchResult(matchId, {
      playerId: currentUser.id,
      claim,
      screenshotBase64,
    });
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
  };

  const handleCancelMatch = async (matchId: string) => {
    await cancelMatch(matchId);
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    await loadData();
  };

  const handleDeposit = async (amount: number, method: string) => {
    await depositWallet(currentUser.id, amount, method);
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
  };

  const handleWithdraw = async (amount: number, bankDetails: { bankName: string; accountNumber: string; accountName: string }) => {
    await withdrawWallet(currentUser.id, amount, bankDetails);
    const updatedUser = await fetchUser(currentUser.id);
    setCurrentUser(updatedUser);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    codmIgn: string;
    codmUid: string;
    initialDeposit: number;
  }) => {
    const user = await signUpUser(data);
    setCurrentUser(user);
    setAllUsers((prev) => ({ ...prev, [user.id]: user }));
    await loadData();
    setCurrentTab('arena');
  };

  const handleSignIn = async (data: {
    identifier: string;
    password: string;
  }) => {
    const user = await signInUser(data);
    setCurrentUser(user);
    await loadData();
    setCurrentTab('arena');
  };

  const handleGoogleSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setAllUsers((prev) => ({ ...prev, [user.id]: user }));
    try {
      await syncUserToFirestore(user);
    } catch (e) {
      console.error('Failed to sync Google user to Firestore:', e);
    }
    await loadData();
    setCurrentTab('arena');
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.error('Failed to sign out from Firebase:', e);
    }
    setCurrentTab('landing');
  };

  const handleUpdateUser = async (updatedData: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    setAllUsers((prev) => ({ ...prev, [currentUser.id]: updated }));
    try {
      await syncUserToFirestore(updated);
    } catch (e) {
      console.error('Failed to sync updated user to Firestore:', e);
    }
  };

  // 1. STANDALONE SEPARATED LANDING PAGE VIEW
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col bg-tactical-grid selection:bg-amber-500 selection:text-black">
        <LandingPage
          matches={matches}
          onOpenAuth={(mode) => {
            setAuthMode(mode || 'signup');
            setCurrentTab('auth');
          }}
        />
      </div>
    );
  }

  // 2. AUTHENTICATION (SIGN UP & SIGN IN) PAGE VIEW
  if (currentTab === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        onSignUp={handleSignUp}
        onSignIn={handleSignIn}
        onBackToLanding={() => setCurrentTab('landing')}
        demoUsers={allUsers}
        onGoogleSuccess={handleGoogleSuccess}
      />
    );
  }

  // 3. DASHBOARD / IN-APP VIEW (ARENA, HISTORY, PROFILE, WALLET, FUNDING)
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col bg-tactical-grid selection:bg-amber-500 selection:text-black relative">
      {/* Main App Container with bottom padding for bottom dock navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">
        {currentTab === 'arena' && (
          <CoreArena
            currentUser={currentUser}
            matches={matches}
            onCreateBet={handleCreateBet}
            onJoinMatch={handleJoinMatch}
            onSubmitResult={handleSubmitResult}
            onCancelMatch={handleCancelMatch}
            onOpenWallet={() => setCurrentTab('wallet_dashboard')}
            onRefresh={loadData}
            onOpenCreateBet={handleOpenCreateBet}
            onOpenNewUserOnboarding={(targetMatch) => {
              setOnboardingTargetMatch(targetMatch || null);
              setIsOnboardingModalOpen(true);
            }}
          />
        )}

        {currentTab === 'history' && (
          <HistoryPage
            currentUser={currentUser}
            matches={matches}
            onNavigateToArena={() => setCurrentTab('arena')}
            onOpenCreateBet={handleOpenCreateBet}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            matches={matches}
            onUpdateUser={handleUpdateUser}
            onNavigateToWallet={() => setCurrentTab('wallet_dashboard')}
            onNavigateToHistory={() => setCurrentTab('history')}
            onNavigateToFunding={() => setCurrentTab('funding')}
            onOpenCreateBet={handleOpenCreateBet}
            onSignOut={handleSignOut}
          />
        )}

        {(currentTab === 'wallet_dashboard' || currentTab === 'funding') && (
          <WalletDashboard
            currentUser={currentUser}
            onNavigateToFunding={() => setCurrentTab('funding')}
            onDeposit={handleDeposit}
            onOpenCreateBet={() => handleOpenCreateBet()}
            onWithdraw={handleWithdraw}
            onRefresh={loadData}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Dock (Icons Only in requested order: Dashboard, Wallet & Fund, History, Profile) */}
      <BottomNavbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab)}
      />

      {/* App Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-white tracking-wider">CODM STAKE</span>
            <span>·</span>
            <span>Call of Duty: Mobile Esports Escrow Wagering in Nigerian Naira (₦)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">Escrow Protected</span>
            <span>·</span>
            <span>Min Wager: ₦1,000</span>
            <span>·</span>
            <span>10% Platform Rake</span>
          </div>
        </div>
      </footer>

      {/* Bet Creation Modal (Supports 1v1 & Normal Matches) */}
      <CreateBetModal
        currentUser={currentUser}
        isOpen={isCreateBetOpen}
        initialMode={createBetInitialMode}
        initialStake={createBetInitialStake}
        onClose={() => {
          setIsCreateBetOpen(false);
          setCreateBetInitialMode(undefined);
          setCreateBetInitialStake(undefined);
        }}
        onSubmit={handleCreateBet}
        onOpenWallet={() => {
          setIsCreateBetOpen(false);
          setCurrentTab('funding');
        }}
      />

      {/* Opponent Onboarding Modal (For new players joining from invite link) */}
      <OpponentOnboardingModal
        match={onboardingTargetMatch}
        isOpen={isOnboardingModalOpen}
        onClose={() => {
          setIsOnboardingModalOpen(false);
          setOnboardingTargetMatch(null);
        }}
        onCompleteOnboarding={handleCompleteOnboarding}
      />
    </div>
  );
}
