import { httpClient } from './http-client';
import { GameConfig, SpinRequest, SpinResponse, SpinHistory } from './types/game.types';

export const gameApi = {
  getConfig: () =>
    httpClient.get<GameConfig>('/game/config'),

  spin: (body: SpinRequest) =>
    httpClient.post<SpinResponse>('/game/spin', body),

  getHistory: () =>
    httpClient.get<SpinHistory>('/game/history'),
};
