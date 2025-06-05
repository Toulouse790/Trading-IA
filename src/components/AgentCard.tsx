
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AgentCard({ name, winRate }: { name: string; winRate: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
        <p className="text-sm text-muted-foreground">Win Rate</p>
      </CardContent>
    </Card>
  );
}
