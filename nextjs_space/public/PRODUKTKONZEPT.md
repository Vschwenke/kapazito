# PulseBI – Produktkonzept & Implementierungsplan

**Version:** 1.0 | **Datum:** April 2026 | **Status:** Demo-Ready

---

## 1. Executive Summary

PulseBI ist eine eigenständige Business-Intelligence-Plattform, die speziell für IT-Dienstleister und Beratungsunternehmen entwickelt wurde. Die Anwendung ersetzt Power BI durch eine maßgeschneiderte Web-Lösung, die alle relevanten Geschäftsbereiche – Finanzen, HR, Sales und Rechnungsstellung – in einem einzigen Dashboard vereint.

**Kernvorteile gegenüber Power BI:**
- ✅ Keine Power BI-Lizenzkosten (ca. 8,40€/User/Monat)
- ✅ Maßgeschneidert für IT-Dienstleister (nicht generisch)
- ✅ Vollständig white-label-fähig
- ✅ Eigene Datenhoheit (kein Microsoft-Lock-in)
- ✅ Integrierte Zeiterfassung möglich
- ✅ Responsive & Mobile-Ready

---

## 2. Module & Funktionsumfang

### 2.1 📊 Finanzreport (BWA-Dashboard)
**Was es zeigt:**
- Betriebswirtschaftliche Auswertung (BWA) mit allen Konten
- Betriebsergebnis, Cashflow, Forderungen, Schulden
- Umsatzrendite, Deckungsbeitrag, Auslastungsquote
- IST-SOLL-Vergleiche und Forecast

**Woher die Daten kommen:**
| Datenpunkt | Quelle im Original | Empfohlene Integration |
|---|---|---|
| BWA-Konten (Umsatz, Kosten, Ergebnis) | DATEV SuSa-Export | **Option A:** DATEV CSV/Excel-Upload → Einfach: BWA als CSV exportieren und hochladen. **Option B:** DATEV API-Anbindung → Automatischer Abruf |
| Cashflow | DATEV / Bankkontoauszüge | CSV-Import oder Banking-API (z.B. finAPI) |
| Offene Posten / Forderungen | DATEV Debitorenliste | DATEV-Export oder manueller Upload |

**Wie der Kunde die Daten liefert:**
> 💡 **Einfachste Variante:** Der Kunde exportiert monatlich seine BWA als CSV aus DATEV und lädt sie in PulseBI hoch. Das System erkennt das Format automatisch und ordnet die Konten zu.

---

### 2.2 👥 HR & Recruiting
**Was es zeigt:**
- Auslastungsquoten pro Team und Mitarbeiter
- Fluktuation (gewonnene / verlorene Mitarbeiter)
- Krankenquoten und verlorener Umsatz durch Krankheit
- Gehälter und Homeoffice-Anteile
- Urlaubsverwaltung

**Woher die Daten kommen:**
| Datenpunkt | Quelle im Original | Empfohlene Integration |
|---|---|---|
| Stunden & Auslastung | Clockodo Zeiterfassung | **Option A:** Clockodo API → Automatischer Abruf (empfohlen). **Option B:** Eigenes Zeiterfassungsmodul in PulseBI |
| Gehälter & Personalkosten | DATEV Personalkosten | DATEV-Export oder manuelle Eingabe |
| Krankheit / Urlaub / Abwesenheit | Clockodo Abwesenheiten | Clockodo API oder eigenes Abwesenheitsmodul |
| Mitarbeiter-Stammdaten | Microsoft Dataverse | **Empfehlung:** Direkt in PulseBI pflegen (Mitarbeiter-Verwaltung) |

**💡 Produkt-Empfehlung: Eigenes Zeiterfassungsmodul**
> Anstatt eine Clockodo-Lizenz zu benötigen, kann PulseBI ein eigenes, einfaches Zeiterfassungsmodul anbieten. Mitarbeiter erfassen ihre Stunden direkt in der App. Das eliminiert eine weitere Abhängigkeit und spart Lizenzkosten.

