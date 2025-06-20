import TrainingHistory from '@/components/TrainingHistory'

export default function DashboardIA() {
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <h1 className="text-3xl font-bold">📊 Tableau de bord IA Trading</h1>

      <section>
        <TrainingHistory />
      </section>

      {/* Autres composants IA à venir ici (ex: AIAgentPanel, PatternStats, etc.) */}
    </div>
  )
}
