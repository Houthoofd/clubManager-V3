# Déploiement ClubManager V3 — Raspberry Pi

## Prérequis sur le Pi

### 1. Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installation de MariaDB
```bash
sudo apt install -y mariadb-server
sudo mysql_secure_installation
```

Créer la base et l'utilisateur :
```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE clubmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'clubmanager'@'localhost' IDENTIFIED BY 'ton_mot_de_passe';
GRANT ALL PRIVILEGES ON clubmanager.* TO 'clubmanager'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Installation de Node.js (v20 LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Installation de pnpm
```bash
npm install -g pnpm
```

### 5. Installation de PM2
```bash
npm install -g pm2
```

### 6. Installation de Nginx
```bash
sudo apt install -y nginx
```

### 7. Installation de Certbot (SSL Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## Déploiement du projet

### 1. Cloner le projet (branche prod)
```bash
cd /home/bartok-48
git clone -b prod https://github.com/Houthoofd/ClubManager clubManager-V3
cd clubManager-V3
```

### 2. Installer les dépendances
```bash
pnpm install
```

### 3. Configurer les variables d'environnement
```bash
# Le .env est déjà configuré sur la branche prod
# Renseigner uniquement le mot de passe MariaDB
nano backend/.env
```

### 4. Importer le schéma SQL
```bash
mysql -u clubmanager -p clubmanager < db/creation/SCHEMA_CONSOLIDATE.sql
```

### 5. Builder le projet
```bash
# Backend
cd backend && pnpm build && cd ..

# Frontend
cd frontend && pnpm build && cd ..
```

### 6. Créer le dossier de logs
```bash
mkdir -p backend/logs
```

---

## Configuration PM2

### Démarrer le backend
```bash
cd backend
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```
> Copier-coller la commande `sudo` affichée par `pm2 startup`

---

## Configuration Nginx

### Copier la config
```bash
sudo cp nginx/clubmanager.conf /etc/nginx/sites-available/clubmanager
sudo ln -s /etc/nginx/sites-available/clubmanager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Générer le certificat SSL
```bash
sudo certbot --nginx -d clubmanagment.com -d club-management.com -d www.clubmanagment.com -d www.club-management.com
```

### Activer le renouvellement automatique
```bash
sudo systemctl enable certbot.timer
```

---

## Vérifications

```bash
# Backend tourne ?
pm2 status

# Nginx OK ?
sudo systemctl status nginx

# MariaDB OK ?
sudo systemctl status mariadb

# Logs backend
pm2 logs clubmanager-backend
```

---

## Mise à jour de l'application

```bash
cd /home/bartok-48/clubManager-V3
git pull origin prod
pnpm install
cd backend && pnpm build && cd ..
cd frontend && pnpm build && cd ..
pm2 restart clubmanager-backend
```
