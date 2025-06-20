import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TrainingLog {
  training_date: string
  win_rate: number
  sharpe_ratio: number
  training_level: string
  best_pattern_name: string
  best_pattern_profit: number
  strategy_version: string
}

export default function TrainingHistory() {
  const [logs, setLogs] = useState<TrainingLog[]>([])

  useEffect(() => {
    fetch('https://tiehzkadrjcaoadpcsox.supabase.co/rest/v1/training_logs?select=training_date,win_rate,sharpe_ratio,training_level,best_pattern_name,best_pattern_profit,strategy_version&order=training_date.desc', {
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    })
      .then(res => res.json())
      .then(setLogs)
  }, [])

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4">Historique des Entraînements IA</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Win Rate</TableHead>
              <TableHead>Sharpe</TableHead>
              <TableHead>Niveau</TableHead>
              <TableHead>Pattern 🧠</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Version</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>{new Date(log.training_date).toLocaleDateString()}</TableCell>
                <TableCell>{log.win_rate.toFixed(1)}%</TableCell>
                <TableCell>{log.sharpe_ratio.toFixed(2)}</TableCell>
                <TableCell><Badge>{log.training_level}</Badge></TableCell>
                <TableCell>{log.best_pattern_name}</TableCell>
                <TableCell>{log.best_pattern_profit.toFixed(2)}%</TableCell>
                <TableCell>{log.strategy_version}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
