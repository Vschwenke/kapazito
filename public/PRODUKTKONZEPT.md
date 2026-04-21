# ServiceIQ – Intelligence Quotient für dein IT-Service-Business

## Produktkonzept & Business Case

*Stand: April 2026 | Version 3.0*

---

## 1. Executive Summary

**ServiceIQ** ist eine KI-gestützte Business-Intelligence-Plattform, die speziell für IT-Dienstleister entwickelt wurde. Die Software vereint Finanzen, HR, Sales, Zeiterfassung, Rechnungsstellung und KI-Beratung in einer einzigen Anwendung – zugeschnitten auf das Geschäftsmodell von Unternehmen, die Berater- und Entwicklerzeit verkaufen.

> **„ServiceIQ macht dein IT-Service-Business messbar, steuerbar und intelligent.“**

---

## 2. Das Problem

### Die tägliche Realität eines IT-Dienstleisters

IT-Unternehmen mit 10–150 Mitarbeitern operieren typischerweise mit 5–8 verschiedenen Tools, die nicht miteinander sprechen:

| Bereich | Typische Tools | Kernproblem |
|---------|---------------|-------------|
| Zeiterfassung | Clockodo, Harvest, Toggl, Mite | Nur Stunden – kein Bezug zu Kosten oder Profitabilität |
| Buchhaltung | DATEV, lexoffice, sevDesk | Nur Zahlen – kein Bezug zu Projekten oder Kunden |
| CRM / Sales | Pipedrive, HubSpot | Keine Verbindung zu Auslastung oder Verfügbarkeit |
| HR | Personio, Excel | Kein Zusammenhang mit Profitabilität |
| Reporting | Power BI, Excel | Manuelles Zusammenführen, enormer Aufwand |
| Rechnungsstellung | lexoffice, Billomat | Isoliert von Zeiterfassung und Projekten |
| Banking | Banken-Portale | Kein Zusammenhang mit Forecast oder Cashflow-Planung |

### Die 5 größten Schmerzpunkte

1. **Blindflug bei der Profitabilität** – Welcher Kunde ist wirklich profitabel? Niemand weiß es, weil Stundensätze, Auslastung und Kosten in verschiedenen Systemen liegen.

2. **Auslastung als Blackbox** – Die Auslastungsquote ist DIE wichtigste Kennzahl, wird aber bestenfalls monatlich in Excel berechnet.

3. **Keine Frühwarnung** – Steigende Krankheitsquoten, sinkende Stundensätze oder wachsende offene Posten werden erst erkannt, wenn es zu spät ist.

4. **2–5 Tage/Monat für Reporting** – Der GF verbringt die Hälfte seiner Zeit damit, Daten zusammenzuführen statt Entscheidungen zu treffen.

5. **Kein Echtzeit-Cashflow** – Ohne Bankanbindung sind Liquiditätsdaten immer veraltet. Forecast basiert auf Schätzungen statt echten Kontobewegungen.

---

## 3. Die Lösung: ServiceIQ

### Produktvision

> **Eine einzige Plattform, die alle geschäftskritischen Daten eines IT-Dienstleisters verbindet – inklusive Bankkonten – und mit KI-gestützter Analyse in Echtzeit-Handlungsempfehlungen verwandelt.**

### Das Drei-Säulen-Modell: Woher kommen die Daten?

ServiceIQ bietet drei Wege, um an Daten zu kommen. Der Kunde wählt, was zu ihm passt:

```
┌────────────────────────────────────────────────────────────────────┐
│              DATEN-STRATEGIE: 3 SÄULEN                        │
│                                                              │
│   SÄULE 1              SÄULE 2             SÄULE 3            │
│   Eigene Module        Integrationen       Datenimport        │
│   (Built-in)           (API-Sync)          (CSV/Excel)        │
│                                                              │
│   • Zeiterfassung      • Clockodo           • BWA (CSV)         │
│   • Abwesenheiten      • Harvest            • Stunden-Import    │
│   • Stammdaten         • Toggl Track        • MA-Import         │
│   • Projekte           • Mite / Kimai       • Kunden-Import     │
│   • Rechnungen         • lexoffice          • Rechnungen        │
│                        • sevDesk            • Offene Posten     │
│   NEU: Bankzugang      • DATEV                                 │
│   • Open Banking API   • Personio                              │
│   • PSD2-konform       • HRworks                               │
│   • Echtzeit-Saldo     • Bankanbindung                         │
│     & Transaktionen       (finAPI/Tink)                       │
└────────────────────────────────────────────────────────────────────┘
```