---

### 2.3 💰 Sales & CRM
**Was es zeigt:**
- Kundenspezifische Umsatzanalysen
- Stundensätze pro Kunde und Projekt
- Aktive Mitarbeiter pro Kunde
- Monatliche Umsatztrends

**Woher die Daten kommen:**
| Datenpunkt | Quelle im Original | Empfohlene Integration |
|---|---|---|
| Stundensätze | SharePoint-Listen / Verträge | **In PulseBI pflegen:** Projekt-Setup mit Stundensätzen direkt in der App |
| Umsatz pro Kunde | Berechnet aus Stunden × Stundensatz | Automatisch aus Zeiterfassung + Projektsätzen |
| Projekte & Purchase Orders | SharePoint / Verträge | Projekt-Verwaltungsmodul in PulseBI |

**💡 Die Stundensätze:**
> Die Stundensätze werden pro Projekt/Kunde im System hinterlegt. Wenn ein Mitarbeiter Stunden auf ein Projekt bucht, wird der Umsatz automatisch berechnet. **Das ist kein externer Datenimport** – die Sätze werden einmalig pro Vertrag im System gepflegt.

---

### 2.4 🧾 Rechnungsstellung
**Was es zeigt:**
- Rechnungsstatus nach Kunden (offen, bezahlt, teilbezahlt)
- Stundenerfassung pro Mitarbeiter und Projekt
- Kalenderansicht der Arbeitszeiten
- Monatsweise Abrechnung

**Woher die Daten kommen:**
| Datenpunkt | Quelle im Original | Empfohlene Integration |
|---|---|---|
| Rechnungen & Status | DATEV / Buchhaltung | **Option A:** DATEV-Import. **Option B:** Rechnungen direkt in PulseBI erstellen |
| Stundenerfassung | Clockodo | Aus dem PulseBI-Zeiterfassungsmodul |
| Kalenderansicht | Clockodo Entries | Automatisch aus Zeiterfassung |

---

### 2.5 ⚙️ Base Report (Systemübersicht)
**Was es zeigt:**
- Datenmodell-Statistiken
- Verbundene Datenquellen und deren Status
- System-Konfiguration

---

## 3. Datenintegrations-Strategie

### 3.1 Übersicht: Wie kommen die Daten ins System?

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATENQUELLEN                                  │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│  DATEV       │  Zeiterfassung│  Stammdaten  │  Projekte         │
│  (BWA/SuSa)  │  (Clockodo    │  (Mitarbeiter│  (Stundensätze,   │
│              │  ODER eigen)  │  Kunden)     │  Verträge)        │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
  CSV-Upload     API oder      Direkte        Direkte
  (monatlich)    Eigenmodul    Eingabe        Eingabe
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   PulseBI DB    │
                 │  (PostgreSQL)   │
                 └────────┬────────┘
                          │
          ┌───────┬───────┼───────┬──────────┐
          ▼       ▼       ▼       ▼          ▼
       Finanz   HR    Sales  Rechnungen   Base
       report         & CRM  stellung   Report
