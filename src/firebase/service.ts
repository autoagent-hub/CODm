import { doc, getDoc, setDoc, updateDoc, collection, getDocs, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testFirestoreConnection } from './config';
import { UserProfile, Match, Transaction } from '../types';

// Run connection validation on import
testFirestoreConnection();

/**
 * Save or update user profile in Firestore
 */
export async function syncUserToFirestore(user: UserProfile): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), {
      id: user.id,
      username: user.username,
      codmIgn: user.codmIgn,
      codmUid: user.codmUid,
      email: user.email,
      phone: user.phone || '',
      balance: user.balance,
      escrowBalance: user.escrowBalance || 0,
      totalWinnings: user.totalWinnings || 0,
      wins: user.wins || 0,
      losses: user.losses || 0,
      draws: user.draws || 0,
      avatar: user.avatar || '',
      tier: user.tier || 'ROOKIE I',
      clan: user.clan || '',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Load user profile from Firestore
 */
export async function getUserFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: data.id || userId,
        username: data.username || data.codmIgn || 'Player',
        codmIgn: data.codmIgn || 'Player',
        codmUid: data.codmUid || '',
        email: data.email || '',
        phone: data.phone || '',
        balance: data.balance || 0,
        escrowBalance: data.escrowBalance || 0,
        totalWinnings: data.totalWinnings || 0,
        wins: data.wins || 0,
        losses: data.losses || 0,
        draws: data.draws || 0,
        avatar: data.avatar || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
        tier: data.tier || 'LEGENDARY TIER',
        clan: data.clan || '[1V1_PRO]',
        transactions: [],
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Sync match to Firestore
 */
export async function syncMatchToFirestore(match: Match): Promise<void> {
  const path = `matches/${match.id}`;
  try {
    await setDoc(doc(db, 'matches', match.id), {
      id: match.id,
      roomCode: match.roomCode,
      gameMode: match.gameMode,
      map: match.map,
      stakeAmount: match.stakeAmount,
      potAmount: match.potAmount,
      platformFee: match.platformFee,
      winnerPayout: match.winnerPayout,
      status: match.status,
      creatorId: match.creator.id,
      creatorIgn: match.creator.codmIgn,
      opponentId: match.opponent?.id || null,
      opponentIgn: match.opponent?.codmIgn || null,
      winnerId: match.winnerId || null,
      winnerIgn: match.winnerIgn || null,
      rules: match.rules || [],
      createdAt: match.createdAt || Date.now(),
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save user transaction to Firestore subcollection
 */
export async function syncTransactionToFirestore(userId: string, tx: Transaction): Promise<void> {
  const path = `users/${userId}/transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'transactions', tx.id), {
      id: tx.id,
      userId,
      type: tx.type,
      amount: tx.amount,
      description: tx.description,
      timestamp: tx.timestamp,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
