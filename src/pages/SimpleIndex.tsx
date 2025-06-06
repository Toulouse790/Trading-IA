
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import SimpleDashboard from '../components/SimpleDashboard';
import { TrainingLog } from '@/hooks/useTrainingLogs';

export default function SimpleIndex() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('training_logs')
          .select('*')
          .order('training_date', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Erreur Supabase :', error);
          setError(error.message);
        } else {
          setLogs(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">📊 Tableau de bord IA Trading (Simple)</h1>
      
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <p>Chargement des données...</p>
        </div>
      ) : error ? (
        <div className="bg-destructive/20 border border-destructive p-4 rounded-lg">
          <p className="text-destructive">Erreur: {error}</p>
        </div>
      ) : (
        <SimpleDashboard logs={logs} />
      )}
    </div>
  );
}
