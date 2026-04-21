# Erweiterte Produktanalyse & Strategiedokument
## Business Intelligence für IT-Dienstleister

*Stand: April 2026 | Version 2.0*

---

# TEIL 1: STATUS-QUO-ANALYSE

## 1.1 Was die App heute kann (IST-Zustand)

### Modul: Finanzen (5 Seiten)
| Feature | KPIs / Kennzahlen | Bewertung |
|---------|------------------|----------|
| BWA-Dashboard | Umsatzerlöse, Rohertrag, Gesamtkosten, Betriebsergebnis, Ergebnis vor Steuern | ✅ Solide |
| Cashflow | Zuflüsse, Abflüsse, kumulierte Liquidität (Monatlich) | ✅ Gut |
| Deckungsbeitrag | DB pro Kunde, DB-Quote (simuliert: pauschal 47%) | ⚠️ Simuliert, nicht echt berechnet |
| Offene Posten | Forderungen nach Kunden | ✅ Gut |
| Planung & Forecast | IST vs. SOLL vs. Forecast pro Kategorie | ✅ Gut |
| Erträge | Umsatzaufschlüsselung, Bruttomarge | ✅ Solide |
| Betriebskosten | Personal-/Sach-/Abschreibungskosten (simuliert: Prozentuale Aufteilung) | ⚠️ Simuliert |
| Gauges | Deckungsbeitrag, Auslastung, Umsatzrendite | ✅ Visuell stark |

### Modul: HR & Team (2 Seiten)
| Feature | KPIs / Kennzahlen | Bewertung |
|---------|------------------|----------|
| Team-Übersicht | Entwickleranzahl, abrechenbare Stunden, Fluktuation, Krankheitstage, Urlaubstage | ✅ Gut |
| Auslastungsquote | Gesamt-Gauge + Einzeln pro Mitarbeiter | ✅ Kernfeature |
| Verlorener Umsatz (Krank) | Berechnung: Krankheitstage × 8h × Ø-Stundensatz | ✅ Clevere Kennzahl |
| Erfahrungs-Mix | Junior/Mid/Senior/Lead-Verteilung (PieChart) | ✅ Gut |
| Vertragsart | Remote/Hybrid/Office (PieChart) | ✅ Gut |
| Mitarbeiter-Detail | Individuell: Gehalt, Auslastung, Homeoffice-%, Vertrag, Erfahrung | ✅ Gut |
| Monatliche Stunden | Abrechenbar/Krank/Urlaub pro Monat (BarChart) | ✅ Gut |
| Ø Monatseinkommen | Durchschnitt über alle Mitarbeiter | ✅ Gut |

### Modul: Sales & CRM (2 Seiten)
| Feature | KPIs / Kennzahlen | Bewertung |
|---------|------------------|----------|
| Abrechenbare Stunden | Gesamt, pro Kunde | ✅ Gut |
| Kundenumsatz | Gesamt und pro Kunde | ✅ Gut |
| Ø Stundensatz | Gesamt und pro Kunde | ✅ Kernkennzahl |
| Umsatzverteilung | PieChart nach Kunden (Klumpenrisiko) | ✅ Gut |
| Monatstrends | Revenue + Stunden über Monate | ✅ Gut |
| Projekte | Liste mit Stundensatz, Budget, Kunde | ✅ Grundlage |

### Modul: Rechnungsstellung (2 Seiten)
| Feature | KPIs / Kennzahlen | Bewertung |
|---------|------------------|----------|
| Rechnungsübersicht | Betrag, Bezahlt, Offen, Statusverteilung | ✅ Gut |
| Kunden-Billing | Rechnungsbetrag vs. Bezahlt pro Kunde | ✅ Gut |
| Mitarbeiter-Abrechnung | Stunden pro MA pro Monat, Abrechenbar-Quote | ✅ Gut |
| Status-Tracking | Offen/Teilweise/Bezahlt/Überfällig | ✅ Gut |

