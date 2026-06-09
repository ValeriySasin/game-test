import { httpClient } from './http-client';
import { LoginRequest, LoginResponse, SessionResponse } from './types/auth.types';

export const authApi = {
  login: (body: LoginRequest) =>
    httpClient.post<LoginResponse>('/auth/login', body),

  logout: () =>
    httpClient.post<Record<string, never>>('/auth/logout', {}),

  getSession: () =>
    httpClient.get<SessionResponse>('/auth/session'),
};
