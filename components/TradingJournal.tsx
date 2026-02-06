/**
 * Trading Journal UI Component
 * Track trades with notes, emotions, and analytics
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  Star,
  MessageSquare,
  BarChart3,
  Download,
  Upload,
  Trash2,
  Edit,
  X,
  ChevronDown,
} from 'lucide-react';
import { TimeFrame } from '../types';
import {
  JournalEntry,
  JournalStats,
  EmotionLevel,
  getAllJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getJournalStats,
  getStrategies,
  getTags,
  exportJournal,
  importJournal,
} from '../services/tradingJournal';

const EMOTION_OPTIONS: { value: EmotionLevel; label: string; emoji: string }[] = [
  { value: 'very_negative', label: 'Tres negatif', emoji: '😰' },
  { value: 'negative', label: 'Negatif', emoji: '😟' },
  { value: 'neutral', label: 'Neutre', emoji: '😐' },
  { value: 'positive', label: 'Positif', emoji: '😊' },
  { value: 'very_positive', label: 'Tres positif', emoji: '😄' },
];

const TradingJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const loadData = () => {
    const allEntries = getAllJournalEntries();
    setEntries(allEntries);
    setStats(getJournalStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = () => {
    const json = exportJournal();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_journal_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const count = importJournal(json);
      if (count > 0) {
        loadData();
        alert(`${count} entree(s) importee(s)`);
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette entree ?')) {
      deleteJournalEntry(id);
      loadData();
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filterStatus !== 'all' && entry.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.pair.toLowerCase().includes(query) ||
        entry.strategy.toLowerCase().includes(query) ||
        entry.notes.toLowerCase().includes(query) ||
        entry.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Journal de Trading</h1>
            <p className="text-gray-400">{entries.length} entree(s)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Stats
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            Importer
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={() => setShowNewEntry(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Entree
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && stats && (
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Statistiques du Journal
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Total Trades" value={stats.closedTrades.toString()} />
            <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} color={stats.winRate >= 50 ? 'emerald' : 'red'} />
            <StatCard label="P&L Total" value={`${stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}$`} color={stats.totalPnl >= 0 ? 'emerald' : 'red'} />
            <StatCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} color={stats.profitFactor >= 1 ? 'emerald' : 'red'} />
            <StatCard label="Meilleur jour" value={`${stats.bestDay.pnl >= 0 ? '+' : ''}${stats.bestDay.pnl.toFixed(0)}$`} color="emerald" />
            <StatCard label="Pire jour" value={`${stats.worstDay.pnl}$`} color="red" />
          </div>

          {stats.commonMistakes.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Erreurs frequentes</p>
              <div className="flex flex-wrap gap-2">
                {stats.commonMistakes.map((m, i) => (
                  <span key={i} className="px-3 py-1 bg-red-900/20 text-red-400 text-sm rounded-full">
                    {m.mistake} ({m.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'Tous' : status === 'open' ? 'Ouverts' : 'Fermes'}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune entree dans le journal</p>
            <p className="text-sm">Commencez a enregistrer vos trades</p>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => setEditingEntry(entry)}
              onDelete={() => handleDelete(entry.id)}
            />
          ))
        )}
      </div>

      {/* New/Edit Entry Modal */}
      {(showNewEntry || editingEntry) && (
        <EntryModal
          entry={editingEntry}
          onClose={() => {
            setShowNewEntry(false);
            setEditingEntry(null);
          }}
          onSave={(entry) => {
            if (editingEntry) {
              updateJournalEntry(editingEntry.id, entry);
            } else {
              createJournalEntry(entry as any);
            }
            loadData();
            setShowNewEntry(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
};

const JournalEntryCard: React.FC<{
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ entry, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const emotionEmoji = EMOTION_OPTIONS.find(e => e.value === entry.emotionEntry)?.emoji || '😐';

  return (
    <div className={`bg-gray-900/50 rounded-2xl border overflow-hidden ${
      entry.status === 'closed'
        ? entry.pnl && entry.pnl >= 0
          ? 'border-emerald-500/30'
          : 'border-red-500/30'
        : 'border-gray-800'
    }`}>
      <div
        className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              entry.type === 'long' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              {entry.type === 'long' ? (
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{entry.pair}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  entry.type === 'long'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {entry.type === 'long' ? 'LONG' : 'SHORT'}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  entry.status === 'open'
                    ? 'bg-blue-500/20 text-blue-400'
                    : entry.status === 'closed'
                    ? 'bg-gray-500/20 text-gray-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {entry.status.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <Calendar className="w-4 h-4" />
                {entry.date.toLocaleDateString()}
                <span className="text-gray-600">|</span>
                <span>{entry.strategy}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              {entry.status === 'closed' && entry.pnl !== undefined && (
                <p className={`font-bold ${entry.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {entry.pnl >= 0 ? '+' : ''}{entry.pnl.toFixed(2)}$
                </p>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <span className="text-lg">{emotionEmoji}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= entry.overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-800 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trade Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-400">Details du trade</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Entree: </span>
                  <span className="text-white font-mono">{entry.entryPrice.toFixed(5)}</span>
                </div>
                {entry.exitPrice && (
                  <div>
                    <span className="text-gray-500">Sortie: </span>
                    <span className="text-white font-mono">{entry.exitPrice.toFixed(5)}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">SL: </span>
                  <span className="text-red-400 font-mono">{entry.stopLoss.toFixed(5)}</span>
                </div>
                <div>
                  <span className="text-gray-500">TP: </span>
                  <span className="text-emerald-400 font-mono">{entry.takeProfit.toFixed(5)}</span>
                </div>
              </div>
            </div>

            {/* Analysis */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-400">Analyse</h4>
              <p className="text-sm text-gray-300">{entry.setup || 'Non specifiee'}</p>
              {entry.indicators.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.indicators.map((ind, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {ind}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {entry.notes && (
              <div className="md:col-span-2 space-y-2">
                <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Notes
                </h4>
                <p className="text-sm text-gray-300">{entry.notes}</p>
              </div>
            )}

            {/* Lessons Learned */}
            {entry.lessonsLearned && (
              <div className="md:col-span-2 space-y-2">
                <h4 className="text-sm font-semibold text-amber-400">Lecons apprises</h4>
                <p className="text-sm text-gray-300">{entry.lessonsLearned}</p>
              </div>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="md:col-span-2 flex flex-wrap gap-2">
                {entry.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-800">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const EntryModal: React.FC<{
  entry: JournalEntry | null;
  onClose: () => void;
  onSave: (entry: Partial<JournalEntry>) => void;
}> = ({ entry, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<JournalEntry>>(entry || {
    pair: 'EUR/USD',
    type: 'long',
    entryPrice: 1.0850,
    stopLoss: 1.0800,
    takeProfit: 1.0950,
    lotSize: 0.1,
    status: 'open',
    timeframe: TimeFrame.H1,
    strategy: '',
    setup: '',
    indicators: [],
    patterns: [],
    confluences: [],
    preTradeAnalysis: '',
    entryReason: '',
    notes: '',
    emotionEntry: 'neutral',
    followedPlan: true,
    mistakesMade: [],
    setupQuality: 3,
    executionQuality: 3,
    overallRating: 3,
    screenshots: [],
    tags: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      date: new Date(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {entry ? 'Modifier l\'entree' : 'Nouvelle Entree'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Paire</label>
              <select
                value={formData.pair}
                onChange={(e) => setFormData({ ...formData, pair: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="EUR/USD">EUR/USD</option>
                <option value="GBP/USD">GBP/USD</option>
                <option value="USD/JPY">USD/JPY</option>
                <option value="USD/CHF">USD/CHF</option>
                <option value="AUD/USD">AUD/USD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'long' | 'short' })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="long">Long (Achat)</option>
                <option value="short">Short (Vente)</option>
              </select>
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Entree</label>
              <input
                type="number"
                step="0.00001"
                value={formData.entryPrice}
                onChange={(e) => setFormData({ ...formData, entryPrice: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stop Loss</label>
              <input
                type="number"
                step="0.00001"
                value={formData.stopLoss}
                onChange={(e) => setFormData({ ...formData, stopLoss: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Take Profit</label>
              <input
                type="number"
                step="0.00001"
                value={formData.takeProfit}
                onChange={(e) => setFormData({ ...formData, takeProfit: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Lot Size</label>
              <input
                type="number"
                step="0.01"
                value={formData.lotSize}
                onChange={(e) => setFormData({ ...formData, lotSize: parseFloat(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Strategy & Setup */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Strategie</label>
              <input
                type="text"
                value={formData.strategy}
                onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                placeholder="Ex: Breakout, Trend Following..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Setup</label>
              <input
                type="text"
                value={formData.setup}
                onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                placeholder="Ex: Double bottom + RSI divergence"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Emotion */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Etat emotionnel a l'entree</label>
            <div className="flex gap-2">
              {EMOTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, emotionEntry: opt.value })}
                  className={`flex-1 py-2 rounded-lg text-center transition-all ${
                    formData.emotionEntry === opt.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Notes sur ce trade..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: 'setupQuality', label: 'Qualite du setup' },
              { key: 'executionQuality', label: 'Qualite d\'execution' },
              { key: 'overallRating', label: 'Note globale' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-2">{label}</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, [key]: star })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= (formData[key as keyof typeof formData] as number || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-600 hover:text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            >
              {entry ? 'Modifier' : 'Creer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'white' }) => (
  <div className="bg-gray-800/50 rounded-xl p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-lg font-bold ${
      color === 'emerald' ? 'text-emerald-400' :
      color === 'red' ? 'text-red-400' : 'text-white'
    }`}>
      {value}
    </p>
  </div>
);

export default TradingJournal;
