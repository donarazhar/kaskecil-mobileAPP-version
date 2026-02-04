// @ts-nocheck
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import TransaksiListPage from "@/pages/transaksi/TransaksiListPage";
import TransaksiCreatePage from "@/pages/transaksi/TransaksiCreatePage";
import TransaksiEditPage from "@/pages/transaksi/TransaksiEditPage";
import PengisianListPage from "@/pages/transaksi/PengisianListPage";
import PengisianCreatePage from "@/pages/transaksi/PengisianCreatePage";
import PengisianEditPage from "@/pages/transaksi/PengisianEditPage";
import CabangListPage from "@/pages/master/cabang/CabangListPage";
import CabangCreatePage from "@/pages/master/cabang/CabangCreatePage";
import UnitListPage from "@/pages/master/unit/UnitListPage";
import UnitCreatePage from "@/pages/master/unit/UnitCreatePage";
import UserListPage from "@/pages/master/users/UserListPage";
import UserCreatePage from "@/pages/master/users/UserCreatePage";
import UserDetailPage from "@/pages/master/users/UserDetailPage";
import AkunAASListPage from "@/pages/master/akun-aas/AkunAASListPage";
import MataAnggaranListPage from "@/pages/master/mata-anggaran/MataAnggaranListPage";
import InstansiPage from "@/pages/master/instansi/InstansiPage";
import { Navigate, Route, Routes } from "react-router-dom";

import LaporanPage from "@/pages/laporan/LaporanPage";
import LaporanAkunAasPage from "@/pages/laporan/LaporanAkunAasPage";
import LaporanTransaksiPage from "@/pages/laporan/LaporanTransaksiPage";

// Placeholder pages - untuk fitur yang belum diimplementasi
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
        {title}
      </h1>
      <p className="text-gray-500 mt-1">
        Halaman ini sedang dalam pengembangan
      </p>
    </div>
    <div className="card-modern p-12 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0053C5]/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-[#0053C5]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Segera Hadir</h2>
      <p className="text-gray-500 text-sm max-w-md mx-auto">
        Fitur {title.toLowerCase()} sedang dalam tahap pengembangan dan akan
        segera tersedia.
      </p>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Transaksi */}
        <Route path="/transaksi" element={<TransaksiListPage />} />
        <Route path="/transaksi/create" element={<TransaksiCreatePage />} />
        <Route path="/transaksi/:id/edit" element={<TransaksiEditPage />} />

        {/* Pengajuan/Draft - placeholder */}
        <Route path="/drafts" element={<PlaceholderPage title="Pengajuan" />} />
        <Route
          path="/drafts/create"
          element={<PlaceholderPage title="Buat Pengajuan" />}
        />

        {/* Pengisian */}
        <Route path="/pengisian" element={<PengisianListPage />} />
        <Route path="/pengisian/create" element={<PengisianCreatePage />} />
        <Route path="/pengisian/:id/edit" element={<PengisianEditPage />} />

        {/* Laporan */}
        <Route path="/laporan/cetak" element={<LaporanPage />} />
        <Route path="/laporan/akun-aas" element={<LaporanAkunAasPage />} />
        <Route path="/laporan/transaksi" element={<LaporanTransaksiPage />} />

        {/* Users */}
        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/create" element={<UserCreatePage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/users/:id/edit" element={<UserCreatePage />} />

        {/* Master Data */}
        <Route path="/master/instansi" element={<InstansiPage />} />

        <Route path="/master/cabang" element={<CabangListPage />} />
        <Route path="/master/cabang/create" element={<CabangCreatePage />} />
        <Route path="/master/cabang/:id/edit" element={<CabangCreatePage />} />

        <Route path="/master/unit" element={<UnitListPage />} />
        <Route path="/master/unit/create" element={<UnitCreatePage />} />
        <Route path="/master/unit/:id/edit" element={<UnitCreatePage />} />

        <Route path="/master/akun-aas" element={<AkunAASListPage />} />

        <Route
          path="/master/mata-anggaran"
          element={<MataAnggaranListPage />}
        />
      </Route>

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
