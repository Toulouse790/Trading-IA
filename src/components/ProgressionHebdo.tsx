
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function ProgressionHebdo() {
  // Données d'exemple pour la progression hebdomadaire
  const weeklyData = [
    { week: "S1", winRate: 45, profit: 2.3 },
    { week: "S2", winRate: 52, profit: 3.8 },
    { week: "S3", winRate: 48, profit: 1.9 },
    { week: "S4", winRate: 65, profit: 5.2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression Hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="winRate" 
              stroke="#8884d8" 
              strokeWidth={2}
              name="Win Rate (%)"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Profit (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