**Entscheidend:** Der Kunde muss NICHT alles auf einmal machen:
- **Tag 1:** Stammdaten eingeben + BWA-CSV hochladen → sofort BI-Dashboards
- **Woche 2:** Zeiterfassungsmodul aktivieren ODER Clockodo anbinden
- **Monat 2:** Bankkonto verbinden für Echtzeit-Cashflow
- **Später:** lexoffice, Personio oder weitere Systeme anbinden

---

## 4. Funktionsumfang (Module)

### 📊 Modul: Finanzen & Controlling

| Feature | Beschreibung |
|---------|-------------|
| BWA-Dashboard | Betriebswirtschaftliche Auswertung: Umsatz, Rohertrag, Kosten, Betriebsergebnis |
| Cashflow-Analyse | Echtzeit-Cashflow aus Bankanbindung (Zu-/Abflüsse, kumulierte Liquidität) |
| **Bankkonten-Integration** | **PSD2-konforme Anbindung via Open Banking (finAPI/Tink). Echtzeit-Kontostand, Transaktionen, automatische Kategorisierung** |
| **Liquiditätsreichweite** | **"Bei aktuellem Burn-Rate reicht die Liquidität noch X Monate"** |
| Planung & Forecast | IST-SOLL-Vergleiche mit automatischem Forecast |
| **Laufender-Monat-Forecast** | **Hochrechnung des aktuellen Monats basierend auf: bereits gebuchte Stunden + offene Arbeitstage + Auslastungstrend + geplante Abwesenheiten + Bankbewegungen** |
| Deckungsbeitrag | **Echtkosten-DB pro Kunde:** (Stundensatz × Stunden) – (anteilige Personalkosten) |
| **Revenue per Employee** | Umsatz pro Mitarbeiter pro Monat (Branchenbenchmark: 10–15K€) |
| **Personalkosten-Quote** | Personalkosten / Umsatz (Ziel: 55–65%) |
| Offene Posten | Forderungen nach Kunden mit **Aging-Analyse (30/60/90/120+ Tage)** |
| **DSO** | Days Sales Outstanding – durchschnittliche Zahlungsdauer |
| Betriebskosten | Kostenstruktur nach Kategorien mit monatlicher Entwicklung |
| **Break-Even-Auslastung** | Ab welcher Auslastung wird Gewinn erwirtschaftet? |

### ⏱️ Modul: Zeiterfassung (Add-On)

| Feature | Beschreibung |
|---------|-------------|
| Stunden buchen | Datum, Projekt, Tätigkeit, Stunden, abrechenbar ja/nein |
| Wochenansicht | Kalender-ähnlich, schnelles Buchen per Klick |
| Timer | Start/Stop für laufende Tätigkeiten |
| Abwesenheiten | Urlaub, Krank, Feiertag beantragen und genehmigen |
| Freigabe-Workflow | Vorgesetzter gibt Zeiten frei, E-Mail-Benachrichtigung |
| Budget-Warnung | Automatischer Alarm wenn X% des Projektbudgets verbraucht |
| Mobile-Ansicht | Responsive für unterwegs |

**ODER:** Integration mit Clockodo, Harvest, Toggl, Mite, Kimai, ZEP

### 👥 Modul: HR & Team

| Feature | Beschreibung |
|---------|-------------|
| Team-Übersicht | Auslastung, Fluktuation, Krankenquote, Urlaubstage |
| **Bench-Management** | **Welche Berater sind wann verfügbar? Welche Projekte enden bald?** |
| **Billable Ratio** | **Anteil abrechnungsfähiger Stunden pro Mitarbeiter** |
| **Revenue per Consultant** | **Welcher Berater generiert welchen Umsatz?** |
| Mitarbeiter-Details | Gehalt, Vertrag, Skills, Auslastung, Homeoffice-% |
| Abwesenheits-Tracking | Trendanalyse Krankheit/Urlaub mit Umsatzausfall-Berechnung |
| **Überstunden-Tracking** | Burnout-Frühindikator |
| Erfahrungs-Mix | Junior/Mid/Senior/Lead-Verteilung für optimale Teamzusammensetzung |

