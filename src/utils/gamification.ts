import { ALL_BADGES, Badge } from '../data/badgesData';
import { pillars } from '../data/contentData';

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export interface UserStats {
  points: number;
  levelInfo: LevelInfo;
  unlockedBadges: string[];
  completedExercisesCount: number;
  totalCorrectQuizAnswers: number;
  passedExamsCount: number;
  savedTermsCount: number;
}

export function getLevelInfo(totalXp: number): LevelInfo {
  const XP_PER_LEVEL = 100;
  const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
  const currentLevelMinXp = (level - 1) * XP_PER_LEVEL;
  const nextLevelXp = level * XP_PER_LEVEL;
  const progressInLevel = totalXp - currentLevelMinXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((progressInLevel / XP_PER_LEVEL) * 100)));

  let title = 'Iniciante Swift';
  if (level === 2) title = 'Aprendiz iOS';
  else if (level === 3) title = 'Desenvolvedor SwiftUI';
  else if (level === 4) title = 'Arquiteto Apple';
  else if (level >= 5 && level < 8) title = 'Especialista em Swift';
  else if (level >= 8) title = 'Grão-Mestre Apple';

  return {
    level,
    title,
    currentLevelXp: totalXp,
    nextLevelXp,
    progressPercent
  };
}

export function evaluateBadges(
  exerciseAnswers: Record<string, string>,
  quizScores: Record<number, number>,
  passedExams: string[],
  savedTerms: string[],
  currentBasePoints: number
): string[] {
  const unlocked: string[] = [];

  const completedExercisesCount = Object.keys(exerciseAnswers).length;
  if (completedExercisesCount >= 1) unlocked.push('first-code');
  if (completedExercisesCount >= 5) unlocked.push('code-enthusiast');
  if (completedExercisesCount >= 10) unlocked.push('code-master');

  // Quiz checks
  let perfectPillars = 0;
  pillars.forEach(p => {
    const score = quizScores[p.id] || 0;
    const totalQ = p.quiz.length;
    if (totalQ > 0 && score >= totalQ) {
      perfectPillars++;
    }
  });

  if (perfectPillars >= 1) unlocked.push('quiz-starter');
  if (perfectPillars >= 4) unlocked.push('quiz-scholar');

  // Exams check
  if (passedExams.length >= 1) unlocked.push('exam-approved');
  if (passedExams.length >= 2) unlocked.push('exam-champion');

  // Glossary
  if (savedTerms.length >= 3) unlocked.push('glossary-collector');

  // Memory Guardian (Pillar 4 is ARC & Memory Management)
  if (quizScores[4] && quizScores[4] >= 3) {
    unlocked.push('memory-guardian');
  }

  // Ecosystem Explorer (Pillars 7, 8, 9: watchOS, macOS, visionOS)
  const ecosystemQuizzes = (quizScores[7] || 0) + (quizScores[8] || 0) + (quizScores[9] || 0);
  if (ecosystemQuizzes >= 2) {
    unlocked.push('ecosystem-explorer');
  }

  // Points based
  if (currentBasePoints >= 100) unlocked.push('century-club');
  if (currentBasePoints >= 350) unlocked.push('swift-legend');

  return unlocked;
}

export function calculateUserGamification(
  exerciseAnswers: Record<string, string>,
  quizScores: Record<number, number>,
  passedExams: string[],
  savedTerms: string[]
): UserStats {
  const completedExercisesCount = Object.keys(exerciseAnswers).length;
  const exerciseXp = completedExercisesCount * 15;

  let totalCorrectQuizAnswers = 0;
  Object.values(quizScores).forEach(score => {
    totalCorrectQuizAnswers += score || 0;
  });
  const quizXp = totalCorrectQuizAnswers * 5;

  const passedExamsCount = passedExams.length;
  const examXp = passedExamsCount * 60;

  const savedTermsCount = savedTerms.length;
  const termsXp = savedTermsCount * 3;

  const basePoints = exerciseXp + quizXp + examXp + termsXp;

  // Evaluate unlocked badges
  const unlockedBadges = evaluateBadges(
    exerciseAnswers,
    quizScores,
    passedExams,
    savedTerms,
    basePoints
  );

  let badgesBonusXp = 0;
  ALL_BADGES.forEach(badge => {
    if (unlockedBadges.includes(badge.id)) {
      badgesBonusXp += badge.xpReward;
    }
  });

  const totalPoints = basePoints + badgesBonusXp;
  const levelInfo = getLevelInfo(totalPoints);

  return {
    points: totalPoints,
    levelInfo,
    unlockedBadges,
    completedExercisesCount,
    totalCorrectQuizAnswers,
    passedExamsCount,
    savedTermsCount
  };
}

export interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL?: string | null;
  points: number;
  level: number;
  levelTitle: string;
  badgesCount: number;
  badges: string[];
  completedExercises: number;
  lastActive: string;
}

// Fallback seed peers for healthy initial competition
export const DEMO_LEADERBOARD_PEERS: LeaderboardUser[] = [
  {
    uid: 'peer-1',
    displayName: 'Julia Mendes',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    points: 420,
    level: 5,
    levelTitle: 'Especialista em Swift',
    badgesCount: 8,
    badges: ['first-code', 'code-enthusiast', 'code-master', 'quiz-starter', 'quiz-scholar', 'exam-approved', 'exam-champion', 'century-club'],
    completedExercises: 14,
    lastActive: 'Hoje'
  },
  {
    uid: 'peer-2',
    displayName: 'Lucas Rocha',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    points: 330,
    level: 4,
    levelTitle: 'Arquiteto Apple',
    badgesCount: 6,
    badges: ['first-code', 'code-enthusiast', 'quiz-starter', 'exam-approved', 'memory-guardian', 'century-club'],
    completedExercises: 9,
    lastActive: 'Hoje'
  },
  {
    uid: 'peer-3',
    displayName: 'Beatriz Costa',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    points: 275,
    level: 3,
    levelTitle: 'Desenvolvedor SwiftUI',
    badgesCount: 5,
    badges: ['first-code', 'code-enthusiast', 'quiz-starter', 'glossary-collector', 'century-club'],
    completedExercises: 8,
    lastActive: 'Ontem'
  },
  {
    uid: 'peer-4',
    displayName: 'Matheus Silveira',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    points: 195,
    level: 2,
    levelTitle: 'Aprendiz iOS',
    badgesCount: 3,
    badges: ['first-code', 'quiz-starter', 'century-club'],
    completedExercises: 6,
    lastActive: 'Há 2 dias'
  },
  {
    uid: 'peer-5',
    displayName: 'Camila Duarte',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    points: 140,
    level: 2,
    levelTitle: 'Aprendiz iOS',
    badgesCount: 2,
    badges: ['first-code', 'glossary-collector'],
    completedExercises: 4,
    lastActive: 'Há 3 dias'
  }
];
