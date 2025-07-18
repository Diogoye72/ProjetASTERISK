import { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CSVUploaderProps {
  onFileProcessed: (data: any[]) => void;
}

export function CSVUploader({ onFileProcessed }: CSVUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');

  const parseCSV = (text: string) => {
    // Nettoyer le texte et gérer les différents types de fins de ligne
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return [];

    // Fonction pour parser une ligne CSV correctement (gestion des guillemets)
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Guillemet échappé ""
            current += '"';
            i += 2;
          } else {
            // Début ou fin de guillemets
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === ',' && !inQuotes) {
          // Séparateur trouvé hors guillemets
          result.push(current.trim());
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
      
      // Ajouter le dernier champ
      result.push(current.trim());
      return result;
    };

    console.log('Première ligne du CSV:', lines[0]);
    
    // Parser la ligne d'en-tête
    const headers = parseCsvLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
    console.log('Headers détectés:', headers);
    
    // Parser les données
    const data = lines.slice(1).map((line, index) => {
      const values = parseCsvLine(line).map(v => v.replace(/^"|"$/g, ''));
      const row: any = {};
      
      headers.forEach((header, headerIndex) => {
        row[header] = values[headerIndex] || '';
      });
      
      // Log pour debug des premières lignes
      if (index < 3) {
        console.log(`Ligne ${index + 1}:`, row);
      }
      
      return row;
    });

    console.log(`CSV parsé: ${data.length} enregistrements trouvés`);
    return data;
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('error');
      return;
    }

    setProcessing(true);
    setFileName(file.name);

    try {
      console.log('Début du traitement du fichier:', file.name, 'Taille:', file.size, 'bytes');
      
      const text = await file.text();
      console.log('Fichier lu, longueur du texte:', text.length);
      console.log('Aperçu du contenu (100 premiers caractères):', text.substring(0, 100));
      
      const data = parseCSV(text);
      
      if (data.length === 0) {
        console.error('Aucune donnée trouvée dans le fichier CSV');
        setUploadStatus('error');
      } else {
        console.log('Données traitées avec succès:', data.length, 'enregistrements');
        onFileProcessed(data);
        setUploadStatus('success');
      }
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      setUploadStatus('error');
    } finally {
      setProcessing(false);
    }
  }, [onFileProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <Card className="p-8">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
          ${processing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${processing 
              ? 'bg-muted animate-pulse' 
              : 'bg-primary/10'
            }
          `}>
            {processing ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {processing ? 'Traitement en cours...' : 'Importer fichier CSV Asterisk'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Glissez-déposez votre fichier CDR ou cliquez pour parcourir
            </p>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="csv-upload"
            disabled={processing}
          />
          
          <Button 
            asChild 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            disabled={processing}
          >
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Parcourir les fichiers
            </label>
          </Button>
        </div>
      </div>

      {uploadStatus !== 'idle' && (
        <div className="mt-6">
          {uploadStatus === 'success' && (
            <Alert variant="default" className="border-success bg-success/5">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                Fichier "{fileName}" traité avec succès !
              </AlertDescription>
            </Alert>
          )}
          
          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erreur lors du traitement du fichier. Assurez-vous qu'il s'agit d'un fichier CSV valide.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </Card>
  );
}