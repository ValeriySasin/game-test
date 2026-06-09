import { ApiResponse } from '../types/common.types';
import {
  PlayerProfile,
  PlayerSettings,
  UpdateBalanceRequest,
  UpdateBalanceResponse,
  UpdateSettingsRequest,
} from '../types/player.types';

const profile: PlayerProfile = {
  id: 'player-001',
  username: 'Player1',
  balance: 1000,
  level: 3,
  totalSpins: 42,
  totalWins: 11,
};

let settings: PlayerSettings = {
  soundEnabled: true,
  language: 'en',
};

export const playerMock = {
  'GET /player/profile': (): ApiResponse<PlayerProfile> => ({
    ok: true,
    status: 200,
    data: { ...profile },
  }),

  'PUT /player/balance': (body: UpdateBalanceRequest): ApiResponse<UpdateBalanceResponse> => {
    profile.balance = body.amount;
    return {
      ok: true,
      status: 200,
      data: { balance: profile.balance },
    };
  },

  'GET /player/settings': (): ApiResponse<PlayerSettings> => ({
    ok: true,
    status: 200,
    data: { ...settings },
  }),

  'PUT /player/settings': (body: UpdateSettingsRequest): ApiResponse<PlayerSettings> => {
    settings = { ...settings, ...body };
    return {
      ok: true,
      status: 200,
      data: { ...settings },
    };
  },
};
