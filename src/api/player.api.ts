import { httpClient } from './http-client';
import { PlayerProfile } from './types/player.types';

export const playerApi = {
  getProfile: () =>
    httpClient.get<PlayerProfile>('/player/profile'),
};
