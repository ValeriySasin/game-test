export interface PlayerProfile {
  id: string;
  username: string;
  balance: number;
  level: number;
  totalSpins: number;
  totalWins: number;
}

export interface PlayerSettings {
  soundEnabled: boolean;
  language: string;
}

export interface UpdateBalanceRequest {
  amount: number;
}

export interface UpdateBalanceResponse {
  balance: number;
}

export interface UpdateSettingsRequest {
  soundEnabled?: boolean;
  language?: string;
}