### 💼 Modul: Sales & CRM

| Feature | Beschreibung |
|---------|-------------|
| Kunden-Dashboard | Umsatz, Stunden, Stundensätze pro Kunde |
| **Stundensatz-Entwicklung** | **Trend über Zeit: Steigen oder sinken unsere Stundensätze?** |
| **Kundenkonzentration (HHI)** | **Objektive Messung des Klumpenrisikos** |
| **Customer Lifetime Value** | **Gesamtwert eines Kunden über die Geschäftsbeziehung** |
| Projekt-Übersicht | Budget, PO, Status, Ressourcen pro Projekt |
| Monatstrends | Revenue- und Stunden-Entwicklung |

### 🧾 Modul: Rechnungsstellung (Add-On)

| Feature | Beschreibung |
|---------|-------------|
| Rechnungsübersicht | Status: offen, teilbezahlt, bezahlt, überfällig |
| **Rechnungserstellung aus Zeiten** | **Automatisch Rechnung generieren aus gebuchten Stunden** |
| **Mahnwesen** | **Intelligente Zahlungserinnerungen basierend auf Kundenbeziehung** |
| Mitarbeiter-Billing | Welcher MA generiert wie viel Umsatz |
| **Export zu lexoffice/sevDesk** | **Rechnungen direkt ins Buchhaltungssystem syncen** |

### 🤖 Modul: KI-Assistenten

| Agent | Spezialisierung | KI-Mehrwert |
|-------|----------------|-------------|
| **Business-Assistent** | Allgemeine Beratung | Querverbindungen zwischen allen Modulen |
| **Finanz-Analyst** | BWA, Cashflow, Kosten | BWA-Interpretation, Liquiditätswarnung, Forecast |
| **HR-Berater** | Auslastung, Team | Fluktuationsrisiko-Erkennung, Bench-Vorhersage |
| **Sales-Stratege** | Kunden, Preise | Stundensatz-Empfehlung, Cross-Selling |

**KI-Stufen:**

| Stufe | Features | Timeline |
|-------|---------|----------|
| **Stufe 1: Datenbasiert** | Vollständige Datenweitergabe, BWA-Interpreter, Smart Alerts, automatische Insights auf jedem Dashboard | Sofort |
| **Stufe 2: Prädiktiv** | Umsatz-Forecast, Fluktuationsrisiko, Cash-Burn-Warnung, Bench-Vorhersage, Stundensatz-Empfehlung | 3–6 Monate |
| **Stufe 3: Autonom** | KI-Wochenbericht per E-Mail, automatische Rechnungen, intelligentes Mahnwesen, Meeting-Vorbereitung | 6–12 Monate |

### ⚙️ Modul: System & Konfiguration

| Feature | Beschreibung |
|---------|-------------|
| Stammdaten-CRUD | Kunden, Mitarbeiter, Projekte anlegen und bearbeiten |
| CSV/Excel-Import | Für BWA, Stunden, Kunden, Mitarbeiter |
| Datenexport | CSV, PDF, Excel für alle Module |
| Datenübersicht | Alle Tabellen und Datenquellen auf einen Blick |
| Integrations-Verwaltung | Verbundene Systeme, Sync-Status, API-Keys |

---

## 5. Datenquellen-Strategie (Detail)

### 5.1 Bankkonten-Anbindung (NEU – Game Changer)

**Warum das alles verändert:**
Mit Zugriff auf echte Bankdaten wird aus einem Reporting-Tool ein **Echtzeit-Finanzcockpit:**

