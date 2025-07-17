import { useState, useMemo } from "react";
import { Euro, FileText, Calculator, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "../dashboard/StatsCard";

interface CallRecord {
  [key: string]: string;
}

interface BillingManagerProps {
  data: CallRecord[];
}

interface TariffSettings {
  localRate: number;
  nationalRate: number;
  internationalRate: number;
  mobileRate: number;
  freeMinutes: number;
}

export function BillingManager({ data }: BillingManagerProps) {
  const [tariffs, setTariffs] = useState<TariffSettings>({
    localRate: 25,
    nationalRate: 50,
    internationalRate: 125,
    mobileRate: 75,
    freeMinutes: 60
  });

  const billingData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const callsByExtension = new Map<string, any[]>();
    
    // Grouper les appels par extension
    data.forEach(call => {
      const extension = call.src || call.clid || 'Inconnu';
      if (!callsByExtension.has(extension)) {
        callsByExtension.set(extension, []);
      }
      callsByExtension.get(extension)!.push(call);
    });

    // Calculer la facturation pour chaque extension
    const extensionBilling = Array.from(callsByExtension.entries()).map(([extension, calls]) => {
      let totalMinutes = 0;
      let totalCost = 0;
      let callCounts = { local: 0, national: 0, international: 0, mobile: 0 };

      calls.forEach(call => {
        // Vérifier si l'appel est facturable (répondu)
        const disposition = call.disposition?.toLowerCase();
        const statusNum = parseInt(call.disposition);
        const isAnswered = disposition === 'answered' || 
                          disposition === 'répondu' || 
                          statusNum === 4;
        
        if (!isAnswered) return;
        
        const duration = parseInt(call.billsec || call.duration || '0');
        const minutes = Math.ceil(duration / 60);
        totalMinutes += minutes;

        // Déterminer le type d'appel basé sur le numéro appelé
        const destination = call.dst || '';
        let rate = tariffs.localRate;
        
        if (destination.startsWith('06') || destination.startsWith('07')) {
          rate = tariffs.mobileRate;
          callCounts.mobile++;
        } else if (destination.startsWith('0033') || destination.startsWith('+33')) {
          rate = tariffs.nationalRate;
          callCounts.national++;
        } else if (destination.startsWith('00') || destination.startsWith('+')) {
          rate = tariffs.internationalRate;
          callCounts.international++;
        } else {
          callCounts.local++;
        }

        // Appliquer les minutes gratuites
        const billableMinutes = Math.max(0, minutes - (tariffs.freeMinutes / calls.length));
        totalCost += billableMinutes * rate;
      });

      return {
        extension,
        totalCalls: calls.length,
        answeredCalls: calls.filter(c => {
          const disposition = c.disposition?.toLowerCase();
          const statusNum = parseInt(c.disposition);
          return disposition === 'answered' || disposition === 'répondu' || statusNum === 4;
        }).length,
        totalMinutes,
        totalCost,
        callCounts
      };
    });

    const totalRevenue = extensionBilling.reduce((sum, ext) => sum + ext.totalCost, 0);
    const totalCalls = data.length;
    const totalMinutes = extensionBilling.reduce((sum, ext) => sum + ext.totalMinutes, 0);

    return {
      extensionBilling,
      totalRevenue,
      totalCalls,
      totalMinutes,
      averageCost: totalRevenue / extensionBilling.length || 0
    };
  }, [data, tariffs]);

  const updateTariff = (field: keyof TariffSettings, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTariffs(prev => ({ ...prev, [field]: numValue }));
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Configuration de Facturation</h3>
        <p className="text-muted-foreground">Importez des données d'appels pour configurer la facturation</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestion de la Facturation</h2>
        <p className="text-muted-foreground">
          Configuration des tarifs et calcul automatique des coûts
        </p>
      </div>

      {/* Configuration des tarifs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Euro className="w-5 h-5 mr-2 text-primary" />
          Configuration des Tarifs
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Local (XOF/min)</label>
            <Input
              type="number"
              step="0.01"
              value={tariffs.localRate}
              onChange={(e) => updateTariff('localRate', e.target.value)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">National (XOF/min)</label>
            <Input
              type="number"
              step="0.01"
              value={tariffs.nationalRate}
              onChange={(e) => updateTariff('nationalRate', e.target.value)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">International (XOF/min)</label>
            <Input
              type="number"
              step="0.01"
              value={tariffs.internationalRate}
              onChange={(e) => updateTariff('internationalRate', e.target.value)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mobile (XOF/min)</label>
            <Input
              type="number"
              step="0.01"
              value={tariffs.mobileRate}
              onChange={(e) => updateTariff('mobileRate', e.target.value)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Minutes gratuites</label>
            <Input
              type="number"
              value={tariffs.freeMinutes}
              onChange={(e) => updateTariff('freeMinutes', e.target.value)}
              className="text-center"
            />
          </div>
        </div>
      </Card>

      {/* Statistiques de facturation */}
      {billingData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Revenus Totaux"
              value={`${billingData.totalRevenue.toFixed(0)} XOF`}
              icon={Euro}
              variant="success"
              subtitle="Tous les appels facturés"
            />
            <StatsCard
              title="Appels Facturés"
              value={billingData.totalCalls}
              icon={FileText}
              variant="default"
              subtitle="Total d'enregistrements"
            />
            <StatsCard
              title="Minutes Totales"
              value={billingData.totalMinutes}
              icon={TrendingUp}
              variant="accent"
              subtitle="Durée de communication"
            />
            <StatsCard
              title="Coût Moyen"
              value={`${billingData.averageCost.toFixed(0)} XOF`}
              icon={Calculator}
              variant="warning"
              subtitle="Par extension"
            />
          </div>

          {/* Détails par extension */}
          <Card className="overflow-hidden shadow-card">
            <div className="p-6 border-b bg-muted/20">
              <h3 className="text-lg font-semibold">Facturation par Extension</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Extension</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Appels</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Minutes</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Répartition</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Coût Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {billingData.extensionBilling.map((ext, index) => (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{ext.extension}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div>{ext.answeredCalls}/{ext.totalCalls}</div>
                          <div className="text-muted-foreground text-xs">répondus/total</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{ext.totalMinutes}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {ext.callCounts.local > 0 && (
                            <Badge variant="secondary" className="text-xs">L:{ext.callCounts.local}</Badge>
                          )}
                          {ext.callCounts.national > 0 && (
                            <Badge variant="default" className="text-xs">N:{ext.callCounts.national}</Badge>
                          )}
                          {ext.callCounts.mobile > 0 && (
                            <Badge variant="outline" className="text-xs">M:{ext.callCounts.mobile}</Badge>
                          )}
                          {ext.callCounts.international > 0 && (
                            <Badge variant="destructive" className="text-xs">I:{ext.callCounts.international}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-success">
                          {ext.totalCost.toFixed(0)} XOF
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}