### Modul: KI-Assistenten (1 Seite)
| Feature | Bewertung |
|---------|----------|
| 4 spezialisierte Agenten (General, Finanz, HR, Sales) | ✅ Grundlage |
| GPT-4.1-powered, Streaming-Responses | ✅ Modern |
| Kontext aus Datenbank (Kunden, MA, Finanzen) | ⚠️ Noch oberflächlich |
| Chat-Historie pro Session | ⚠️ Geht bei Reload verloren |

### Modul: System (2 Seiten)
| Feature | Bewertung |
|---------|----------|
| Datenmodell-Übersicht | ✅ Transparent |
| Modul-Status | ✅ Übersichtlich |

---

# TEIL 2: WAS FEHLT – KRITISCHE LÜCKEN

## 2.1 Fehlende Kernkennzahlen (KPIs)

Diese Kennzahlen sind für IT-Dienstleister geschäftskritisch, fehlen aber aktuell:

### Finanzen
| Fehlender KPI | Warum kritisch | Priorität |
|--------------|----------------|----------|
| **Echtkosten-Deckungsbeitrag** pro Kunde | Aktuell pauschal 47% simuliert – muss echte Personalkosten pro Kunde verrechnen | 🔴 KRITISCH |
| **Revenue per Employee** | DER Branchen-Benchmark für Effizienz (Ziel: 10–15K€/MA/Monat) | 🔴 KRITISCH |
| **Personalkosten-Quote** | Personalkosten / Umsatz (Ziel: 55–65%) – wichtigste Cost-Ratio | 🔴 KRITISCH |
| **EBITDA / EBITDA-Marge** | Operatives Ergebnis ohne Finanzierungseffekte | 🟡 HOCH |
| **Working Capital / DSO** | Days Sales Outstanding – wie schnell zahlen Kunden? | 🟡 HOCH |
| **Break-Even-Auslastung** | Ab welcher Auslastung wird Gewinn erwirtschaftet? | 🟡 HOCH |
| **Liquiditätsreichweite** | Wie viele Monate reicht die aktuelle Liquidität? | 🟡 HOCH |

### HR
| Fehlender KPI | Warum kritisch | Priorität |
|--------------|----------------|----------|
| **Billable Ratio** pro MA | Anteil abrechnungsfähiger Stunden an Gesamtstunden (Ziel: >75%) | 🔴 KRITISCH |
| **Revenue per Consultant** | Welcher Berater generiert welchen Umsatz? | 🔴 KRITISCH |
| **Bench-Quote** (unbesetzte Berater) | Wie viele Berater sitzen "auf der Bank" ohne Kundeneinsatz? | 🔴 KRITISCH |
| **Kosten pro Krankheitstag** | Echte Kosten (Lohnfortzahlung + entgangener Umsatz) | 🟡 HOCH |
| **Overtime / Überstunden** | Wie viele Stunden über Vertrag hinaus? Burnout-Indikator | 🟡 HOCH |
| **Gehälter vs. Markt-Benchmark** | Sind wir wettbewerbsfähig? Fluktuationsrisiko! | 🟢 MITTEL |
| **Skill-Matrix / Kompetenzprofil** | Welche Skills haben wir? Welche fehlen? | 🟢 MITTEL |

### Sales
| Fehlender KPI | Warum kritisch | Priorität |
|--------------|----------------|----------|
| **Customer Lifetime Value (CLV)** | Gesamtwert eines Kunden über die Geschäftsbeziehung | 🔴 KRITISCH |
| **Stundensatz-Entwicklung** über Zeit | Steigen oder sinken unsere Stundensätze? Preismacht-Indikator | 🔴 KRITISCH |
| **Kundenkonzentration (HHI)** | Herfindahl-Hirschman-Index – objektive Messung des Klumpenrisikos | 🟡 HOCH |
| **Win Rate / Angebotsquote** | Wie viele Angebote werden zu Aufträgen? | 🟡 HOCH |
| **Vertragslaufzeiten / Renewal Rate** | Verlängern Kunden oder kündigen sie? | 🟡 HOCH |
| **Cross-Selling-Rate** | Wie viele Kunden kaufen >1 Service? | 🟢 MITTEL |
| **Net Revenue Retention** | Wächst der Umsatz bei bestehenden Kunden? | 🟢 MITTEL |

