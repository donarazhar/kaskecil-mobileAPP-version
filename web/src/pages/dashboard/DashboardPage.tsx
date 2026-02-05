import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard, useTransaksi } from "@kas-kecil/api-client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { UnitRecapTable } from "./UnitRecapTable";
import { DashboardFilters } from "./DashboardFilters";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Skeleton components
const StatCardSkeleton = () => (
  <div className="stats-card animate-pulse">
    <div className="flex items-start justify-between">
      <div className="w-12 h-12 rounded-xl bg-gray-200" />
      <div className="w-16 h-6 rounded-full bg-gray-200" />
    </div>
    <div className="mt-4">
      <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
      <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

const TransactionSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-200" />
      <div>
        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="text-right">
      <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-16 bg-gray-200 rounded" />
    </div>
  </div>
);

// Simple Horizontal Bar Chart Component
const SimpleHorizontalBarChart = ({
  data,
}: {
  data: { label: string; value: number; color: string; subLabel?: string }[];
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="flex justify-between items-end text-sm">
            <div className="flex flex-col">
              <span
                className="text-gray-700 font-medium truncate w-32 sm:w-48"
                title={item.label}
              >
                {item.label}
              </span>
              {item.subLabel && (
                <span className="text-xs text-gray-400">{item.subLabel}</span>
              )}
            </div>
            <span className="font-semibold text-gray-900">
              {formatCurrency(item.value)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                item.color,
              )}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Donut Chart Component
const DonutChart = ({
  percentage,
  color,
  label,
}: {
  percentage: number;
  color: string;
  label: string;
}) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="12"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">{label}</p>
    </div>
  );
};

