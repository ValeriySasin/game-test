import { ApiResponse } from '@/api/types/common.types';
import { GameConfig, SpinRequest, SpinResponse } from '@/api/types/game.types';
import { PAYTABLE, SYMBOLS, SymbolKey } from '@/types/constants';
import { mockState } from './player.mock';

const WIN_CHANCE   = 0.28;
const MAX_ATTEMPTS = 100; // safety cap for loss symbol generation

function randomSymbol(): SymbolKey {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function randomId(): string {
  return 'spin-' + Math.random().toString(36).slice(2, 10);
}

function checkSymbols(
  syms: [SymbolKey, SymbolKey, SymbolKey],
  bet: number,
): { isWin: true; winAmount: number; winLabel: string } | { isWin: false; winAmount: 0; winLabel: '' } {
  // Check 3×
  if (syms[0] === syms[1] && syms[1] === syms[2]) {
    const row = PAYTABLE.find(r => r.count === 3 && r.symbols[0] === syms[0]);
    if (row) return { isWin: true, winAmount: bet * row.multiplier, winLabel: row.label };
  }
  // Check 2× sevens
  const sevens = syms.filter(s => s === 'seven').length;
  if (sevens >= 2) {
    const row = PAYTABLE.find(r => r.count === 2 && r.symbols[0] === 'seven');
    if (row) return { isWin: true, winAmount: bet * row.multiplier, winLabel: row.label };
  }
  return { isWin: false, winAmount: 0, winLabel: '' };
}

function generateWinSymbols(): [SymbolKey, SymbolKey, SymbolKey] {
  const row = PAYTABLE[Math.floor(Math.random() * PAYTABLE.length)];
  const sym = row.symbols[0];
  if (row.count === 3) return [sym, sym, sym];
  // count=2 (sevens): place sevens in 2 random positions, 3rd is non-seven
  const nonSeven = SYMBOLS.filter(s => s !== 'seven');
  const third    = nonSeven[Math.floor(Math.random() * nonSeven.length)];
  const thirdPos = Math.floor(Math.random() * 3);
  const res: SymbolKey[] = ['seven', 'seven', 'seven'];
  res[thirdPos] = third;
  return res as [SymbolKey, SymbolKey, SymbolKey];
}

function generateLossSymbols(): [SymbolKey, SymbolKey, SymbolKey] {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const res: [SymbolKey, SymbolKey, SymbolKey] = [randomSymbol(), randomSymbol(), randomSymbol()];
    if (!checkSymbols(res, 1).isWin) return res;
  }
  // Guaranteed non-winning fallback
  return ['gem', 'crown', 'coin'];
}

export const gameMock = {
  'GET /game/config': (): ApiResponse<GameConfig> => ({
    ok: true,
    status: 200,
    data: {
      reelCount:     3,
      betMin:        1,
      betMax:        100,
      betSteps:      [1, 5, 10, 25, 50, 100],
      symbols:       [...SYMBOLS],
      rtp:           96,
      winMultiplier: 10,
    },
  }),

  'POST /game/spin': (body: SpinRequest): ApiResponse<SpinResponse> => {
    const willWin = Math.random() < WIN_CHANCE;
    const symbols = willWin ? generateWinSymbols() : generateLossSymbols();
    const result  = checkSymbols(symbols, body.bet);

    // Single shared balance — stays in sync with player.mock.ts
    mockState.balance = mockState.balance - body.bet + result.winAmount;

    const spinId = randomId();

    if (result.isWin) {
      return {
        ok: true, status: 200,
        data: { symbols, isWin: true, winAmount: result.winAmount, winLabel: result.winLabel, newBalance: mockState.balance, spinId },
      };
    }

    return {
      ok: true, status: 200,
      data: { symbols, isWin: false, winAmount: 0, winLabel: '', newBalance: mockState.balance, spinId },
    };
  },
};