### Rechnungen
| Fehlender KPI | Warum kritisch | Priorität |
|--------------|----------------|----------|
| **DSO (Days Sales Outstanding)** | Durchschnittliche Zahlungsdauer in Tagen | 🔴 KRITISCH |
| **Überfälligkeits-Aging** | 30/60/90/120+ Tage Analyse | 🔴 KRITISCH |
| **Gutschriften / Stornoquote** | Wie oft müssen wir Rechnungen korrigieren? | 🟢 MITTEL |

---

## 2.2 Fehlende Module (komplett neue Bereiche)

### 🔴 MODUL: Zeiterfassung (FEHLT KOMPLETT)
**Status:** Das Datenmodell hat `TimeEntry`, aber es gibt KEINE Möglichkeit, Zeiten im System zu erfassen. Die App konsumiert nur Daten.

**Warum das der wichtigste fehlende Baustein ist:**
- Zeiterfassung ist die **Daten-Quelle Nr. 1** für IT-Dienstleister
- Ohne eigene Zeiterfassung ODER Integration braucht die App immer ein Fremdsystem
- Ein eigenes Zeiterfassungsmodul wäre der **größte Mehrwert-Hebel** und gleichzeitig der **stärkste Lock-in**

**Was ein eigenes Zeiterfassungsmodul braucht:**

| Feature | Beschreibung | Priorität |
|---------|-------------|----------|
| Stunden buchen | Datum, Projekt, Stunden, Beschreibung, abrechenbar ja/nein | 🔴 Muss |
| Wochenansicht | Kalender-ähnliche Ansicht für schnelle Buchung | 🔴 Muss |
| Abwesenheiten | Urlaub, Krank, Feiertag beantragen/eintragen | 🔴 Muss |
| Freigabe-Workflow | Vorgesetzter gibt Zeiten frei | 🟡 Soll |
| Mobile-Ansicht | Unterwegs buchen | 🟡 Soll |
| Timer | Start/Stop-Funktion für laufende Tätigkeiten | 🟢 Kann |
| Projektbudget-Warnung | Alarm wenn X% des Budgets verbraucht | 🟡 Soll |

### 🟡 MODUL: Projekt-Controlling (FEHLT)
**Status:** Projekte existieren als Datensatz, aber es gibt kein echtes Controlling.

| Feature | Beschreibung | Priorität |
|---------|-------------|----------|
| Budget vs. Verbrauch | Visuell: Wie viel Budget ist noch übrig? | 🔴 Muss |
| Projekt-Profitabilität | Umsatz vs. Personalkosten pro Projekt | 🔴 Muss |
| Meilensteine / Phasen | Projektfortschritt tracken | 🟡 Soll |
| Forecast pro Projekt | Wann ist das Budget aufgebraucht? | 🟡 Soll |
| Ressourcenplanung | Wer arbeitet wann an welchem Projekt? | 🟡 Soll |

### 🟡 MODUL: Executive Dashboard / Cockpit (FEHLT)
**Status:** Kein zusammenfassendes C-Level-Dashboard.

| Feature | Beschreibung |
|---------|-------------|
| Top-5-KPIs auf einen Blick | Umsatz, Auslastung, DB, Cashflow, Offene Posten |
| Traffic-Light-System | Grün/Gelb/Rot für jede Kennzahl vs. Zielwert |
| Trend-Pfeile | Besser/Schlechter als Vormonat? |
| Alert-Feed | "3 Kunden haben offene Posten >60 Tage", "Auslastung unter 70%" |
| Quick-Actions | Direkt zum relevanten Detail-Report springen |

