'use client';

import { Database, Globe, Server, Shield, RefreshCw } from 'lucide-react';

const dataSources = [
  { name: 'Clockodo', type: 'SaaS Zeiterfassung', status: 'Demo-Modus', statusColor: 'bg-amber-100 text-amber-700', desc: 'API-Verbindung (clockodo.com) - Stunden, Abwesenheiten, Urlaub, Feiertage' },
  { name: 'DATEV', type: 'Buchhaltungssoftware', status: 'Demo-Modus', statusColor: 'bg-amber-100 text-amber-700', desc: 'Datenexport/API - Summen- und Saldenliste (SuSa), Personalkosten' },
  { name: 'Microsoft Dataverse', type: 'Low-Code Datenplattform', status: 'Demo-Modus', statusColor: 'bg-amber-100 text-amber-700', desc: 'Native Connector - Finanzplanung und Mitarbeiterstammdaten' },
  { name: 'SharePoint', type: 'Dokumenten-/Listenmanagement', status: 'Demo-Modus', statusColor: 'bg-amber-100 text-amber-700', desc: 'SharePoint Lists - AgileOne, PPM, Vertec-Stunden' },
  { name: 'PostgreSQL', type: 'Relationale Datenbank', status: 'Aktiv', statusColor: 'bg-emerald-100 text-emerald-700', desc: 'Zentrale Datenbank f\u00fcr alle Reports und Analysen' },
];

export function ConfigView() {
  return (
    <div className="space-y-4">
      {/* System Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-start gap-3">
          <Server className="w-8 h-8 text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Server</p>
            <p className="text-xs text-muted-foreground">Next.js 14 + PostgreSQL</p>
            <p className="text-xs text-muted-foreground">Abacus AI Hosting</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-start gap-3">
          <Database className="w-8 h-8 text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Datenbank</p>
            <p className="text-xs text-muted-foreground">PostgreSQL + Prisma ORM</p>
            <p className="text-xs text-muted-foreground">15 Tabellen, Sample-Daten</p>
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
      </div>

      {/* Data Sources */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Datenquellen</h3>
        <div className="space-y-3">
          {dataSources.map((ds: any) => (
            <div key={ds?.name} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{ds?.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ds?.statusColor}`}>{ds?.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{ds?.type}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ds?.desc}</p>
              </div>
              <button className="p-1.5 rounded hover:bg-muted transition-colors" title="Daten aktualisieren">
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Notes */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Integrationshinweise</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>\u2022 Die Anwendung nutzt aktuell <strong>Sample-Daten</strong> zu Demonstrationszwecken.</p>
          <p>\u2022 F\u00fcr den Produktivbetrieb k\u00f6nnen die echten Datenquellen \u00fcber API-Verbindungen integriert werden:</p>
          <p className="pl-4">\u2013 <strong>Clockodo API</strong>: Automatische Synchronisation der Zeiterfassungsdaten</p>
          <p className="pl-4">\u2013 <strong>DATEV Export/API</strong>: BWA- und Buchhaltungsdaten</p>
          <p className="pl-4">\u2013 <strong>Microsoft Dataverse</strong>: Stammdaten und Finanzplanung</p>
          <p className="pl-4">\u2013 <strong>SharePoint Lists</strong>: Projektmanagement-Daten</p>
          <p>\u2022 Das Datenmodell ist so aufgebaut, dass es eine nahtlose Migration von Sample- zu Echtdaten erm\u00f6glicht.</p>
        </div>
      </div>
    </div>
  );
}
