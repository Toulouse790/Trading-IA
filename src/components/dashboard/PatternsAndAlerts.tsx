
import { Brain, Bell, Zap, AlertCircle, Shield } from 'lucide-react';
import { TrainingLog } from '@/hooks/useTrainingLogs';

interface PatternsAndAlertsProps {
  patternsData: any[];
  currentLog?: TrainingLog;
}

const COLORS = ['#8989DE', '#7EBF8E', '#D2886F', '#6366F1', '#EC4899'];

export const PatternsAndAlerts = ({ patternsData, currentLog }: PatternsAndAlertsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Top Patterns */}
      <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#8989DE]" />
          Top Patterns Détectés
        </h3>
        <div className="space-y-3">
          {patternsData.length > 0 ? patternsData.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#141413] rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[index] }} />
                <span className="font-medium">{pattern.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#7EBF8E] font-medium">+{pattern.profit.toFixed(1)}%</p>
                <p className="text-xs text-[#605F5B]">{pattern.value} analyses</p>
              </div>
            </div>
          )) : (
            <p className="text-[#605F5B] text-center py-4">Aucun pattern analysé</p>
          )}
        </div>
      </div>

      {/* Alertes récentes */}
      <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#D2886F]" />
          Alertes Récentes
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-[#7EBF8E]/10 rounded-lg border border-[#7EBF8E]/20">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#7EBF8E]/20 rounded">
                <Zap className="w-4 h-4 text-[#7EBF8E]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Pattern {currentLog?.best_pattern_name || 'HAMMER'} détecté</p>
                <p className="text-xs text-[#605F5B] mt-1">Profit potentiel: +{currentLog?.best_pattern_profit?.toFixed(1) || '2.5'}%</p>
              </div>
              <span className="text-xs text-[#605F5B]">09:15</span>
            </div>
          </div>
          
          <div className="p-3 bg-[#D2886F]/10 rounded-lg border border-[#D2886F]/20">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#D2886F]/20 rounded">
                <AlertCircle className="w-4 h-4 text-[#D2886F]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Entraînement en cours</p>
                <p className="text-xs text-[#605F5B] mt-1">Analyse de {currentLog?.total_trades_analyzed || 0} trades</p>
              </div>
              <span className="text-xs text-[#605F5B]">10:30</span>
            </div>
          </div>
          
          <div className="p-3 bg-[#8989DE]/10 rounded-lg border border-[#8989DE]/20">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#8989DE]/20 rounded">
                <Shield className="w-4 h-4 text-[#8989DE]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Modèle mis à jour</p>
                <p className="text-xs text-[#605F5B] mt-1">{currentLog?.model_version || 'gpt-4-turbo'}</p>
              </div>
              <span className="text-xs text-[#605F5B]">11:45</span>
            </div>
          </div>
        </div>
      </div>

      {/* État de l'apprentissage */}
      <div className="bg-[#1F1F1E] rounded-xl p-6 border border-[#3A3935]/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#8989DE]" />
          État de l'IA
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#E6E4DD]">Niveau actuel</span>
              <span className="text-sm font-medium text-[#8989DE]">{currentLog?.training_level || 'LEARNING'}</span>
            </div>
            <div className="w-full bg-[#141413] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#8989DE] to-[#6366F1] h-2 rounded-full" 
                style={{ width: `${Math.min((currentLog?.win_rate || 0), 100)}%` }} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#141413] rounded-lg p-3">
              <p className="text-xs text-[#605F5B] mb-1">Patterns analysés</p>
              <p className="text-lg font-bold">{currentLog?.patterns_analyzed || 0}</p>
            </div>
            <div className="bg-[#141413] rounded-lg p-3">
              <p className="text-xs text-[#605F5B] mb-1">Win Rate</p>
              <p className="text-lg font-bold">{(currentLog?.win_rate || 0).toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-r from-[#8989DE]/10 to-[#6366F1]/10 rounded-lg border border-[#8989DE]/20">
            <p className="text-sm text-[#E6E4DD]">
              🎯 Prochain objectif: {currentLog?.win_rate && currentLog.win_rate < 70 ? 'Atteindre 70% de win rate' : 'Maintenir les performances'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
