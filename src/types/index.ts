export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'ESCROW_LOCK' | 'ESCROW_REFUND' | 'MATCH_WIN_PAYOUT' | 'WITHDRAWAL';
  amount: number;
  description: string;
  timestamp: number;
  matchId?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  codmIgn: string;
  codmUid: string;
  email: string;
  phone: string;
  balance: number;
  escrowBalance: number;
  totalWinnings: number;
  wins: number;
  losses: number;
  draws: number;
  tier?: string;
  clan?: string;
  avatar: string;
  transactions: Transaction[];
}

export interface MatchPlayer {
  id: string;
  username: string;
  codmIgn: string;
  codmUid: string;
  avatar: string;
  staked: boolean;
  resultClaim?: 'VICTORY' | 'DEFEAT' | 'DRAW';
  screenshotUrl?: string;
  screenshotAnalysis?: {
    detectedOutcome: 'VICTORY' | 'DEFEAT' | 'DRAW' | 'UNCLEAR';
    confidence: number;
    detectedPlayerName?: string | null;
    scoreSummary?: string;
    reasoning?: string;
  };
  submittedAt?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Match {
  id: string;
  roomCode: string;
  gameMode: string;
  map: string;
  rules: string[];
  stakeAmount: number;
  potAmount: number;
  platformFeePercentage: number;
  platformFee: number;
  winnerPayout: number;
  status: 'PENDING_OPPONENT' | 'READY_TO_PLAY' | 'IN_PROGRESS' | 'SUBMITTING_RESULTS' | 'VERIFYING' | 'SETTLED' | 'DISPUTED' | 'CANCELLED';
  createdAt: number;
  creator: MatchPlayer;
  opponent?: MatchPlayer;
  winnerId?: string;
  winnerIgn?: string;
  chatMessages: ChatMessage[];
  resolutionNotes?: string;
}
