/**
 * Service WebSocket pour prix temps réel
 * Utilise Finnhub WebSocket ou polling Twelve Data en fallback
 */

import { getAPIConfig } from '../../config/apiConfig';
import { generateRealtimePrice } from '../forexService';

export interface PriceUpdate {
  symbol: string;
  bid: number;
  ask: number;
  price: number;
  spread: number;
  timestamp: Date;
  source: 'finnhub' | 'twelvedata' | 'simulated';
}

type PriceCallback = (price: PriceUpdate) => void;

class PriceWebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: Map<string, Set<PriceCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000;
  private pollingInterval: NodeJS.Timeout | null = null;
  private subscribedSymbols: Set<string> = new Set();
  private isConnected = false;
  private lastPrices: Map<string, PriceUpdate> = new Map();

  /**
   * Initialise la connexion WebSocket
   */
  connect(): void {
    const config = getAPIConfig();

    if (config.finnhub.apiKey) {
      this.connectFinnhub(config.finnhub.apiKey);
    } else {
      console.log('[WebSocket] Pas de clé Finnhub, utilisation du polling simulé');
      this.startPolling();
    }
  }

  private connectFinnhub(apiKey: string): void {
    try {
      const wsUrl = `wss://ws.finnhub.io?token=${apiKey}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connecté à Finnhub');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Resubscribe aux symboles
        this.subscribedSymbols.forEach((symbol) => {
          this.sendSubscribe(symbol);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'trade' && data.data) {
            data.data.forEach((trade: any) => {
              const symbol = this.convertFinnhubSymbol(trade.s);
              const price = trade.p;
              const spread = 0.00015; // Spread estimé

              const update: PriceUpdate = {
                symbol,
                bid: price - spread / 2,
                ask: price + spread / 2,
                price,
                spread,
                timestamp: new Date(trade.t),
                source: 'finnhub',
              };

              this.lastPrices.set(symbol, update);
              this.notifyCallbacks(symbol, update);
            });
          }
        } catch (e) {
          console.error('[WebSocket] Erreur parsing:', e);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Erreur:', error);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Déconnecté');
        this.isConnected = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[WebSocket] Erreur connexion:', error);
      this.startPolling();
    }
  }

  private convertFinnhubSymbol(finnhubSymbol: string): string {
    // Convertir OANDA:EUR_USD vers EUR/USD
    if (finnhubSymbol.includes(':')) {
      const [, pair] = finnhubSymbol.split(':');
      return pair.replace('_', '/');
    }
    return finnhubSymbol;
  }

  private convertToFinnhubSymbol(symbol: string): string {
    // Convertir EUR/USD vers OANDA:EUR_USD
    return `OANDA:${symbol.replace('/', '_')}`;
  }

  private sendSubscribe(symbol: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const finnhubSymbol = this.convertToFinnhubSymbol(symbol);
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol: finnhubSymbol }));
      console.log(`[WebSocket] Subscribed to ${finnhubSymbol}`);
    }
  }

  private sendUnsubscribe(symbol: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const finnhubSymbol = this.convertToFinnhubSymbol(symbol);
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol: finnhubSymbol }));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      setTimeout(() => {
        const config = getAPIConfig();
        if (config.finnhub.apiKey) {
          this.connectFinnhub(config.finnhub.apiKey);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('[WebSocket] Max reconnexions atteint, passage au polling');
      this.startPolling();
    }
  }

  /**
   * Démarre le polling pour les données simulées
   */
  private startPolling(): void {
    if (this.pollingInterval) return;

    this.pollingInterval = setInterval(() => {
      this.subscribedSymbols.forEach((symbol) => {
        const simulated = generateRealtimePrice();
        const update: PriceUpdate = {
          symbol,
          bid: simulated.bid,
          ask: simulated.ask,
          price: (simulated.bid + simulated.ask) / 2,
          spread: simulated.spread,
          timestamp: new Date(),
          source: 'simulated',
        };

        this.lastPrices.set(symbol, update);
        this.notifyCallbacks(symbol, update);
      });
    }, 1000);
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private notifyCallbacks(symbol: string, update: PriceUpdate): void {
    const callbacks = this.callbacks.get(symbol);
    if (callbacks) {
      callbacks.forEach((callback) => callback(update));
    }

    // Notifier aussi les callbacks génériques (*)
    const allCallbacks = this.callbacks.get('*');
    if (allCallbacks) {
      allCallbacks.forEach((callback) => callback(update));
    }
  }

  /**
   * S'abonne aux mises à jour de prix pour un symbole
   */
  subscribe(symbol: string, callback: PriceCallback): () => void {
    this.subscribedSymbols.add(symbol);

    if (!this.callbacks.has(symbol)) {
      this.callbacks.set(symbol, new Set());
    }
    this.callbacks.get(symbol)!.add(callback);

    // Si connecté, envoyer la subscription
    if (this.isConnected) {
      this.sendSubscribe(symbol);
    }

    // Envoyer le dernier prix connu immédiatement
    const lastPrice = this.lastPrices.get(symbol);
    if (lastPrice) {
      callback(lastPrice);
    }

    // Retourner une fonction de désinscription
    return () => {
      const callbacks = this.callbacks.get(symbol);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.callbacks.delete(symbol);
          this.subscribedSymbols.delete(symbol);
          this.sendUnsubscribe(symbol);
        }
      }
    };
  }

  /**
   * Récupère le dernier prix connu
   */
  getLastPrice(symbol: string): PriceUpdate | null {
    return this.lastPrices.get(symbol) || null;
  }

  /**
   * Vérifie si le WebSocket est connecté
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Récupère la source de données actuelle
   */
  getDataSource(): 'finnhub' | 'simulated' {
    return this.isConnected ? 'finnhub' : 'simulated';
  }

  /**
   * Déconnecte et nettoie
   */
  disconnect(): void {
    this.stopPolling();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.callbacks.clear();
    this.subscribedSymbols.clear();
    this.lastPrices.clear();
    this.isConnected = false;
  }
}

// Singleton
export const priceWebSocket = new PriceWebSocketService();

/**
 * Hook React pour utiliser le prix en temps réel
 */
export function useLivePrice(symbol: string = 'EUR/USD'): PriceUpdate | null {
  // Ce hook sera utilisé dans les composants React
  // L'implémentation complète nécessite useState/useEffect
  return priceWebSocket.getLastPrice(symbol);
}

export default priceWebSocket;