### 🟢 MODUL: Angebote / Pipeline (FEHLT)
| Feature | Beschreibung |
|---------|-------------|
| Angebots-Tracking | Angebote mit Status und Wahrscheinlichkeit |
| Pipeline-Wert | Gewichteter Gesamt-Pipeline-Wert |
| Win/Loss-Analyse | Warum haben wir gewonnen/verloren? |
| Forecast basierend auf Pipeline | Erwarteter Umsatz der nächsten Monate |

### 🟢 MODUL: Stammdaten-Verwaltung (unvollständig)
**Status:** Kunden/Mitarbeiter/Projekte existieren in der DB, aber es gibt KEINE UI zum Anlegen/Bearbeiten.

| Feature | Beschreibung | Priorität |
|---------|-------------|----------|
| Kunden anlegen/bearbeiten | Name, Branche, Kontaktdaten, Stundensatz | 🔴 Muss |
| Mitarbeiter verwalten | Gehalt, Vertrag, Skills, Start-/Enddatum | 🔴 Muss |
| Projekte konfigurieren | Budget, PO, Stundensatz, Laufzeit | 🔴 Muss |
| Import-Assistent | CSV-Upload für Massendaten | 🟡 Soll |

---

# TEIL 3: DATEN-STRATEGIE – WIE KOMMEN DIE DATEN REIN?

## 3.1 Das Drei-Säulen-Modell

Die Plattform braucht **drei Wege**, um an Daten zu kommen:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    DATEN-STRATEGIE                                       │
│                                                                          │
│   SÄULE 1               SÄULE 2               SÄULE 3                   │
│   Eigene Module         Integrationen          Datenimport               │
│   (Built-in)            (API-Anbindungen)      (CSV/Excel)               │
│                                                                          │
│   • Zeiterfassung       • Clockodo              • BWA-Import (CSV)         │
│   • Abwesenheiten       • Harvest               • Stunden-Import           │
│   • Stammdaten          • Toggl Track           • Mitarbeiter-Import       │
│   • Projekte            • Mite                  • Kunden-Import            │
│   • Rechnungen          • Kimai                 • Rechnungs-Import         │
│                         • ZEP                   • Offene-Posten-Import     │
│                         • lexoffice                                       │
│                         • sevDesk                                         │
│                         • DATEV (Unternehmen                              │
│                           Online / DATEVconnect)                          │
│                         • Personio                                        │
│                         • HRworks                                         │
│                         • Sage HR                                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Entscheidender Punkt:** Der Kunde muss NICHT alles auf einmal machen. Er kann:
1. **Tag 1:** Stammdaten manuell eingeben + BWA als CSV hochladen → sofort BI-Dashboards
2. **Woche 2:** Zeiterfassungsmodul aktivieren ODER Clockodo anbinden
3. **Monat 2:** lexoffice/DATEV anbinden für automatische Finanzdaten
4. **Später:** Weitere Integrationen nach Bedarf

## 3.2 Integrations-Landschaft (Detailliert)

### Zeiterfassungssysteme

| System | API-Qualität | Verbreitung bei Zielgruppe | Aufwand | Priorität |
|--------|-------------|---------------------------|---------|----------|
| **Clockodo** | ⭐⭐⭐⭐ REST-API, gut dokumentiert | Sehr hoch im DACH-Raum, speziell IT-DL | Mittel | 🔴 P1 |
| **Harvest** | ⭐⭐⭐⭐⭐ Exzellente API | Hoch, international | Niedrig | 🔴 P1 |
| **Toggl Track** | ⭐⭐⭐⭐ Gute REST-API | Hoch, viele kleine IT-Teams | Niedrig | 🟡 P2 |
| **Mite** | ⭐⭐⭐ Einfache API | Mittel, beliebt bei Agenturen | Niedrig | 🟡 P2 |
| **Kimai** | ⭐⭐⭐ Open-Source REST-API | Mittel, Self-Hosted-Fans | Mittel | 🟢 P3 |
| **ZEP** | ⭐⭐ SOAP/REST | Hoch bei Ingenieurbüros | Hoch | 🟢 P3 |

