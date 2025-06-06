
import { Zap } from 'lucide-react';
import { TrainingLog } from '@/hooks/useTrainingLogs';

interface NotificationToastProps {
  show: boolean;
  currentLog?: TrainingLog;
}

export const NotificationToast = ({ show, currentLog }: NotificationToastProps) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 animate-slide-up">
      <div className="bg-[#1F1F1E] border border-[#8989DE]/30 rounded-lg p-4 shadow-xl shadow-[#8989DE]/10 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#8989DE]/20 rounded-lg">
            <Zap className="w-5 h-5 text-[#8989DE]" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Nouvel entraînement terminé!</p>
            <p className="text-sm text-[#605F5B] mt-1">
              Win rate: {(currentLog?.win_rate || 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
