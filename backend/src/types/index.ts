/**
 * Types et DTOs pour l'API Trading-IA
 */

import { z } from 'zod';

// ===========================================
// ENUMS
// ===========================================

export const TimeframeEnum = z.enum(['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']);
export type Timeframe = z.infer<typeof TimeframeEnum>;

export const SignalDirectionEnum = z.enum(['BUY', 'SELL', 'NO_TRADE']);
export type SignalDirection = z.infer<typeof SignalDirectionEnum>;

export const SignalSourceEnum = z.enum(['ML', 'LLM', 'HYBRID', 'MANUAL', 'RULES']);
export type SignalSource = z.infer<typeof SignalSourceEnum>;

export const TradeDirectionEnum = z.enum(['LONG', 'SHORT']);
export type TradeDirection = z.infer<typeof TradeDirectionEnum>;

export const TradeStatusEnum = z.enum(['OPEN', 'CLOSED', 'CANCELLED']);
export type TradeStatus = z.infer<typeof TradeStatusEnum>;

// ===========================================
// REQUEST DTOs (Validation avec Zod)
// ===========================================

// GET /candles query params
export const GetCandlesQuerySchema = z.object({
  pair: z.string().min(1, 'Pair is required'),
  timeframe: TimeframeEnum.default('H1'),
  limit: z.coerce.number().int().min(1).max(5000).default(100),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});
export type GetCandlesQuery = z.infer<typeof GetCandlesQuerySchema>;

// GET /signals query params
export const GetSignalsQuerySchema = z.object({
  pair: z.string().optional(),
  timeframe: TimeframeEnum.optional(),
  direction: SignalDirectionEnum.optional(),
  source: SignalSourceEnum.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  activeOnly: z.coerce.boolean().default(true),
});
export type GetSignalsQuery = z.infer<typeof GetSignalsQuerySchema>;

// POST /signals body
export const CreateSignalBodySchema = z.object({
  pair: z.string().min(1, 'Pair is required'),
  timeframe: TimeframeEnum,
  direction: SignalDirectionEnum,
  confidence: z.number().min(0).max(1),
  entryPrice: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  riskReward: z.number().positive().optional(),
  reasonSummary: z.string().min(1, 'Reason summary is required'),
  reasonDetails: z.string().optional(),
  source: SignalSourceEnum,
  modelVersion: z.string().optional(),
  modelName: z.string().optional(),
  indicators: z.record(z.any()).optional(),
  expiresAt: z.coerce.date().optional(),
});
export type CreateSignalBody = z.infer<typeof CreateSignalBodySchema>;

// POST /trades body
export const CreateTradeBodySchema = z.object({
  pair: z.string().min(1, 'Pair is required'),
  timeframe: TimeframeEnum.optional(),
  direction: TradeDirectionEnum,
  entryPrice: z.number().positive(),
  takeProfit: z.number().positive().optional(),
  stopLoss: z.number().positive().optional(),
  positionSize: z.number().positive().min(0.01).max(100),
  leverage: z.number().positive().default(1),
  signalId: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateTradeBody = z.infer<typeof CreateTradeBodySchema>;

// PATCH /trades/:id/close body
export const CloseTradeBodySchema = z.object({
  exitPrice: z.number().positive(),
  closeReason: z.string().optional(),
  notes: z.string().optional(),
});
export type CloseTradeBody = z.infer<typeof CloseTradeBodySchema>;

// POST /candles/batch body (pour N8N)
export const BatchCandlesBodySchema = z.object({
  pair: z.string().min(1),
  timeframe: TimeframeEnum,
  candles: z.array(z.object({
    timestamp: z.coerce.date(),
    open: z.number(),
    high: z.number(),
    low: z.number(),
    close: z.number(),
    volume: z.number().default(0),
  })),
});
export type BatchCandlesBody = z.infer<typeof BatchCandlesBodySchema>;

// ===========================================
// RESPONSE DTOs
// ===========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp?: string;
  };
}

export interface PairResponse {
  id: string;
  symbol: string;
  displayName: string;
  description: string | null;
  baseCurrency: string;
  quoteCurrency: string;
  pipValue: number;
  spreadPips: number;
  isActive: boolean;
  isMajor: boolean;
}

export interface CandleResponse {
  id: string;
  pair: string;
  timeframe: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SignalResponse {
  id: string;
  pair: string;
  pairDisplayName: string;
  timeframe: string;
  timestamp: string;
  direction: SignalDirection;
  confidence: number;
  entryPrice: number | null;
  takeProfit: number | null;
  stopLoss: number | null;
  riskReward: number | null;
  reasonSummary: string;
  source: SignalSource;
  modelVersion: string | null;
  isActive: boolean;
  indicators: Record<string, unknown> | null;
}

export interface TradeResponse {
  id: string;
  pair: string;
  pairDisplayName: string;
  timeframe: string | null;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number | null;
  takeProfit: number | null;
  stopLoss: number | null;
  positionSize: number;
  leverage: number;
  openedAt: string;
  closedAt: string | null;
  pnl: number | null;
  pnlPips: number | null;
  pnlPercent: number | null;
  status: TradeStatus;
  closeReason: string | null;
  signalId: string | null;
}

export interface ModelResponse {
  id: string;
  name: string;
  version: string;
  type: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  metrics: Record<string, unknown> | null;
  trainedAt: string | null;
}

// ===========================================
// UTILITY TYPES
// ===========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}
