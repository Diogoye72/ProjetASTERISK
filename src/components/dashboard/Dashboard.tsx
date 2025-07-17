import { Phone, Clock, TrendingUp, Users, CheckCircle, XCircle } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { CSVUploader } from "../upload/CSVUploader";
import { useState } from "react";

interface CallData {
  [key: string]: string;
}

interface DashboardProps {
  data?: CallData[];
  onFileProcessed?: (data: CallData[]) => void;
}

export function Dashboard({ data = [], onFileProcessed }: DashboardProps) {
  const callData = data;
  const hasData = data.length > 0;

  const handleFileProcessed = (newData: CallData[]) => {
    if (onFileProcessed) {
      onFileProcessed(newData);
    }
  };

  const calculateStats = () => {
    if (!hasData || callData.length === 0) {
      return {
        totalCalls: 0,
        avgDuration: '0:00',
        successRate: 0,
        totalDuration: '0:00'
      };
    }

    const totalCalls = callData.length;
    
    // Calcul de la durée moyenne (supposant une colonne 'duration' ou 'billsec')
    const durations = callData
      .map(call => parseInt(call.billsec || call.duration || '0'))
      .filter(d => !isNaN(d));
    
    const totalSeconds = durations.reduce((sum, d) => sum + d, 0);
    const avgSeconds = totalSeconds / durations.length || 0;
    
    // Calcul du taux de succès
    const successfulCalls = callData.filter(call => {
      const disposition = call.disposition?.toLowerCase();
      const statusNum = parseInt(call.disposition);
      return disposition === 'answered' || disposition === 'répondu' || statusNum === 4;
    }).length;
    const successRate = (successfulCalls / totalCalls) * 100;

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}h ${mins}m`;
      }
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      totalCalls,
      avgDuration: formatDuration(Math.round(avgSeconds)),
      successRate: Math.round(successRate),
      totalDuration: formatDuration(totalSeconds)
    };
  };

  const stats = calculateStats();

  if (!hasData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">
            Bienvenue dans Asterisk Analytics
          </h2>
          <p className="text-muted-foreground mb-8">
            Importez votre fichier CSV CDR pour commencer l'analyse
          </p>
        </div>
        
        <CSVUploader onFileProcessed={handleFileProcessed} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-50">
          <StatsCard
            title="Total Appels"
            value="--"
            icon={Phone}
            variant="default"
          />
          <StatsCard
            title="Durée Moyenne"
            value="--:--"
            icon={Clock}
            variant="accent"
          />
          <StatsCard
            title="Taux de Succès"
            value="--%"
            icon={TrendingUp}
            variant="success"
          />
          <StatsCard
            title="Durée Totale"
            value="--h --m"
            icon={Users}
            variant="warning"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Asterisk</h2>
          <p className="text-muted-foreground">
            Analyse de {callData.length} enregistrements d'appels
          </p>
        </div>
        
        <CSVUploader onFileProcessed={handleFileProcessed} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Appels"
          value={stats.totalCalls.toLocaleString()}
          icon={Phone}
          variant="default"
          subtitle="Tous les appels enregistrés"
        />
        <StatsCard
          title="Durée Moyenne"
          value={stats.avgDuration}
          icon={Clock}
          variant="accent"
          subtitle="Par appel réussi"
        />
        <StatsCard
          title="Taux de Succès"
          value={`${stats.successRate}%`}
          icon={CheckCircle}
          variant="success"
          subtitle="Appels répondus"
        />
        <StatsCard
          title="Durée Totale"
          value={stats.totalDuration}
          icon={TrendingUp}
          variant="warning"
          subtitle="Temps de communication"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-card">
          <h3 className="text-lg font-semibold mb-4">Répartition des Appels</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>Appels Réussis</span>
              </div>
              <span className="font-medium">{stats.successRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span>Appels Échoués</span>
              </div>
              <span className="font-medium">{100 - stats.successRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-card">
          <h3 className="text-lg font-semibold mb-4">Services Configurés</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span>Follow Me</span>
            </div>
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span>Call Parking</span>
            </div>
            <div className="flex items-center space-x-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span>Transfert d'Appel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}