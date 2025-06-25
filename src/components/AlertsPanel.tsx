
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangleIcon, InfoIcon, XCircleIcon, CheckCircleIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface TradingAlert {
  id: string;
  alert_type: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  message: string;
  value?: number;
  threshold?: number;
  action_required?: string;
  resolved: boolean;
  created_at: string;
}

export default function AlertsPanel() {
  // Récupérer les alertes directement depuis la table trading_alerts
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['tradingAlerts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('trading_alerts')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) {
          console.error('Erreur lors de la récupération des alertes:', error);
          return [];
        }
        
        return (data as TradingAlert[]) || [];
      } catch (error) {
        console.error('Erreur dans la requête d\'alertes:', error);
        return [];
      }
    },
    refetchInterval: 10000 // Rafraîchir toutes les 10 secondes
  });

  // Souscrire aux nouvelles alertes en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('trading-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trading_alerts'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircleIcon className="h-4 w-4" />;
      case 'HIGH':
      case 'WARNING':
        return <AlertTriangleIcon className="h-4 w-4" />;
      case 'INFO':
        return <InfoIcon className="h-4 w-4" />;
      default:
        return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
    return date.toLocaleDateString();
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('trading_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);
      
      if (error) {
        console.error('Erreur lors de la résolution de l\'alerte:', error);
      } else {
        refetch();
      }
    } catch (error) {
      console.error('Erreur dans resolveAlert:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5" />
            Alertes Trading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5" />
            Alertes Trading
          </CardTitle>
          {alerts && alerts.length > 0 && (
            <Badge variant="secondary">{alerts.length} active{alerts.length > 1 ? 's' : ''}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune alerte active</p>
            <p className="text-sm mt-1">Tous les systèmes fonctionnent normalement</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert 
                  key={alert.id} 
                  className={`cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => resolveAlert(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 text-${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(alert.severity) as any}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(alert.created_at)}
                        </span>
                      </div>
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                      {alert.action_required && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Action: {alert.action_required}
                        </p>
                      )}
                      {alert.value !== undefined && alert.value !== null && 
                       alert.threshold !== undefined && alert.threshold !== null && (
                        <div className="flex gap-2 mt-2 text-xs">
                          <span>Valeur: {alert.value.toFixed(2)}</span>
                          <span className="text-muted-foreground">|</span>
                          <span>Seuil: {alert.threshold.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
