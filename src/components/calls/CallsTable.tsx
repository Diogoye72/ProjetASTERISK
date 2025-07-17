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
    const secs = parseInt(seconds) || 0;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR');
  };

  const getStatusBadge = (disposition: string) => {
    switch (disposition?.toUpperCase()) {
      case 'ANSWERED':
        return <Badge variant="default" className="bg-success text-success-foreground">Répondu</Badge>;
      case 'NO ANSWER':
        return <Badge variant="secondary">Non répondu</Badge>;
      case 'BUSY':
        return <Badge variant="destructive">Occupé</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Échec</Badge>;
      default:
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