import { useState } from "react";
import { Download, Phone, Clock, Calendar, ArrowLeft, FileText } from "lucide-react";
import jsPDF from 'jspdf';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CallRecord {
  [key: string]: string;
}

interface ExtensionDetailsProps {
  extension: string;
  calls: CallRecord[];
  onBack: () => void;
}

export function ExtensionDetails({ extension, calls, onBack }: ExtensionDetailsProps) {
  const extensionCalls = calls.filter(call => 
    call.src === extension || call.dst === extension
  );

  const totalCalls = extensionCalls.length;
  const answeredCalls = extensionCalls.filter(call => 
    call.disposition === '4' || call.disposition?.toLowerCase() === 'answered'
  ).length;
  const totalDuration = extensionCalls.reduce((sum, call) => 
    sum + (parseInt(call.billsec || call.duration || '0')), 0
  );

  const ratePerMinute = 25; // XOF par minute
  const totalCost = Math.ceil(totalDuration / 60) * ratePerMinute;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR');
  };

  const downloadInvoice = () => {
    const pdf = new jsPDF();
    
    // Configuration de la police
    pdf.setFont('helvetica');
    
    // En-tête
    pdf.setFontSize(20);
    pdf.setTextColor(102, 51, 153); // Couleur primaire
    pdf.text('FACTURE TÉLÉPHONIQUE', 20, 30);
    
    // Informations générales
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Extension: ${extension}`, 20, 50);
    pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 60);
    
    // Ligne de séparation
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 75, 190, 75);
    
    // Résumé
    pdf.setFontSize(14);
    pdf.setTextColor(102, 51, 153);
    pdf.text('RÉSUMÉ:', 20, 90);
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`• Nombre total d'appels: ${totalCalls}`, 25, 105);
    pdf.text(`• Appels répondus: ${answeredCalls}`, 25, 115);
    pdf.text(`• Durée totale: ${formatDuration(totalDuration)}`, 25, 125);
    pdf.text(`• Tarif par minute: ${ratePerMinute} XOF`, 25, 135);
    
    // Total avec style
    pdf.setFontSize(14);
    pdf.setTextColor(34, 197, 94); // Couleur success
    pdf.text(`TOTAL: ${totalCost} XOF`, 25, 150);
    
    // Détail des appels si la page le permet
    if (extensionCalls.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(102, 51, 153);
      pdf.text('DÉTAIL DES APPELS:', 20, 170);
      
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      let yPosition = 185;
      const maxCalls = 15; // Limite pour tenir sur une page
      
      extensionCalls.slice(0, maxCalls).forEach((call) => {
        const duration = parseInt(call.billsec || call.duration || '0');
        const cost = Math.ceil(duration / 60) * ratePerMinute;
        const callText = `${formatDate(call.calldate || call.start)} | ${call.src} → ${call.dst} | ${formatDuration(duration)} | ${cost} XOF`;
        
        if (yPosition > 270) { // Nouvelle page si nécessaire
          pdf.addPage();
          yPosition = 30;
        }
        
        pdf.text(callText, 20, yPosition);
        yPosition += 8;
      });
      
      if (extensionCalls.length > maxCalls) {
        pdf.text(`... et ${extensionCalls.length - maxCalls} autres appels`, 20, yPosition + 5);
      }
    }
    
    // Pied de page
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i}/${pageCount} - Généré le ${new Date().toLocaleString('fr-FR')}`, 20, 285);
    }
    
    // Télécharger le PDF
    pdf.save(`facture_${extension}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Extension {extension}</h2>
            <p className="text-muted-foreground">Détails de facturation</p>
          </div>
        </div>
        
        <Button onClick={downloadInvoice} className="bg-gradient-to-r from-primary to-primary-glow">
          <Download className="w-4 h-4 mr-2" />
          Télécharger la facture
        </Button>
      </div>

      {/* Résumé de facturation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Appels</p>
              <p className="text-2xl font-bold text-foreground">{totalCalls}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Répondus</p>
              <p className="text-2xl font-bold text-success">{answeredCalls}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Durée totale</p>
              <p className="text-2xl font-bold text-foreground">{formatDuration(totalDuration)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Coût total</p>
              <p className="text-2xl font-bold text-primary">{totalCost} XOF</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Détail des appels */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Historique des appels</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date/Heure</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">De</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vers</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Durée</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Coût (XOF)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {extensionCalls.map((call, index) => {
                  const duration = parseInt(call.billsec || call.duration || '0');
                  const cost = Math.ceil(duration / 60) * ratePerMinute;
                  
                  return (
                    <tr key={index} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        {formatDate(call.calldate || call.start)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {call.src === extension ? (
                          <Badge variant="outline" className="bg-primary/20 text-primary">Sortant</Badge>
                        ) : (
                          call.src
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {call.dst === extension ? (
                          <Badge variant="outline" className="bg-accent/20 text-accent-foreground">Entrant</Badge>
                        ) : (
                          call.dst
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDuration(duration)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {cost} XOF
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Tarification */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tarification</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Tarif par minute:</span>
            <span className="font-semibold">{ratePerMinute} XOF</span>
          </div>
          <div className="flex justify-between">
            <span>Durée facturée:</span>
            <span>{Math.ceil(totalDuration / 60)} minutes</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total à payer:</span>
            <span className="text-primary">{totalCost} XOF</span>
          </div>
        </div>
      </Card>
    </div>
  );
}