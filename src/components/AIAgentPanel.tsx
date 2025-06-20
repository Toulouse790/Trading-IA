
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AIAgentPanelProps {
  name: string;
  objective: string;
  status: string;
  winRate: number;
  sharpeRatio: number;
}

export default function AIAgentPanel({ 
  name, 
  objective, 
  status, 
  winRate, 
  sharpeRatio 
}: AIAgentPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'learning':
        return 'text-[#D2886F] bg-[#D2886F]/20 border border-[#D2886F]/30';
      case 'active':
        return 'text-[#7EBF8E] bg-[#7EBF8E]/20 border border-[#7EBF8E]/30';
      case 'paused':
        return 'text-[#605F5B] bg-[#605F5B]/20 border border-[#605F5B]/30';
      default:
        return 'text-[#8989DE] bg-[#8989DE]/20 border border-[#8989DE]/30';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-[#1F1F1E] to-[#2A2A29] border-[#3A3935]/50 hover:border-[#8989DE]/30 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-bold text-[#FAFAF8]">{name}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-[#E6E4DD]">
          <strong className="text-[#FAFAF8]">Objectif:</strong> {objective}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#141413] rounded-lg p-3 border border-[#3A3935]/30 hover:border-[#7EBF8E]/30 transition-colors">
            <div className="text-xs text-[#605F5B] uppercase tracking-wide">Win Rate</div>
            <div className="text-2xl font-bold text-[#7EBF8E]">{winRate.toFixed(1)}%</div>
          </div>
          
          <div className="bg-[#141413] rounded-lg p-3 border border-[#3A3935]/30 hover:border-[#8989DE]/30 transition-colors">
            <div className="text-xs text-[#605F5B] uppercase tracking-wide">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-[#8989DE]">{sharpeRatio.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
