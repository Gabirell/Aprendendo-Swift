import React from 'react';
import { glossaryData } from '../data/glossaryData';

interface Props {
  text: string;
  onSaveTerm: (term: string) => void;
  theme?: 'dark' | 'light' | 'dark-violet' | 'light-violet';
}

export default function TextWithGlossary({ text, onSaveTerm, theme = 'dark' }: Props) {
  // Sort keys by length descending to match longest terms first (e.g., "retain cycle" before "retain")
  const keys = Object.keys(glossaryData).sort((a, b) => b.length - a.length);
  
  // Escape regex special characters from glossary keys, just in case
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const pattern = `\\b(${keys.map(escapeRegExp).join('|')})\\b`;
  const regex = new RegExp(pattern, 'gi');
  
  const parts = text.split(regex);

  const isGlossaryTerm = (str: string) => keys.includes(str.toLowerCase());

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark-violet':
        return 'text-violet-300 decoration-violet-500/50 hover:bg-violet-500/20 hover:text-violet-100 focus:ring-violet-400';
      case 'light-violet':
        return 'text-violet-600 decoration-violet-300 hover:bg-violet-50 hover:text-violet-800 focus:ring-violet-400';
      case 'light':
        return 'text-blue-600 decoration-blue-300 hover:bg-blue-50 hover:text-blue-800 focus:ring-blue-400';
      case 'dark':
      default:
        return 'text-blue-300 decoration-blue-500/50 hover:bg-blue-500/20 hover:text-blue-100 focus:ring-blue-400';
    }
  };

  return (
    <span className="leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (isGlossaryTerm(part)) {
          return (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                onSaveTerm(part.toLowerCase());
              }}
              className={`underline decoration-dashed decoration-2 underline-offset-4 transition-colors font-semibold mx-0.5 rounded-sm px-0.5 focus:outline-none focus:ring-2 inline-flex ${getThemeClasses()}`}
              title="Salvar no glossário para consultar depois"
            >
              {part}
            </button>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
