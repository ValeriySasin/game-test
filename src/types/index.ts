import { SymbolKey } from './constants';

export interface SpinResult {
  symbols: [SymbolKey, SymbolKey, SymbolKey];
  isWin: boolean;
  winAmount?: number;
}

export interface SpinRequest {
  bet: number;
}

export interface GameState {
  balance: number;
  bet: number;
  betSteps: number[];
  betStepIndex: number;
  isSpinning: boolean;
  soundEnabled: boolean;
}
