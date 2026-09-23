export type PillarId = number;

export interface Exercise {
  id: number;
  question: string;
  codeSnippet: string;
  correctAnswer: string;
  hint: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PillarContent {
  id: PillarId;
  title: string;
  theory: string;
  appleDocUrl?: string;
  isAdvanced?: boolean;
  category?: 'Fundamentos' | 'Swift Avançado' | 'iOS e iPadOS' | 'watchOS' | 'macOS' | 'visionOS';
  corporateCase: string;
  gameCase: string;
  exercises: Exercise[];
  quiz: QuizQuestion[];
  extraQuiz?: QuizQuestion[];
}
