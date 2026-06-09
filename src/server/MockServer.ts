import { SpinRequest, SpinResult } from '../types';
import { SYMBOLS, SymbolKey } from '../types/constants';

const MOCK_DELAY_MS = 600;
const WIN_CHANCE = 0.25; // 25% win chance

function randomSymbol(): SymbolKey {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

export class MockServer {
  async spin(request: SpinRequest): Promise<SpinResult> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

    const isWin = Math.random() < WIN_CHANCE;

    let symbols: [SymbolKey, SymbolKey, SymbolKey];

    if (isWin) {
      // Force all 3 same symbols
      const winSymbol = randomSymbol();
      symbols = [winSymbol, winSymbol, winSymbol];
    } else {
      // Make sure at least 2 are different
      let result: [SymbolKey, SymbolKey, SymbolKey];
      do {
        result = [randomSymbol(), randomSymbol(), randomSymbol()];
      } while (result[0] === result[1] && result[1] === result[2]);
      symbols = result;
    }

    return {
      symbols,
      isWin,
      winAmount: isWin ? request.bet * 10 : 0,
    };
  }
}

export const mockServer = new MockServer();
