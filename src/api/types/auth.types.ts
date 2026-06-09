export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  sessionId: string;
  expiresAt: number; // unix timestamp
}

export interface SessionResponse {
  sessionId: string;
  username: string;
  expiresAt: number;
}