**Was wir von jeder Integration brauchen:**
- Zeiteinträge (Datum, Projekt, Stunden, abrechenbar)
- Projekte (Name, Kunde, Stundensatz)
- Abwesenheiten (wenn verfügbar)
- Automatischer täglicher Sync

### Buchhaltungs- / Rechnungssysteme

| System | API-Qualität | Verbreitung | Was wir bekommen | Priorität |
|--------|-------------|-------------|------------------|-----------|
| **lexoffice** | ⭐⭐⭐⭐ REST-API (Partner-Programm) | Sehr hoch bei KMU | Rechnungen, Kontakte, Belege, BWA-Äquivalent | 🔴 P1 |
| **sevDesk** | ⭐⭐⭐⭐ REST-API | Hoch bei KMU | Rechnungen, Kontakte, Zahlungen | 🔴 P1 |
| **DATEV Unternehmen Online** | ⭐⭐ DATEVconnect online | Standard bei Steuerberatern | BWA-Daten, Buchungssätze | 🟡 P2 |
| **DATEV (Schnittstelle Steuerberater)** | ⭐⭐ CSV/ASCII-Export | Universal | BWA als Datei | 🔴 P1 (CSV) |
| **Billomat** | ⭐⭐⭐ REST-API | Mittel | Rechnungen | 🟢 P3 |
| **FastBill** | ⭐⭐⭐ REST-API | Mittel | Rechnungen | 🟢 P3 |

**Strategischer Hinweis:** DATEV-Integration ist komplex (Zertifizierung nötig), aber der einfachste Weg ist: **Steuerberater exportiert BWA als CSV → Import in unsere App.** Das funktioniert ab Tag 1 und deckt 80% der Bedürfnisse ab.

### HR-Systeme

| System | API-Qualität | Was wir bekommen | Priorität |
|--------|-------------|------------------|-----------|
| **Personio** | ⭐⭐⭐⭐ REST-API | Mitarbeiterdaten, Abwesenheiten, Gehälter | 🟡 P2 |
| **HRworks** | ⭐⭐⭐ API | Mitarbeiter, Abwesenheiten, Zeiterfassung | 🟡 P2 |
| **Sage HR** | ⭐⭐⭐ API | Mitarbeiter, Org-Struktur | 🟢 P3 |
| **Kenjo** | ⭐⭐ API | Mitarbeiter, Performance | 🟢 P3 |

---

# TEIL 4: KI-STRATEGIE – WO KI ECHTEN MEHRWERT BRINGT

## 4.1 Aktueller KI-Status (Schwachstellen)

Die KI-Agenten sind aktuell im Wesentlichen **Chatbots mit minimalem Datenkontext:**
- Finanz-Agent bekommt: Anzahl Buchungen + letzter Cashflow-Stand
- HR-Agent bekommt: Anzahl MA + Ø Auslastung
- Sales-Agent bekommt: Anzahl Kunden + Projekte + Kundennamen

**Problem:** Das reicht nicht für echte datenbasierte Beratung. Die KI halluziniert Zahlen.

## 4.2 Wo KI einen fundamentalen Unterschied macht

### Stufe 1: Datenbasierte Analyse (kurzfristig)

| KI-Feature | Beschreibung | Wert für Kunden |
|-----------|-------------|------------------|
| **Smart Alerts** | KI erkennt Anomalien: "Auslastung Team A ist 15% unter Vormonat" | Frühwarnsystem |
| **Automatische Insights** | Auf jedem Dashboard: "Die 3 wichtigsten Erkenntnisse dieses Monats" | Spart Analysezeit |
| **Datenerklärung** | Klick auf jede Zahl: "Warum ist der Umsatz gesunken?" → KI erklärt | Sofortiges Verständnis |
| **BWA-Interpreter** | BWA-CSV hochladen → KI generiert lesbare Zusammenfassung + Empfehlungen | Steuerberater-Ersatz für die Einordnung |
| **Vollständige Datenweitergabe** an Agenten | Alle relevanten Zahlen, Trends, Vergleiche zum Vorjahr | Echte Beratungsqualität |

