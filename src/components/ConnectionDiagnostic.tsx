
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ConnectionDiagnostic() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      console.log('Testing Supabase connection...');
      
      // Test de connexion simple avec une requête valide
      const { data, error } = await supabase
        .from('agents')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Erreur de connexion Supabase:', error);
        setConnectionStatus('disconnected');
        toast({
          title: "Connexion échouée",
          description: `Erreur: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Connexion Supabase réussie:', data);
      setConnectionStatus('connected');
      setLastCheck(new Date());
      
      toast({
        title: "Connexion réussie",
        description: "Supabase est connecté et fonctionne",
      });
    } catch (error) {
      console.error('Erreur de test de connexion:', error);
      setConnectionStatus('disconnected');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Supabase",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500 text-white';
      case 'disconnected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connecté';
      case 'disconnected':
        return 'Déconnecté';
      default:
        return 'Vérification...';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Diagnostic Connexion Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Statut de connexion</p>
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
          <Button 
            onClick={checkConnection} 
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Tester
          </Button>
        </div>
        
        {lastCheck && (
          <div className="text-xs text-muted-foreground">
            Dernière vérification: {lastCheck.toLocaleTimeString('fr-FR')}
          </div>
        )}

        {connectionStatus === 'disconnected' && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Problème de connexion détecté</p>
                <p>Vérifiez votre connexion internet et les paramètres Supabase.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function getStatusIcon() {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-yellow-500" />;
    }
  }

  function getStatusColor() {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500 text-white';
      case 'disconnected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-yellow-500 text-white';
    }
  }

  function getStatusText() {
    switch (connectionStatus) {
      case 'connected':
        return 'Connecté';
      case 'disconnected':
        return 'Déconnecté';
      default:
        return 'Vérification...';
    }
  }
}
