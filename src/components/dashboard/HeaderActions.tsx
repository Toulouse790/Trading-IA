
import { Bell, Settings } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrainingLog } from '@/hooks/useTrainingLogs';

interface HeaderActionsProps {
  currentLog?: TrainingLog;
}

export const HeaderActions = ({ currentLog }: HeaderActionsProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Nouvel entraînement terminé',
      description: `Win rate: ${(currentLog?.win_rate || 0).toFixed(1)}%`,
      time: '09:15',
      type: 'success'
    },
    {
      id: 2,
      title: 'Pattern HAMMER détecté',
      description: `Profit potentiel: +${(currentLog?.best_pattern_profit || 2.5).toFixed(1)}%`,
      time: '10:30',
      type: 'info'
    },
    {
      id: 3,
      title: 'Modèle mis à jour',
      description: currentLog?.model_version || 'gpt-4-turbo',
      time: '11:45',
      type: 'update'
    }
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogTrigger asChild>
          <button className="p-2 sm:p-3 rounded-lg bg-[#1F1F1E] hover:bg-[#3A3935] transition-colors relative">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#8989DE] rounded-full flex items-center justify-center">
              <span className="text-xs text-white">{notifications.length}</span>
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md bg-[#1F1F1E] border-[#3A3935] text-[#FAFAF8]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-3 bg-[#141413] rounded-lg border border-[#3A3935]/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-[#605F5B] mt-1">{notif.description}</p>
                  </div>
                  <span className="text-xs text-[#605F5B]">{notif.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setNotificationsOpen(false)}
              className="bg-[#141413] border-[#3A3935] text-[#E6E4DD] hover:bg-[#3A3935]"
            >
              Marquer tout comme lu
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogTrigger asChild>
          <button className="p-2 sm:p-3 rounded-lg bg-[#1F1F1E] hover:bg-[#3A3935] transition-colors">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg bg-[#1F1F1E] border-[#3A3935] text-[#FAFAF8]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Paramètres du Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Notifications</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Alertes de trading</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Fin d'entraînement</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Mises à jour du modèle</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Affichage</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Mode sombre</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Actualisation automatique</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSettingsOpen(false)}
              className="bg-[#141413] border-[#3A3935] text-[#E6E4DD] hover:bg-[#3A3935]"
            >
              Annuler
            </Button>
            <Button 
              size="sm"
              onClick={() => setSettingsOpen(false)}
              className="bg-[#8989DE] hover:bg-[#6366F1] text-white"
            >
              Sauvegarder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
