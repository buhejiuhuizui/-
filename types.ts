
export interface NoteAnalysis {
  riskScore: number;
  violationKeywords: string[];
  violationAnalysis: string;
  optimizedTitle: string;
  optimizedContent: string;
  recommendedTags: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AnalysisHistoryItem extends NoteAnalysis {
  id: string;
  originalTitle: string;
  originalContent: string;
  timestamp: number;
}

export type ModuleType = 'detect' | 'optimize' | 'history' | 'chat';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