| Feature | Ohne Bank | Mit Bank |
|---------|-----------|----------|
| Cashflow | Manuell aus BWA (Monat alt) | **Echtzeit aus Kontobewegungen** |
| Liquidität | Geschätzt | **Auf den Cent genau** |
| Forecast aktueller Monat | Nicht möglich | **Hochrechnung aus Ist-Daten + Trends** |
| Zahlungseingänge | Manuell abgleichen | **Automatisch zuordnen zu Rechnungen** |
| Frühwarnung | Keine | **"Liquidität reicht noch 3,2 Monate"** |

**Technische Umsetzung:**
- **Provider:** finAPI (deutsch, PSD2-zertifiziert) oder Tink (Visa-Tochter)
- **Standard:** PSD2 / Open Banking API
- **Sicherheit:** Bank-Grade-Verschlüsselung, keine Speicherung von Bankzugangsdaten
- **Kategorisierung:** KI-basierte automatische Zuordnung von Transaktionen (Gehälter, Miete, Kundeneingänge, etc.)

### 5.2 BWA-Import (Kernfeature)

**Der pragmatischste Weg zu Finanzdaten:**
- Steuerberater exportiert monatlich BWA als CSV/PDF aus DATEV
- ServiceIQ importiert und parsed automatisch
- **KI-Feature:** BWA hochladen → sofortige Zusammenfassung + Empfehlungen

**Formate:** DATEV-Standard-CSV, lexoffice-Export, sevDesk-Export, freies CSV-Mapping

### 5.3 Zeiterfassungs-Integrationen

| System | API | Verbreitung DACH | Daten | Priorität |
|--------|-----|-----------------|-------|-----------|
| **Clockodo** | REST, gut dokumentiert | Sehr hoch | Stunden, Projekte, Abwesenheiten | 🔴 P1 |
| **Harvest** | Exzellente REST-API | Hoch (international) | Stunden, Projekte, Ausgaben | 🔴 P1 |
| **Toggl Track** | Gute REST-API | Hoch | Stunden, Projekte | 🟡 P2 |
| **Mite** | Einfache REST-API | Mittel (Agenturen) | Stunden, Projekte | 🟡 P2 |
| **Kimai** | Open-Source REST | Mittel (Self-Hosted) | Stunden, Projekte, Abwesenheiten | 🟢 P3 |
| **ZEP** | SOAP/REST | Hoch (Ingenieurbüros) | Stunden, Projekte | 🟢 P3 |

### 5.4 Buchhaltungs-/Rechnungssysteme

| System | Daten | Integration | Priorität |
|--------|-------|------------|-----------|
| **lexoffice** | Rechnungen, Kontakte, Belege | REST-API (Partner-Programm) | 🔴 P1 |
| **sevDesk** | Rechnungen, Kontakte, Zahlungen | REST-API | 🔴 P1 |
| **DATEV** | BWA, Buchungssätze | CSV-Import (sofort) + DATEVconnect (später) | 🔴 P1 (CSV) |
| **Billomat** | Rechnungen | REST-API | 🟢 P3 |
| **FastBill** | Rechnungen | REST-API | 🟢 P3 |

### 5.5 HR-Systeme

| System | Daten | Priorität |
|--------|-------|-----------|
| **Personio** | Mitarbeiter, Abwesenheiten, Gehälter | 🟡 P2 |
| **HRworks** | Mitarbeiter, Zeiterfassung, Abwesenheiten | 🟡 P2 |
| **Sage HR** | Mitarbeiter, Org-Struktur | 🟢 P3 |

### 5.6 Laufender-Monat-Forecast (Killer-Feature)

So berechnet ServiceIQ den Forecast für den aktuellen Monat:

```
Forecast Umsatz (aktueller Monat) =
    Bereits gebuchte Stunden × Stundensatz
  + Verbleibende Arbeitstage × Ø-Auslastung × Ø-Stundensatz
  - Geplante Abwesenheiten × Stundensatz
  ± Trend-Korrektur (basierend auf letzten 3 Monaten)

Forecast Cashflow (aktueller Monat) =
    Aktueller Kontostand (aus Bankanbindung)
  + Erwartete Zahlungseingänge (fällige Rechnungen)
  - Geplante Ausgaben (Gehälter am 25., Miete am 1., etc.)
  - Offene Verbindlichkeiten
```

