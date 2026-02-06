/**
 * Composant Calendrier Économique
 * Affiche les événements économiques importants pour EUR/USD
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import {
  fetchEconomicCalendar,
  getTodayEvents,
  getHighImpactEventsNext24h,
  isHighRiskPeriod,
  EconomicEvent,
} from '../services/realtime/economicCalendar';

interface EconomicCalendarProps {
  compact?: boolean;
  maxEvents?: number;
  onEventClick?: (event: EconomicEvent) => void;
}

const EconomicCalendar: React.FC<EconomicCalendarProps> = ({
  compact = false,
  maxEvents = 10,
  onEventClick,
}) => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [riskStatus, setRiskStatus] = useState<{ isHighRisk: boolean; reason?: string }>({ isHighRisk: false });
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
    checkRisk();

    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(() => {
      loadEvents();
      checkRisk();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [filter]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      let data: EconomicEvent[];

      switch (filter) {
        case 'today':
          data = await getTodayEvents();
          break;
        case 'high':
          data = await getHighImpactEventsNext24h();
          break;
        default:
          data = await fetchEconomicCalendar();
      }

      setEvents(data.slice(0, maxEvents));
    } catch (error) {
      console.error('Erreur chargement calendrier:', error);
    }
    setIsLoading(false);
  };

  const checkRisk = async () => {
    const status = await isHighRiskPeriod();
    setRiskStatus(status);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      GBP: '🇬🇧',
      JPY: '🇯🇵',
      CHF: '🇨🇭',
      CAD: '🇨🇦',
      AUD: '🇦🇺',
      NZD: '🇳🇿',
    };
    return flags[country] || '🏳️';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Demain';
    }
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const isEventPast = (date: Date) => {
    return date < new Date();
  };

  if (compact) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Calendrier
          </h4>
          {riskStatus.isHighRisk && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Risque
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {events.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`flex items-center gap-2 text-sm ${
                  isEventPast(event.date) ? 'opacity-50' : ''
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  event.impact === 'high' ? 'bg-red-500' :
                  event.impact === 'medium' ? 'bg-amber-500' : 'bg-gray-500'
                }`} />
                <span>{getCountryFlag(event.country)}</span>
                <span className="text-gray-400 text-xs">{formatTime(event.date)}</span>
                <span className="text-white truncate flex-1">{event.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            Calendrier Économique
          </h3>

          <button
            onClick={loadEvents}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Alerte risque */}
        {riskStatus.isHighRisk && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-medium">Période de risque élevé</p>
              <p className="text-red-400/70 text-sm">{riskStatus.reason}</p>
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="flex gap-2">
          {(['all', 'today', 'high'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {f === 'all' ? 'Cette semaine' : f === 'today' ? "Aujourd'hui" : 'Fort impact'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des événements */}
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun événement</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {events.map((event) => {
              const isPast = isEventPast(event.date);
              const isExpanded = expandedEvent === event.id;

              return (
                <div
                  key={event.id}
                  className={`p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    isPast ? 'opacity-60' : ''
                  }`}
                  onClick={() => {
                    setExpandedEvent(isExpanded ? null : event.id);
                    onEventClick?.(event);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Date/Heure */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-gray-500">{formatDate(event.date)}</p>
                      <p className="text-sm font-mono text-white">{formatTime(event.date)}</p>
                    </div>

                    {/* Pays */}
                    <div className="text-2xl">{getCountryFlag(event.country)}</div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getImpactColor(event.impact)}`}>
                          {event.impact === 'high' ? 'Fort' : event.impact === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                        <span className="text-xs text-gray-500">{event.currency}</span>
                      </div>
                      <h4 className="text-white font-medium truncate">{event.title}</h4>

                      {/* Valeurs */}
                      {(event.forecast || event.previous || event.actual) && (
                        <div className="flex gap-4 mt-2 text-sm">
                          {event.actual && (
                            <div>
                              <span className="text-gray-500">Actuel: </span>
                              <span className="text-emerald-400 font-medium">{event.actual}</span>
                            </div>
                          )}
                          {event.forecast && (
                            <div>
                              <span className="text-gray-500">Prévu: </span>
                              <span className="text-white">{event.forecast}</span>
                            </div>
                          )}
                          {event.previous && (
                            <div>
                              <span className="text-gray-500">Précédent: </span>
                              <span className="text-gray-400">{event.previous}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description (expanded) */}
                      {isExpanded && event.description && (
                        <p className="mt-2 text-sm text-gray-400 bg-gray-800/50 rounded-lg p-3">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Expand indicator */}
                    <div className="text-gray-500">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 bg-gray-900/30">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{events.length} événements</span>
          <span>Données Forex Factory</span>
        </div>
      </div>
    </div>
  );
};

export default EconomicCalendar;
