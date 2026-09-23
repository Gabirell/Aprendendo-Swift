import React from 'react';
import { Badge } from '../data/badgesData';
import { Sparkles, Trophy, CheckCircle2, X } from 'lucide-react';

interface BadgeUnlockedModalProps {
  badge: Badge | null;
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({ badge, onClose }) => {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-amber-200 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Background glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
        >
          <X size={18} />
        </button>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-300/50 mb-5 ring-8 ring-amber-100 animate-bounce">
          <Trophy size={40} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
          <Sparkles size={14} className="text-amber-500" /> Nova Conquista Desbloqueada!
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-2">
          {badge.title}
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {badge.description}
        </p>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mb-6 text-amber-900">
          <span className="text-xs uppercase font-bold tracking-wider text-amber-700 block">Recompensa Obtida</span>
          <span className="text-2xl font-black text-amber-600">+{badge.xpReward} XP</span>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition shadow-md"
        >
          Continuar Aprendendo
        </button>
      </div>
    </div>
  );
};
