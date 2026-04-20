'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export function BwaImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [separator, setSeparator] = useState(';');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawContent, setRawContent] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setRawContent(text);
      const lines = text.split('\n').filter(l => l.trim());
      const parsed = lines.slice(0, 6).map(l => l.split(separator).map(c => c.trim()));
      setPreview(parsed);
    };
    reader.readAsText(f, 'UTF-8');
  };

  const handleImport = async () => {
    if (!rawContent) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/import/bwa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rawContent, separator }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Import fehlgeschlagen');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Info */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-semibold">CSV-Format f\u00fcr BWA-Import</p>
              <p className="text-muted-foreground">Pflichtfelder: <code className="bg-muted px-1 rounded">Kontonummer</code>, <code className="bg-muted px-1 rounded">Kontoname</code>, <code className="bg-muted px-1 rounded">Jahr</code>, <code className="bg-muted px-1 rounded">Monat</code>, <code className="bg-muted px-1 rounded">Betrag</code></p>
              <p className="text-muted-foreground">Optionale Felder: <code className="bg-muted px-1 rounded">Kategorie</code>, <code className="bg-muted px-1 rounded">Vorjahr</code>, <code className="bg-muted px-1 rounded">Budget</code></p>
              <p className="text-muted-foreground">Trennzeichen: Semikolon (;) oder Komma (,). Dezimaltrennzeichen: Komma oder Punkt.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader><CardTitle className="text-base">Datei hochladen</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium">Trennzeichen</label>
              <select value={separator} onChange={e => setSeparator(e.target.value)}
                className="ml-2 h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value=";">Semikolon (;)</option>
                <option value=",">Komma (,)</option>
                <option value="\t">Tab</option>
              </select>
            </div>
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors"
          >
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" />
                <span className="font-medium text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">CSV-Datei hier ablegen oder klicken zum Ausw\u00e4hlen</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {preview.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Vorschau (erste 5 Zeilen)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {preview[0]?.map((h, i) => (
                      <th key={i} className="text-left p-2 font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-b last:border-0">
                      {row.map((c, ci) => <td key={ci} className="p-2">{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleImport} disabled={loading}>
                {loading ? 'Importiere...' : 'Import starten'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card className="border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold text-emerald-500">Import erfolgreich!</p>
                <p>{result.imported} von {result.total} Datens\u00e4tzen importiert.</p>
                {result.skipped > 0 && <p className="text-orange-500">{result.skipped} Datens\u00e4tze \u00fcbersprungen.</p>}
                {result.errors?.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {result.errors.map((e: string, i: number) => <p key={i}>{e}</p>)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-500">Fehler</p>
                <p>{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
