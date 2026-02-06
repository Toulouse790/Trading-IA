/**
 * Authentication Middleware
 * Vérifie l'API key pour les endpoints protégés
 */

import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { UnauthorizedError } from './errorHandler';

/**
 * Middleware d'authentification par API key
 * Utilisé pour protéger les endpoints sensibles (POST, PUT, DELETE)
 *
 * L'API key peut être fournie via:
 * - Header: X-API-Key
 * - Header: Authorization: Bearer <key>
 * - Query param: ?apiKey=<key>
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  // Skip en mode développement si pas de clé configurée
  if (config.isDev && config.apiSecretKey === 'dev-secret-key') {
    return next();
  }

  // Récupérer la clé
  const apiKey =
    req.header('X-API-Key') ||
    req.header('Authorization')?.replace('Bearer ', '') ||
    (req.query.apiKey as string);

  if (!apiKey) {
    throw new UnauthorizedError('API key is required');
  }

  if (apiKey !== config.apiSecretKey) {
    throw new UnauthorizedError('Invalid API key');
  }

  next();
}

/**
 * Middleware optionnel d'authentification
 * Ne bloque pas si pas de clé, mais ajoute l'info à req
 */
export function optionalApiKey(req: Request, res: Response, next: NextFunction): void {
  const apiKey =
    req.header('X-API-Key') ||
    req.header('Authorization')?.replace('Bearer ', '');

  // Ajouter l'info d'authentification à la requête
  (req as any).isAuthenticated = apiKey === config.apiSecretKey;

  next();
}
