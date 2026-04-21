# Changelog

## 0.2.2 — 2026-04-21 · GitHub Codespaces Support

- `.devcontainer/` mit vollstaendiger Dev-Umgebung: Node 20, Postgres-Sidecar, Prisma-/Tailwind-/ESLint-VSCode-Extensions.
- `postCreateCommand` automatisiert npm install + Prisma generate + db push + Seed.
- `ANTHROPIC_API_KEY` kommt automatisch aus GitHub-Codespace-Secrets in die `.env`.
- Port 3000 wird automatisch als Preview geoeffnet, `NEXTAUTH_URL` wird dynamisch auf die Codespace-Domain gesetzt.
- `.devcontainer/README.md` mit Setup- und Troubleshooting-Anleitung.
- Haupt-README um Codespaces-Schnellstart-Abschnitt erweitert.

## 0.2.1 — 2026-04-21 · Auth & Onboarding (Epic 2)

### Added

- **Signup-Flow** (`/signup`, 2 Schritte): Account + Tenant-Anlage in einer Transaktion, Trial 14 Tage, Passwort-Policy enforced, Slug aus Firmenname.
- **Login verbessert**: optionaler Tenant-Slug fuer Nutzer mit Multi-Membership, bessere Fehlermeldungen, Redirect auf Callback-URL.
- **Invite-Flow**: `/api/settings/team/invitations` (erstellen), Token-basierter Accept-Link per E-Mail, `/invite/accept` Public-Page — bestehende User werden direkt verknuepft, neue User legen Passwort an.
- **Settings-Bereich**:
  - `/settings/organization`: Firmendaten, Adresse, USt-ID, Bankverbindung, DATEV-Mandantennummer.
  - `/settings/team`: Mitglieder mit Rollen-Matrix (inline-editierbar), offene Invites, Entfernen, Last-Owner-Protection.
- **Onboarding-Wizard** (`/onboarding`, 5 Schritte): Welcome → Firmendaten → Mitarbeiter → Kunde → Projekt. Skippbar, localStorage-persistent, nach Signup automatisch.
- **Service**: `lib/services/signup.service.ts` mit Slug-Generator (DE-Umlaute, Kollisions-Suffix), Welcome-Mail, ValidationError-Klasse.
- **APIs**: 6 neue Routen unter `/api/settings/*` und `/api/invite/accept`, alle mit Zod + RBAC + Audit.
- **Sidebar**: Einstellungen-Link in Verwaltungs-Bereich.

### Changed

- `/api/signup` komplett neu — nutzt Signup-Service, Rate-Limit 5/h, Zod-Validation.
- Login-UI: neue Struktur mit Multi-Tenant-Support und verbesserter UX.

## 0.2.0 — 2026-04-21 · Foundation + Invoicing + Agentic AI

**Vom Prototyp zum Produkt.** Diese Version setzt die kritischen Epics 1, 5 und 7 aus dem Produkt-Blueprint um.

### Breaking

- **Alle Datenmodelle** haben jetzt `tenantId`. Bestehende Prototyp-Daten sind nicht portierbar und müssen via Seed neu angelegt werden.
- `/api/agent` ist deprecated (410 Gone). Neue Route: `/api/kapi/chat`.
- NextAuth-Session trägt jetzt `tenantId`, `tenantSlug`, `role`, `scopes` statt plain `role`-String.

### Added — Epic 1 Foundation

- `Tenant`, `Membership`, `Invitation`, `AuditLog`, `AgentAction`, `InvoiceNumberRange`, `Payment`, `Reminder`, `Document`, `Quote`, `QuoteItem`, `ApiKey`, `WebhookSubscription` — 13 neue Prisma-Models.
- `lib/tenant-prisma.ts` — automatische tenant-scoped Prisma-Extension (injiziert tenantId in jede Query).
- `lib/auth.ts` — NextAuth neu mit Multi-Tenant-JWT, Session-Helper `requireAuth`, `requireRole`, `getServerAuth`.
- `lib/rbac.ts` — Rollen-Matrix (Owner/Admin/Finance/Manager/Member/Guest) mit 25+ Permissions.
- `lib/api.ts` — Zod-Validation, Error-Wrapping, einheitliches JSON-Error-Format.
- `lib/rate-limit.ts` — Upstash Redis Rate-Limiter (no-op in Dev).
- `lib/errors.ts` — Pino-Logger mit structured logs.
- `lib/llm/provider.ts` — Provider-Abstraktion (Anthropic/OpenAI via Vercel AI SDK).
- `.github/workflows/ci.yml` — Lint + Typecheck + Tests + XRechnung-Check + Build.
- `vitest.config.ts` + 4 Unit-Tests (xrechnung, invoice-number, rbac, reminder).