**Warum das einzigartig ist:** Kein anderes Tool im Markt verknüpft Zeiterfassung + Bankdaten + HR-Daten für einen Echtzeit-Forecast.

---

## 6. Zielgruppe

### Primäre Zielgruppe

**IT-Dienstleister im DACH-Raum mit 10–150 Mitarbeitern**, deren Geschäftsmodell auf dem Verkauf von Berater-/Entwicklerzeit basiert.

| Segment | Beschreibung | Typische Größe |
|---------|-------------|----------------|
| IT-Beratungen | Strategie, Prozess, Technologie | 15–100 MA |
| Systemhäuser | IT-Infrastruktur, Managed Services, Cloud | 20–150 MA |
| Softwareentwicklungshäuser | Custom Development, Nearshoring | 10–80 MA |
| IT-Personaldienstleister | ANÜ, Freelancer-Vermittlung | 10–50 MA |
| Managed Service Provider | IT-Betreuung mit SLAs | 15–100 MA |

### Buyer Persona: "Der datengetriebene Geschäftsführer"
- 35–55 Jahre, technikaffin, aber kein Entwickler
- Nutzt aktuell Excel + 3–5 verschiedene Tools
- Verbringt monatlich 2–5 Tage mit Reporting
- Budget: 500–2.000€/Monat für eine Lösung, die 2–5 Tage spart

---

## 7. USPs (Unique Selling Propositions)

### USP 1: Echtkosten-Deckungsbeitrag pro Kunde
> Kein anderes Tool verbindet Stundensätze + Personalkosten + Auslastung in einer Zahl.

### USP 2: Bankanbindung + Forecast
> Echtzeit-Liquidität statt monatlich veralteter BWA. Forecast des aktuellen Monats basierend auf echten Daten.

### USP 3: KI-Agenten mit Vollzugriff
> 4 spezialisierte Agenten, die nicht nur anzeigen, sondern aktiv beraten. KI-Wochenbericht per E-Mail.

### USP 4: Branchenspezifisch statt generisch
> Auslastungsquote, Bench-Management, Billable Hours – nativ eingebaut, nicht nachkonfiguriert.

### USP 5: Modular – nur zahlen was du brauchst
> Eigene Module ODER Integrationen. Zeiterfassung per User. Bankkonto optional. Kein All-or-Nothing.

---

## 8. Preismodell

### Kernplattform (Basis)

**Immer inkludiert:**
- Executive Dashboard / Cockpit
- Finanz-Dashboards (BWA, Cashflow, Deckungsbeitrag, Kosten)
- HR-Übersicht & Sales-Dashboard
- Rechnungsübersicht (nur Ansicht)
- KI-Assistenten (Basis: 50 Anfragen/Monat)
- Stammdaten-Verwaltung (Kunden, MA, Projekte)
- CSV/Excel-Import für alle Datentypen
- Datenexport (CSV, PDF)
- 3 User-Accounts

### Basis-Bundles

| Bundle | Zielgruppe | Preis | Inkludiert |
|--------|-----------|-------|------------|
| **Starter** | Kleine Teams (5–20 MA) | **349€/Monat** | Kernplattform + 1 Integration + 5 User |
| **Professional** | Mittelstand (20–75 MA) | **799€/Monat** | Kernplattform + Zeiterfassung (bis 30 User) + Rechnungsmodul + 3 Integrationen + 15 User + 200 KI-Anfragen |
| **Enterprise** | Größere Unternehmen (75–200 MA) | **1.699€/Monat** | Alles uneingeschränkt + Custom Integrationen + dedizierter Support + unbegrenzt KI |

### Add-On-Module (einzeln zubuchbar)