### Stufe 2: Prädiktive Analyse (mittelfristig)

| KI-Feature | Beschreibung | Wert für Kunden |
|-----------|-------------|------------------|
| **Umsatz-Forecast** | Basierend auf Pipeline, Auslastung, historischen Daten | Planungssicherheit |
| **Fluktutions-Risiko** | KI erkennt Muster: sinkende Auslastung + keine Gehaltserhöhung = Risiko | Mitarbeiterbindung |
| **Stundensatz-Empfehlung** | Basierend auf Markt, Kunde, Projekttyp, Auslastung | Umsatz-Optimierung |
| **Cash-Burn-Warnung** | "Bei aktuellem Trend reicht Liquidität noch 4,2 Monate" | Überlebensgarantie |
| **Bench-Vorhersage** | "In 3 Wochen endet Projekt X – 2 Berater werden frei" | Proaktive Akquise |

### Stufe 3: Autonome Agenten (langfristig)

| KI-Feature | Beschreibung | Wert für Kunden |
|-----------|-------------|------------------|
| **Automatische Rechnungserstellung** | KI generiert Rechnung aus gebuchten Stunden | Zeiteinsparung |
| **Automatische Mahnungen** | Intelligentes Mahnwesen basierend auf Kundenbeziehung | Besserer Cashflow |
| **Reporting-Autopilot** | Wöchentlicher KI-generierter Bericht per E-Mail an GF | Null Aufwand für Reporting |
| **Meeting-Vorbereitung** | Vor Kundengespräch: KI fasst alle Kennzahlen zum Kunden zusammen | Professionellere Kundengespräche |

---

# TEIL 5: SICHERHEIT & VERTRAUEN

## 5.1 Was Kunden Sicherheit gibt

| Bereich | Maßnahme | Warum wichtig |
|---------|---------|---------------|
| **Datenhoheit** | EU-Hosting (Frankfurt), keine Daten außerhalb der EU | DSGVO, Kundenvertrauen |
| **Verschlüsselung** | TLS 1.3 in Transit, AES-256 at Rest | Standard für sensible Finanzdaten |
| **Mandantentrennung** | Jeder Kunde hat isolierte Datenbank | Kein Daten-Leak möglich |
| **Rollenkonzept** | Admin, Controller, Manager, Viewer | Nicht jeder sieht Gehälter |
| **Audit-Log** | Jede Änderung wird protokolliert | Compliance, Nachvollziehbarkeit |
| **2FA** | Zwei-Faktor-Authentifizierung | Account-Sicherheit |
| **SSO** | Google/Microsoft SSO-Option | Convenience + Security |
| **Backup** | Tägliche automatische Backups, 30 Tage Aufbewahrung | Disaster Recovery |
| **Datenexport** | Jederzeit alle Daten als CSV/JSON exportieren | Kein Vendor Lock-in |
| **AVV** | Auftragsverarbeitungsvertrag nach Art. 28 DSGVO | Rechtssicherheit |
| **Penetration Testing** | Jährlicher externer Sicherheitstest | Vertrauen |

## 5.2 Was Kunden Flexibilität gibt

| Bereich | Maßnahme | Warum wichtig |
|---------|---------|---------------|
| **Kein Vendor Lock-in** | Alle Daten jederzeit exportierbar | Kunde behält Kontrolle |
| **Modular zubuchbar** | Nur zahlen was genutzt wird | Niedrige Einstiegshürde |
| **API-First** | Offene API für eigene Integrationen | Erweiterbarkeit |
| **Eigene Integrationen wählbar** | Clockodo ODER Harvest ODER manuell | Passt sich an, nicht umgekehrt |
| **Monatlich kündbar** | Kein Jahresvertrag (optional Rabatt) | Niedriges Risiko |
| **White-Label-Option** | Für IT-Berater, die das Tool für ihre Kunden nutzen | Partner-Channel |

---

# TEIL 6: MODULARISIERUNG & PREISMODELL

## 6.1 Modulstruktur (Kern + Add-Ons)