### Added — Epic 5 Rechnungs-Pipeline

- `services/invoice-number.service.ts` — atomarer Nummernkreis mit Lücken-Erkennung.
- `services/invoice.service.ts` — Lifecycle: Draft → Final → Sent → Paid/Overdue/Cancelled. Abrechnungs-Assistent `createDraftFromTimeEntries`.
- `services/xrechnung.service.ts` — UBL 2.1 EN-16931-konformer XML-Builder (Customization `xrechnung_3.0`).
- `services/invoice-pdf.service.tsx` — Corporate-Template mit @react-pdf/renderer.
- `services/reminder.service.ts` — 3-Stufen-Mahnwesen mit Gebühren + Verzugszinsen §288 BGB.
- `services/datev-export.service.ts` — DATEV-Buchungsstapel EXTF-CSV (Format 510, SKR03-Default).
- `services/email.service.ts` — Resend-Integration.
- `services/audit.service.ts` — Append-only Audit-Log.
- API: `/api/rechnungen` (GET/POST), `/api/rechnungen/[id]` (GET/PATCH/DELETE), `/[id]/finalize`, `/[id]/pdf`, `/[id]/xml`, `/[id]/send`, `/[id]/payments`, `/draft-from-times`, `/reminders`, `/datev`.
- UI: `/rechnungen` (Liste, Filter, KPIs), `/rechnungen/[id]` (Detail, Aktionen), `/rechnungen/abrechnen` (Kapi-Assistent).
- `scripts/validate-xrechnung.ts` — CI-Check auf Pflichtfelder.

### Added — Epic 7 Agentic AI

- `lib/agent/tools.ts` — Kapis Tool-Kit: `queryBusinessData`, `listOverdueInvoices`, `findBillableTimeEntries`, `forecastCashflow`, `suggestStaffing` (read), plus `proposeInvoiceFromTimes`, `proposeSendInvoice`, `proposeRunReminders`, `proposeDatevExport`, `proposeRegisterPayment` (write mit Approval).
- `lib/agent/executor.ts` — führt approved Actions gegen die Services aus, mit Error-Recovery und Status-Update.
- `/api/kapi/chat` — Multi-Step Tool-Calling via streamText aus AI SDK.
- `/api/kapi/actions` (list), `/actions/[id]/approve`, `/actions/[id]/reject`.
- `components/kapi/approval-queue.tsx` — UI-Widget für die Pending-Queue.

### Removed (Abacus-Artefakte)

- `.abacus.donotdelete` (126 KB)
- `<script src="apps.abacus.ai/...">` in `app/layout.tsx`
- Hardcoded `apps.abacus.ai/v1/chat/completions`-Endpoint
- `ABACUSAI_API_KEY` aus `.env`
- Prisma `output`-Pfad `/home/ubuntu/inlogy_reporting_app/...`
- `plotly.js`, `react-plotly.js`, `chart.js`, `react-chartjs-2` (ungenutzt, ~170 KB Bloat)
- `jotai` (Duplikat zu Zustand)
- `formik` (Duplikat zu React-Hook-Form)
- `maplibre-gl`, `gray-matter`, `react-is`, `react-use`, `csv`, `react-datepicker`, `embla-carousel-react`, `input-otp` (ungenutzt oder durch Besseres ersetzt)
- `browserslist` mit `ie >= 11`

### Security

- **Alle Secrets rotiert** — alte Werte sind als kompromittiert zu betrachten.
- `.env` aus Git entfernt (Git-History-Bereinigung empfohlen: `git filter-repo --path .env --invert-paths`).
- Zod-Validation auf allen API-Routes verhindert Injection.
- Rate-Limit vorbereitet (no-op ohne Upstash-Token).

### Open for next release (0.3)

- Tenant-Onboarding-Flow + Signup-UI
- Zeiterfassungs-UI-Redesign (Mobile, Bulk-Approve)
- Staffing-Heatmap
- Stripe-Billing
- ZUGFeRD 2.3 PDF/A-3 Einbettung (mustangproject)
- UI/UX-Politur mit Claude Design

## 0.1.0 — 2026-03-xx · Prototyp (Abacus)

Initialer Abacus-AI-Prototyp mit 17 Datenmodellen, 4 KI-Agenten, Dashboard, Finanzen-Modul, HR-Modul, einfacher Rechnungsübersicht, Zeiterfassung, Stammdaten, BWA-CSV-Import.

**Nicht produktionsreif** — siehe `Kapazito_Produkt-Blueprint.docx` für die vollständige Audit-Zusammenfassung.
