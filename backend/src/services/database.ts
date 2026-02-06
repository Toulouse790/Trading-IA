/**
 * Database Service
 * Singleton pour le client Prisma avec configuration optimisée
 */

import { PrismaClient } from '@prisma/client';
import config from '../config';

// Extension du type global pour le singleton
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Créer le client avec logging approprié
const createPrismaClient = (): PrismaClient => {
  return new PrismaClient({
    log: config.isDev
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: config.isDev ? 'pretty' : 'minimal',
  });
};

// Singleton pattern pour éviter les connexions multiples en dev (hot reload)
export const prisma = global.__prisma || createPrismaClient();

if (config.isDev) {
  global.__prisma = prisma;
}

// Fonction pour vérifier la connexion
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Fonction pour fermer proprement la connexion
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export default prisma;
