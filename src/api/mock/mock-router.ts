import { ApiResponse } from '../types/common.types';
import { authMock } from './auth.mock';
import { playerMock } from './player.mock';
import { gameMock } from './game.mock';

type MockHandler = (body?: any) => ApiResponse<any>;

const handlers: Record<string, MockHandler> = {
  ...authMock,
  ...playerMock,
  ...gameMock,
};

export function mockRouter<T>(
  method: string,
  path: string,
  body?: unknown,
): ApiResponse<T> {
  const key = `${method} ${path}`;
  const handler = handlers[key];

  if (!handler) {
    throw {
      status: 404,
      message: `[Mock] No handler for: ${key}`,
      code: 'MOCK_NOT_FOUND',
    };
  }

  return handler(body) as ApiResponse<T>;
}