// Monthly Summary Table Component
const MonthlySummaryTable = ({
  data,
}: {
  data: { month: string; pengeluaran: number; pengisian: number }[];
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left py-3 px-2 font-semibold text-gray-600">
            Bulan
          </th>
          <th className="text-right py-3 px-2 font-semibold text-gray-600">
            Pengeluaran
          </th>
          <th className="text-right py-3 px-2 font-semibold text-gray-600">
            Pengisian (Cair)
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
            <td className="py-3 px-2 text-gray-900">{row.month}</td>
            <td className="py-3 px-2 text-right text-red-600 font-medium">
              {formatCurrency(row.pengeluaran)}
            </td>
            <td className="py-3 px-2 text-right text-emerald-600 font-medium">
              {formatCurrency(row.pengisian)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filters, setFilters] = useState<{
    cabang_id?: number;
    unit_id?: number;
  }>({});

  // Check if user is super admin
  const isSuperAdmin = user?.role?.name === "super_admin";

  const { summary, isSummaryLoading, topAnggaran } = useDashboard({
    cabang_id: filters.cabang_id,
    unit_id: filters.unit_id,
  });

  // Determine critical units (Low balance)
  const criticalUnits = useMemo(() => {
    if (!summary?.unit_summaries) return [];
    return summary.unit_summaries.filter(
      (u) => u.sisa_kas < 1000000 || u.persentase_pemakaian > 90,
    );
  }, [summary]);

  // Build stats from real data
  const statsData = summary
    ? [
        {
          title: "Pembentukan Kas",
          value: formatCurrency(summary.plafon || 0),
          change: "+0%",
          changeType: "neutral",
          icon: Wallet,
          iconBg: "bg-blue-500",
          description: "Batas maksimal kas",
        },
        {
          title: "Pengeluaran",
          value: formatCurrency(summary.total_pengeluaran || 0),
          change:
            "-" +
            ((summary.total_pengeluaran / (summary.plafon || 1)) * 100).toFixed(
              0,
            ) +
            "%",
          changeType: "negative",
          icon: TrendingDown,
          iconBg: "bg-red-500",
          description: "Total bulan ini",
        },
        {
          title: "Saldo Berjalan",
          value: formatCurrency(summary.sisa_kas || 0),
          change:
            ((summary.sisa_kas / (summary.plafon || 1)) * 100).toFixed(0) + "%",
          changeType: "positive",
          icon: TrendingUp,
          iconBg: "bg-emerald-500",
          description: "Tersedia untuk digunakan",
        },
        {
          title: "Pengisian (Belum Cair)",
          value: formatCurrency(summary.total_draft_pengisian || 0),
          change: "+0%", // Placeholder, or calculate if needed
          changeType: "neutral",
          icon: Clock,
          iconBg: "bg-amber-500",
          description: "Saldo yang belum dicairkan",
        },
      ]
    : [];

  // Calculate usage percentage
  const usagePercentage = summary
    ? ((summary.total_pengeluaran || 0) / (summary.plafon || 1)) * 100
    : 0;

  // Top Spending Units Data (for Super Admin)
  const topSpendingUnits = useMemo(() => {
    if (!summary?.unit_summaries) return [];
    return [...summary.unit_summaries]
      .sort((a, b) => b.total_pengeluaran - a.total_pengeluaran)
      .slice(0, 5)
      .map((u) => ({
        label: u.nama_unit,
        subLabel: u.cabang,
        value: u.total_pengeluaran,
        color: "bg-red-500", // Uniform color for now, or dynamic
      }));
  }, [summary]);

  // Category data from API (Top Anggaran / Akun AAS)
  const categoryData = useMemo(() => {
    if (!topAnggaran || topAnggaran.length === 0) return [];

    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-purple-500",
      "bg-rose-500",
    ];
    return topAnggaran.map((item: any, index: number) => ({
      label: item.nama_matanggaran,
      value: item.total,
      color: colors[index % colors.length],
    }));
  }, [topAnggaran]);

  const chartData =
    isSuperAdmin && !filters.unit_id ? topSpendingUnits : categoryData;
  const chartTitle =
    isSuperAdmin && !filters.unit_id ? "Top 5 Unit Boros" : "Estimasi Kategori";

  const monthlyData = useMemo(() => {
    if (summary?.monthly_summary && summary.monthly_summary.length > 0) {
      return summary.monthly_summary;
    }
    return [];
  }, [summary]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Selamat datang kembali, {user?.nama || "User"}!
            {isSuperAdmin && (
              <span className="ml-1 hidden sm:inline">
                Anda memiliki akses penuh ke seluruh data unit.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Critical Alerts (Super Admin) */}
      {isSuperAdmin && criticalUnits.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
          {/* @ts-ignore */}
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-red-800 font-semibold text-sm">
              Perhatian: {criticalUnits.length} Unit dengan Saldo Kritis
            </h3>
            <p className="text-red-600 text-sm mt-1">
              Unit berikut memiliki saldo rendah (&lt; 1jt) atau penggunaan di
              atas 90%:
              <span className="font-medium ml-1">
                {criticalUnits.map((u) => u.nama_unit).join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Filters (Super Admin Only) */}
      {isSuperAdmin && <DashboardFilters onFilterChange={setFilters} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isSummaryLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statsData.map((stat, index) => (
            <div
              key={index}
              className="stats-card group hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white",
                    stat.iconBg,
                  )}
                >
                  {/* @ts-ignore */}
                  <stat.icon size={22} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full",
                    stat.changeType === "positive" &&
                      "bg-emerald-100 text-emerald-700",
                    stat.changeType === "negative" && "bg-red-100 text-red-700",
                    stat.changeType === "neutral" &&
                      "bg-gray-100 text-gray-700",
                  )}
                >
                  {/* @ts-ignore */}
                  {stat.changeType === "positive" && (
                    <ArrowUpRight size={14} className="text-emerald-700" />
                  )}
                  {/* @ts-ignore */}
                  {stat.changeType === "negative" && (
                    <ArrowDownRight size={14} className="text-red-700" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Penggunaan Kas Donut Chart */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-2 mb-6">
            {/* @ts-ignore */}
            <PieChart size={20} className="text-[#0053C5]" />
            <h2 className="text-lg font-semibold text-gray-900">
              Penggunaan Kas
            </h2>
          </div>
          <div className="flex justify-center">
            <DonutChart
              percentage={Math.min(usagePercentage, 100)}
              color={
                usagePercentage > 80
                  ? "#EF4444"
                  : usagePercentage > 50
                    ? "#F59E0B"
                    : "#10B981"
              }
              label="Kas Terpakai"
            />
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Terpakai</span>
              <span className="font-medium text-red-600">
                {formatCurrency(summary?.total_pengeluaran || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Saldo Berjalan</span>
              <span className="font-medium text-emerald-600">
                {formatCurrency(summary?.sisa_kas || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Pengeluaran Chart (Switchable based on role) */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-2 mb-6">
            {/* @ts-ignore */}
            <BarChart3 size={20} className="text-[#0053C5]" />
            <h2 className="text-lg font-semibold text-gray-900">
              {chartTitle}
            </h2>
          </div>
          {isSummaryLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-6 bg-gray-200 rounded" />
              <div className="h-6 bg-gray-200 rounded" />
            </div>
          ) : (
            <SimpleHorizontalBarChart data={chartData} />
          )}
        </div>

        {/* Ringkasan Bulanan */}
        <div className="card-modern p-6">
          <div className="flex items-center gap-2 mb-6">
            {/* @ts-ignore */}
            <Activity size={20} className="text-[#0053C5]" />
            <h2 className="text-lg font-semibold text-gray-900">
              Ringkasan Bulanan
            </h2>
          </div>
          {isSummaryLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ) : (
            <MonthlySummaryTable data={monthlyData} />
          )}
        </div>
      </div>

      {/* Unit Recap Table (Super Admin only - improved) */}
      {summary?.unit_summaries && summary.unit_summaries.length > 0 && (
        <UnitRecapTable data={summary.unit_summaries} />
      )}

      {/* Split Transactions Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Transaksi Pengeluaran (Bulan Ini) */}
        <RecentPengeluaranList
          user={user}
          navigate={navigate}
          filters={filters}
        />

        {/* 2. Transaksi Pengisian Kas (History) */}
        <RecentPengisianList
          user={user}
          navigate={navigate}
          filters={filters}
        />
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function RecentPengeluaranList({
  user,
  navigate,
  filters,
}: {
  user: any;
  navigate: any;
  filters: any;
}) {
  // Calculate date range for current month
  const dateRange = useMemo(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Format to YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    return {
      from: formatDate(firstDay),
      to: formatDate(lastDay),
    };
  }, []);

  const { data: pengeluaranData, isLoading } = useTransaksi({
    page: 1,
    per_page: 5,
    kategori: "pengeluaran",
    from: dateRange.from,
    to: dateRange.to,
    unit_id: filters.unit_id || user?.unit?.id,
    cabang_id: filters.cabang_id || user?.cabang_id,
  });

  const transactions = pengeluaranData?.pages?.[0]?.data || [];

  return (
    <div className="card-modern p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-100 text-red-600">
            {/* @ts-ignore */}
            <TrendingDown size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pengeluaran Bulan Ini
            </h2>
            <p className="text-sm text-gray-500">5 transaksi terakhir</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-sm text-[#0053C5]"
          onClick={() => navigate("/transaksi")}
        >
          Lihat Semua
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : transactions.length > 0 ? (
          transactions.map((trx: any) => (
            <div
              key={trx.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-red-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-gray-900 line-clamp-1">
                    {trx.keterangan}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{trx.tanggal?.split("T")[0]}</span>
                    {trx.no_bukti && (
                      <span className="px-1.5 py-0.5 bg-gray-200 rounded">
                        {trx.no_bukti}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {trx.unit?.nama_unit}
                  </div>
                </div>
              </div>
              <span className="font-semibold text-red-600">
                -{formatCurrency(trx.jumlah)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Belum ada pengeluaran bulan ini
          </div>
        )}
      </div>
    </div>
  );
}

function RecentPengisianList({
  user,
  navigate,
  filters,
}: {
  user: any;
  navigate: any;
  filters: any;
}) {
  const { data: pengisianData, isLoading } = useTransaksi({
    page: 1,
    per_page: 5,
    kategori: "pengisian", // Filter for pengisian and pembentukan
    unit_id: filters.unit_id || user?.unit?.id,
    cabang_id: filters.cabang_id || user?.cabang_id,
  });

  const transactions = pengisianData?.pages?.[0]?.data || [];

  return (
    <div className="card-modern p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
            {/* @ts-ignore */}
            <Wallet size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Riwayat Pengisian Kas
            </h2>
            <p className="text-sm text-gray-500">5 transaksi terakhir</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="text-sm text-[#0053C5]"
          onClick={() => navigate("/pengisian")}
        >
          Lihat Semua
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : transactions.length > 0 ? (
          transactions.map((trx: any) => (
            <div
              key={trx.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-gray-900 line-clamp-1">
                    {trx.keterangan}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{trx.tanggal?.split("T")[0]}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {trx.unit?.nama_unit}
                  </div>
                </div>
              </div>
              <span className="font-semibold text-emerald-600">
                +{formatCurrency(trx.jumlah)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Belum ada riwayat pengisian
          </div>
        )}
      </div>
    </div>
  );
}