| Modul | Preismodell | Preis |
|-------|------------|-------|
| **⏱ Zeiterfassung** | **Pro User / Monat** | **9€/User/Monat** (Min. 5 User) |
| **🧾 Rechnungsstellung PRO** | Pro Unternehmen | 149€/Monat (Starter), 249€ (Pro), 399€ (Enterprise) |
| **🏦 Bankanbindung** | Pro Bankkonto | **29€/Bankkonto/Monat** |
| **📊 HR Analytics PRO** | Pro Unternehmen | 99€/Monat (Starter), 179€ (Pro), 299€ (Enterprise) |
| **📁 Projekt-Controlling** | Pro Unternehmen | 99€/Monat (Starter), 179€ (Pro), 299€ (Enterprise) |
| **📈 Sales Pipeline** | Pro Unternehmen | 99€/Monat (Starter), 179€ (Pro), 299€ (Enterprise) |
| **🤖 KI PRO** | Pro Unternehmen | 149€/Monat (unbegrenzte Anfragen + Wochenbericht + Smart Alerts) |
| **🔌 Integrationen** | Pro Anbindung | 49€/Integration/Monat |
| **👤 Zusätzliche User** | Pro User | 15€/User/Monat |

### Beispielrechnung: IT-Beratung mit 35 MA

| Posten | Preis |
|--------|-------|
| Professional Bundle | 799€ |
| + Zeiterfassung (35 User) | 315€ |
| + Bankanbindung (2 Konten) | 58€ |
| + KI PRO | 149€ |
| + 20 zusätzliche User | 300€ |
| **Gesamt** | **1.621€/Monat** |
| **ROI:** Spart mind. 3 GF-Tage/Monat + Auslastungsoptimierung | **>10x** |

### Setup-Gebühr

| Paket | Preis | Umfang |
|-------|-------|--------|
| **Self-Service** | 0€ | CSV-Import, Online-Dokumentation |
| **Assisted** | 1.500€ | Datenimport, 2h Setup-Call, Konfiguration |
| **White-Glove** | 4.500€ | Vollständiges Onboarding, Datenmigration, 3 Schulungstermine |

---

## 9. Wettbewerbsanalyse

| Lösung | Stärke | Schwäche gegenüber ServiceIQ |
|--------|--------|-----------------------------|
| **Power BI** | Mächtig, flexibel | Erfordert Expertise, teuer (50–100€/User/Monat + Berater), nicht branchenspezifisch |
| **Tableau / Looker** | Enterprise-ready | Zu komplex für KMU, keine Branchenfokussierung |
| **DATEV** | Standard bei Steuerberatern | Nur Finanzen, kein HR/Sales/Auslastung |
| **Personio** | Gutes HR | Nur HR, keine Finanz-/Sales-Integration |
| **Clockodo / Harvest** | Einfache Zeiterfassung | Nur Zeiterfassung, kein BI, keine KI |
| **Productive.io / Kantata** | PSA-Tool | Meist englisch, nicht DACH-fokussiert |
| **sevDesk / lexoffice** | Buchhaltung | Nur Rechnungen, kein BI |

**ServiceIQ-Positionierung:** Branchenspezifisch + KI + All-in-One + Bankanbindung

---

## 10. Sicherheit & Vertrauen

| Bereich | Maßnahme |
|---------|----------|
| **Datenhoheit** | EU-Hosting (Frankfurt), DSGVO-konform |
| **Verschlüsselung** | TLS 1.3 in Transit, AES-256 at Rest |
| **Mandantentrennung** | Isolierte Datenbank pro Kunde |
| **Rollenkonzept** | Admin, Controller, Manager, Viewer (nicht jeder sieht Gehälter) |
| **2FA / SSO** | Zwei-Faktor + Google/Microsoft SSO |
| **Bankdaten** | PSD2-konform, keine Speicherung von Zugangsdaten, nur Lesezugriff |
| **Audit-Log** | Jede Änderung protokolliert |
| **Backup** | Tägliche automatische Backups, 30 Tage |
| **Datenexport** | Jederzeit alle Daten als CSV/JSON – kein Vendor Lock-in |
| **AVV** | Auftragsverarbeitungsvertrag nach Art. 28 DSGVO |

### Flexibilität für den Kunden

- **Kein Vendor Lock-in:** Alle Daten jederzeit exportierbar
- **Modular zubuchbar:** Nur zahlen was genutzt wird
- **Eigene Integrationen wählbar:** Clockodo ODER Harvest ODER ServiceIQ-eigene Zeiterfassung
- **Monatlich kündbar:** Optional: 20% Rabatt bei Jahresvertrag
- **API-First:** Offene API für eigene Integrationen
- **White-Label-Option:** Für IT-Berater, die das Tool für ihre Kunden nutzen

