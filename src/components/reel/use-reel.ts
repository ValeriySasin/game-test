import { SymbolKey, SYMBOLS } from '../../types/constants';

const STRIP_SYMBOL_COUNT = 20;

export function useReel() {
  const strip: SymbolKey[] = generateStrip();
  let currentIndex = 0;

  function generateStrip(): SymbolKey[] {
    return Array.from({ length: STRIP_SYMBOL_COUNT }, () =>
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    );
  }

  return {
    getStrip: () => strip,
    getCurrentIndex: () => currentIndex,
    setCurrentIndex: (i: number) => { currentIndex = i; },
    getCurrentSymbol: () => strip[currentIndex],
    setSymbolAt: (index: number, symbol: SymbolKey) => { strip[index] = symbol; },
    getLandIndex: () => (currentIndex + STRIP_SYMBOL_COUNT - 1) % STRIP_SYMBOL_COUNT,
    getStripCount: () => STRIP_SYMBOL_COUNT,
  };
}

export type ReelLogic = ReturnType<typeof useReel>;
