import { SymbolKey } from '@/types/constants';

export interface GameConfig {
  reelCount: number;
  betMin: number;
  betMax: number;
  betSteps: number[]; // preset bet values, e.g. [1, 5, 10, 25, 50, 100]
  symbols: SymbolKey[];
  rtp: number; // return to player %, e.g. 96
  winMultiplier: number;
}

export interface SpinRequest {
  bet: number;
  sessionId: string;
}

export interface SpinResponse {
  symbols: [SymbolKey, SymbolKey, SymbolKey];
  isWin: boolean;
  winAmount: number;
  winLabel: string;
  newBalance: number;
  spinId: string;
}

export interface SpinHistoryItem {
  spinId: string;
  timestamp: number;
  bet: number;
  symbols: [SymbolKey, SymbolKey, SymbolKey];
  isWin: boolean;
  winAmount: number;
}

export type SpinHistory = SpinHistoryItem[];
