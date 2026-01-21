# Panduan Workflow Aplikasi Kas Kecil (v4.0)

Dokumen ini menjelaskan alur kerja pengembangan dan operasional aplikasi Kas Kecil yang menggunakan struktur monorepo.

## 1. Struktur Arsitektur
Proyek ini menggunakan struktur **Monorepo** dengan `turbo` untuk manajemen task:
- `apps/api`: Backend Laravel (REST API).
- `apps/web`: Frontend Web (Admin Panel).
- `apps/mobile`: Aplikasi Mobile (React Native/Expo).
- `packages/*`: Shared logic, API client, dan validator.

---

## 2. Persiapan Pengembangan (Setup)
Langkah-langkah untuk menjalankan aplikasi di lingkungan lokal:

1.  **Instalasi Dependencies**:
    ```bash
    pnpm install
    ```
2.  **Konfigurasi Database** (menggunakan Docker):
    ```bash
    pnpm docker:up
    ```
3.  **Setup Database Laravel**:
    ```bash
    pnpm db:fresh
    ```
    *Perintah ini akan menjalankan migrasi dan seeding data awal (Admin, Petugas, dll).*
4.  **Menjalankan Semua Layanan**:
    ```bash
    pnpm dev
    ```

---

## 3. Alur Bisnis (Business Workflow)
Alur utama aplikasi mengikuti metode **Imprest** (Dana Tetap):

### A. Pencatatan Transaksi Harian
1. **Petugas/Admin** menginput transaksi (Pemasukan atau Pengeluaran).
2. Transaksi langsung memotong/menambah saldo Kas Kecil di unit terkait.

### B. Pengajuan Dana (Draft & Approval)
1. **User** membuat draft pengajuan (misal: pengeluaran besar yang butuh persetujuan).
2. Status draft: `Draft` -> `Pending`.
3. **Manager/Atasan** mereview draft melalui menu Approval.
4. Status berubah menjadi `Approved` (Dana Cair) atau `Rejected`.

### C. Pengisian Kembali (Replenishment)
1. Unit mengajukan **Reimbursement** ke Cabang ketika saldo menipis.
2. Cabang memverifikasi saldo dan rekap transaksi.
3. Cabang mentransfer dana, dan saldo unit kembali ke jumlah semula (Imprest).

---

## 4. Perintah Umum (Useful Commands)
| Perintah | Deskripsi |
| :--- | :--- |
| `pnpm dev:api` | Menjalankan hanya Backend Laravel |
| `pnpm dev:mobile` | Menjalankan Aplikasi Mobile (Expo) |
| `pnpm format` | Merapikan kode menggunakan Prettier |
| `pnpm lint` | Mengecek error penulisan kode |
| `pnpm docker:down` | Menghentikan container database |

---

## 5. Deployment
Aplikasi dapat dideploy menggunakan Docker atau secara manual:
- **Build Web**: `pnpm build:web`
- **Build Mobile**: `pnpm build:mobile:android` atau `pnpm build:mobile:ios`
