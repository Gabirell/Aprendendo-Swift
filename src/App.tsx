/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { pillars } from './data/contentData';
import { PillarContent } from './types';
import { 
  BookOpen, Gamepad2, Code, CheckCircle2, AlertCircle, ChevronRight, 
  GraduationCap, BrainCircuit, LogIn, LogOut, Apple, X, FileText, 
  MessageSquare, Route, ShieldCheck, Trophy, Sparkles, Crown, Award, Linkedin
} from 'lucide-react';
import { auth, db, signInWithGoogle, signInWithApple, signInWithLinkedIn, logOut, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, getDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import MindMap from './components/MindMap';
import TextWithGlossary from './components/TextWithGlossary';
import { glossaryData } from './data/glossaryData';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SimuladosView } from './components/SimuladosView';
import { LeaderboardView } from './components/LeaderboardView';
import { BadgeUnlockedModal } from './components/BadgeUnlockedModal';
import { StudyBankView } from './components/StudyBankView';
import { 
  calculateUserGamification, 
  DEMO_LEADERBOARD_PEERS, 
  LeaderboardUser, 
  UserStats 
} from './utils/gamification';
import { ALL_BADGES, Badge } from './data/badgesData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'trilha' | 'simulados' | 'ranking' | 'banco'>('trilha');
  const [activePillar, setActivePillar] = useState<PillarContent | null>(null);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { correct: boolean, msg: string }>>({});
  const [quizScores, setQuizScores] = useState<Record<number, number>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [savedTerms, setSavedTerms] = useState<string[]>([]);
  const [passedExams, setPassedExams] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showExtraQuiz, setShowExtraQuiz] = useState<Record<number, boolean>>({});
  const [showProgress, setShowProgress] = useState(false);
  const [careerTipsLoading, setCareerTipsLoading] = useState(false);
  const [careerTips, setCareerTips] = useState<{ resumeTips: string, interviewTips: string, nextSteps: string } | null>(null);

  // Leaderboard & Gamification State
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(DEMO_LEADERBOARD_PEERS);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const prevBadgesRef = useRef<string[]>([]);

  // Calculate live gamification stats
  const userStats: UserStats = calculateUserGamification(
    exerciseAnswers,
    quizScores,
    passedExams,
    savedTerms
  );

  // Listen for newly unlocked badges to trigger the modal celebration
  useEffect(() => {
    if (userStats.unlockedBadges.length > 0) {
      if (prevBadgesRef.current.length > 0) {
        const newlyUnlocked = userStats.unlockedBadges.find(id => !prevBadgesRef.current.includes(id));
        if (newlyUnlocked) {
          const badgeObj = ALL_BADGES.find(b => b.id === newlyUnlocked);
          if (badgeObj) {
            setNewlyUnlockedBadge(badgeObj);
          }
        }
      }
      prevBadgesRef.current = userStats.unlockedBadges;
    }
  }, [userStats.unlockedBadges]);

  // Real-time listener for the public Leaderboard
  useEffect(() => {
    try {
      const leaderboardCol = collection(db, 'leaderboard');
      const q = query(leaderboardCol, orderBy('points', 'desc'), limit(50));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const users: LeaderboardUser[] = [];
          snapshot.forEach(docSnap => {
            users.push(docSnap.data() as LeaderboardUser);
          });
          setLeaderboardUsers(users);
        } else {
          setLeaderboardUsers(DEMO_LEADERBOARD_PEERS);
        }
      }, (err) => {
        console.warn("Notice: Firestore leaderboard fallback to demo peers:", err);
        setLeaderboardUsers(DEMO_LEADERBOARD_PEERS);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Notice: Leaderboard setup fallback:", e);
      setLeaderboardUsers(DEMO_LEADERBOARD_PEERS);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthReady && user) {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Test connection
      getDoc(userDocRef).catch(error => {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      });

      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.exerciseAnswers) setExerciseAnswers(data.exerciseAnswers);
          if (data.quizScores) setQuizScores(data.quizScores);
          if (data.quizAnswers) setQuizAnswers(data.quizAnswers);
          if (data.savedTerms) setSavedTerms(data.savedTerms || []);
          if (data.passedExams) setPassedExams(data.passedExams || []);
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      });

      return () => unsubscribe();
    } else if (isAuthReady && !user) {
      // Clear data when logged out
      setExerciseAnswers({});
      setQuizScores({});
      setQuizAnswers({});
      setPassedExams([]);
      setFeedback({});
    }
  }, [user, isAuthReady]);

  const saveProgressToFirestore = async (
    newExerciseAnswers: Record<string, string>,
    newQuizScores: Record<number, number>,
    newQuizAnswers: Record<string, number>,
    newSavedTerms: string[],
    newPassedExams: string[] = passedExams
  ) => {
    if (!user) return;
    try {
      const calculated = calculateUserGamification(
        newExerciseAnswers,
        newQuizScores,
        newPassedExams,
        newSavedTerms
      );

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        exerciseAnswers: newExerciseAnswers,
        quizScores: newQuizScores,
        quizAnswers: newQuizAnswers,
        savedTerms: newSavedTerms,
        passedExams: newPassedExams,
        points: calculated.points,
        level: calculated.levelInfo.level,
        levelTitle: calculated.levelInfo.title,
        unlockedBadges: calculated.unlockedBadges,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Synchronize public leaderboard profile
      const leaderboardDocRef = doc(db, 'leaderboard', user.uid);
      await setDoc(leaderboardDocRef, {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Estudante Swift',
        photoURL: user.photoURL || null,
        points: calculated.points,
        level: calculated.levelInfo.level,
        levelTitle: calculated.levelInfo.title,
        badgesCount: calculated.unlockedBadges.length,
        badges: calculated.unlockedBadges,
        completedExercises: calculated.completedExercisesCount,
        lastActive: 'Hoje',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleExamFinish = (examId: string, score: number, total: number, isApproved: boolean) => {
    if (isApproved && !passedExams.includes(examId)) {
      const newPassed = [...passedExams, examId];
      setPassedExams(newPassed);
      if (user) {
        saveProgressToFirestore(exerciseAnswers, quizScores, quizAnswers, savedTerms, newPassed);
      }
      setToastMessage("🎉 Simulado Aprovado! +60 XP e novo progresso registrado!");
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const checkExercise = (pillarId: number, exId: number, correct: string) => {
    const key = `${pillarId}-${exId}`;
    const userAns = exerciseAnswers[key]?.trim().toLowerCase();
    const isCorrect = userAns === correct.toLowerCase();
    
    setFeedback({
      ...feedback,
      [key]: {
        correct: isCorrect,
        msg: isCorrect ? "Excelente! Você dominou este conceito." : `Quase lá! Dica: ${pillars.find(p => p.id === pillarId)?.exercises.find(e => e.id === exId)?.hint}`
      }
    });

    if (isCorrect && user) {
      const newAnswers = { ...exerciseAnswers, [key]: userAns };
      setExerciseAnswers(newAnswers);
      saveProgressToFirestore(newAnswers, quizScores, quizAnswers, savedTerms, passedExams);
    }
  };

  const handleQuizAnswer = (pillarId: number, questionId: number, selectedIndex: number, correctIndex: number, explanation: string) => {
    const key = `${pillarId}-${questionId}`;
    if (quizAnswers[key] !== undefined) return; // Prevent changing answer

    const newQuizAnswers = { ...quizAnswers, [key]: selectedIndex };
    setQuizAnswers(newQuizAnswers);
    
    let newQuizScores = { ...quizScores };
    if (selectedIndex === correctIndex) {
      newQuizScores = { ...quizScores, [pillarId]: (quizScores[pillarId] || 0) + 1 };
      setQuizScores(newQuizScores);
    }

    if (user) {
      saveProgressToFirestore(exerciseAnswers, newQuizScores, newQuizAnswers, savedTerms, passedExams);
    }
  };

  const handleSaveTerm = (term: string) => {
    if (!user) {
      setToastMessage("Faça login para salvar termos no seu Glossário!");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (!savedTerms.includes(term)) {
      const newTerms = [...savedTerms, term];
      setSavedTerms(newTerms);
      saveProgressToFirestore(exerciseAnswers, quizScores, quizAnswers, newTerms, passedExams);
      setToastMessage(`"${term}" salvo! Acesse 'Meu Progresso' para consultar o Glossário.`);
    } else {
      setToastMessage(`"${term}" já está anotado no seu Glossário!`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError("O domínio atual não está autorizado no Firebase. Por favor, adicione este domínio (terminado em .run.app) na lista de 'Authorized domains' no console do Firebase Authentication.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("O pop-up de login foi fechado antes de concluir. Tente novamente ou abra o app em uma nova aba.");
      } else {
        setAuthError(`Erro ao fazer login: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const handleAppleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithApple();
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError("O domínio atual não está autorizado no Firebase. Por favor, adicione este domínio (terminado em .run.app) na lista de 'Authorized domains' no console do Firebase Authentication.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("O pop-up de login foi fechado antes de concluir. Tente novamente ou abra o app em uma nova aba.");
      } else {
        setAuthError(`Erro ao fazer login: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const handleLinkedInLogin = async () => {
    setAuthError(null);
    try {
      await signInWithLinkedIn();
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        setAuthError("O domínio atual não está autorizado no Firebase. Por favor, adicione este domínio (terminado em .run.app) na lista de 'Authorized domains' no console do Firebase Authentication.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("O pop-up de login foi fechado antes de concluir. Tente novamente ou abra o app em uma nova aba.");
      } else {
        setAuthError(`Erro ao fazer login com LinkedIn: ${error.message || 'Erro desconhecido'}`);
      }
    }
  };

  const generateCareerTips = async () => {
    setCareerTipsLoading(true);
    try {
      const topics = pillars.map(p => p.title);
      const res = await fetch('/api/career-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCareerTips(data);
    } catch (e) {
      console.error(e);
      setToastMessage("Erro ao gerar dicas de carreira. Tente novamente.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setCareerTipsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {/* Toast Notificação Glossário */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-4 pr-12 animate-in slide-in-from-bottom-8 duration-300 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500/20 text-blue-400 rounded-full p-1.5 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <p className="text-white text-sm font-medium mt-0.5 leading-relaxed">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Auth Error Modal */}
      {authError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle size={24} />
                <h3 className="text-lg font-bold">Erro de Autenticação</h3>
              </div>
              <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {authError}
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setAuthError(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {showProgress && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="text-blue-600" /> Meu Progresso
                </h3>
                <p className="text-slate-500 mt-1">Acompanhe seu aprendizado e veja o que precisa revisar.</p>
              </div>
              <button onClick={() => setShowProgress(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Resumo de Gamificação */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Status na Swift Academy</span>
                <h4 className="text-lg font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <Crown size={18} className="text-amber-500" /> Nível {userStats.levelInfo.level} • {userStats.levelInfo.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {userStats.points} XP acumulados • {userStats.unlockedBadges.length} de {ALL_BADGES.length} conquistas
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProgress(false);
                  setActiveTab('ranking');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Trophy size={14} className="text-yellow-300" /> Ver Ranking & Badges
              </button>
            </div>
            
            <div className="space-y-4">
              {pillars.map(pillar => {
                const score = quizScores[pillar.id] || 0;
                const totalQuestions = pillar.quiz.length + (showExtraQuiz[pillar.id] && pillar.extraQuiz ? pillar.extraQuiz.length : 0);
                const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
                const needsReview = percentage < 60 && quizAnswers[`${pillar.id}-1`] !== undefined; // Has answered at least one question

                return (
                  <div key={pillar.id} className={`p-4 rounded-2xl border ${needsReview ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'} flex items-center justify-between`}>
                    <div>
                      <h4 className={`font-bold ${needsReview ? 'text-rose-900' : 'text-slate-800'}`}>
                        {pillar.id}. {pillar.title}
                      </h4>
                      {needsReview && (
                        <p className="text-sm text-rose-600 font-medium mt-1 flex items-center gap-1">
                          <AlertCircle size={14} /> Recomendamos revisar este conceito
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-black ${needsReview ? 'text-rose-600' : 'text-blue-600'}`}>
                        {score} <span className="text-sm text-slate-400 font-medium">/ {totalQuestions}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Glossário Salvo */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                <BookOpen className="text-blue-600" /> Meu Glossário de Revisão
              </h3>
              <p className="text-slate-500 mb-6 text-sm">Conceitos e termos que você salvou durante os questionários. Estude-os para aprimorar o seu aprendizado.</p>
              
              {savedTerms.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 text-center text-slate-500 font-medium">
                  Nenhum termo salvo ainda.<br/>
                  <span className="text-sm font-normal text-slate-400">Clique nas palavras sublinhadas nos textos das questões para guardá-las aqui e consultá-las sem ver a resposta do Quiz!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedTerms.map(term => (
                    <div key={term} className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                      <h4 className="font-bold text-blue-900 capitalize mb-2">{term}</h4>
                      <p className="text-sm text-blue-800/90 leading-relaxed">{glossaryData[term]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dicas de Carreira com IA */}
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                <BrainCircuit className="text-purple-600" /> Mentoria de Carreira (AI)
              </h3>
              <p className="text-slate-500 mb-6 text-sm">Receba conselhos do Gemini sobre como destacar seus novos conhecimentos em Swift em entrevistas e no seu currículo.</p>

              {!careerTips ? (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center">
                  <p className="text-purple-900 font-medium mb-4">Gere dicas personalizadas baseadas no seu progresso no app.</p>
                  <button 
                    onClick={generateCareerTips}
                    disabled={careerTipsLoading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-200 flex items-center gap-2 mx-auto"
                  >
                    {careerTipsLoading ? (
                      <span className="animate-pulse">Analisando progresso...</span>
                    ) : (
                      <>
                        <BrainCircuit size={20} />
                        Gerar Dicas com Gemini
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                      <FileText className="text-blue-500" /> Dicas para o Currículo
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{careerTips.resumeTips}</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                      <MessageSquare className="text-blue-500" /> Entrevistas Técnicas
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{careerTips.interviewTips}</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h4 className="font-bold text-purple-900 text-lg mb-3 flex items-center gap-2">
                      <ChevronRight className="text-purple-500" /> Próximos Passos
                    </h4>
                    <p className="text-purple-800 text-sm leading-relaxed whitespace-pre-wrap">{careerTips.nextSteps}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      <OfflineIndicator />
      {/* Header Estilo Apple */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 border-b border-slate-200 p-4 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800 tracking-tight">
            <GraduationCap className="text-blue-600" /> Swift Academy
          </h1>
          <div className="flex items-center gap-4">
            <nav className="flex bg-slate-100 p-1 rounded-full hidden md:flex items-center gap-1">
              <button onClick={() => setActiveTab('trilha')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'trilha' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <Route size={16} /> Trilha
              </button>
              <button onClick={() => setActiveTab('simulados')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'simulados' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <ShieldCheck size={16} /> Simulados
              </button>
              <button onClick={() => setActiveTab('banco')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'banco' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <BookOpen size={16} /> Banco de Questões
              </button>
              <button onClick={() => setActiveTab('ranking')} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === 'ranking' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                <Trophy size={16} className={activeTab === 'ranking' ? 'text-amber-500' : ''} /> Ranking & Badges
                {userStats.points > 0 && (
                  <span className="ml-1 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {userStats.points} XP
                  </span>
                )}
              </button>
            </nav>
            <PWAInstallButton />
            {isAuthReady && (
              user ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowProgress(true)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Meu Progresso
                  </button>
                  <span className="text-sm font-medium text-slate-600 hidden sm:block">
                    {user.displayName || user.email}
                  </span>
                  <button 
                    onClick={logOut}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-full transition-colors shadow-sm"
                  >
                    <LogIn size={16} /> Google
                  </button>
                  <button 
                    onClick={handleAppleLogin}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-1.5 rounded-full transition-colors shadow-sm"
                  >
                    <Apple size={16} /> Apple
                  </button>
                  <button 
                    onClick={handleLinkedInLogin}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-[#0A66C2] hover:bg-[#084e96] px-4 py-1.5 rounded-full transition-colors shadow-sm"
                  >
                    <Linkedin size={16} /> LinkedIn
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-8 pb-20 md:pb-8">
        {/* Mobile Navigation Segmented Control */}
        <div className="md:hidden flex bg-slate-200/80 p-1 rounded-2xl w-full max-w-md mx-auto justify-between">
          <button 
            onClick={() => setActiveTab('trilha')} 
            className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'trilha' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            <Route size={15} /> Trilha
          </button>
          <button 
            onClick={() => setActiveTab('simulados')} 
            className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'simulados' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            <ShieldCheck size={15} /> Simulados
          </button>
          <button 
            onClick={() => setActiveTab('banco')} 
            className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'banco' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            <BookOpen size={15} /> Banco
          </button>
          <button 
            onClick={() => setActiveTab('ranking')} 
            className={`flex-1 flex justify-center items-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'ranking' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            <Trophy size={15} className={activeTab === 'ranking' ? 'text-amber-500' : ''} /> Ranking
          </button>
        </div>

        {activeTab === 'ranking' ? (
          <LeaderboardView 
            user={user}
            userStats={userStats}
            leaderboardUsers={leaderboardUsers}
            onLoginRequest={handleGoogleLogin}
          />
        ) : activeTab === 'simulados' ? (
          <SimuladosView onExamFinish={handleExamFinish} />
        ) : activeTab === 'banco' ? (
          <StudyBankView />
        ) : (
          <>
            {/* Mind Map Section */}
            <section className={`transition-all duration-500 ${activePillar ? 'h-[400px]' : 'h-[70vh]'} w-full`}>
              <div className="h-full w-full relative">
                <MindMap 
                  pillars={pillars} 
                  activePillar={activePillar} 
                  onNodeClick={(pillar) => {
                    setActivePillar(pillar);
                    // Scroll to content smoothly
                    setTimeout(() => {
                      document.getElementById('lesson-content')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }} 
                />
              </div>
            </section>

            {/* Conteúdo da Lição */}
            <section id="lesson-content" className="w-full max-w-4xl mx-auto">
              {!activePillar ? (
                <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <BookOpen size={48} className="text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Bem-vindo à Swift Academy</h3>
              <p className="text-slate-500 max-w-md">
                Selecione um dos pilares no mapa mental ao lado para começar sua jornada pelos fundamentos da linguagem Swift.
                {!user && (
                  <span className="block mt-4 text-blue-600 font-medium">
                    Faça login para salvar seu progresso automaticamente!
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Teoria e Casos */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className={`p-8 text-white ${activePillar.isAdvanced ? 'bg-violet-900' : 'bg-slate-900'}`}>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 ${activePillar.isAdvanced ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {activePillar.isAdvanced ? 'Tópico Avançado' : `Pilar ${activePillar.id}`}
                  </div>
                  <h2 className="text-3xl font-extrabold mb-4 tracking-tight">{activePillar.title}</h2>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">{activePillar.theory}</p>
                  
                  {activePillar.appleDocUrl && (
                    <a 
                      href={activePillar.appleDocUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activePillar.isAdvanced ? 'bg-violet-800 hover:bg-violet-700 text-violet-100' : 'bg-slate-800 hover:bg-slate-700 text-blue-100'}`}
                    >
                      <BookOpen size={18} />
                      Documentação Oficial da Apple
                    </a>
                  )}
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                    <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-3">
                      <BookOpen size={20} className="text-indigo-500" /> Caso Corporativo
                    </h4>
                    <p className="text-sm text-indigo-800 leading-relaxed">{activePillar.corporateCase}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
                    <h4 className="flex items-center gap-2 font-bold text-emerald-900 mb-3">
                      <Gamepad2 size={20} className="text-emerald-500" /> Caso de Games
                    </h4>
                    <p className="text-sm text-emerald-800 leading-relaxed">{activePillar.gameCase}</p>
                  </div>
                </div>
              </div>

              {/* Exercícios Práticos */}
              <div className={`rounded-3xl p-8 text-white shadow-lg ${activePillar.isAdvanced ? 'bg-violet-950' : 'bg-slate-900'}`}>
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <Code className={activePillar.isAdvanced ? 'text-violet-400' : 'text-blue-400'} /> Exercícios de Fixação
                </h3>
                <div className="space-y-8">
                  {activePillar.exercises.map((ex) => (
                    <div key={ex.id} className={`p-6 rounded-2xl border ${activePillar.isAdvanced ? 'bg-violet-900/50 border-violet-800' : 'bg-slate-800/50 border-slate-700'}`}>
                      <p className="mb-4 text-slate-200 font-medium leading-relaxed">
                        <span className={`mr-2 ${activePillar.isAdvanced ? 'text-violet-400' : 'text-blue-400'}`}>{ex.id}.</span> 
                        <TextWithGlossary text={ex.question} onSaveTerm={handleSaveTerm} theme={activePillar.isAdvanced ? 'dark-violet' : 'dark'} />
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <code className={`p-4 rounded-xl flex-1 font-mono text-sm text-slate-300 overflow-x-auto whitespace-nowrap border ${activePillar.isAdvanced ? 'bg-violet-950/50 border-violet-900' : 'bg-slate-950 border-slate-800'}`}>
                          {ex.codeSnippet.split('___')[0]}
                          <input
                            type="text"
                            className={`border-b-2 outline-none px-2 mx-1 w-24 text-center transition-colors rounded-t-sm ${activePillar.isAdvanced ? 'bg-violet-900 border-violet-500 text-violet-300 focus:bg-violet-800' : 'bg-slate-800 border-blue-500 text-blue-300 focus:bg-slate-700'}`}
                            value={exerciseAnswers[`${activePillar.id}-${ex.id}`] || ''}
                            onChange={(e) => setExerciseAnswers({
                              ...exerciseAnswers,
                              [`${activePillar.id}-${ex.id}`]: e.target.value
                            })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                checkExercise(activePillar.id, ex.id, ex.correctAnswer);
                              }
                            }}
                          />
                          {ex.codeSnippet.split('___')[1]}
                        </code>
                        <button 
                          onClick={() => checkExercise(activePillar.id, ex.id, ex.correctAnswer)}
                          className={`text-white px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap shadow-sm ${activePillar.isAdvanced ? 'bg-violet-600 hover:bg-violet-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                        >
                          Validar
                        </button>
                      </div>
                      {feedback[`${activePillar.id}-${ex.id}`] && (
                        <div className={`mt-4 flex items-start gap-2 text-sm p-3 rounded-lg ${
                          feedback[`${activePillar.id}-${ex.id}`].correct 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {feedback[`${activePillar.id}-${ex.id}`].correct ? <CheckCircle2 size={18} className="shrink-0 mt-0.5"/> : <AlertCircle size={18} className="shrink-0 mt-0.5"/>}
                          <span className="leading-relaxed">{feedback[`${activePillar.id}-${ex.id}`].msg}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Estilo Certificação Apple */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <GraduationCap className={activePillar.isAdvanced ? 'text-violet-600' : 'text-blue-600'} /> Simulado Apple
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Questões no estilo da certificação oficial</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pontuação</span>
                    <div className={`text-2xl font-black ${activePillar.isAdvanced ? 'text-violet-600' : 'text-blue-600'}`}>
                      {quizScores[activePillar.id] || 0} <span className="text-slate-300 text-lg">/ 5</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {activePillar.quiz.map((q) => {
                    const key = `${activePillar.id}-${q.id}`;
                    const answered = quizAnswers[key] !== undefined;
                    const selectedIdx = quizAnswers[key];

                    return (
                      <div key={q.id} className="space-y-4">
                        <p className="font-semibold text-slate-800 text-lg leading-relaxed">
                          <span className={`mr-2 ${activePillar.isAdvanced ? 'text-violet-500' : 'text-blue-500'}`}>{q.id}.</span>
                          <TextWithGlossary text={q.question} onSaveTerm={handleSaveTerm} theme={activePillar.isAdvanced ? 'light-violet' : 'light'} />
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {q.options.map((opt, idx) => {
                            let btnClass = "text-left p-4 rounded-xl border transition-all text-sm font-medium ";
                            
                            if (!answered) {
                              btnClass += activePillar.isAdvanced ? "border-slate-200 hover:border-violet-400 hover:bg-violet-50 text-slate-700" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700";
                            } else {
                              if (idx === q.correctIndex) {
                                btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                              } else if (idx === selectedIdx) {
                                btnClass += "border-rose-500 bg-rose-50 text-rose-900";
                              } else {
                                btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={answered}
                                onClick={() => handleQuizAnswer(activePillar.id, q.id, idx, q.correctIndex, q.explanation)}
                                className={btnClass}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                                    answered && idx === q.correctIndex ? 'bg-emerald-500 border-emerald-500 text-white' :
                                    answered && idx === selectedIdx ? 'bg-rose-500 border-rose-500 text-white' :
                                    'border-slate-300 text-slate-500'
                                  }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className="mt-0.5">{opt}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {answered && (
                          <div className={`p-4 rounded-xl text-sm leading-relaxed border ${
                            selectedIdx === q.correctIndex 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}>
                            <span className="font-bold block mb-1">
                              {selectedIdx === q.correctIndex ? 'Correto!' : 'Incorreto.'}
                            </span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Extra Quiz Section */}
                  {activePillar.extraQuiz && activePillar.extraQuiz.length > 0 && (
                    <div className="pt-6 border-t border-slate-100">
                      {!showExtraQuiz[activePillar.id] ? (
                        <button
                          onClick={() => setShowExtraQuiz({ ...showExtraQuiz, [activePillar.id]: true })}
                          className="w-full py-4 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <BrainCircuit size={20} />
                          Gerar +5 Questões de Revisão
                        </button>
                      ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                          <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                            <BrainCircuit className="text-blue-600" /> Questões Extras de Revisão
                          </h4>
                          {activePillar.extraQuiz.map((q) => {
                            const key = `${activePillar.id}-extra-${q.id}`;
                            const answered = quizAnswers[key] !== undefined;
                            const selectedIdx = quizAnswers[key];

                            return (
                              <div key={`extra-${q.id}`} className="space-y-4">
                                <p className="font-semibold text-slate-800 text-lg leading-relaxed">
                                  <span className={`mr-2 ${activePillar.isAdvanced ? 'text-violet-500' : 'text-blue-500'}`}>Extra {q.id}.</span>
                                  <TextWithGlossary text={q.question} onSaveTerm={handleSaveTerm} theme={activePillar.isAdvanced ? 'light-violet' : 'light'} />
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                  {q.options.map((opt, idx) => {
                                    let btnClass = "text-left p-4 rounded-xl border transition-all text-sm font-medium ";
                                    
                                    if (!answered) {
                                      btnClass += activePillar.isAdvanced ? "border-slate-200 hover:border-violet-400 hover:bg-violet-50 text-slate-700" : "border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700";
                                    } else {
                                      if (idx === q.correctIndex) {
                                        btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                                      } else if (idx === selectedIdx) {
                                        btnClass += "border-rose-500 bg-rose-50 text-rose-900";
                                      } else {
                                        btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
                                      }
                                    }

                                    return (
                                      <button
                                        key={idx}
                                        disabled={answered}
                                        onClick={() => handleQuizAnswer(activePillar.id, `extra-${q.id}` as any, idx, q.correctIndex, q.explanation)}
                                        className={btnClass}
                                      >
                                        <div className="flex items-start gap-3">
                                          <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                                            answered && idx === q.correctIndex ? 'bg-emerald-500 border-emerald-500 text-white' :
                                            answered && idx === selectedIdx ? 'bg-rose-500 border-rose-500 text-white' :
                                            'border-slate-300 text-slate-500'
                                          }`}>
                                            {String.fromCharCode(65 + idx)}
                                          </span>
                                          <span className="mt-0.5">{opt}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                                {answered && (
                                  <div className={`p-4 rounded-xl text-sm leading-relaxed border ${
                                    selectedIdx === q.correctIndex 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                    : 'bg-rose-50 border-rose-200 text-rose-800'
                                  }`}>
                                    <span className="font-bold block mb-1">
                                      {selectedIdx === q.correctIndex ? 'Correto!' : 'Incorreto.'}
                                    </span>
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </section>
        </>
        )}
      </main>

      {/* Celebratory Modal for newly unlocked badges */}
      <BadgeUnlockedModal 
        badge={newlyUnlockedBadge} 
        onClose={() => setNewlyUnlockedBadge(null)} 
      />
    </div>
  );
}

