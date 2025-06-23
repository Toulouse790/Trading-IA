
import { Brain, Bell, Zap, AlertCircle, Shield } from 'lucide-react';
import { TrainingLog } from '@/hooks/useTrainingLogs';

interface PatternsAndAlertsProps {
  patternsData: any[];
  currentLog?: TrainingLog;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const PatternsAndAlerts = ({ patternsData, currentLog }: PatternsAndAlertsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
      {/* Top Patterns */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-[#8989DE]" />
          <span className="truncate text-[#FAFAF8]">Top Patterns Détectés</span>
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {patternsData.length > 0 ? patternsData.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-[#141413] rounded-lg border border-[#3A3935]/30">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: COLORS[index] }} />
                <span className="font-medium text-sm sm:text-base truncate text-[#FAFAF8]">{pattern.name}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs sm:text-sm text-[#10B981] font-medium">+{pattern.profit ? pattern.profit.toFixed(1) : '0.0'}%</p>
                <p className="text-xs text-[#9CA3AF]">{pattern.value || 0} analyses</p>
              </div>
            </div>
          )) : (
            <p className="text-[#9CA3AF] text-center py-4 text-sm">Aucun pattern analysé</p>
          )}
        </div>
      </div>

      {/* Alertes récentes */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
          <span className="truncate text-[#FAFAF8]">Alertes Récentes</span>
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="p-2 sm:p-3 bg-[#10B981]/10 rounded-lg border border-[#10B981]/30">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#10B981]/20 rounded flex-shrink-0">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[#10B981]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate text-[#FAFAF8]">Pattern {currentLog?.best_pattern_name || 'HAMMER'} détecté</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Profit potentiel: +{currentLog?.best_pattern_profit ? currentLog.best_pattern_profit.toFixed(1) : '2.5'}%</p>
              </div>
              <span className="text-xs text-[#9CA3AF] flex-shrink-0">09:15</span>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/30">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#F59E0B]/20 rounded flex-shrink-0">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-[#F59E0B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[#FAFAF8]">Entraînement en cours</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Analyse de {currentLog?.total_trades_analyzed || 0} trades</p>
              </div>
              <span className="text-xs text-[#9CA3AF] flex-shrink-0">10:30</span>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 bg-[#6366F1]/10 rounded-lg border border-[#6366F1]/30">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-[#6366F1]/20 rounded flex-shrink-0">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-[#6366F1]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[#FAFAF8]">Modèle mis à jour</p>
                <p className="text-xs text-[#9CA3AF] mt-1 truncate">{currentLog?.model_version || 'gpt-4-turbo'}</p>
              </div>
              <span className="text-xs text-[#9CA3AF] flex-shrink-0">11:45</span>
            </div>
          </div>
        </div>
      </div>

      {/* État de l'apprentissage */}
      <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50 md:col-span-2 lg:col-span-1">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-[#8989DE]" />
          <span className="truncate text-[#FAFAF8]">État de l'IA</span>
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-[#FAFAF8]">Niveau actuel</span>
              <span className="text-xs sm:text-sm font-medium text-[#6366F1]">{currentLog?.training_level || 'LEARNING'}</span>
            </div>
            <div className="w-full bg-[#141413] rounded-full h-2 border border-[#3A3935]/50">
              <div 
                className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((currentLog?.win_rate || 0), 100)}%` }} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-[#141413] rounded-lg p-2 sm:p-3 border border-[#3A3935]/30">
              <p className="text-xs text-[#9CA3AF] mb-1">Patterns analysés</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-[#FAFAF8]">{currentLog?.patterns_analyzed || 0}</p>
            </div>
            <div className="bg-[#141413] rounded-lg p-2 sm:p-3 border border-[#3A3935]/30">
              <p className="text-xs text-[#9CA3AF] mb-1">Win Rate</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-[#10B981]">{currentLog?.win_rate ? currentLog.win_rate.toFixed(1) : '0.0'}%</p>
            </div>
          </div>
          
          <div className="p-2 sm:p-3 bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 rounded-lg border border-[#6366F1]/30">
            <p className="text-xs sm:text-sm text-[#FAFAF8]">
              🎯 Prochain objectif: {currentLog?.win_rate && currentLog.win_rate < 70 ? 'Atteindre 70% de win rate' : 'Maintenir les performances'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