### Kernplattform (immer inkludiert)
- Executive Dashboard / Cockpit
- KI-Assistenten (Basis: Fragen stellen)
- Stammdaten-Verwaltung (Kunden, Mitarbeiter, Projekte)
- CSV/Excel-Import für alle Datentypen
- Basis-Reporting (Finanzen, HR, Sales)
- 1 User-Account

### Kostenpflichtige Module (Add-Ons)

| Modul | Beschreibung | Preis/Monat |
|-------|-------------|-------------|
| **🔴 Zeiterfassung PRO** | Stunden buchen, Timer, Wochenansicht, Freigabe-Workflow, Abwesenheiten | 99€ (bis 20 MA) / 199€ (bis 75) / 349€ (unbegrenzt) |
| **🔴 Rechnungsstellung PRO** | Rechnungen erstellen aus Zeiten, Mahnwesen, lexoffice/sevDesk-Sync | 149€ / 249€ / 399€ |
| **🟡 HR Analytics PRO** | Gehalts-Benchmarking, Skill-Matrix, Fluktionsprädiktion, Onboarding | 99€ / 179€ / 299€ |
| **🟡 Projekt-Controlling** | Budget-Tracking, Projekt-Profitabilität, Ressourcenplanung | 99€ / 179€ / 299€ |
| **🟡 Sales Pipeline** | Angebots-Tracking, Pipeline, Win/Loss, Forecast | 99€ / 179€ / 299€ |
| **🟢 KI PRO** | Automatische Insights, Smart Alerts, Reporting-Autopilot | 149€ / 249€ / 399€ |
| **🟢 Integrationen** | Pro Integration (Clockodo, lexoffice, Personio, etc.) | 49€ pro Integration |
| **🟢 Zusätzliche User** | Über Basis-Kontingent hinaus | 15€ pro User |

### Bundles

| Bundle | Module | Preis (bis 30 MA) | Ersparnis |
|--------|--------|--------------------|-----------|
| **Starter** | Kern + 1 Integration | 299€/Monat | – |
| **Professional** | Kern + Zeiterfassung + Rechnungen + 2 Integrationen + 5 User | 699€/Monat | ~25% |
| **Enterprise** | Kern + alle Module + alle Integrationen + unbegrenzte User | 1.499€/Monat | ~40% |

---

# TEIL 7: FUNDAMENTALE DIFFERENZIERUNG

## 7.1 Was würde den größten Unterschied machen?

### Die "Killer-Features" – priorisiert nach Impact

#### 🥇 #1: Echtkosten-Deckungsbeitrag pro Kunde
**Was:** Automatische Berechnung: (Stundensatz × Stunden) – (Personalkosten des eingesetzten Beraters)
**Warum Killer:** KEIN anderes Tool im Markt kann das. Clockodo hat die Stunden, DATEV hat die Kosten, aber NIEMAND verknüpft beides. Wir können es, weil wir ALLE Daten haben.
**Effekt:** Der GF sieht sofort: "Kunde Alpha bringt 150K€ Umsatz aber nur 12K€ Gewinn – weil wir dort den teuersten Senior-Berater mit dem niedrigsten Stundensatz einsetzen."

#### 🥈 #2: KI-generierter Wochenbericht per E-Mail
**Was:** Jeden Montag um 8:00 bekommt der GF eine E-Mail: "Letzte Woche: Umsatz +8%, 2 Berater unter 60% Auslastung, Kunde X hat Rechnung bezahlt, Empfehlung: Erhöhung Stundensatz bei Kunde Y."
**Warum Killer:** Zero-Effort-Reporting. Der GF muss die App nicht mal öffnen.
**Effekt:** Stärkstes Retentions-Feature. Wer das einmal hat, kündigt nicht.

