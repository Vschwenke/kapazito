# Kapazito in GitHub Codespaces

Ein-Klick-Dev-Umgebung im Browser — keine lokale Installation, kein Docker, nichts.

## Start

1. Repo oeffnen: https://github.com/Vschwenke/kapazito
2. Branch `rebuild-v0.2` waehlen (Branch-Dropdown oben links)
3. Gruener **„Code"**-Button → **„Codespaces"**-Tab → **„Create codespace on rebuild-v0.2"**

GitHub startet in ~3 Minuten:
- Node 20 + alle Dependencies
- Postgres-Container mit Demo-Daten
- Prisma-Schema migriert
- VS Code im Browser mit Prisma-/Tailwind-/ESLint-Extensions

## Einmaliges Setup: Anthropic-Key

Der Kapi-Agent braucht einen API-Key. Am besten einmal als GitHub-Codespace-Secret setzen:

1. https://github.com/settings/codespaces
2. **„New secret"**
3. Name: `ANTHROPIC_API_KEY`
4. Value: `sk-ant-...` (aus https://console.anthropic.com/settings/keys)
5. Repository-Access: `Vschwenke/kapazito` auswaehlen

Beim naechsten Codespace-Start wird der Key automatisch in `.env` uebernommen.

Alternativ: Im laufenden Codespace `.env` oeffnen und `ANTHROPIC_API_KEY` manuell einfuegen (gilt nur fuer diesen Codespace).

## App starten

Im Codespace-Terminal:

```bash
npm run dev
```

Unten in VS Code erscheint der Tab **„PORTS"** — dort auf das Globus-Icon neben Port 3000 klicken. Die App oeffnet sich in einem neuen Tab.

## Login

- `admin@kapazito.de` / `Kapazito2026!` / Organisation-Slug: `demo` (nur wenn nach Slug gefragt)
- oder direkt auf `/signup` einen neuen Mandanten anlegen

## Reset

Codespace verwerfen und neu erstellen: https://github.com/codespaces → Codespace → „…" → Delete.
Kostenloses Kontingent: 120 Core-Stunden pro Monat fuer Personal-Accounts.

## Troubleshooting

**Postgres laeuft nicht**
```bash
sudo service postgresql start
# oder neu aufsetzen:
npm run docker:dev
```

**Schema out of sync nach Branch-Wechsel**
```bash
npx prisma db push --accept-data-loss
npm run db:seed
```

**Port 3000 zeigt „not forwarded"**
In VS Code den PORTS-Tab oeffnen → „Add Port" → 3000.
