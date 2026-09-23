import React, { useState } from 'react';
import { ALL_BADGES, Badge } from '../data/badgesData';
import { BadgeCard } from './BadgeCard';
import { UserStats, LeaderboardUser } from '../utils/gamification';
import { 
  Trophy, 
  Award, 
  Crown, 
  Medal, 
  Sparkles, 
  Search, 
  LogIn, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Users,
  Flame,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';

interface LeaderboardViewProps {
  user: User | null;
  userStats: UserStats;
  leaderboardUsers: LeaderboardUser[];
  onLoginRequest: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  user,
  userStats,
  leaderboardUsers,
  onLoginRequest
}) => {
  const [subTab, setSubTab] = useState<'ranking' | 'badges'>('ranking');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<'todos' | 'iniciante' | 'pratica' | 'mestre' | 'especial'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  // Merge current user into leaderboard if logged in and not already there
  const allRankedUsers = [...leaderboardUsers];
  if (user) {
    const existingIndex = allRankedUsers.findIndex(u => u.uid === user.uid);
    const currentUserEntry: LeaderboardUser = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Você',
      photoURL: user.photoURL,
      points: userStats.points,
      level: userStats.levelInfo.level,
      levelTitle: userStats.levelInfo.title,
      badgesCount: userStats.unlockedBadges.length,
      badges: userStats.unlockedBadges,
      completedExercises: userStats.completedExercisesCount,
      lastActive: 'Agora'
    };

    if (existingIndex >= 0) {
      allRankedUsers[existingIndex] = currentUserEntry;
    } else {
      allRankedUsers.push(currentUserEntry);
    }
  }

  // Sort descending by points
  const sortedUsers = [...allRankedUsers].sort((a, b) => b.points - a.points);

  // Find current user's rank
  const currentUserRank = user ? sortedUsers.findIndex(u => u.uid === user.uid) + 1 : null;

  // Filtered leaderboard
  const filteredUsers = sortedUsers.filter(u => 
    u.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered badges
  const filteredBadges = ALL_BADGES.filter(b => {
    if (badgeCategoryFilter === 'todos') return true;
    return b.category === badgeCategoryFilter;
  });

  const unlockedCount = userStats.unlockedBadges.length;
  const totalBadges = ALL_BADGES.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Banner Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/2 -top-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-500/30">
              <Sparkles size={14} /> Competição Saudável
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Ranking Global & Conquistas
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Pratique exercícios, acerte questões nos simulados e colete emblemas oficiais. Conquiste seu espaço no topo da comunidade de desenvolvedores Apple!
            </p>
          </div>

          {/* User quick status widget */}
          {user ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 min-w-[240px] text-center md:text-right">
              <span className="text-xs text-slate-300 uppercase font-bold tracking-wider block">Seu Nível Atual</span>
              <div className="text-2xl font-black text-amber-400 mt-1 flex items-center justify-center md:justify-end gap-2">
                <Crown size={22} className="text-amber-400" />
                Nível {userStats.levelInfo.level}
              </div>
              <p className="text-xs text-slate-200 mt-0.5">{userStats.levelInfo.title}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white">
                <Trophy size={14} className="text-yellow-300" /> {userStats.points} XP Acumulados
              </div>
            </div>
          ) : (
            <button
              onClick={onLoginRequest}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2 text-sm shrink-0"
            >
              <LogIn size={18} /> Entrar e Participar
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="flex bg-slate-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setSubTab('ranking')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              subTab === 'ranking' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy size={16} className={subTab === 'ranking' ? 'text-amber-500' : ''} />
            Ranking Global ({sortedUsers.length})
          </button>
          <button
            onClick={() => setSubTab('badges')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              subTab === 'badges' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={16} className={subTab === 'badges' ? 'text-blue-500' : ''} />
            Mural de Conquistas ({unlockedCount}/{totalBadges})
          </button>
        </div>

        {subTab === 'ranking' && (
          <div className="relative hidden sm:block w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar estudante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Tab: RANKING GLOBAL */}
      {subTab === 'ranking' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top 3 Podium Cards */}
          {sortedUsers.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* 2nd Place */}
              <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 border-2 border-slate-200/80 shadow-sm flex flex-col items-center text-center order-2 md:order-1 mt-0 md:mt-6 relative">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-sm absolute -top-4 shadow-sm border-2 border-white">
                  2º
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center mb-3 shadow-inner">
                  {sortedUsers[1].photoURL ? (
                    <img src={sortedUsers[1].photoURL} alt={sortedUsers[1].displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-slate-500">{sortedUsers[1].displayName[0]}</span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{sortedUsers[1].displayName}</h4>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full mt-1">
                  Nível {sortedUsers[1].level} • {sortedUsers[1].levelTitle}
                </span>
                <div className="mt-4 pt-4 border-t border-slate-100 w-full flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block">Badges</span>
                    <span className="font-bold text-slate-700">{sortedUsers[1].badgesCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">XP</span>
                    <span className="font-black text-slate-900 text-base">{sortedUsers[1].points}</span>
                  </div>
                </div>
              </div>

              {/* 1st Place (Gold Champion) */}
              <div className="bg-gradient-to-b from-amber-50/60 via-white to-white rounded-3xl p-8 border-2 border-amber-300 shadow-md flex flex-col items-center text-center order-1 md:order-2 relative transform md:-translate-y-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-base absolute -top-5 shadow-md border-2 border-white">
                  👑 1º
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-amber-300 overflow-hidden bg-amber-100 flex items-center justify-center mb-3 shadow-inner ring-4 ring-amber-100">
                  {sortedUsers[0].photoURL ? (
                    <img src={sortedUsers[0].photoURL} alt={sortedUsers[0].displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-amber-700">{sortedUsers[0].displayName[0]}</span>
                  )}
                </div>
                <h4 className="font-black text-slate-900 text-xl">{sortedUsers[0].displayName}</h4>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full mt-1 border border-amber-200">
                  Nível {sortedUsers[0].level} • {sortedUsers[0].levelTitle}
                </span>
                <div className="mt-4 pt-4 border-t border-amber-100 w-full flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block">Badges</span>
                    <span className="font-bold text-amber-700">{sortedUsers[0].badgesCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">XP Total</span>
                    <span className="font-black text-amber-600 text-lg">{sortedUsers[0].points} XP</span>
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="bg-gradient-to-b from-amber-50/20 to-white rounded-3xl p-6 border-2 border-amber-700/20 shadow-sm flex flex-col items-center text-center order-3 mt-0 md:mt-6 relative">
                <div className="w-8 h-8 rounded-full bg-amber-700/80 text-white flex items-center justify-center font-black text-sm absolute -top-4 shadow-sm border-2 border-white">
                  3º
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-amber-700/30 overflow-hidden bg-amber-50 flex items-center justify-center mb-3 shadow-inner">
                  {sortedUsers[2].photoURL ? (
                    <img src={sortedUsers[2].photoURL} alt={sortedUsers[2].displayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-amber-800">{sortedUsers[2].displayName[0]}</span>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-lg">{sortedUsers[2].displayName}</h4>
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full mt-1 border border-amber-200/50">
                  Nível {sortedUsers[2].level} • {sortedUsers[2].levelTitle}
                </span>
                <div className="mt-4 pt-4 border-t border-slate-100 w-full flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block">Badges</span>
                    <span className="font-bold text-slate-700">{sortedUsers[2].badgesCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">XP</span>
                    <span className="font-black text-slate-900 text-base">{sortedUsers[2].points}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current User Highlight Row */}
          {user && currentUserRank && (
            <div className="bg-blue-50 border-2 border-blue-400/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
                  #{currentUserRank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Sua Posição no Ranking</span>
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">Você</span>
                  </div>
                  <p className="text-xs text-blue-800 mt-0.5">
                    Nível {userStats.levelInfo.level} ({userStats.levelInfo.title}) • {userStats.unlockedBadges.length} Conquistas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Pontos</span>
                  <span className="text-lg font-black text-blue-600 block">{userStats.points} XP</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users size={20} className="text-blue-600" /> Tabela Completa de Classificação
              </h3>
              <span className="text-xs text-slate-500 font-medium">Atualizado em tempo real</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-6">Posição</th>
                    <th className="py-3.5 px-6">Desenvolvedor</th>
                    <th className="py-3.5 px-6">Nível & Título</th>
                    <th className="py-3.5 px-6 text-center">Exercícios</th>
                    <th className="py-3.5 px-6 text-center">Badges</th>
                    <th className="py-3.5 px-6 text-right">XP Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((u, index) => {
                    const isSelf = user && u.uid === user.uid;
                    const rank = index + 1;

                    return (
                      <tr 
                        key={u.uid} 
                        className={`transition-colors ${
                          isSelf ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-4 px-6 font-bold">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                            rank === 1 ? 'bg-amber-400 text-amber-950 font-black' :
                            rank === 2 ? 'bg-slate-200 text-slate-700 font-bold' :
                            rank === 3 ? 'bg-amber-700/20 text-amber-900 font-bold' :
                            'text-slate-500'
                          }`}>
                            {rank}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                              ) : (
                                u.displayName[0]
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block flex items-center gap-2">
                                {u.displayName}
                                {isSelf && (
                                  <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-1.5 py-0.2 rounded">
                                    VOCÊ
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-slate-400">Ativo {u.lastActive}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                            Lv. {u.level} • {u.levelTitle}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-slate-600 font-medium">
                          {u.completedExercises}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs">
                            <Award size={13} /> {u.badgesCount}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-slate-900">
                          {u.points} XP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!user && (
              <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-slate-700 text-sm">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Sparkles size={18} />
                  </div>
                  <span>Faça login para salvar seus pontos e aparecer na tabela pública!</span>
                </div>
                <button
                  onClick={onLoginRequest}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
                >
                  Conectar Minha Conta
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: MURAL DE CONQUISTAS */}
      {subTab === 'badges' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Level Progress Overview Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Seu Nível de Conhecimento
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-2">
                  <Crown className="text-amber-500" /> Nível {userStats.levelInfo.level} — {userStats.levelInfo.title}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Ganhe XP respondendo questionários, codificando e conquistando emblemas para subir de nível!
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-blue-600">{userStats.points}</span>
                <span className="text-sm font-semibold text-slate-400"> / {userStats.levelInfo.nextLevelXp} XP</span>
                <span className="block text-xs text-slate-400 mt-0.5">Próximo Nível: {userStats.levelInfo.nextLevelXp - userStats.points} XP restantes</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${userStats.levelInfo.progressPercent}%` }}
              ></div>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-xs text-slate-400 block font-medium">Badges Desbloqueados</span>
                <span className="text-xl font-bold text-slate-900">{unlockedCount} de {totalBadges}</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-xs text-slate-400 block font-medium">Exercícios Resolvidos</span>
                <span className="text-xl font-bold text-slate-900">{userStats.completedExercisesCount}</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-xs text-slate-400 block font-medium">Questões Corretas</span>
                <span className="text-xl font-bold text-slate-900">{userStats.totalCorrectQuizAnswers}</span>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4">
                <span className="text-xs text-slate-400 block font-medium">Simulados Aprovados</span>
                <span className="text-xl font-bold text-slate-900">{userStats.passedExamsCount}</span>
              </div>
            </div>
          </div>

          {/* Badges Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {(['todos', 'iniciante', 'pratica', 'mestre', 'especial'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setBadgeCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    badgeCategoryFilter === cat 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'todos' ? 'Todos' : cat}
                </button>
              ))}
            </div>

            <span className="text-xs font-medium text-slate-500">
              Mostrando {filteredBadges.length} conquistas
            </span>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBadges.map(badge => {
              const isUnlocked = userStats.unlockedBadges.includes(badge.id);
              return (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  isUnlocked={isUnlocked}
                  onSelect={() => setSelectedBadge(badge)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Badge Details Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                +{selectedBadge.xpReward} XP Recompensa
              </span>
              <button onClick={() => setSelectedBadge(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedBadge.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">{selectedBadge.description}</p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Como Conquistar:
              </span>
              <p className="text-sm font-medium text-slate-800">{selectedBadge.criteria}</p>
            </div>

            <div className="flex items-center justify-between">
              {userStats.unlockedBadges.includes(selectedBadge.id) ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 size={18} /> Você já conquistou este emblema!
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                  <Lock size={16} /> Emblema ainda bloqueado
                </div>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
