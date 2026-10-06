import React from 'react';
import { UserProfile } from '../types';
import { Trophy, Swords, Medal, ArrowUpRight } from 'lucide-react';

interface LeaderboardViewProps {
  currentUser: UserProfile;
  onOpenCreateBet: () => void;
}

const LEADERBOARD_DATA = [
  { rank: 1, ign: 'Ghost_NG', uid: '6829471928371902', winnings: 24500, wins: 14, losses: 3, winRate: '82%' },
  { rank: 2, ign: 'SniperQueen_KD', uid: '6719284729103822', winnings: 19800, wins: 11, losses: 2, winRate: '85%' },
  { rank: 3, ign: 'ShadowSniper', uid: '6948201948271034', winnings: 12000, wins: 8, losses: 5, winRate: '62%' },
  { rank: 4, ign: 'LagosViper', uid: '6738291048291039', winnings: 9200, wins: 6, losses: 2, winRate: '75%' },
  { rank: 5, ign: 'DeltaForce_99', uid: '6849201948201847', winnings: 7400, wins: 5, losses: 4, winRate: '56%' },
  { rank: 6, ign: 'AbujaQuickscope', uid: '6729482018492019', winnings: 5400, wins: 4, losses: 1, winRate: '80%' },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUser,
  onOpenCreateBet,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Nigeria Esports Rankings</span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
            CODM 1V1 WAGER LEADERBOARD
          </h1>
          <p className="text-xs text-neutral-400">Rankings based on total verified escrow winnings</p>
        </div>

        <button
          onClick={onOpenCreateBet}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Swords className="w-4 h-4" />
          <span>Challenge Top Players</span>
        </button>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LEADERBOARD_DATA.slice(0, 3).map((player, idx) => {
          const medals = ['text-amber-400 bg-amber-500/10 border-amber-500/30', 'text-slate-300 bg-slate-400/10 border-slate-400/30', 'text-amber-600 bg-amber-700/10 border-amber-700/30'];
          return (
            <div
              key={player.ign}
              className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-center relative overflow-hidden space-y-2"
            >
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center mx-auto font-black text-sm ${medals[idx]}`}>
                #{player.rank}
              </div>
              <div className="font-bold text-white text-base truncate">{player.ign}</div>
              <div className="text-xl font-black font-mono-nums text-amber-400">
                ₦{player.winnings.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-400 font-mono-nums">
                {player.wins}W - {player.losses}L · {player.winRate}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 uppercase font-mono-nums">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Gamer Tag</th>
              <th className="py-3 px-4">Win/Loss</th>
              <th className="py-3 px-4">Win Rate</th>
              <th className="py-3 px-4 text-right">Escrow Winnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
            {LEADERBOARD_DATA.map((player) => {
              const isMe = player.ign === currentUser.codmIgn;
              return (
                <tr
                  key={player.ign}
                  className={`hover:bg-neutral-800/40 transition-colors ${
                    isMe ? 'bg-amber-500/10 font-semibold' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono-nums font-bold text-white">
                    #{player.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{player.ign}</span>
                      {isMe && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">You</span>}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono-nums">UID: {player.uid}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono-nums">
                    <span className="text-emerald-400">{player.wins}W</span> / <span className="text-rose-400">{player.losses}L</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono-nums text-neutral-200">
                    {player.winRate}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-nums font-bold text-amber-400 text-sm">
                    ₦{player.winnings.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