#### 🥉 #3: Bench-Management / Verfügbarkeits-Dashboard
**Was:** Echtzeit-Übersicht: Welche Berater sind wann verfügbar? Welche Projekte enden bald?
**Warum Killer:** Das größte Problem von IT-Dienstleistern: Berater auf der Bank = Kosten ohne Umsatz. Frühzeitig zu wissen, wer frei wird, ermöglicht proaktive Akquise.
**Effekt:** 1 Berater × 1 Monat auf der Bank = 15.000€ verlorener Umsatz. Wer das 2 Wochen früher weiß, spart Zehntausende.

#### #4: Branchenvergleich (Benchmarks)
**Was:** Anonymisierter Vergleich mit ähnlichen IT-Dienstleistern: "Ihre Auslastung liegt bei 76% – der Branchendurchschnitt ist 82%."
**Warum Killer:** Extrem schwer nachzubauen (braucht Daten vieler Kunden). Wird mit jedem neuen Kunden wertvoller (Netzwerkeffekt).
**Effekt:** DAS Verkaufsargument, um Kunden zu gewinnen und zu halten.

---

# TEIL 8: WAS WÜRDE ICH SOFORT BAUEN?

## Priorisierte Roadmap (nächste 4 Sprints)

### Sprint 1: Fundament (macht die App real benutzbar)
1. ✅ **Executive Dashboard** – C-Level-Cockpit als Startseite
2. ✅ **Stammdaten-CRUD** – Kunden/MA/Projekte anlegen und bearbeiten
3. ✅ **CSV-Import** für BWA-Daten
4. ✅ **Echtkosten-Deckungsbeitrag** (statt simulierte 47%)
5. ✅ **Fehlende KPIs** (Revenue/Employee, Personalkosten-Quote, DSO)

### Sprint 2: Zeiterfassung (der größte Hebel)
1. ✅ **Eigenes Zeiterfassungsmodul** (Stunden buchen, Wochenansicht)
2. ✅ **Abwesenheitsverwaltung** (Urlaub/Krank beantragen)
3. ✅ **Budget-Warnung** bei Projekten

### Sprint 3: KI-Upgrade
1. ✅ **Vollständige Datenweitergabe** an KI-Agenten
2. ✅ **Automatische Insights** auf jedem Dashboard
3. ✅ **KI-Wochenbericht** per E-Mail

### Sprint 4: Integrationen
1. ✅ **Clockodo-Integration** (API-Sync)
2. ✅ **lexoffice-Integration** (Rechnungen + Kontakte)
3. ✅ **Datenexport** (CSV/PDF für alle Module)

---

# TEIL 9: ZUSAMMENFASSUNG – DAS GESAMTBILD

## Was haben wir? (Gut)
- Solide BI-Dashboards für Finanzen, HR, Sales, Rechnungen
- KI-Assistenten als Grundlage
- Professionelles UI mit Dark-Mode-Sidebar
- Auth-System, sichere Architektur
- ~80% der wichtigen Visualisierungen

## Was fehlt? (Kritisch)
- **Keine Dateneingabe** – man kann nur Daten ansehen, nicht erfassen
- **Keine Integrationen** – Daten müssen komplett per Seed-Script kommen
- **KI ist oberflächlich** – wenig Kontext, keine proaktiven Insights
- **Wichtige KPIs fehlen** – Echtkosten-DB, Revenue/Employee, DSO, Bench-Quote
- **Kein Executive-Dashboard** – keine Gesamtsicht für die GF
- **Kein Datenexport** – keine PDFs, keine CSV-Exports

## Was macht uns einzigartig? (USP)
1. **Einziges Tool, das Finanzen + HR + Sales + Auslastung verknüpft** für IT-DL
2. **Echtkosten-Deckungsbeitrag pro Kunde** – kein anderes Tool kann das
3. **KI-Agenten mit Vollzugriff** auf alle Geschäftsdaten
4. **Branchenspezifisch** statt generisch – spricht die Sprache der Zielgruppe
5. **Drei-Säulen-Datenstrategie** – eigene Module ODER Integrationen ODER Import

---

*Erstellt: April 2026 | Version 2.0*
*Dieses Dokument ist vertraulich und nur für die interne Produktentwicklung bestimmt.*
