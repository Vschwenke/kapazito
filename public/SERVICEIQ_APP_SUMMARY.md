# ServiceIQ – Vollständige App-Dokumentation

> **Intelligence Quotient für dein IT-Service-Business**

---

## 1. Produktübersicht

**ServiceIQ** ist eine vollständige SaaS-Business-Intelligence-Plattform für IT-Dienstleister. Sie vereint Finanzdaten (BWA), HR-Management, Sales/CRM, Rechnungsstellung, Zeiterfassung und KI-gestützte Analysen in einer einzigen Anwendung.

**Zielgruppe:** IT-Dienstleister, IT-Consulting-Firmen, Managed-Service-Provider (5–200 Mitarbeiter)

**Tech-Stack:**
- Frontend: Next.js 14, React 18, Tailwind CSS 3, Recharts
- Backend: Next.js API Routes, Prisma ORM, PostgreSQL
- Auth: NextAuth v4 (E-Mail/Passwort)
- KI: GPT-4.1-mini via Abacus AI API
- Fonts: DM Sans (Headings), Plus Jakarta Sans (Body), JetBrains Mono (Code/Zahlen)

---

## 2. Design-System

### Farbschema
| Verwendung | Hell | Dunkel |
|---|---|---|
| Primary | `hsl(221, 83%, 53%)` (#3b82f6) | `hsl(217, 91%, 60%)` |
| Background | `hsl(220, 20%, 97%)` | `hsl(222, 47%, 11%)` |
| Card | `hsl(0, 0%, 100%)` | `hsl(217, 33%, 17%)` |
| Accent | `hsl(199, 89%, 48%)` | `hsl(199, 89%, 48%)` |

### Chart-Farben
- `#60B5FF` (Blau), `#FF9149` (Orange), `#FF9898` (Rosa), `#FF90BB` (Pink), `#80D8C3` (Mint), `#A19AD3` (Lila)

### Sidebar
- Dunkle Sidebar (`bg-slate-900`), fixiert links
- Kollabierbar (Icon-Only-Modus)
- Mobile: Overlay mit Hamburger-Menü
- Logo: Blaues Quadrat "SQ" + "ServiceIQ"
- Gruppen-Icons mit Farben (Sky, Blue, Emerald, Orange, Purple, Amber, Teal, Cyan)
- Footer: User-Info + Abmelden-Button + Copyright

### Allgemeines Layout
- `DashboardShell`-Wrapper für jede Seite (Sidebar + Sticky-Header mit Titel/Subtitle + Content)
- KPI-Cards: Abgerundete Cards mit Icon, Wert, Delta-Anzeige (▲/▼ grün/rot)
- Gauge-Charts: SVG-basierte 270°-Bögen mit Animation
- Filter-Bar: Buttons für Jahr/Quartal/Monat-Auswahl
- Tabellen: Hover-Effekte, sortierbar, responsive
- Radius: `0.625rem` (10px)

---

## 3. Authentifizierung

### Screen: Login (`/login`)
- **Layout:** Split-Screen (50/50)
  - Links: Gradient-Background (Blue 700 → Slate 900), Logo, 4 Feature-Highlights mit Icons
  - Rechts: Login-Formular auf hellem Hintergrund
- **Felder:** E-Mail, Passwort (+ Name bei Registrierung)
- **Modi:** Login / Registrierung (Toggle-Link unten)
- **Demo-Zugang:** `admin@serviceiq.de` / `ServiceIQ2026!`
- **Redirect:** Nach Login → `/finanzen`

---

## 4. Screens & Module (Navigation)

### 4.1 Cockpit

#### 4.1.1 Executive Dashboard (`/dashboard`)
- **Titel:** EXECUTIVE COCKPIT
- **Datenquelle:** `/api/dashboard`
- **KPIs (obere Reihe):** Umsatz (€), Betriebsergebnis (€), Deckungsbeitrag (%), Auslastung (%), Offene Posten (€), Mitarbeiter (Anzahl)
- **Alerts-Banner:** Warnungen bei kritischen Metriken (niedriger DB, hohe offene Posten, etc.)
- **Charts:**
  - Monatlicher Umsatz (BarChart)
  - Cashflow-Entwicklung (ComposedChart: Zufluss/Abfluss Bars + Kumulativ Line)
  - Deckungsbeitrag pro Kunde (BarChart: Umsatz vs. Kosten mit DB-Linie)
  - Forderungsalter (PieChart: <30T / 30-60 / 60-90 / >90 Tage)
- **Quick-Links:** Navigation zu den Detail-Dashboards

#### 4.1.2 KI-Assistenten (`/agent`)
- **Titel:** KI-ASSISTENT
- **Layout:** Chat-Interface mit Agent-Auswahl oben
- **4 Agenten:**
  - ServiceIQ Assistent (Blau) – Allgemeine Geschäftsberatung
  - Finanz-Analyst (Grün) – BWA, Cashflow, Deckungsbeitrag
  - HR-Berater (Lila) – Auslastung, Team, Gehalt
  - Sales-Stratege (Orange) – Kunden, Stundensätze, Pipeline
- **Features:** Streaming-Antworten, Vorschlags-Buttons, Markdown-Rendering
- **Daten:** Agenten erhalten automatisch aktuelle KPIs aus der Datenbank

---

### 4.2 Finanzen

#### 4.2.1 Finanz-Dashboard (`/finanzen`)
- **Titel:** FINANZREPORT
- **Filter:** Jahr / Quartal / Monat
- **KPIs:** Umsatz, Rohertrag, Gesamtkosten, Betriebsergebnis, Kunden, Mitarbeiter
- **Gauges:** Auslastungsquote, Profitabilität
- **Charts:**
  - Betriebsergebnis-Entwicklung (ComposedChart: Umsatz/Kosten Bars + BE Line)
  - Cashflow-Verlauf (ComposedChart)
  - Offene Posten nach Kunden (BarChart)

#### 4.2.2 Planung & Forecast (`/finanzen/planung`)
- **Titel:** PLANUNG & FORECAST
- **Kategorie-Auswahl:** Umsatz, Personalkosten, Betriebskosten, Betriebsergebnis, Auslastung
- **Charts:**
  - IST vs. Plan (BarChart, gruppiert)
  - Forecast-Trend (LineChart: Plan vs. Forecast)
- **Detail-Tabelle:** Monat | Geplant | IST | Forecast | Abweichung (%)

#### 4.2.3 Deckungsbeitrag (`/finanzen/deckungsbeitrag`)
- **Titel:** DECKUNGSBEITRAG
- **Datenquelle:** `/api/dashboard` (customerDB mit Echtkosten)
- **KPIs:** Gesamt-DB (€), DB-Quote (%), Umsatz gesamt, Kosten gesamt
- **Charts:**
  - DB pro Kunde (BarChart: Umsatz/Kosten/DB)
  - DB-Verteilung (PieChart)
- **Warnungen:** Kunden mit DB-Quote < 30% werden hervorgehoben
- **Export:** CSV-Download
- **Tabelle:** Kunde | Umsatz | Kosten | DB | DB-Quote

#### 4.2.4 Erträge (`/finanzen/ertraege`)
- **Titel:** ERTRÄGE
- **Filter:** Jahr / Quartal / Monat
- **KPIs:** Gesamtumsatz, Refinancing, Rohertrag
- **Charts:**
  - Monatliche Ertragsaufschlüsselung (BarChart)
  - Rohertrag-Entwicklung (AreaChart)

#### 4.2.5 Betriebskosten (`/finanzen/betriebskosten`)
- **Titel:** BETRIEBSKOSTEN
- **Filter:** Jahr / Quartal / Monat
- **KPIs:** Gesamtkosten, Personalkosten, Sachkosten, Abschreibungen
- **Charts:**
  - Kostenverteilung (PieChart)
  - Monatlicher Kostenverlauf (gestapelter BarChart)
- **Hinweis:** Zeigt Warnung wenn nur geschätzte Daten (keine BWA-Subkategorien)
- **Export:** CSV-Download
- **Tabelle:** Kategorie | Betrag | Anteil

---

### 4.3 HR & Team

#### 4.3.1 Team-Übersicht (`/hr`)
- **Titel:** HR & RECRUITING - TEAM
- **KPIs:** Mitarbeiter gesamt, Billable Hours, Fluktuation, Krankheitskosten, Krankheitstage, Urlaubstage
- **Gauges:** Auslastung (%), Billable Quote (%)
- **Charts:**
  - Monatliche Stunden & Abwesenheiten (BarChart)
  - Verteilung nach Erfahrungslevel (PieChart: Junior/Mid/Senior/Lead)
  - Verteilung nach Vertragsart (PieChart: Remote/Hybrid/Office)

#### 4.3.2 Mitarbeiter-Detail (`/hr/mitarbeiter`)
- **Titel:** HR - MITARBEITER
- **Layout:** Mitarbeiterliste links (selektierbar) + Detail-Panel rechts
- **Detail-KPIs:** Vertragsart, Home-Office %, Monatsgehalt, Erfahrungslevel
- **Detail-Gauge:** Individuelle Auslastung
- **Tabelle:** Alle Mitarbeiter mit Stunden, Billable, Krank, Urlaub (sortierbar)

#### 4.3.3 Abwesenheiten (`/abwesenheiten`)
- **Titel:** ABWESENHEITSMANAGEMENT
- **KPIs pro Typ:** Urlaub (Tage), Krank (Tage), Feiertage (Anzahl), Sonstiges
- **Mitarbeiter-Übersicht:** Tabelle mit Urlaub/Krank/Gesamt pro Person
- **CRUD-Formular:** Mitarbeiter wählen, Typ, Start-/Enddatum, Arbeitstage (auto-berechnet)
- **Filter:** Nach Mitarbeiter
- **Export:** CSV-Download

---

### 4.4 Sales & CRM

#### 4.4.1 Sales Dashboard (`/sales`)
- **Titel:** SALES & CRM
- **Filter:** Kunde (Dropdown)
- **KPIs:** Billable Hours, Kundenumsatz, Ø Stundensatz, Offene Posten, Aktive MA, Kunden
- **Charts:**
  - Monatlicher Umsatz + Stunden (ComposedChart)
  - Umsatzverteilung nach Kunden (PieChart)
- **Tabelle:** Projekte mit Stundensatz und Budgetstunden

#### 4.4.2 Sales Erträge (`/sales/ertraege`)
- **Titel:** SALES - ERTRÄGE
- **Chart:** Umsatz pro Kunde (BarChart)
- **Tabelle:** Kunde | Umsatz | Stunden | Ø Stundensatz | Anteil (%)

#### 4.4.3 Projekt-Controlling (`/projekte`)
- **Titel:** PROJEKT-CONTROLLING
- **Summary-KPIs:** Projekte gesamt, Ø Budgetauslastung, Gefährdete Projekte, Ø Profitabilität
- **Projekt-Cards (expandierbar):**
  - Budget-Fortschrittsbalken (grün/gelb/rot je nach Auslastung)
  - Verbrauchte vs. Budget-Stunden
  - Profitabilität
  - Monatliche Stundenverteilung (BarChart)
  - Team-Mitglieder mit individuellen Stunden
- **Export:** CSV-Download

---

### 4.5 Rechnungen

#### 4.5.1 Kundenübersicht (`/rechnungen`)
- **Titel:** RECHNUNGSSTELLUNG
- **Filter:** Kunde
- **KPIs:** Gesamt fakturiert, Bezahlt, Offen, Anzahl Rechnungen
- **Charts:**
  - Rechnungen pro Kunde (BarChart: Gesamt vs. Bezahlt)
  - Status-Verteilung (PieChart: Offen/Teilweise/Bezahlt/Überfällig)
- **Tabellen:**
  - Rechnungsliste (Nr, Kunde, Datum, Betrag, Status)
  - MA-Billing-Summary (Stunden, Billable, monatliche Aufschlüsselung)

#### 4.5.2 Rechnungsdetails (`/rechnungen/details`)
- **Titel:** RECHNUNGSSTELLUNG - DETAILS
- **Filter:** Kunde + Monat
- **KPIs:** Mitarbeiter, Gesamtstunden, Billable Hours, Rechnungen
- **Tabelle:** Stundenerfassung pro MA mit monatlicher Aufschlüsselung

---

### 4.6 Stammdaten (CRUD)

#### 4.6.1 Kunden (`/stammdaten/kunden`)
- **Tabs:** Kunden | Mitarbeiter | Projekte
- **Suche:** Volltextsuche
- **Tabelle:** Name, Kürzel, Branche, Projekte (Anzahl), Status (Aktiv/Inaktiv), Aktionen
- **CRUD-Formular:** Name*, Kürzel, Branche, Aktiv-Toggle

#### 4.6.2 Mitarbeiter (`/stammdaten/mitarbeiter`)
- **Tabs:** Kunden | Mitarbeiter | Projekte
- **Suche:** Volltextsuche
- **Tabelle:** Name, E-Mail, Vertragsart (Badge), Level (Badge), Gehalt (€), Status
- **CRUD-Formular:** Vorname*, Nachname*, E-Mail, Vertragsart (Remote/Hybrid/Office), Level (Junior/Mid/Senior/Lead), Gehalt, HO%, Wochenstunden

#### 4.6.3 Projekte (`/stammdaten/projekte`)
- **Tabs:** Kunden | Mitarbeiter | Projekte
- **Suche:** Volltextsuche
- **Tabelle:** Projekt, Kunde, Bestellnr., Stundensatz, Budget-Stunden, Status
- **CRUD-Formular:** Name*, Kunde (Dropdown)*, Bestellnr., Stundensatz, Budget-Stunden

---

### 4.7 Zeiterfassung

#### 4.7.1 Wochenansicht (`/zeiterfassung`)
- **Titel:** ZEITERFASSUNG
- **Layout:** Wochenkalender-Grid
- **Mitarbeiter-Auswahl:** Dropdown
- **Wochennavigation:** Vor/Zurück-Buttons
- **Tages-Einträge:** Projekt, Stunden, Beschreibung, Billable-Toggle
- **Wochen-Summary:** Gesamtstunden, Billable, Quote

---

### 4.8 System

#### 4.8.1 Datenübersicht (`/base`)
- **Titel:** BASE REPORT
- **KPIs:** DB-Einträge gesamt, Tabellen, Datenquellen, Mitarbeiter
- **Charts:**
  - Einträge pro Datenquelle (PieChart)
  - Mitarbeiter nach Level (BarChart)
- **Datenarchitektur-Grafik:** Visuelle Darstellung der Datenquellen → PostgreSQL
- **Tabelle:** Tabellen mit Typ, Quelle, Einträge

#### 4.8.2 BWA-Import (`/import`)
- **Titel:** DATENIMPORT
- **Funktion:** CSV-Upload für BWA-/Finanzdaten
- **Prozess:** Datei wählen → Vorschau → Import bestätigen
- **Format:** Kontonummer, Kontoname, Kategorie, Jahr, Monat, Betrag, Vorjahr, Budget

#### 4.8.3 Konfiguration (`/base/config`)
- **Titel:** KONFIGURATION
- **Sektionen:**
  - Server-Info (Next.js, Node.js, PostgreSQL)
  - Datenbanken-Status
  - Sicherheit (Auth, HTTPS)
  - Datenquellen mit Status (Demo-Modus)
  - Integrationshinweise für Produktivbetrieb

---

## 5. Datenmodell (17 Tabellen)

| Tabelle | Beschreibung |
|---|---|
| `User` | Auth-Benutzer (E-Mail, Passwort, Rolle) |
| `ChatMessage` | KI-Chat-Verlauf |
| `Customer` | Kunden (Name, Branche, Status) |
| `Employee` | Mitarbeiter (Name, Vertragsart, Level, Gehalt) |
| `Project` | Projekte (Kunde, Stundensatz, Budget) |
| `TimeEntry` | Zeiterfassungs-Einträge |
| `Absence` | Abwesenheiten (Urlaub, Krank, Feiertag) |
| `FinancialAccount` | BWA-Konten (Umsatz, Kosten, Ergebnis) |
| `PersonnelCost` | Personalkosten pro MA/Monat |
| `Invoice` | Rechnungen (Betrag, Status) |
| `InvoiceItem` | Rechnungspositionen |
| `OpenItem` | Offene Posten |
| `FinancialPlanning` | Planungs-/Forecast-Daten |
| `Holiday` | Feiertage |
| `EmployeeAssignment` | MA-Kunden-Zuordnung (Stundensatz, Allocation) |
| `UserReport` | Monatliche MA-Reports (Stunden, Auslastung) |
| `CashflowEntry` | Cashflow-Daten |

---

## 6. API-Endpunkte

| Route | Methode | Beschreibung |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth Authentication |
| `/api/signup` | POST | User-Registrierung |
| `/api/dashboard` | GET | Executive Dashboard KPIs |
| `/api/finanzen` | GET | Finanz-Daten (BWA, Cashflow) |
| `/api/hr` | GET | HR-KPIs und Mitarbeiterdaten |
| `/api/sales` | GET | Sales/CRM-Daten |
| `/api/rechnungen` | GET | Rechnungsdaten |
| `/api/planung` | GET | Planungs-/Forecast-Daten |
| `/api/base` | GET | Datenmodell-Statistiken |
| `/api/agent` | POST | KI-Chat (Streaming) |
| `/api/stammdaten/kunden` | GET/POST | Kunden CRUD |
| `/api/stammdaten/kunden/[id]` | PUT/DELETE | Kunde bearbeiten/löschen |
| `/api/stammdaten/mitarbeiter` | GET/POST | Mitarbeiter CRUD |
| `/api/stammdaten/mitarbeiter/[id]` | PUT/DELETE | MA bearbeiten/löschen |
| `/api/stammdaten/projekte` | GET/POST | Projekte CRUD |
| `/api/stammdaten/projekte/[id]` | PUT/DELETE | Projekt bearbeiten/löschen |
| `/api/zeiterfassung` | GET/POST | Zeiterfassungs-Einträge |
| `/api/import/bwa` | POST | CSV-Import für BWA-Daten |
| `/api/projekte/controlling` | GET | Projekt-Controlling-Daten |
| `/api/abwesenheiten` | GET/POST | Abwesenheiten CRUD |
| `/api/abwesenheiten/[id]` | PUT/DELETE | Abwesenheit bearbeiten/löschen |

---

## 7. Gemeinsame UI-Komponenten

| Komponente | Pfad | Beschreibung |
|---|---|---|
| `DashboardShell` | `components/layout/dashboard-shell.tsx` | Seiten-Wrapper (Sidebar + Header + Content) |
| `Sidebar` | `components/layout/sidebar.tsx` | Navigation (kollabierbar, mobile-ready) |
| `KpiCard` | `components/ui/kpi-card.tsx` | KPI-Anzeige (Wert, Delta, Icon) |
| `GaugeChart` | `components/ui/gauge-chart.tsx` | SVG Gauge (270°, animiert) |
| `FilterBar` | `components/ui/filter-bar.tsx` | Jahr/Quartal/Monat-Filter |
| `Card` | `components/ui/card.tsx` | ShadcN Card |
| `Button` | `components/ui/button.tsx` | ShadcN Button (Varianten) |
| `Input` | `components/ui/input.tsx` | ShadcN Input |
| `Badge` | `components/ui/badge.tsx` | ShadcN Badge |
| `Label` | `components/ui/label.tsx` | ShadcN Label |

---

## 8. Demo-Daten

### Kunden (6)
- Alpha Dynamics GmbH (Energy Technology)
- NexaTech AG (Healthcare IT)
- CoreBit Solutions (Financial Technology)
- Stratton Capital GmbH (Asset Management)
- AquaVerde Werke (Utilities)
- Vantara Digital (Technology)

### Mitarbeiter (27)
- Mix aus Junior (3), Mid (9), Senior (11), Lead (3)
- Vertragsarten: Remote (12), Hybrid (9), Office (6)
- Gehaltsspanne: 4.100€ – 8.800€/Monat

### Projekte (8)
- Pro Kunde 1-2 Projekte
- Stundensätze: 82€ – 98€
- Budget: 600 – 2.000 Stunden

### Zeitraum
- Historische Daten: 2024 + 2025 (ganze Jahre)
- Aktuelles Jahr: 2026 (Jan – Jun mit Demodaten)

---

## 9. Login-Daten

| Rolle | E-Mail | Passwort |
|---|---|---|
| Admin | `admin@serviceiq.de` | `ServiceIQ2026!` |
| Test | `john@doe.com` | `johndoe123` |

---

*Dokumentversion: 3.0 – Stand April 2026*
