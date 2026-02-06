# Trading-IA Backend

API REST pour la plateforme de trading Forex avec IA.

## 📋 Table des matières

- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration Supabase](#-configuration-supabase)
- [Démarrage](#-démarrage)
- [Endpoints API](#-endpoints-api)
- [Intégration N8N](#-intégration-n8n)
- [Structure du projet](#-structure-du-projet)

## 🛠 Stack technique

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Validation**: Zod

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase (ou PostgreSQL local)

### Installation des dépendances

```bash
cd backend
npm install
```

## ⚙️ Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez le **Project Reference** (visible dans l'URL: `https://supabase.com/dashboard/project/[PROJECT-REF]`)

### 2. Récupérer l'URL de connexion

1. Dans votre projet Supabase, allez dans **Settings** > **Database**
2. Scrollez jusqu'à **Connection string**
3. Copiez l'**URI** (pas le pooler pour le développement)

Format de l'URL:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Configurer le fichier .env

```bash
# Copier le template
cp .env.example .env

# Éditer .env avec votre URL
```

Exemple de `.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# Database Supabase
DATABASE_URL="postgresql://postgres:VotreMotDePasse@db.abcdefghijk.supabase.co:5432/postgres?schema=public"

# API Key pour N8N et appels internes
API_SECRET_KEY="votre-cle-secrete-pour-n8n"

# CORS (URLs du frontend)
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# (Optionnel) Peupler avec des données de test
npm run db:seed
```

## 🏃 Démarrage

### Mode développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3001`

### Mode production

```bash
npm run build
npm start
```

## 📚 Endpoints API

### Health Check

```bash
GET /api/health
```

Réponse:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "database": "connected",
    "uptime": 3600
  }
}
```

### Paires Forex

```bash
# Liste toutes les paires actives
GET /api/pairs

# Détails d'une paire
GET /api/pairs/EURUSD
```

### Candles (OHLCV)

```bash
# Récupérer les bougies
GET /api/candles?pair=EURUSD&timeframe=H1&limit=100

# Dernière bougie
GET /api/candles/latest?pair=EURUSD&timeframe=H1

# Statistiques
GET /api/candles/stats

# Insérer des bougies (N8N) - Requiert API key
POST /api/candles/batch
X-API-Key: votre-cle-api
Content-Type: application/json

{
  "pair": "EURUSD",
  "timeframe": "H1",
  "candles": [
    {
      "timestamp": "2024-01-15T10:00:00.000Z",
      "open": 1.0850,
      "high": 1.0865,
      "low": 1.0845,
      "close": 1.0860,
      "volume": 5000
    }
  ]
}
```

### Signaux de Trading

```bash
# Liste des signaux
GET /api/signals?pair=EURUSD&timeframe=H1&activeOnly=true&limit=20

# Détails d'un signal
GET /api/signals/:id

# Statistiques
GET /api/signals/stats

# Créer un signal (N8N/ML) - Requiert API key
POST /api/signals
X-API-Key: votre-cle-api
Content-Type: application/json

{
  "pair": "EURUSD",
  "timeframe": "H1",
  "direction": "BUY",
  "confidence": 0.85,
  "entryPrice": 1.0850,
  "takeProfit": 1.0900,
  "stopLoss": 1.0820,
  "riskReward": 1.67,
  "reasonSummary": "RSI oversold + MACD bullish crossover",
  "source": "ML",
  "modelVersion": "1.0.0",
  "indicators": {
    "rsi": 28,
    "macd": { "value": 0.0012, "signal": 0.0008 }
  }
}
```

### Trades

```bash
# Liste des trades
GET /api/trades?status=OPEN

# Trades ouverts
GET /api/trades/open

# Statistiques
GET /api/trades/stats

# Créer un trade - Requiert API key
POST /api/trades
X-API-Key: votre-cle-api
Content-Type: application/json

{
  "pair": "EURUSD",
  "direction": "LONG",
  "entryPrice": 1.0850,
  "takeProfit": 1.0900,
  "stopLoss": 1.0820,
  "positionSize": 0.1,
  "signalId": "clx123..." // optionnel
}

# Fermer un trade - Requiert API key
PATCH /api/trades/:id/close
X-API-Key: votre-cle-api
Content-Type: application/json

{
  "exitPrice": 1.0875,
  "closeReason": "TP"
}
```

## 🔄 Intégration N8N

### Configuration dans N8N

1. **HTTP Request Node** pour appeler l'API
2. Ajouter le header `X-API-Key` avec votre clé

### Exemple: Workflow de génération de signaux

```
┌─────────────────┐
│   Cron Trigger  │ (toutes les heures)
│   0 * * * *     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │ GET https://api.twelve-data.com/time_series
│  Fetch Candles  │ ?symbol=EUR/USD&interval=1h&outputsize=100
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Function Node  │ Transformer les données
│  Transform Data │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │ POST /api/candles/batch
│  Store Candles  │ X-API-Key: xxx
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Function Node  │ Calculer indicateurs + ML
│  Analyze Data   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Request   │ POST /api/signals
│  Create Signal  │ X-API-Key: xxx
└─────────────────┘
```

### Payload exemple pour POST /signals (depuis N8N)

```javascript
// Dans un Function node N8N
const signal = {
  pair: "EURUSD",
  timeframe: "H1",
  direction: rsi < 30 ? "BUY" : rsi > 70 ? "SELL" : "NO_TRADE",
  confidence: Math.abs(50 - rsi) / 50,
  entryPrice: currentPrice,
  takeProfit: direction === "BUY" ? currentPrice * 1.005 : currentPrice * 0.995,
  stopLoss: direction === "BUY" ? currentPrice * 0.997 : currentPrice * 1.003,
  reasonSummary: `RSI ${rsi.toFixed(0)} - ${direction === "BUY" ? "Oversold" : "Overbought"}`,
  source: "RULES",
  modelVersion: "n8n-v1"
};

return [{ json: signal }];
```

### Workflow de mise à jour quotidienne

```
Trigger: Cron 00:05 UTC

1. Fetch historical data from Twelve Data
2. Store in database via POST /api/candles/batch
3. Run ML analysis (Python script ou API externe)
4. Create signals via POST /api/signals
5. Check open trades via GET /api/trades/open
6. Close expired trades via PATCH /api/trades/:id/close
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── index.ts              # Point d'entrée
│   ├── config/
│   │   └── index.ts          # Configuration (env vars)
│   ├── routes/
│   │   └── index.ts          # Définition des routes
│   ├── controllers/
│   │   ├── health.controller.ts
│   │   ├── pairs.controller.ts
│   │   ├── candles.controller.ts
│   │   ├── signals.controller.ts
│   │   └── trades.controller.ts
│   ├── services/
│   │   ├── database.ts       # Client Prisma
│   │   ├── pairs.service.ts
│   │   ├── candles.service.ts
│   │   ├── signals.service.ts
│   │   └── trades.service.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts   # Gestion des erreurs
│   │   ├── auth.ts           # Authentification API key
│   │   └── validate.ts       # Validation Zod
│   └── types/
│       └── index.ts          # Types et DTOs
├── prisma/
│   ├── schema.prisma         # Schéma de la base de données
│   └── seed.ts               # Données initiales
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🧪 Tester l'API

### Avec curl

```bash
# Health check
curl http://localhost:3001/api/health

# Liste des paires
curl http://localhost:3001/api/pairs

# Créer un signal (avec API key)
curl -X POST http://localhost:3001/api/signals \
  -H "Content-Type: application/json" \
  -H "X-API-Key: votre-cle-api" \
  -d '{
    "pair": "EURUSD",
    "timeframe": "H1",
    "direction": "BUY",
    "confidence": 0.85,
    "reasonSummary": "Test signal",
    "source": "MANUAL"
  }'
```

### Avec Prisma Studio

```bash
npm run db:studio
```

Ouvre une interface web pour explorer la base de données.

## 📝 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarre en mode développement (hot reload) |
| `npm run build` | Compile TypeScript |
| `npm start` | Démarre la version compilée |
| `npm run db:generate` | Génère le client Prisma |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed` | Peuple la base avec des données de test |
| `npm run db:studio` | Interface visuelle Prisma |

## 🔐 Sécurité

- Les endpoints de modification (POST, PATCH, DELETE) requièrent une API key
- Rate limiting: 100 requêtes/minute par IP
- Helmet pour les headers de sécurité
- CORS configuré pour les origines autorisées

## 📄 License

MIT
