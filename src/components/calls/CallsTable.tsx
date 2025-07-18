import { useState } from "react";
import { Phone, Clock, User, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CallRecord {
  [key: string]: string;
}

interface CallsTableProps {
  data: CallRecord[];
}

export function CallsTable({ data }: CallsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = data.filter(call =>
    Object.values(call).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const formatDuration = (seconds: string) => {
    if (!seconds || seconds === '0' || seconds === '') return '0:00';
    const secs = parseInt(seconds) || 0;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    
    // Corriger les dates incorrectes
    if (timestamp.includes('2040') || timestamp.includes('701')) {
      return new Date().toLocaleString('fr-FR');
    }
    
    const date = new Date(timestamp);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      return new Date().toLocaleString('fr-FR');
    }
    
    return date.toLocaleString('fr-FR');
  };

  const getStatusBadge = (disposition: string) => {
    const status = disposition?.toLowerCase();
    const statusNum = parseInt(disposition);
    
    // Gestion des codes numériques Asterisk
    if (!isNaN(statusNum)) {
      switch (statusNum) {
        case 4:
          return <Badge variant="default" className="bg-success text-success-foreground">Répondu</Badge>;
        case 0:
          return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pas de réponse</Badge>;
        case 8:
          return <Badge variant="destructive">Occupé</Badge>;
        case 15:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Transféré</Badge>;
        case 26:
          return <Badge variant="outline" className="bg-muted text-muted-foreground">Parké</Badge>;
        case 1:
          return <Badge variant="default" className="bg-success text-success-foreground">Connecté</Badge>;
        case 5:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Reprise Parking</Badge>;
        case 7:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Transféré Aveugle</Badge>;
        case 9:
          return <Badge variant="outline" className="bg-muted text-muted-foreground">Abandonné</Badge>;
        case 10:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Écoute Active</Badge>;
        case 11:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Conférence</Badge>;
        case 12:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Supervision</Badge>;
        case 14:
          return <Badge variant="outline" className="bg-muted text-muted-foreground">Timeout</Badge>;
        case 16:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Renvoi</Badge>;
        case 18:
          return <Badge variant="destructive">Rejeté</Badge>;
        case 19:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Chuchoté</Badge>;
        case 20:
          return <Badge variant="outline" className="bg-muted text-muted-foreground">Interrompu</Badge>;
        case 21:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Dévié</Badge>;
        case 22:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Mise en Attente</Badge>;
        case 24:
          return <Badge variant="destructive">Erreur</Badge>;
        case 25:
          return <Badge variant="outline" className="bg-muted text-muted-foreground">Annulé</Badge>;
        case 28:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Follow Me</Badge>;
        case 29:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Récupéré du Parking</Badge>;
        case 34:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Transféré Assisté</Badge>;
        case 35:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Pickup Groupe</Badge>;
        case 38:
          return <Badge variant="outline" className="bg-muted text-muted-foreground">DND Activé</Badge>;
        case 40:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Origination</Badge>;
        case 51:
          return <Badge variant="outline" className="bg-primary/20 text-primary">Barge In</Badge>;
        case 67:
          return <Badge variant="outline" className="bg-muted text-muted-foreground">Queue Timeout</Badge>;
        case 91:
          return <Badge variant="outline" className="bg-accent text-accent-foreground">Extension Mobile</Badge>;
        default:
          return <Badge variant="outline">Code {disposition}</Badge>;
      }
    }
    
    // Gestion des statuts textuels
    if (status === 'answered' || status === 'répondu') {
      return <Badge variant="default" className="bg-success text-success-foreground">Répondu</Badge>;
    } else if (status === 'no answer' || status === 'pas de réponse') {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Pas de réponse</Badge>;
    } else if (status === 'busy' || status === 'occupé') {
      return <Badge variant="destructive">Occupé</Badge>;
    } else if (status === 'failed' || status === 'échec') {
      return <Badge variant="destructive">Échec</Badge>;
    } else if (status?.includes('transfer') || status?.includes('transféré')) {
      return <Badge variant="outline" className="bg-accent text-accent-foreground">Transféré</Badge>;
    } else if (status?.includes('park') || status?.includes('parké')) {
      return <Badge variant="outline" className="bg-muted text-muted-foreground">Parké</Badge>;
    } else if (status?.includes('spy') || status?.includes('écoute')) {
      return <Badge variant="outline" className="bg-primary/20 text-primary">Écoute</Badge>;
    } else {
      return <Badge variant="outline">{disposition || 'Inconnu'}</Badge>;
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Aucun appel trouvé</h3>
        <p className="text-muted-foreground">Importez un fichier CSV pour voir les détails des appels</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Détails des Appels</h2>
          <p className="text-muted-foreground">
            {filteredData.length} appel(s) trouvé(s) sur {data.length} total
          </p>
        </div>
        
        <div className="w-72">
          <Input
            placeholder="Rechercher dans les appels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <Card className="overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date/Heure</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Appelant</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Appelé</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Durée</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedData.map((call, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    {formatDate(call.calldate || call.start)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {call.src || call.clid || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {call.dst || call.dstchannel || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDuration(call.billsec || call.duration || '0')}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(call.disposition || call.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}