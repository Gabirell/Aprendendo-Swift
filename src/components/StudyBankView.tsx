import React, { useState, useMemo, useEffect } from 'react';
import { mockExams, getCustomImportedExams } from '../data/mockExamsData';
import { BrainCircuit, CheckCircle2, XCircle, Loader2, ChevronRight, BookOpen } from 'lucide-react';

interface StudyQuestion {
  uniqueId: string;
  examTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const StudyBankView: React.FC = () => {
  const [customExams, setCustomExams] = useState(getCustomImportedExams());

  useEffect(() => {
    setCustomExams(getCustomImportedExams());
  }, []);

  const allQuestions = useMemo(() => {
    const qs: StudyQuestion[] = [];
    const sourceExams = [...customExams, ...mockExams];
    sourceExams.forEach(exam => {
      if (exam && Array.isArray(exam.questions)) {
        exam.questions.forEach(q => {
          if (q && typeof q.question === 'string' && q.question.trim().length > 0) {
            qs.push({
              uniqueId: `${exam.id}-${q.id || Math.random()}`,
              examTitle: exam.title || 'Simulado',
              question: q.question.trim(),
              options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Opção A', 'Opção B'],
              correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 ? q.correctIndex : 0,
              explanation: q.explanation || 'Revisão do conteúdo.'
            });
          }
        });
      }
    });
    // Shuffle the array so it's a mix of questions
    return qs.sort(() => Math.random() - 0.5);
  }, [customExams]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [tutorExplanation, setTutorExplanation] = useState<{ studyRecommendation: string, examples: string } | null>(null);
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);

  if (allQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Nenhuma questão disponível no momento</h3>
        <p className="text-slate-500 text-sm">Carregue ou importe um simulado na aba Simulados para liberar questões no Banco de Estudos.</p>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, currentIndex), allQuestions.length - 1);
  const currentQ = allQuestions[safeIndex];

  if (!currentQ) {
    return null;
  }

  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQ.correctIndex;

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setTutorExplanation(null);
    setTutorError(null);
    setCurrentIndex(prev => (prev + 1) % allQuestions.length);
  };

  const handleAskTutor = async () => {
    setTutorLoading(true);
    setTutorError(null);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          options: currentQ.options,
          correctIndex: currentQ.correctIndex,
          userIndex: selectedAnswer,
          explanation: currentQ.explanation
        })
      });
      const data = await res.json();
      if (!data.error) {
        setTutorExplanation(data);
      } else {
        setTutorError(data.error);
      }
    } catch (e) {
      console.error(e);
      setTutorError("Não foi possível carregar a resposta do tutor. Tente novamente.");
    } finally {
      setTutorLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/50 text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen size={14} /> Banco de Questões
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white">Modo Estudo</h2>
          <p className="text-emerald-100 max-w-2xl text-sm md:text-base">
            Treine com feedback instantâneo. Se errar, nosso AI Tutor explicará a origem da sua dúvida e dará mais exemplos práticos para você não esquecer.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-bold text-slate-400">
          Questão {currentIndex + 1} de {allQuestions.length}
        </span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-3 py-1 rounded-full text-right max-w-[60%] truncate">
          De: {currentQ.examTitle}
        </span>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
          {currentQ.question}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "w-full text-left p-5 rounded-xl border-2 transition-all font-medium ";
            
            if (!isAnswered) {
              btnClass += "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer";
            } else {
              if (idx === currentQ.correctIndex) {
                btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
              } else if (idx === selectedAnswer) {
                btnClass += "border-rose-500 bg-rose-50 text-rose-900";
              } else {
                btnClass += "border-slate-100 bg-white text-slate-400 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(idx)}
                className={btnClass}
              >
                <span className="inline-block w-8 font-bold opacity-50">{String.fromCharCode(65 + idx)})</span>
                {opt}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="text-rose-500 shrink-0 mt-0.5" />}
                <h4 className="font-bold text-lg">
                  {isCorrect ? 'Correto!' : 'Incorreto.'}
                </h4>
              </div>
              <p className="text-sm leading-relaxed pl-9">
                <strong>Explicação:</strong> {currentQ.explanation}
              </p>
            </div>

            {!isCorrect && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                {tutorError && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    {tutorError}
                  </div>
                )}
                {!tutorExplanation && !tutorLoading && (
                  <button
                    onClick={handleAskTutor}
                    className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium text-sm transition-colors px-4 py-3 bg-rose-50 hover:bg-rose-100 rounded-xl w-full justify-center border border-rose-100"
                  >
                    <BrainCircuit size={18} /> Ai Tutor: Onde errei e quais exemplos podem me ajudar?
                  </button>
                )}
                
                {tutorLoading && (
                  <div className="flex items-center justify-center gap-2 text-rose-500 font-medium text-sm animate-pulse p-4">
                    <Loader2 size={18} className="animate-spin" /> O AI Tutor está analisando sua resposta e criando novos exemplos...
                  </div>
                )}
                
                {tutorExplanation && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-5 shadow-inner">
                    <div>
                      <h4 className="text-rose-800 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                        <BrainCircuit size={16} /> Onde focar o estudo
                      </h4>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {tutorExplanation.studyRecommendation}
                      </p>
                    </div>
                    <div className="border-t border-slate-200 pt-5">
                      <h4 className="text-blue-800 font-bold mb-2 text-sm uppercase tracking-wide">
                        Novos Exemplos Práticos
                      </h4>
                      <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                        {tutorExplanation.examples}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-md"
              >
                Próxima Questão <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
