import { ApiResponse } from '@/api/types/common.types';
import { PlayerProfile } from '@/api/types/player.types';

// Single source of truth for mock balance — shared with game.mock.ts
export const mockState = {
  balance: 1000,
};

const profile: PlayerProfile = {
  id: 'player-001',
  username: 'Player1',
  balance: mockState.balance,
  level: 3,
  totalSpins: 42,
  totalWins: 11,
};

export const playerMock = {
  'GET /player/profile': (): ApiResponse<PlayerProfile> => ({
    ok: true,
    status: 200,
    data: { ...profile, balance: mockState.balance },
  }),
};
