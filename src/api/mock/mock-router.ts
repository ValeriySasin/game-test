import { ApiResponse } from '../types/common.types';
import { authMock } from './auth.mock';
import { playerMock } from './player.mock';
import { gameMock } from './game.mock';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockHandler = (body?: any) => ApiResponse<unknown>;

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
    throw new Error(`[Mock] No handler for: ${key}`);
  }

  return handler(body) as ApiResponse<T>;
}
