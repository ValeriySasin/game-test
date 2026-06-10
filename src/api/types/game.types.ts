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

type SpinBase = {
  symbols:    [SymbolKey, SymbolKey, SymbolKey];
  newBalance: number;
  spinId:     string;
};

export type SpinResponse =
  | (SpinBase & { isWin: true;  winAmount: number; winLabel: string })
  | (SpinBase & { isWin: false; winAmount: 0;      winLabel: '' });

