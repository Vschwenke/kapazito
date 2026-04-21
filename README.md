# Kapazito

**Das agentische Operations-Cockpit für IT-Beratungen im DACH-Raum.**

Kapazito verbindet Auslastung, Projekt-Profitabilität, BWA-Controlling, E-Invoicing (XRechnung/ZUGFeRD) und einen handlungsfähigen KI-Agenten („Kapi") in einer Plattform. Zielmarkt: Professional-Services-Firmen mit 10–100 Mitarbeitern.

Dieses Repo ist die Produkt-Version 0.2.0 — aus dem Abacus-Prototyp neu aufgebaut, mandantenfähig, mit realem Rechnungsmodul und Vercel-AI-SDK-basierter Agentic-KI.

---

## Tech-Stack

- **Frontend**: Next.js 14 (App Router, standalone) · React 18 · TypeScript · Tailwind · shadcn/ui · Recharts
- **Backend**: Next.js Route Handlers · Prisma 6 · PostgreSQL 16
- **Auth**: NextAuth v4 mit Multi-Tenant-JWT + RBAC
- **KI**: Anthropic Claude Sonnet via Vercel AI SDK (+ OpenAI als Fallback)
- **E-Invoicing**: XRechnung 3.0 (UBL 2.1) · ZUGFeRD-ready · @react-pdf/renderer
- **Mail**: Resend (mit Dev-Fallback)
- **Jobs**: pg-boss (Postgres-basiert, keine externe Queue noetig)
- **Storage**: lokales Volume (Self-Hosting), S3/R2 pluggable
- **Observability**: Sentry · Pino
- **Hosting**: Docker Compose auf Strato vServer (Ubuntu 22.04 LTS) + Nginx + Let's Encrypt
- **Tests**: Vitest + Testing-Library + Playwright
- **CI/CD**: GitHub Actions -> GHCR -> SSH-Deploy

---

## Schnellstart via GitHub Codespaces (3 Min, Browser)

1. https://github.com/Vschwenke/kapazito → Branch `rebuild-v0.2`
2. Gruener „Code"-Button → Codespaces-Tab → „Create codespace on rebuild-v0.2"
3. Warten (~3 Min), dann im Terminal: `npm run dev`
4. Port 3000 oeffnet automatisch als Preview

Einmal-Setup fuer Kapi: `ANTHROPIC_API_KEY` als Codespace-Secret hinterlegen — Details in `.devcontainer/README.md`.

## Schnellstart (lokal)

```bash
# Dependencies
npm install

# .env aus Template bauen und befüllen
cp .env.example .env
# DATABASE_URL, NEXTAUTH_SECRET (openssl rand -base64 32), ANTHROPIC_API_KEY setzen

# Postgres + Redis als Docker-Container (einfacher als lokale Installation)
npm run docker:dev

# Datenbank-Schema initialisieren
npm run db:migrate

# Demo-Tenant + Daten seeden
npm run db:seed

# Dev-Server starten
npm run dev

# Optional: Worker-Prozess (Mahnwesen-Cron) in zweitem Terminal
npm run worker
```

Anmeldung (nach Seed):

- **Admin**: `admin@kapazito.de` / `Kapazito2026!` / Tenant-Slug `demo`
- **Demo**:  `demo@kapazito.de`  / `Demo2026!`      / Tenant-Slug `demo`

---

## Architektur auf einen Blick

```
app/
  (dashboard)/…          UI pro Modul (Finanzen, HR, Rechnungen, …)
  api/
    kapi/                Agentic AI — Chat + Approval-Queue
    rechnungen/          Invoice API (CRUD + PDF + XML + Mahnwesen + DATEV)
    …
  layout.tsx

lib/
  auth.ts                NextAuth + Session-Helper
  db.ts                  Prisma-Singleton
  tenant-prisma.ts       Tenant-scoped DB-Wrapper (automat. tenantId)
  rbac.ts                Rollen-Matrix
  api.ts                 API-Helper (Zod + Error-Handling)
  rate-limit.ts          Upstash-basiertes Rate-Limiting
  errors.ts              Pino-Logger

  llm/provider.ts        Anthropic/OpenAI Provider-Switch
  llm/prompts.ts         Kapi-Persona + System-Prompts

  agent/tools.ts         Kapis Tool-Kit (Read + Write-Tools)
  agent/executor.ts      Führt approved Actions gegen Services aus

  services/
    invoice.service.ts         Lifecycle: Draft → Final → Sent → Paid
    invoice-number.service.ts  Atomare Nummernkreise
    invoice-pdf.service.tsx    PDF mit @react-pdf/renderer
    xrechnung.service.ts       XRechnung 3.0 UBL XML
    reminder.service.ts        3-Stufen-Mahnwesen
    datev-export.service.ts    DATEV-Buchungsstapel CSV
    email.service.ts           Resend
    audit.service.ts           Append-only Audit-Log

prisma/schema.prisma     27 Models, alle tenant-aware
scripts/seed.ts          Demo-Daten-Seed
scripts/validate-xrechnung.ts  CI-Check auf Pflichtfelder
```

---

## Die wichtigsten Features (Epic 1, 5, 7)

### Multi-Tenancy

Alle Business-Models tragen `tenantId`. Der `lib/tenant-prisma.ts`-Wrapper injiziert `tenantId` automatisch in **jede** Query (where/create/update). Damit ist es systemisch unmöglich, cross-tenant zu queryen — selbst wenn ein Entwickler es vergessen würde.

### Rechnungs-Pipeline (End-to-End)

1. **Abrechnungs-Assistent** (`/rechnungen/abrechnen`): Kapi nimmt genehmigte Zeitbuchungen, gruppiert pro Projekt, erzeugt einen Entwurf mit korrekten Leistungszeiträumen, USt-Sätzen und Preisen.
2. **Editor**: Positionen, Texte, Rabatte anpassen — Totals aktualisieren sich automatisch.
3. **Finalisieren**: Atomare Nummernkreis-Vergabe (`nextInvoiceNumber`), Status → OPEN.
4. **PDF**: Corporate-Template mit Logo, Farben, AGB, Zahlungsinfo.
5. **XRechnung 3.0 UBL**: EN-16931-konform, alle BG-Felder. Validierung via `npm run validate:xrechnung`.
6. **Versand**: PDF + XML per E-Mail (Resend).
7. **Zahlungsabgleich**: Manuell oder via Agent-Action.
8. **Mahnwesen**: 3 Stufen (`/api/rechnungen/reminders`), Gebühren + Verzugszinsen §288 BGB.
9. **DATEV-Export**: Buchungsstapel-CSV (Format 510, SKR03-Konten).

### Agentic KI („Kapi")

- **Read-Tools** führen direkt aus: `queryBusinessData`, `listOverdueInvoices`, `findBillableTimeEntries`, `forecastCashflow`, `suggestStaffing`.
- **Write-Tools** legen eine `AgentAction` mit `PENDING` an: `proposeInvoiceFromTimes`, `proposeSendInvoice`, `proposeRunReminders`, `proposeDatevExport`, `proposeRegisterPayment`.
- User sieht Approval-Queue, kann freigeben oder ablehnen. Bei Freigabe führt der `executor` die echte Service-Funktion aus.
- Jede Action ist in `AgentAction` audit-sicher protokolliert: Input, Output, Confidence, Zeitstempel, User.

---

## Scripts

| Befehl | Zweck |
|---|---|
| `npm run dev` | Dev-Server |
| `npm run build` | Prod-Build (inkl. Prisma-Generate) |
| `npm run typecheck` | TS strict check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit + integration) |
| `npm run test:e2e` | Playwright |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:deploy` | Prisma migrate deploy (prod) |
| `npm run db:seed` | Demo-Daten laden |
| `npm run db:studio` | Prisma Studio |
| `npm run validate:xrechnung` | Pflichtfeld-Check XRechnung |
| `npm run check` | Lint + Typecheck + Tests |

---

## E-Invoicing-Zertifizierung

Die generierte XRechnung ist gegen die EN-16931-Pflichtfelder geprüft. **Vor dem Produktiv-Start** sollte jede Template-Änderung zusätzlich mit dem offiziellen **KoSIT-Validator** (<https://github.com/itplr-kosit/validator>) validiert werden. Die CI-Pipeline (`validate:xrechnung`) prüft nur Struktur-Pflichtfelder.

Für ZUGFeRD 2.3 (PDF/A-3 mit eingebettetem XML) ist ein zusätzlicher Post-Processing-Schritt nötig (z.B. `mustangproject` oder `ghostscript` + `veraPDF`). Das Modul liefert PDF und XML heute getrennt aus, die Hybrid-Version folgt in v0.3.

---

## Deployment auf Strato vServer

### Einmaliges Server-Setup

Auf einem frischen Ubuntu-22.04-vServer von Strato:

```bash
# Als root einloggen via SSH
wget https://raw.githubusercontent.com/Vschwenke/kapazito/main/deploy/setup-strato.sh
bash setup-strato.sh app.kapazito.de     # Domain eintragen
```

Das Script installiert: Docker + Compose, Nginx, Certbot, UFW, Fail2ban. Legt den Nutzer `deploy` an und bereitet `/srv/kapazito/storage/{db,files,backups,redis}` vor.

### Environment

`.env.prod` auf dem Server hinterlegen (z.B. `/srv/kapazito/.env.prod`):

```bash
POSTGRES_USER=kapazito
POSTGRES_PASSWORD=$(openssl rand -hex 24)
POSTGRES_DB=kapazito
REDIS_PASSWORD=$(openssl rand -hex 24)
NEXTAUTH_URL=https://app.kapazito.de
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
MAIL_FROM="Kapazito <hello@kapazito.de>"
LLM_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20241022
KAPI_APPROVAL_REQUIRED=true
MULTI_TENANCY_ENFORCED=true
```

### SSL

```bash
certbot --nginx -d app.kapazito.de
```

### GitHub Secrets (einmalig)

In den Repo-Settings → Secrets and variables → Actions:

- `STRATO_HOST` — IP oder Hostname des vServers
- `STRATO_USER` — `deploy`
- `STRATO_SSH_KEY` — privater SSH-Key fuer den deploy-User
- `STRATO_SSH_PORT` — optional, Standard 22

Der Public-Key muss in `/home/deploy/.ssh/authorized_keys` auf dem Server liegen.

### Deployment

Ab sofort loest jeder Push auf `main` automatisch aus:

1. Docker-Image bauen
2. Push nach GHCR (`ghcr.io/vschwenke/kapazito:latest`)
3. SSH zum Strato-Server
4. `docker compose pull && up -d`
5. `prisma migrate deploy`

Manueller Deploy-Trigger: in GitHub → Actions → "Deploy" → "Run workflow".

### Backup

Taegliche pg_dump-Sicherung liegt bereits im Compose (Service `backup`). Zusaetzlich empfohlen:

```bash
# Auf dem Server als deploy-User:
echo "0 3 * * * /srv/kapazito/src/deploy/backup.sh >> /var/log/kapazito-backup.log 2>&1" | crontab -

