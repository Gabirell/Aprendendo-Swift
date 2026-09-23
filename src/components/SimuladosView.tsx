import React, { useState, useEffect } from 'react';
import { 
  mockExams, 
  MockExam, 
  getCustomImportedExams, 
  deleteCustomImportedExam,
  RevisionTopic 
} from '../data/mockExamsData';
import { 
  Clock, Play, CheckCircle2, XCircle, Award, BrainCircuit, 
  Loader2, UploadCloud, BookOpen, Trash2, Sparkles, FileText, ChevronRight, X
} from 'lucide-react';
import { HtmlExamImporterModal } from './HtmlExamImporterModal';

interface SimuladosViewProps {
  onExamFinish?: (examId: string, score: number, total: number, isApproved: boolean) => void;
}

export const SimuladosView: React.FC<SimuladosViewProps> = ({ onExamFinish }) => {
  const [customExams, setCustomExams] = useState<MockExam[]>([]);
  const [activeExam, setActiveExam] = useState<MockExam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [tutorExplanations, setTutorExplanations] = useState<Record<number, { studyRecommendation: string, examples: string }>>({});
  const [tutorLoading, setTutorLoading] = useState<Record<number, boolean>>({});
  
  // Importer Modal & Revision Viewer
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [viewingRevisionNotes, setViewingRevisionNotes] = useState<RevisionTopic[] | null>(null);
  const [revisionExamTitle, setRevisionExamTitle] = useState<string>('');

  useEffect(() => {
    setCustomExams(getCustomImportedExams());
  }, []);

  const allAvailableExams = [...customExams, ...mockExams];

  const handleAskTutor = async (qIdx: number) => {
    if (!activeExam || !activeExam.questions || !activeExam.questions[qIdx]) return;
    setTutorLoading(prev => ({ ...prev, [qIdx]: true }));
    try {
      const q = activeExam.questions[qIdx];
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          userIndex: answers[qIdx],
          explanation: q.explanation
        })
      });
      const data = await res.json();
      if (!data.error) {
        setTutorExplanations(prev => ({ ...prev, [qIdx]: data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTutorLoading(prev => ({ ...prev, [qIdx]: false }));
    }
  };

  const handleStart = (exam: MockExam) => {
    if (!exam || !Array.isArray(exam.questions) || exam.questions.length === 0) {
      if (exam?.revisionNotes && exam.revisionNotes.length > 0) {
        setViewingRevisionNotes(exam.revisionNotes);
        setRevisionExamTitle(exam.title);
        return;
      }
      return;
    }
    setActiveExam(exam);
    setCurrentQuestion(0);
    setAnswers({});
    setFinished(false);
    setTutorExplanations({});
    setTutorLoading({});
  };

  const handleAnswer = (optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: optionIdx }));
  };

  const handleNext = () => {
    if (currentQuestion < activeExam!.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setFinished(true);
      if (activeExam) {
        let sc = 0;
        activeExam.questions.forEach((q, idx) => {
          if (answers[idx] === q.correctIndex) sc++;
        });
        const isApproved = sc / activeExam.questions.length >= 0.7;
        onExamFinish?.(activeExam.id, sc, activeExam.questions.length, isApproved);
      }
    }
  };

  const calculateScore = () => {
    if (!activeExam) return 0;
    let score = 0;
    activeExam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  const handleExamImported = (importedExam: MockExam) => {
    setCustomExams(getCustomImportedExams());
    handleStart(importedExam);
  };

  const handleDeleteCustom = (examId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza de que deseja remover este simulado importado?')) {
      const updated = deleteCustomImportedExam(examId);
      setCustomExams(updated);
    }
  };

  if (!activeExam) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Banner Principal */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={14} /> Material Oficial & iOS Lab
                </span>
                <h2 className="text-3xl font-black">Simulados & Revisões</h2>
              </div>
              
              <button
                onClick={() => setIsImporterOpen(true)}
                className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <UploadCloud size={18} />
                <span>Importar swift-revisao-simulado.html</span>
              </button>
            </div>
            
            <p className="text-blue-100 max-w-2xl text-base leading-relaxed">
              Pratique com os questionários estruturados do iOS Lab e exames oficiais da Apple. 
              Você também pode importar arquivos HTML do seu laboratório local com 1 clique para praticar offline.
            </p>
          </div>
        </div>

        {/* Lista de Simulados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allAvailableExams.map(exam => {
            const isCustom = exam.isCustomImported || exam.id.startsWith('ioslab-import');
            const hasNotes = exam.revisionNotes && exam.revisionNotes.length > 0;

            return (
              <div 
                key={exam.id} 
                className={`bg-white rounded-3xl border ${isCustom ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200'} p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full ${
                      isCustom 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : exam.category === 'iOS Lab / Simulado'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isCustom ? 'Importado pelo Usuário' : exam.category}
                    </span>
                    {hasNotes && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold py-1 px-2.5 rounded-full flex items-center gap-1">
                        <BookOpen size={12} /> Revisão Teórica
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                      <Clock size={14} /> {exam.timeLimitMinutes} min
                    </span>
                    {isCustom && (
                      <button
                        onClick={(e) => handleDeleteCustom(exam.id, e)}
                        title="Excluir simulado importado"
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{exam.title}</h3>
                <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">{exam.description}</p>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-500">
                    {exam.questions.length} Questões
                  </span>

                  <div className="flex items-center gap-2">
                    {hasNotes && (
                      <button
                        onClick={() => {
                          setViewingRevisionNotes(exam.revisionNotes!);
                          setRevisionExamTitle(exam.title);
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <FileText size={14} className="text-blue-600" /> Revisar Conteúdo
                      </button>
                    )}
                    <button 
                      onClick={() => handleStart(exam)}
                      className="bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      <Play size={14} /> Iniciar Teste
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal de Importação */}
        <HtmlExamImporterModal
          isOpen={isImporterOpen}
          onClose={() => setIsImporterOpen(false)}
          onExamImported={handleExamImported}
        />

        {/* Modal de Revisão Teórica */}
        {viewingRevisionNotes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Revisão Teórica do iOS Lab</h3>
                    <p className="text-xs text-slate-500">{revisionExamTitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingRevisionNotes(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {viewingRevisionNotes.map((note, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3">
                    <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {note.topic}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>

                    {note.keyPoints && note.keyPoints.length > 0 && (
                      <div className="mt-3 bg-white rounded-xl p-4 border border-slate-200/60">
                        <div className="text-xs font-bold text-slate-700 mb-2">Pontos Chave para Fixação:</div>
                        <ul className="space-y-1.5">
                          {note.keyPoints.map((pt, pIdx) => (
                            <li key={pIdx} className="text-xs text-slate-600 flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.codeExample && (
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                        {note.codeExample}
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
                <button
                  onClick={() => setViewingRevisionNotes(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Fechar Revisão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    const score = calculateScore();
    const total = activeExam.questions.length;
    const isApproved = score / total >= 0.7; // 70% passing grade

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div className={`rounded-3xl p-10 text-center ${isApproved ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            <Award size={40} />
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${isApproved ? 'text-emerald-900' : 'text-rose-900'}`}>
            {isApproved ? 'Parabéns, Aprovado no Desafio!' : 'Continue Praticando'}
          </h2>
          <p className={`text-lg font-medium mb-8 ${isApproved ? 'text-emerald-700' : 'text-rose-700'}`}>
            Você acertou {score} de {total} questões ({(score / total * 100).toFixed(0)}%).
          </p>
          <button 
            onClick={() => setActiveExam(null)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-md"
          >
            Voltar aos Simulados
          </button>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Gabarito e Correção Detalhada</h3>
          {activeExam.questions.map((q, idx) => {
            const userAns = answers[idx];
            const isCorrect = userAns === q.correctIndex;

            return (
              <div key={q.id} className={`p-6 rounded-3xl border ${isCorrect ? 'bg-white border-emerald-200' : 'bg-white border-rose-200'} shadow-sm space-y-4`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" /> : <XCircle className="text-rose-500 shrink-0 mt-1" />}
                  <p className="font-semibold text-slate-900 text-base leading-relaxed">{idx + 1}. {q.question}</p>
                </div>
                
                <div className="pl-8 space-y-2">
                  {q.options.map((opt, optIdx) => {
                    let btnClass = "p-3 rounded-2xl border text-left w-full text-xs font-medium ";
                    if (optIdx === q.correctIndex) {
                      btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                    } else if (optIdx === userAns) {
                      btnClass += "bg-rose-50 border-rose-500 text-rose-900";
                    } else {
                      btnClass += "bg-slate-50 border-slate-200 text-slate-500 opacity-60";
                    }
                    
                    return (
                      <div key={optIdx} className={btnClass}>
                        {String.fromCharCode(65 + optIdx)}) {opt}
                      </div>
                    );
                  })}
                </div>

                <div className="ml-8 bg-blue-50 border border-blue-100 text-blue-900 p-4 rounded-2xl text-xs leading-relaxed">
                  <span className="font-bold">Justificativa Oficial: </span>
                  {q.explanation}
                </div>

                {/* Gemini AI Tutor */}
                {!isCorrect && (
                  <div className="ml-8 pt-2">
                    {!tutorExplanations[idx] ? (
                      <button
                        onClick={() => handleAskTutor(idx)}
                        disabled={tutorLoading[idx]}
                        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {tutorLoading[idx] ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Consultando AI Tutor...
                          </>
                        ) : (
                          <>
                            <BrainCircuit size={14} />
                            Pedir Explicação Personalizada ao Tutor Gemini
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                          <BrainCircuit size={16} className="text-indigo-600" />
                          <span>Dica Pedagógica do AI Tutor:</span>
                        </div>
                        <p className="text-xs text-indigo-950 leading-relaxed">
                          {tutorExplanations[idx].studyRecommendation}
                        </p>
                        {tutorExplanations[idx].examples && (
                          <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/50">
                            <span className="text-[11px] font-bold text-indigo-800 block mb-1">Exemplo Prático:</span>
                            <pre className="text-[11px] font-mono text-indigo-900 whitespace-pre-wrap">
                              {tutorExplanations[idx].examples}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active question in progress
  if (!activeExam.questions || activeExam.questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <p className="text-slate-700 font-medium">Este simulado não possui questões disponíveis para teste.</p>
        <button 
          onClick={() => setActiveExam(null)}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  const safeCurrentQuestion = Math.min(Math.max(0, currentQuestion), activeExam.questions.length - 1);
  const q = activeExam.questions[safeCurrentQuestion] || activeExam.questions[0];

  if (!q) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <p className="text-slate-700 font-medium">Questão não encontrada.</p>
        <button 
          onClick={() => setActiveExam(null)}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          Voltar para Lista
        </button>
      </div>
    );
  }

  const progressPercent = ((safeCurrentQuestion + 1) / activeExam.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
            {activeExam.title}
          </span>
          <h2 className="text-base font-bold text-slate-800">
            Questão {safeCurrentQuestion + 1} de {activeExam.questions.length}
          </h2>
        </div>
        <button 
          onClick={() => {
            if (confirm('Deseja realmente sair do simulado? O progresso atual será perdido.')) {
              setActiveExam(null);
            }
          }}
          className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          Cancelar Simulado
        </button>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300 rounded-full" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
          {q.question}
        </h3>

        <div className="space-y-3">
          {q.options.map((option, idx) => {
            const isSelected = answers[currentQuestion] === idx;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all text-xs md:text-sm font-medium flex items-center gap-3 ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-grow">{option}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Anterior
          </button>
          
          <button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-7 py-3 rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <span>{currentQuestion === activeExam.questions.length - 1 ? 'Finalizar Simulado' : 'Próxima Questão'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
