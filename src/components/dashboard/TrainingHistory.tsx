
import { Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TrainingLog } from '@/hooks/useTrainingLogs';

interface TrainingHistoryProps {
  trainingData: TrainingLog[];
}

export const TrainingHistory = ({ trainingData }: TrainingHistoryProps) => {
  return (
    <div className="bg-[#1F1F1E] rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#3A3935]/50">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#8989DE]" />
          <span className="truncate">Historique des Entraînements</span>
        </h3>
        <button className="text-xs sm:text-sm text-[#8989DE] hover:text-[#6366F1] transition-colors flex items-center gap-1 flex-shrink-0">
          <span className="hidden sm:inline">Voir tout</span>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left text-xs sm:text-sm text-[#605F5B] border-b border-[#3A3935]">
              <th className="pb-2 sm:pb-3 font-medium">Date</th>
              <th className="pb-2 sm:pb-3 font-medium">Pattern</th>
              <th className="pb-2 sm:pb-3 font-medium">Win Rate</th>
              <th className="pb-2 sm:pb-3 font-medium">Trades</th>
              <th className="pb-2 sm:pb-3 font-medium">Sharpe</th>
              <th className="pb-2 sm:pb-3 font-medium">Profit</th>
              <th className="pb-2 sm:pb-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {trainingData.slice(0, 4).map((log) => (
              <tr key={log.id} className="border-b border-[#3A3935]/50 hover:bg-[#141413] transition-colors">
                <td className="py-2 sm:py-3 text-xs sm:text-sm">
                  <div className="flex flex-col">
                    <span>{log.training_date ? format(new Date(log.training_date), "dd/MM/yyyy", { locale: fr }) : 'N/A'}</span>
                    <span className="text-[#605F5B] text-xs">{log.training_date ? format(new Date(log.training_date), "HH:mm", { locale: fr }) : ''}</span>
                  </div>
                </td>
                <td className="py-2 sm:py-3 text-xs sm:text-sm font-medium">{log.best_pattern_name || 'N/A'}</td>
                <td className="py-2 sm:py-3">
                  <span className={`text-xs sm:text-sm font-medium ${(log.win_rate || 0) > 50 ? 'text-[#7EBF8E]' : 'text-[#EF4444]'}`}>
                    {(log.win_rate || 0).toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 sm:py-3 text-xs sm:text-sm">{log.total_trades_analyzed || 0}</td>
                <td className="py-2 sm:py-3 text-xs sm:text-sm">{(log.sharpe_ratio || 0).toFixed(2)}</td>
                <td className="py-2 sm:py-3">
                  <span className={`text-xs sm:text-sm font-medium ${(log.best_pattern_profit || 0) > 0 ? 'text-[#7EBF8E]' : 'text-[#EF4444]'}`}>
                    {(log.best_pattern_profit || 0) > 0 ? '+' : ''}{(log.best_pattern_profit || 0).toFixed(1)}%
                  </span>
                </td>
                <td className="py-2 sm:py-3">
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${
                    (log.win_rate || 0) > 50
                      ? 'bg-[#7EBF8E]/20 text-[#7EBF8E]' 
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {(log.win_rate || 0) > 50 ? 'Réussi' : 'À améliorer'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
