
import { Brain, Bell, Zap, AlertCircle, Shield } from 'lucide-react';
import { TrainingLog } from '@/hooks/useTrainingLogs';

interface PatternsAndAlertsProps {
  patternsData: any[];
  currentLog?: TrainingLog;
}

const COLORS = ['#8989DE', '#7EBF8E', '#D2886F', '#6366F1', '#EC4899'];

export const PatternsAndAlerts = ({ patternsData, currentLog }: PatternsAndAlertsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
      {/* Top Patterns */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-[#8989DE]" />
          <span className="truncate">Top Patterns Détectés</span>
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {patternsData.length > 0 ? patternsData.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-[#141413] rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: COLORS[index] }} />
                <span className="font-medium text-sm sm:text-base truncate">{pattern.name}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs sm:text-sm text-[#7EBF8E] font-medium">+{pattern.profit.toFixed(1)}%</p>
                <p className="text-xs text-[#605F5B]">{pattern.value} analyses</p>
              </div>
            </div>
          )) : (
            <p className="text-[#605F5B] text-center py-4 text-sm">Aucun pattern analysé</p>
          )}
        </div>
      </div>

      {/* Alertes récentes */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#D2886F]" />
          <span className="truncate">Alertes Récentes</span>
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="p-2 sm:p-3 bg-[#7EBF8E]/10 rounded-lg border border-[#7EBF8E]/20">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#7EBF8E]/20 rounded flex-shrink-0">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[#7EBF8E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">Pattern {currentLog?.best_pattern_name || 'HAMMER'} détecté</p>
                <p className="text-xs text-[#605F5B] mt-1">Profit potentiel: +{currentLog?.best_pattern_profit?.toFixed(1) || '2.5'}%</p>
              </div>
              <span className="text-xs text-[#605F5B] flex-shrink-0">09:15</span>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 bg-[#D2886F]/10 rounded-lg border border-[#D2886F]/20">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#D2886F]/20 rounded flex-shrink-0">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#D2886F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium">Entraînement en cours</p>
                <p className="text-xs text-[#605F5B] mt-1">Analyse de {currentLog?.total_trades_analyzed || 0} trades</p>
              </div>
              <span className="text-xs text-[#605F5B] flex-shrink-0">10:30</span>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 bg-[#8989DE]/10 rounded-lg border border-[#8989DE]/20">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#8989DE]/20 rounded flex-shrink-0">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#8989DE]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium">Modèle mis à jour</p>
                <p className="text-xs text-[#605F5B] mt-1 truncate">{currentLog?.model_version || 'gpt-4-turbo'}</p>
              </div>
              <span className="text-xs text-[#605F5B] flex-shrink-0">11:45</span>
            </div>
          </div>
        </div>
      </div>

      {/* État de l'apprentissage */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50 md:col-span-2 lg:col-span-1">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-[#8989DE]" />
          <span className="truncate">État de l'IA</span>
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-[#E6E4DD]">Niveau actuel</span>
              <span className="text-xs sm:text-sm font-medium text-[#8989DE]">{currentLog?.training_level || 'LEARNING'}</span>
            </div>
            <div className="w-full bg-[#141413] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#8989DE] to-[#6366F1] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((currentLog?.win_rate || 0), 100)}%` }} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-[#141413] rounded-lg p-2 sm:p-3">
              <p className="text-xs text-[#605F5B] mb-1">Patterns analysés</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold">{currentLog?.patterns_analyzed || 0}</p>
            </div>
            <div className="bg-[#141413] rounded-lg p-2 sm:p-3">
              <p className="text-xs text-[#605F5B] mb-1">Win Rate</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold">{(currentLog?.win_rate || 0).toFixed(1)}%</p>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 bg-gradient-to-r from-[#8989DE]/10 to-[#6366F1]/10 rounded-lg border border-[#8989DE]/20">
            <p className="text-xs sm:text-sm text-[#E6E4DD]">
              🎯 Prochain objectif: {currentLog?.win_rate && currentLog.win_rate < 70 ? 'Atteindre 70% de win rate' : 'Maintenir les performances'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
