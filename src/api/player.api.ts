import { httpClient } from './http-client';
import {
  PlayerProfile,
  PlayerSettings,
  UpdateBalanceRequest,
  UpdateBalanceResponse,
  UpdateSettingsRequest,
} from './types/player.types';

export const playerApi = {
  getProfile: () =>
    httpClient.get<PlayerProfile>('/player/profile'),

  updateBalance: (body: UpdateBalanceRequest) =>
    httpClient.put<UpdateBalanceResponse>('/player/balance', body),

  getSettings: () =>
    httpClient.get<PlayerSettings>('/player/settings'),

  updateSettings: (body: UpdateSettingsRequest) =>
    httpClient.put<PlayerSettings>('/player/settings', body),
};
