# Panduan Deployment Kaskecil dengan aaPanel

Panduan ini menjelaskan cara menginstall aaPanel pada server Kaskecil (192.168.13.75) dan melakukan deployment aplikasi.

---

## 1. Instalasi aaPanel pada Server Kaskecil

### 1.1 Login ke Server via SSH

```bash
ssh root@192.168.13.75
# Password: password123
```

### 1.2 Update Sistem

```bash
apt update && apt upgrade -y
```

### 1.3 Install aaPanel

Jalankan script instalasi aaPanel (untuk Debian/Ubuntu):

```bash
wget -O install.sh http://www.aapanel.com/script/install-ubuntu_6.0_en.sh && bash install.sh aapanel
```

> **PENTING:** Catat informasi login aaPanel yang muncul setelah instalasi selesai:
>
> - **Panel URL**: `http://192.168.13.75:7800/xxxx`
> - **Username**: `xxxx`
> - **Password**: `xxxx`

### 1.4 Akses aaPanel

Buka browser dan akses URL panel yang diberikan setelah instalasi.

---

## 2. Konfigurasi LEMP Stack via aaPanel

Setelah login ke aaPanel, Anda akan diminta menginstall software. Pilih **LNMP (Recommended)**:

| Software   | Versi yang Direkomendasikan |
| ---------- | --------------------------- |
| Nginx      | 1.24+                       |
| MySQL      | 8.0                         |
| PHP        | 8.2                         |
| phpMyAdmin | Latest                      |

Klik **One-Click Install** dan tunggu proses selesai (15-30 menit).

---

## 3. Konfigurasi PHP Extensions

Setelah LNMP terinstall:

1. Masuk ke **App Store** → **PHP 8.2** → **Settings** → **Install Extensions**
2. Install extensions berikut:
   - `fileinfo`
   - `redis` (opsional)
   - `opcache`

---

## 4. Setup Database

### 4.1 Buat Database

1. Masuk ke **Database** di sidebar
2. Klik **Add Database**
3. Isi form:
   - **Database Name**: `kaskecil`
   - **Username**: `kaskecil`
   - **Password**: (buat password yang kuat)
   - **Access**: `Local Server`
4. Klik **Submit**

---

## 5. Deploy Laravel API (Backend)

### 5.1 Buat Website untuk API

1. Masuk ke **Website** di sidebar
2. Klik **Add Site**
3. Isi form:
   - **Domain**: `api.donarazhar.site` (atau domain Anda)
   - **Root Directory**: `/www/wwwroot/api.donarazhar.site`
   - **PHP Version**: `PHP-82`
4. Klik **Submit**

### 5.2 Upload Source Code

**Via Git (Recommended)**

SSH ke server dan clone repository:

```bash
cd /www/wwwroot/api.donarazhar.site
rm -rf * .* 2>/dev/null
git clone https://github.com/donarazhar/kaskecil-mobileAPP-version.git .
cd apps/api
```

### 5.3 Configure Laravel

```bash
cd /www/wwwroot/api.donarazhar.site/apps/api

# Install dependencies
composer install --no-dev --optimize-autoloader

# Copy dan edit .env
cp .env.example .env
nano .env
```

Edit `.env` dengan konfigurasi production.

### 5.4 Setup Laravel

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chown -R www:www /www/wwwroot/api.donarazhar.site
chmod -R 755 /www/wwwroot/api.donarazhar.site
chmod -R 775 /www/wwwroot/api.donarazhar.site/apps/api/storage
chmod -R 775 /www/wwwroot/api.donarazhar.site/apps/api/bootstrap/cache
```

### 5.5 Configure Nginx untuk Laravel

Di aaPanel, masuk ke **Website** → klik domain API → **Config** dan set root ke `public`:

```nginx
server {
    listen 80;
    server_name api.donarazhar.site;
    root /www/wwwroot/api.donarazhar.site/apps/api/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/tmp/php-cgi-82.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 5.6 Setup SSL (HTTPS)

1. Di aaPanel Website → klik domain → **SSL**
2. Pilih **Let's Encrypt**
3. Klik **Apply** dan aktifkan **Force HTTPS**

---

## 6. Deploy React Web (Frontend)

### 6.1 Build Frontend di Lokal

```bash
cd apps/web
npm run build
```

### 6.2 Buat Website untuk Frontend

1. Di aaPanel → **Website** → **Add Site**
2. Isi:
   - **Domain**: `learn.al-azhar.or.id`
   - **PHP Version**: `Pure Static`
3. Klik **Submit**

### 6.3 Upload Build Files

Upload dan extract folder `dist/` ke root website.

### 6.4 Configure Nginx untuk SPA

Tambahkan di config Nginx:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 6.5 Setup SSL

Apply Let's Encrypt SSL.

---

## 7. Quick Reference

| Item            | Value                        |
| --------------- | ---------------------------- |
| Proxmox         | `https://192.168.13.69:8006` |
| Server Kaskecil | `192.168.13.75`              |
| aaPanel Port    | `7800`                       |