# Dumps regelmaessig off-site sichern (z.B. via rsync zu Hetzner Storage Box)
```

### Health-Check

`https://app.kapazito.de/api/health` liefert:

```json
{ "status": "ok", "db": "up", "version": "0.2.0", "uptimeMs": 123456 }
```

Fuer Uptime-Monitoring (BetterStack oder UptimeRobot) diesen Endpoint anpingen.

## Roadmap

Siehe `Kapazito_Backlog.xlsx` im Projekt-Root — 77 User Stories in 11 Epics, ~160 PT bis GA.

Was in dieser Version (0.2.0) fertig ist:

- ✅ Epic 1: Foundation (Multi-Tenant, Auth, RBAC, LLM-Abstraktion, Tests, CI)
- ✅ Epic 5: Rechnungs-Pipeline (PDF, XRechnung, Mahnwesen, DATEV)
- ✅ Epic 7: Kapi mit Tool-Calling + Approval-Flow
- ⏳ Epic 2: Auth & Onboarding (Signup-Flow, Team-Invites, Wizard)
- ⏳ Epic 3: Zeiterfassung 2.0 (mobile, Bulk-Approve)
- ⏳ Epic 4: Staffing-Heatmap
- ⏳ Epic 6: BWA-Cockpit polish
- ⏳ Epic 8: Stripe-Billing
- ⏳ Epic 9: öffentliche API + Webhooks
- ⏳ Epic 10: DSGVO-Self-Service, Status-Page
- ⏳ Epic 11: UI/UX-Politur (Claude Design)

---

## Lizenz & Kontakt

Proprietär · © schwenke.group 2026

Kontakt: viktor@schwenke.group
