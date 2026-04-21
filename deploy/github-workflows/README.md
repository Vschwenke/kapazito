# GitHub Workflows — manuell platzieren

Diese beiden Workflow-Files muessen ins Verzeichnis `.github/workflows/` (im Repo-Root) wandern. Weil der initiale Push mit einem Token ohne `workflow`-Scope erfolgte, liegen sie hier zwischengelagert.

Optionen:

**A) Via GitHub Web-UI** (einfachster Weg, ein-klick):
1. `.github/workflows/ci.yml` in GitHub anlegen (Add file → Create new file, Pfad exakt so)
2. Inhalt von `deploy/github-workflows/ci.yml` hineinkopieren
3. Commit
4. Dasselbe fuer `deploy.yml`

**B) Lokal mit neuem Token** (braucht PAT mit `workflow`-Scope):
```bash
git mv deploy/github-workflows/ci.yml     .github/workflows/ci.yml
git mv deploy/github-workflows/deploy.yml .github/workflows/deploy.yml
rmdir deploy/github-workflows
git commit -m "chore: restore GitHub Actions workflows"
git push
```

Nach dem Platzieren: Secrets setzen (STRATO_HOST, STRATO_USER, STRATO_SSH_KEY — siehe README.md „Deployment auf Strato vServer").
