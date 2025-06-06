
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTrainingLogs } from "@/hooks/useTrainingLogs";
import { Settings, Edit3, Save, X, Bot } from "lucide-react";

export default function AssistantManagement() {
  const { data: trainings } = useTrainingLogs();
  const [editingAssistant, setEditingAssistant] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [assistantNames, setAssistantNames] = useState<Record<string, string>>({});

  // Récupérer les assistants uniques
  const uniqueAssistants = [...new Set(trainings?.map(t => t.assistant_id).filter(Boolean) || [])];

  const handleStartEdit = (assistantId: string) => {
    setEditingAssistant(assistantId);
    setNewName(assistantNames[assistantId] || assistantId);
  };

  const handleSave = (assistantId: string) => {
    setAssistantNames(prev => ({
      ...prev,
      [assistantId]: newName || assistantId
    }));
    setEditingAssistant(null);
    setNewName("");
  };

  const handleCancel = () => {
    setEditingAssistant(null);
    setNewName("");
  };

  const getDisplayName = (assistantId: string) => {
    return assistantNames[assistantId] || assistantId;
  };

  const getAssistantStats = (assistantId: string) => {
    const assistantTrainings = trainings?.filter(t => t.assistant_id === assistantId) || [];
    const totalRuns = assistantTrainings.length;
    const avgWinRate = totalRuns > 0 
      ? assistantTrainings.reduce((sum, t) => sum + (t.win_rate || 0), 0) / totalRuns 
      : 0;
    const lastUsed = assistantTrainings[0]?.created_at;
    
    return { totalRuns, avgWinRate, lastUsed };
  };

  return (
    <div className="min-h-screen bg-[#0F0F0E] p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FAFAF8] mb-2">
            Gestion des Assistants
          </h1>
          <p className="text-sm sm:text-base text-[#605F5B]">
            Renommez vos assistants pour une meilleure organisation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {uniqueAssistants.map((assistantId) => {
            const stats = getAssistantStats(assistantId);
            const isEditing = editingAssistant === assistantId;

            return (
              <Card key={assistantId} className="bg-[#1F1F1E] border-[#3A3935]/50 hover:border-[#8989DE]/30 transition-all duration-300">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <div className="p-1.5 sm:p-2 bg-[#8989DE]/10 rounded-lg">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-[#8989DE]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-7 sm:h-8 text-xs sm:text-sm bg-[#2A2A28] border-[#3A3935] text-[#FAFAF8]"
                            placeholder="Nom de l'assistant"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSave(assistantId)}
                            className="h-7 sm:h-8 w-7 sm:w-8 p-0 bg-[#7EBF8E] hover:bg-[#7EBF8E]/80"
                          >
                            <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            className="h-7 sm:h-8 w-7 sm:w-8 p-0 border-[#3A3935] text-[#605F5B] hover:text-[#FAFAF8]"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-[#FAFAF8] truncate text-sm sm:text-base">
                            {getDisplayName(assistantId)}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(assistantId)}
                            className="h-6 sm:h-7 w-6 sm:w-7 p-0 text-[#605F5B] hover:text-[#8989DE]"
                          >
                            <Edit3 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3 p-3 sm:p-6 pt-0">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-[#605F5B] mb-1">ID Original</p>
                      <Badge variant="outline" className="text-xs max-w-full truncate block">
                        {assistantId}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t border-[#3A3935]/50 pt-3 space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#E6E4DD]">Entraînements</span>
                      <span className="text-[#FAFAF8] font-medium">{stats.totalRuns}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-[#E6E4DD]">Win Rate Moyen</span>
                      <span className="text-[#7EBF8E] font-medium">{stats.avgWinRate.toFixed(1)}%</span>
                    </div>
                    {stats.lastUsed && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-[#E6E4DD]">Dernière utilisation</span>
                        <span className="text-[#605F5B]">
                          {new Date(stats.lastUsed).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {uniqueAssistants.length === 0 && (
          <Card className="bg-[#1F1F1E] border-[#3A3935]/50">
            <CardContent className="p-6 sm:p-8 text-center">
              <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-[#605F5B] mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-[#E6E4DD] mb-2">
                Aucun assistant trouvé
              </h3>
              <p className="text-sm sm:text-base text-[#605F5B]">
                Lancez votre premier entraînement pour voir vos assistants apparaître ici.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
