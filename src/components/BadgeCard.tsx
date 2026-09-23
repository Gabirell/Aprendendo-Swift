import React from 'react';
import { Badge } from '../data/badgesData';
import { 
  Sparkles, 
  Code2, 
  Award, 
  Flame, 
  ShieldCheck, 
  BookOpen, 
  Cpu, 
  Smartphone, 
  Zap, 
  Trophy, 
  Crown, 
  GraduationCap, 
  Lock,
  CheckCircle2
} from 'lucide-react';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  onSelect?: () => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isUnlocked, onSelect }) => {
  const renderIcon = (name: Badge['iconName']) => {
    const props = { size: 28, className: isUnlocked ? 'text-amber-500' : 'text-slate-400' };
    switch (name) {
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Code2': return <Code2 {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Crown': return <Crown {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Trophy':
      default:
        return <Trophy {...props} />;
    }
  };

  const categoryLabels = {
    iniciante: 'Iniciante',
    pratica: 'Prática',
    mestre: 'Mestre',
    especial: 'Especial'
  };

  const categoryColors = {
    iniciante: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pratica: 'bg-blue-50 text-blue-700 border-blue-200',
    mestre: 'bg-purple-50 text-purple-700 border-purple-200',
    especial: 'bg-amber-50 text-amber-700 border-amber-200'
  };

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isUnlocked 
          ? 'bg-white border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300' 
          : 'bg-slate-50/80 border-slate-200/80 opacity-80 hover:opacity-100 hover:bg-slate-50'
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
            isUnlocked 
              ? 'bg-gradient-to-br from-amber-100 to-yellow-50 shadow-inner border border-amber-200/60' 
              : 'bg-slate-200/60 border border-slate-200'
          }`}>
            {isUnlocked ? renderIcon(badge.iconName) : <Lock size={22} className="text-slate-400" />}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${categoryColors[badge.category]}`}>
              {categoryLabels[badge.category]}
            </span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
              +{badge.xpReward} XP
            </span>
          </div>
        </div>

        <h4 className={`text-base font-bold mb-1.5 ${isUnlocked ? 'text-slate-900' : 'text-slate-600'}`}>
          {badge.title}
        </h4>
        
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          {badge.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate max-w-[180px]" title={badge.criteria}>
          {badge.criteria}
        </span>
        {isUnlocked ? (
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <CheckCircle2 size={14} /> Conquistado
          </span>
        ) : (
          <span className="flex items-center gap-1 font-medium text-slate-400">
            <Lock size={12} /> Bloqueado
          </span>
        )}
      </div>
    </div>
  );
};