---

## 11. Business Case

### Marktgröße (DACH)

| Kennzahl | Wert |
|----------|------|
| IT-Dienstleister in DACH (10–150 MA) | ~15.000 Unternehmen |
| Davon "Time & Material"-Geschäftsmodell | ~10.000 (67%) |
| Erreichbarer Markt (5 Jahre) | ~2.000 Unternehmen (20%) |
| Ø Jahresumsatz pro Kunde | 15.000–25.000€ |
| **TAM** | **~180 Mio. €/Jahr** |
| **SAM** | **~40 Mio. €/Jahr** |

### ROI für den Kunden

**Szenario: 40 Berater, Ø 130€/h, 80% Ziel-Auslastung**

| Verbesserung | Effekt | Jährlicher Wert |
|-------------|--------|-----------------|
| Auslastung +3% | +500 billable Hours | **+65.000€** |
| Stundensatz +5€ bei 2 Kunden | Höherer Ertrag | **+25.000€** |
| Reporting -3 Tage/Monat | GF-Zeitersparnis | **+18.000€** |
| Krankenstand -1 Tag/MA | Weniger Ausfall | **+12.000€** |
| Schnellere Zahlung (DSO -10 Tage) | Bessere Liquidität | **+8.000€** |
| **Gesamt-Wertbeitrag** | | **~128.000€/Jahr** |
| **Software-Kosten** | | **~20.000€/Jahr** |
| **ROI** | | **>6x** |

---

## 12. Roadmap (12 Monate)

| Quartal | Feature | Typ |
|---------|---------|-----|
| **Q1** | Executive Dashboard / Cockpit | Kern |
| **Q1** | Stammdaten-CRUD (Kunden, MA, Projekte) | Kern |
| **Q1** | CSV-Import (BWA, Stunden, MA) | Kern |
| **Q1** | Echtkosten-Deckungsbeitrag | Kern |
| **Q1** | Fehlende KPIs (Rev/Employee, DSO, Bench-Quote) | Kern |
| **Q2** | Zeiterfassungsmodul (Add-On) | Modul |
| **Q2** | Clockodo + Harvest Integration | Integration |
| **Q2** | lexoffice + sevDesk Integration | Integration |
| **Q2** | Bankanbindung (finAPI) | Modul |
| **Q3** | Rechnungserstellung aus Zeiten | Modul |
| **Q3** | KI Stufe 2 (Forecast, Smart Alerts, Wochenbericht) | KI |
| **Q3** | Laufender-Monat-Forecast | Kern |
| **Q3** | Personio Integration | Integration |
| **Q4** | Branchenvergleich (anonymisierte Benchmarks) | Kern |
| **Q4** | KI Stufe 3 (auto Rechnungen, Mahnwesen) | KI |
| **Q4** | Pipeline / Angebots-Tracking | Modul |
| **Q4** | White-Label-Option | Business |

---

## 13. Die 4 Killer-Features (die ServiceIQ einzigartig machen)

### 🥇 #1: Echtkosten-Deckungsbeitrag pro Kunde
KEIN anderes Tool verbindet Stundensätze + Personalkosten + Auslastung für die Antwort auf: *"Welcher Kunde lohnt sich wirklich?"*

### 🥈 #2: Echtzeit-Cashflow + Laufender-Monat-Forecast
Bankanbindung + gebuchte Stunden + Abwesenheiten = ein Forecast, der jeden Tag besser wird.

### 🥉 #3: KI-Wochenbericht per E-Mail
Jeden Montag: *"Umsatz +8%, 2 Berater unter 60%, Rechnung bezahlt, Empfehlung: Stundensatz erhöhen."*
Zero-Effort. Der GF muss die App nicht mal öffnen.

### 🏅 #4: Bench-Management
*"In 3 Wochen endet Projekt X – 2 Berater werden frei."*
1 Berater × 1 Monat auf der Bank = 15.000€ verlorener Umsatz.

---

*ServiceIQ – Intelligence Quotient für dein IT-Service-Business*
*Erstellt: April 2026 | Version 3.0*
*Vertraulich – nur für die interne Produktentwicklung*
