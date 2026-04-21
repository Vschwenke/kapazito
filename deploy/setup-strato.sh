#!/usr/bin/env bash
# Einmaliges Setup-Script fuer einen frischen Strato-vServer (Ubuntu 22.04 LTS).
# Aufruf als root:  bash setup-strato.sh

set -euo pipefail

DOMAIN=${1:?"Bitte Domain als Argument uebergeben: ./setup-strato.sh app.kapazito.de"}
TARGET_DIR=/srv/kapazito

echo "=== Kapazito Strato-Setup ==="
echo "Domain: $DOMAIN"
echo ""

# 1. System-Updates
apt update -y
apt upgrade -y

# 2. Pakete
apt install -y \
  curl ca-certificates gnupg lsb-release \
  nginx certbot python3-certbot-nginx \
  ufw fail2ban

# 3. Docker installieren (offizielles Repo)
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update -y
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

# 4. Firewall
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

# 5. Verzeichnisse
mkdir -p "$TARGET_DIR"
mkdir -p /srv/kapazito/storage/db
mkdir -p /srv/kapazito/storage/files
mkdir -p /srv/kapazito/storage/backups
mkdir -p /srv/kapazito/storage/redis

# 6. Deploy-User anlegen
id -u deploy &>/dev/null || useradd -m -s /bin/bash deploy
usermod -aG docker deploy
mkdir -p /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chown -R deploy:deploy "$TARGET_DIR"
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# 7. Nginx-Template verteilen (falls bereits gepullt)
if [ -f "$TARGET_DIR/deploy/nginx.conf" ]; then
  sed "s/app.kapazito.de/$DOMAIN/g" "$TARGET_DIR/deploy/nginx.conf" \
    > /etc/nginx/sites-available/kapazito
  ln -sf /etc/nginx/sites-available/kapazito /etc/nginx/sites-enabled/kapazito
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
fi

echo ""
echo "=== Basis-Setup fertig ==="
echo ""
echo "Naechste Schritte (manuell):"
echo "  1. Public-Key des GitHub-Actions-Deploy-Users in /home/deploy/.ssh/authorized_keys eintragen."
echo "  2. sudo -u deploy git clone https://github.com/Vschwenke/kapazito.git $TARGET_DIR/src"
echo "     (oder: nur deploy/* rsyncen via CI)"
echo "  3. cp .env.example .env.prod  &&  vim .env.prod   (Secrets setzen)"
echo "  4. certbot --nginx -d $DOMAIN    (Let's Encrypt)"
echo "  5. docker compose -f docker-compose.prod.yml --env-file .env.prod up -d"
echo "  6. docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy"
echo "  7. docker compose -f docker-compose.prod.yml exec app npm run db:seed"
echo ""
echo "Fertig."
