import { ApiResponse } from '@/api/types/common.types';
import { playerMock } from './player.mock';
import { gameMock } from './game.mock';

// Each concrete handler accepts a typed body; the registry uses unknown
// so spread of typed handler maps is compatible. The cast in mockRouter<T>
// narrows back to the expected response type at the call site.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MockHandler = (body?: any) => ApiResponse<unknown>;

const handlers: Record<string, MockHandler> = {
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
