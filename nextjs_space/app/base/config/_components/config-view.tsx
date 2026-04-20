'use client';

import { Database, Globe, Server, Shield, RefreshCw, Upload, Cpu } from 'lucide-react';

const modules = [
  { name: 'Zeiterfassung', type: 'Integriertes Modul', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'Stunden buchen, Abwesenheiten und Auslastung erfassen' },
  { name: 'Buchhaltung (BWA)', type: 'CSV-Import / API', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'BWA-Daten importieren \u2013 CSV-Upload oder automatischer API-Abruf' },
  { name: 'Stammdaten', type: 'Integriert', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'Kunden, Mitarbeiter, Vertr\u00e4ge und Stunds\u00e4tze direkt verwalten' },
  { name: 'Projektverwaltung', type: 'Integriert', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'Projekte mit Budgets, Purchase Orders und Stundensatz-Zuordnungen' },
  { name: 'Rechnungsmodul', type: 'Integriert', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'Rechnungen erstellen und Zahlungsstatus verfolgen' },
  { name: 'KI-Assistenten', type: 'Integrierte KI', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'Finanz-Analyst, HR-Berater und Sales-Stratege per Chat' },
  { name: 'PostgreSQL', type: 'Relationale Datenbank', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'Zentrale Datenbank f\u00fcr alle Module und Analysen' },
];

export function ConfigView() {
  return (
    <div className="space-y-4">
      {/* System Info */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-start gap-3">
          <Server className="w-8 h-8 text-teal-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Server</p>
            <p className="text-xs text-muted-foreground">Next.js 14 + PostgreSQL</p>
            <p className="text-xs text-muted-foreground">Cloud-Hosting</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-start gap-3">
          <Database className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Datenbank</p>
            <p className="text-xs text-muted-foreground">PostgreSQL + Prisma ORM</p>
            <p className="text-xs text-muted-foreground">15+ Tabellen</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-start gap-3">
          <Shield className="w-8 h-8 text-purple-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Sicherheit</p>
            <p className="text-xs text-muted-foreground">SSL/TLS verschl\u00fcsselt</p>
            <p className="text-xs text-muted-foreground">Rollenbasierte Zugriffe</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-start gap-3">
          <Cpu className="w-8 h-8 text-pink-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">KI-Engine</p>
            <p className="text-xs text-muted-foreground">GPT-4.1 powered</p>
            <p className="text-xs text-muted-foreground">3 spezialisierte Agents</p>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Module & Datenquellen</h3>
        <div className="space-y-3">
          {modules.map((ds: any) => (
            <div key={ds?.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{ds?.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ds?.statusColor}`}>{ds?.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{ds?.type}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ds?.desc}</p>
              </div>
              <button className="p-1.5 rounded hover:bg-muted transition-colors" title="Status pr\u00fcfen">
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Integration */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Upload className="w-4 h-4" /> Datenintegration</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>\u2022 <strong>BWA-Daten:</strong> Monatlich als CSV aus Ihrer Buchhaltung exportieren und hochladen</p>
          <p>\u2022 <strong>Zeiterfassung:</strong> Mitarbeiter erfassen Stunden direkt in Kapazito \u2013 keine externe Software n\u00f6tig</p>
          <p>\u2022 <strong>Stundens\u00e4tze:</strong> Pro Projekt/Vertrag im System pflegen \u2013 Umsatz wird automatisch berechnet</p>
          <p>\u2022 <strong>Stammdaten:</strong> Kunden und Mitarbeiter direkt in der Anwendung verwalten</p>
          <p>\u2022 <strong>Rechnungen:</strong> Automatisch aus Zeiterfassung und Stundens\u00e4tzen generieren</p>
          <p>\u2022 <strong>KI-Assistenten:</strong> Analysieren Ihre Daten und geben konkrete Handlungsempfehlungen</p>
        </div>
      </div>
    </div>
  );
}
