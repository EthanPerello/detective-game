import { Account, RpcProvider } from 'starknet';

export interface DojoProvider {
  provider: RpcProvider;
  account: Account;
  worldAddress: string;
  actions: {
    start_game(): Promise<number>;
    make_accusation(gameId: string, characterId: number): Promise<boolean>;
  };
}

export interface GameState {
  gameId: string;
  player: string;
  status: 'Active' | 'Won' | 'Lost';
  accusationUsed: boolean;
  accusedCharacter: number;
  startedAt: number;
}

export interface PlayerState {
  playerAddress: string;
  gamesWon: number;
  gamesPlayed: number;
  currentGameId: string;
}

export interface AccusationState {
  gameId: string;
  accusedCharacterId: number;
  isCorrect: boolean;
  timestamp: number;
}

// Character data interface
export interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
  gender: 'male' | 'female';
}

// Game case interface
export interface GameCase {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  attempts: number;
  completions: number;
  successRate: number;
  playerCompleted: boolean;
  playerAttempts: number;
}

// Chat message interface
export interface ChatMessage {
  type: 'player' | 'character';
  message: string;
  timestamp: Date;
}

// Game result interface
export interface GameResult {
  won: boolean;
  accusedCharacter: number;
  characterName: string;
}

// Blockchain transaction result
export interface TransactionResult {
  transaction_hash: string;
  success: boolean;
  error?: string;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GameStartResponse {
  gameId: string;
  totalAttempts: number;
  blockchainTxHash?: string;
}

export interface AccusationResponse {
  isCorrect: boolean;
  totalCompletions: number;
  playerRanking: number;
  correctAnswer?: number;
  blockchainTxHash?: string;
}

export interface RankingResponse {
  totalCompletions: number;
  playerRanking: number;
  hasCompleted: boolean;
}

export interface ChatResponse {
  response: string;
  characterId: number;
}