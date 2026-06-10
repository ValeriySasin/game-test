import { ApiResponse, HttpError } from './types/common.types';
import { mockRouter } from './mock/mock-router';

// Set USE_MOCK=false in webpack DefinePlugin / .env to switch to real backend
const IS_MOCK  = (process.env['USE_MOCK'] ?? 'true') !== 'false';
const BASE_URL =  process.env['API_BASE_URL'] ?? 'https://api.lucky-reels.com/v1';
const MOCK_DELAY_MS = 500;

async function simulateDelay(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  if (IS_MOCK) {
    await simulateDelay();
    return mockRouter<T>(method, path, body);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = sessionStorage.getItem('auth_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await res.json();

  if (!res.ok) {
    const errBody = json as { message?: string; code?: string };
    throw new HttpError(res.status, errBody.message ?? 'Unknown error', errBody.code);
  }

  return { data: json as T, status: res.status, ok: true };
}

export const httpClient = {
  get:    <T>(path: string)                  => request<T>('GET',    path),
  post:   <T>(path: string, body: unknown)   => request<T>('POST',   path, body),
  put:    <T>(path: string, body: unknown)   => request<T>('PUT',    path, body),
  delete: <T>(path: string)                  => request<T>('DELETE', path),
};
