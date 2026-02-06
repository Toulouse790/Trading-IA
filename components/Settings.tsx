/**
 * Composant Paramètres - Configuration des APIs et préférences
 */

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Info,
  Shield,
  Zap,
} from 'lucide-react';
import {
  getAPIConfig,
  getAPIStatus,
  saveApiKey,
  removeApiKey,
  APIStatus,
} from '../config/apiConfig';

interface SettingsProps {
  onClose?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState('');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [savedKeys, setSavedKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    refreshStatus();
    loadSavedKeys();
  }, []);

  const refreshStatus = () => {
    setApiStatuses(getAPIStatus());
  };

  const loadSavedKeys = () => {
    const keys: Record<string, string> = {};
    ['twelve_data_api_key', 'finnhub_api_key', 'alpha_vantage_api_key', 'gemini_api_key'].forEach((key) => {
      const value = localStorage.getItem(`trading_ia_${key}`);
      if (value) keys[key] = value;
    });
    setSavedKeys(keys);
  };

  const handleSaveKey = (apiKey: string) => {
    if (keyValue.trim()) {
      saveApiKey(apiKey, keyValue.trim());
      setEditingKey(null);
      setKeyValue('');
      refreshStatus();
      loadSavedKeys();
    }
  };

  const handleRemoveKey = (apiKey: string) => {
    removeApiKey(apiKey);
    refreshStatus();
    loadSavedKeys();
  };

  const toggleShowKey = (key: string) => {
    setShowKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  const apiDocs: Record<string, { url: string; description: string }> = {
    twelve_data_api_key: {
      url: 'https://twelvedata.com/account/api-keys',
      description: 'Données historiques et temps réel Forex. Gratuit: 800 req/jour.',
    },
    finnhub_api_key: {
      url: 'https://finnhub.io/dashboard',
      description: 'News financières et WebSocket. Gratuit: 60 req/min.',
    },
    alpha_vantage_api_key: {
      url: 'https://www.alphavantage.co/support/#api-key',
      description: 'Indicateurs techniques pré-calculés. Gratuit: 5 req/min.',
    },
    gemini_api_key: {
      url: 'https://aistudio.google.com/app/apikey',
      description: 'Analyse IA et génération de signaux. Gratuit avec quota.',
    },
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-gray-400" />
            Paramètres
          </h1>
          <p className="text-gray-400 mt-1">
            Configurez vos clés API pour accéder aux données réelles
          </p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-200 font-medium">Mode sans API</p>
          <p className="text-blue-200/70 text-sm mt-1">
            L'application fonctionne avec des données simulées. Ajoutez vos clés API pour accéder aux données réelles en temps réel.
          </p>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Clés API
          </h3>
        </div>

        <div className="divide-y divide-gray-800">
          {apiStatuses.map((api) => (
            <div key={api.key} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    api.configured
                      ? 'bg-emerald-500/20'
                      : api.required
                      ? 'bg-red-500/20'
                      : 'bg-gray-500/20'
                  }`}>
                    {api.configured ? (
                      <Check className="w-5 h-5 text-emerald-400" />
                    ) : api.required ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Key className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{api.name}</h4>
                      {api.required && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                          Requis
                        </span>
                      )}
                      {api.configured && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                          Configuré
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{api.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Limite: {api.freeLimit}</p>
                  </div>
                </div>

                <a
                  href={apiDocs[api.key]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Obtenir <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Clé actuelle ou formulaire */}
              <div className="mt-4 pl-13">
                {editingKey === api.key ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={keyValue}
                      onChange={(e) => setKeyValue(e.target.value)}
                      placeholder={`Entrez votre clé ${api.name}`}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none font-mono text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveKey(api.key)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => {
                        setEditingKey(null);
                        setKeyValue('');
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                ) : api.configured && savedKeys[api.key] ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2 bg-gray-800/50 rounded-lg font-mono text-sm text-gray-400">
                      {showKey[api.key] ? savedKeys[api.key] : maskKey(savedKeys[api.key])}
                    </div>
                    <button
                      onClick={() => toggleShowKey(api.key)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                    >
                      {showKey[api.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingKey(api.key);
                        setKeyValue(savedKeys[api.key]);
                      }}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveKey(api.key)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingKey(api.key)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                  >
                    Ajouter une clé API
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-emerald-400" />
          Sécurité
        </h3>

        <div className="space-y-4 text-sm text-gray-400">
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>Vos clés API sont stockées localement dans votre navigateur (localStorage)</p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>Aucune donnée n'est envoyée à nos serveurs</p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>Les appels API sont effectués directement depuis votre navigateur</p>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>Ne partagez jamais vos clés API. Effacez-les si vous utilisez un ordinateur partagé.</p>
          </div>
        </div>
      </div>

      {/* Statut des APIs */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Statut des connexions
          </h3>
          <button
            onClick={refreshStatus}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {apiStatuses.map((api) => (
            <div
              key={api.key}
              className={`p-4 rounded-xl text-center ${
                api.configured
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                api.configured ? 'bg-emerald-500' : 'bg-gray-500'
              }`} />
              <p className="text-sm font-medium text-white">{api.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {api.configured ? 'Connecté' : 'Non configuré'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
