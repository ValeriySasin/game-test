import { ApiResponse } from '../types/common.types';
import { LoginRequest, LoginResponse, SessionResponse } from '../types/auth.types';

const SESSION_ID = 'mock-session-' + Math.random().toString(36).slice(2);

export const authMock = {
  'POST /auth/login': (body: LoginRequest): ApiResponse<LoginResponse> => ({
    ok: true,
    status: 200,
    data: {
      token: 'mock-token-' + Math.random().toString(36).slice(2),
      sessionId: SESSION_ID,
      expiresAt: Date.now() + 3600_000,
    },
  }),

  'POST /auth/logout': (): ApiResponse<{}> => ({
    ok: true,
    status: 200,
    data: {},
  }),

  'GET /auth/session': (): ApiResponse<SessionResponse> => ({
    ok: true,
    status: 200,
    data: {
      sessionId: SESSION_ID,
      username: 'Player1',
      expiresAt: Date.now() + 3600_000,
    },
  }),
};
