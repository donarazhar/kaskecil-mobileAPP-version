# Walkthrough - Kas Kecil Application Implementation

## 1. Backend Implementation (Laravel API)
Backend telah diimplementasikan sepenuhnya dengan fitur-fitur berikut:

### Database & Models
- **Migrations**: 12 tabel (instansi, cabang, unit, roles, users, akun_aas, akun_matanggaran, transaksi, transaksi_shadow, notifications, settings, personal_access_tokens).
- **Models**: 11 Model dengan relasi lengkap.
- **Enums**: UserRole, TransaksiKategori, DraftStatus.

### Core Features
- **Authentication**: Login, Logout, Me, Refresh Token, Change Password.
- **Role-Based Access Control**: Middleware `CheckRole`, `CheckCabangAccess`, `CheckUnitAccess` & Policies.
- **Transaksi**: CRUD Transaksi harian (Pemasukan & Pengeluaran).
- **Draft & Approval**: Sistem approval berjenjang untuk pengeluaran (Draft -> Pending -> Approved/Rejected).
- **Replenishment**: Fitur pengisian kas kembali (Reimbursement) dari Cabang ke Unit.
- **Laporan**: Endpoint untuk Buku Kas Umum dan Rekap Anggaran.

### Verification
- `php artisan migrate:fresh` berhasil dijalankan.
- `php artisan db:seed` berhasil membuat data dummy (Super Admin, Admins, Petugas).

## 2. Mobile App Implementation (React Native / Expo)
Struktur aplikasi mobile telah dibuat menggunakan React Native & Expo Router pattern.

### Structure
- **Navigation**:
  - `AuthNavigator`: Login, ForgotPassword.
  - `BottomTabNavigator`: Dashboard, Transaksi, Draft, Laporan, Menu.
  - `RootNavigator`: Mengatur flow Auth state.
- **Screens**: 17 Screens telah dibuat sebagai placeholder yang terhubung dengan navigasi.
  - Auth: Login, ForgotPassword
  - Utama: Dashboard, Transaksi (List, Create, Detail, Edit), Draft (List, Create, Detail, Edit)
  - Menu: Profile, Pengisian, Master Data (Cabang, Unit, Mata Anggaran), Users, Notifications
- **Modals**: CameraModal, FilterModal, ApprovalModal.

### ⚠️ Action Required
Environment Anda saat ini belum memiliki dependencies yang terinstall untuk mobile app, menyebabkan error "Cannot find module".

**Silakan jalankan perintah berikut di terminal root project:**
```bash
pnpm install
```

Setelah dependencies terinstall, error di editor akan hilang dan Anda dapat menjalankan aplikasi mobile dengan:
```bash
cd apps/mobile
pnpm start
```
