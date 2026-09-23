import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileCode, CheckCircle2, AlertCircle, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { parseHtmlSimulado, ParsedExamResult } from '../utils/htmlExamParser';
import { MockExam, saveCustomImportedExam } from '../data/mockExamsData';

interface HtmlExamImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamImported: (exam: MockExam) => void;
}

export const HtmlExamImporterModal: React.FC<HtmlExamImporterModalProps> = ({
  isOpen,
  onClose,
  onExamImported
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'paste'>('upload');
  const [pastedHtml, setPastedHtml] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedExamResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('swift-revisao-simulado.html');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessHtml = (htmlContent: string, name: string) => {
    setErrorMessage(null);
    try {
      if (!htmlContent.trim()) {
        setErrorMessage('O conteúdo HTML está vazio. Por favor selecione um arquivo válido.');
        return;
      }
      const result = parseHtmlSimulado(htmlContent, name);
      if (result.exam.questions.length === 0 && result.rawNotes.length === 0) {
        setErrorMessage('Não conseguimos identificar perguntas ou seções no HTML fornecido. Verifique o arquivo.');
        return;
      }
      result.exam.isCustomImported = true;
      setParsedResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Erro ao processar arquivo: ${err?.message || 'Formato não reconhecido'}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleProcessHtml(content, file.name);
    };
    reader.onerror = () => {
      setErrorMessage('Erro ao ler arquivo do computador.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleProcessHtml(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedResult) return;
    saveCustomImportedExam(parsedResult.exam);
    onExamImported(parsedResult.exam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">Importar Material do iOS Lab</h3>
              <p className="text-xs text-slate-500">Inclua simulados e revisões em HTML salvos localmente</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Informative Notice */}
        <div className="p-6 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Sobre links do tipo <code className="bg-amber-100 px-1 py-0.5 rounded">file:///C:/Users/...</code>:</p>
              <p className="text-amber-800 leading-relaxed">
                Navegadores e ambientes em nuvem não podem ler arquivos diretamente da unidade local do seu computador por segurança. 
                Para incluir seu <strong>swift-revisao-simulado.html</strong>, selecione-o no botão abaixo ou arraste-o para cá!
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeMode === 'upload' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Selecionar Arquivo HTML
            </button>
            <button
              onClick={() => setActiveMode('paste')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${activeMode === 'paste' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Colar Código HTML
            </button>
          </div>

          {/* Mode 1: File Upload */}
          {activeMode === 'upload' && !parsedResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50 scale-[0.99]' 
                  : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileCode size={28} />
              </div>
              <h4 className="font-bold text-slate-800 text-base mb-1">
                Clique para escolher ou arraste seu arquivo
              </h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
                Suporta <strong className="text-slate-700">swift-revisao-simulado.html</strong> ou qualquer arquivo de questões e revisão de iOS
              </p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all">
                Procurar no computador
              </span>
            </div>
          )}

          {/* Mode 2: Paste HTML */}
          {activeMode === 'paste' && !parsedResult && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Cole o código ou texto de <span className="font-mono text-blue-600">swift-revisao-simulado.html</span>:
              </label>
              <textarea
                value={pastedHtml}
                onChange={(e) => setPastedHtml(e.target.value)}
                placeholder="Abra seu arquivo no Bloco de Notas ou VS Code, selecione tudo (Ctrl+A / Cmd+A), copie e cole aqui..."
                rows={8}
                className="w-full text-xs font-mono p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
              <button
                onClick={() => handleProcessHtml(pastedHtml, 'simulado-colado.html')}
                disabled={!pastedHtml.trim()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold transition-all shadow-md"
              >
                Processar e Extrair Material
              </button>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedResult && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                    Material Processado com Sucesso
                  </span>
                  <h4 className="font-bold text-slate-800 text-lg mt-2">
                    {parsedResult.exam.title}
                  </h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {parsedResult.exam.description}
                  </p>
                </div>
                <button
                  onClick={() => setParsedResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  Trocar arquivo
                </button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                  <div className="text-2xl font-black text-blue-600">
                    {parsedResult.totalQuestions}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Questões Identificadas</div>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                  <div className="text-2xl font-black text-purple-600">
                    {parsedResult.rawNotes.length}
                  </div>
                  <div className="text-xs font-bold text-slate-600">Seções de Revisão</div>
                </div>
              </div>

              {/* Preview of Question 1 if available */}
              {parsedResult.exam.questions && parsedResult.exam.questions[0]?.question && (
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-xs space-y-2">
                  <div className="font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Exemplo de Questão Extraída:
                  </div>
                  <p className="text-slate-800 font-medium">{parsedResult.exam.questions[0].question}</p>
                  <div className="text-slate-500 text-[11px]">
                    {parsedResult.exam.questions[0].options?.length || 0} alternativas detectadas.
                  </div>
                </div>
              )}

              {/* Action */}
              <button
                onClick={handleConfirmImport}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Salvar e Abrir no App
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
