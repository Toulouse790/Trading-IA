
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
        return 'text-yellow-600 bg-yellow-100';
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-800">{name}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <strong>Objectif:</strong> {objective}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Win Rate</div>
            <div className="text-2xl font-bold text-green-600">{winRate.toFixed(1)}%</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-blue-600">{sharpeRatio.toFixed(2)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
