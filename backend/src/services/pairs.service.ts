/**
 * Forex Pairs Service
 * Gestion des paires de devises
 */

import { prisma } from './database';
import type { PairResponse } from '../types';

/**
 * Récupère toutes les paires actives
 */
export async function getAllPairs(activeOnly: boolean = true): Promise<PairResponse[]> {
  const pairs = await prisma.forexPair.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [
      { isMajor: 'desc' },
      { symbol: 'asc' },
    ],
  });

  return pairs.map(formatPairResponse);
}

/**
 * Récupère une paire par son symbole
 */
export async function getPairBySymbol(symbol: string): Promise<PairResponse | null> {
  const pair = await prisma.forexPair.findUnique({
    where: { symbol: symbol.toUpperCase().replace('/', '') },
  });

  return pair ? formatPairResponse(pair) : null;
}

/**
 * Récupère une paire par son ID
 */
export async function getPairById(id: string): Promise<PairResponse | null> {
  const pair = await prisma.forexPair.findUnique({
    where: { id },
  });

  return pair ? formatPairResponse(pair) : null;
}

/**
 * Récupère l'ID d'une paire par son symbole
 */
export async function getPairIdBySymbol(symbol: string): Promise<string | null> {
  const pair = await prisma.forexPair.findUnique({
    where: { symbol: symbol.toUpperCase().replace('/', '') },
    select: { id: true },
  });

  return pair?.id || null;
}

/**
 * Formate la réponse d'une paire
 */
function formatPairResponse(pair: {
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
}): PairResponse {
  return {
    id: pair.id,
    symbol: pair.symbol,
    displayName: pair.displayName,
    description: pair.description,
    baseCurrency: pair.baseCurrency,
    quoteCurrency: pair.quoteCurrency,
    pipValue: pair.pipValue,
    spreadPips: pair.spreadPips,
    isActive: pair.isActive,
    isMajor: pair.isMajor,
  };
}
