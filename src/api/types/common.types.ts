export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
  message?: string;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
