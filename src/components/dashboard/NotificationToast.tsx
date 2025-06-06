
import { Zap } from 'lucide-react';
import { TrainingLog } from '@/hooks/useTrainingLogs';

interface NotificationToastProps {
  show: boolean;
  currentLog?: TrainingLog;
}

export const NotificationToast = ({ show, currentLog }: NotificationToastProps) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 animate-slide-up z-50">
      <div className="bg-[#1F1F1E] border border-[#8989DE]/30 rounded-lg p-3 sm:p-4 shadow-xl shadow-[#8989DE]/10 max-w-xs sm:max-w-sm">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-[#8989DE]/20 rounded-lg flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#8989DE]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base">Nouvel entraînement terminé!</p>
            <p className="text-xs sm:text-sm text-[#605F5B] mt-1">
              Win rate: {(currentLog?.win_rate || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