```

### 3.2 Drei Stufen der Datenintegration

**Stufe 1 – MVP (Sofort einsatzbereit):**
- ✅ Manuelle Dateneingabe für Mitarbeiter, Kunden, Projekte
- ✅ CSV/Excel-Upload für BWA-Daten aus DATEV
- ✅ Einfache Zeiterfassung direkt in PulseBI
- ✅ Manuelle Rechnungserstellung

**Stufe 2 – Automatisierung (3-6 Monate):**
- 🔄 Clockodo API-Integration (falls gewünscht)
- 🔄 DATEV API-Anbindung für automatischen BWA-Import
- 🔄 Automatische Rechnungsgenerierung aus Zeiterfassung

**Stufe 3 – Vollintegration (6-12 Monate):**
- 🚀 Banking-API für Echtzeit-Cashflow
- 🚀 CRM-Integration (Salesforce, HubSpot)
- 🚀 Automatische Mahnungen
- 🚀 KI-gestützte Prognosen

---

## 4. Spezifische Fragen & Antworten

### "Wie kommen die BWA-Daten rein?"
> **Empfehlung:** Der Steuerberater oder die Buchhaltung exportiert monatlich die BWA als CSV aus DATEV. In PulseBI gibt es einen Upload-Bereich, der das DATEV-Format erkennt und die Konten automatisch zuordnet. Alternativ kann eine direkte DATEV-API-Anbindung eingerichtet werden.

### "Woher kommen die Stundensätze?"
> Die Stundensätze werden **einmalig pro Projekt/Vertrag** im PulseBI-Projekt-Setup definiert. Wenn ein neuer Vertrag mit einem Kunden geschlossen wird, legt der Projektmanager das Projekt mit dem vereinbarten Stundensatz an. Die Stundensätze sind **keine externe Datenquelle** – sie sind Vertragsinformationen, die direkt im System gepflegt werden.

### "Wo werden die Stundensätze festgehalten?"
> Im Power BI Original waren die Stundensätze in SharePoint-Listen gespeichert. In PulseBI werden sie direkt in der **Projektverwaltung** gepflegt:
> - Projekt anlegen → Kunde zuweisen → Stundensatz definieren
> - Pro Mitarbeiter können individuelle Sätze hinterlegt werden
> - Historische Änderungen werden protokolliert

### "Brauchen wir ein eigenes Zeiterfassungsmodul?"
> **Ja, das ist die stärkste Empfehlung.** Ein eigenes Zeiterfassungsmodul in PulseBI:
> 1. Eliminiert die Clockodo-Lizenzkosten
> 2. Vereinfacht die Datenintegration (keine API nötig)
> 3. Ermöglicht direkte Verknüpfung mit Projekten und Stundensätzen
> 4. Bietet Echtzeit-Auslastungsberechnung
> 5. Funktionalität: Stunden buchen, Projekt wählen, Homeoffice/Büro angeben

---

## 5. Produktvision für den Kunden

### Was der Kunde bekommt:

1. **Ein Dashboard statt fünf Tools** – Finanzen, HR, Sales, Rechnungen, alles an einem Ort
2. **Keine Power BI-Lizenz nötig** – Einsparung von ~8,40€/User/Monat
3. **Keine Clockodo-Lizenz nötig** – Eigene Zeiterfassung inklusive (optional)
4. **White-Label möglich** – Logo, Farben, Domain des Kunden
5. **Eigene Datenhoheit** – Keine Abhängigkeit von Microsoft
6. **Mobile Nutzung** – Responsive Design für Smartphone/Tablet
7. **Multi-Mandanten-fähig** – Mehrere Unternehmen/Standorte

### Preismodell (Vorschlag):
| Paket | Preis | Enthält |
|---|---|---|
| Starter | 49€/Monat | Bis 10 Mitarbeiter, 3 Module |
| Business | 149€/Monat | Bis 50 Mitarbeiter, alle Module |
| Enterprise | 349€/Monat | Unbegrenzt, API-Integrationen, White-Label |

---

## 6. Technische Architektur

- **Frontend:** Next.js 14, React 18, Tailwind CSS, Recharts
- **Backend:** Next.js API Routes, Prisma ORM
- **Datenbank:** PostgreSQL
- **Hosting:** Cloud-basiert (Abacus AI / AWS / Vercel)
- **Authentifizierung:** NextAuth.js (vorbereitet)

---

## 7. Nächste Schritte

1. **Demo-Termin** – Anwendung dem Kunden live zeigen
2. **Anforderungsworkshop** – Spezifische Anpassungen besprechen
3. **Datenmapping** – Welche DATEV-Konten werden genutzt?
4. **Pilotphase** – 4 Wochen Testbetrieb mit echten Daten
5. **Go-Live** – Produktivschaltung und Migration

---

*Dieses Dokument wurde automatisch generiert und dient als Grundlage für die Kundenberatung.*
