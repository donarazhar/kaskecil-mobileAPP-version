// ===========================================
// Kas Kecil - Shared Types
// ===========================================

// ============ AUTH ============
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export type LoginDTO = LoginCredentials;

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_at: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// ============ USER ============
export interface User {
  id: number;
  nama: string;
  email: string;
  role: Role;
  cabang_id?: number | null;
  unit_id?: number | null;
  cabang?: Cabang | null;
  unit?: Unit | null;
  foto?: string | null;
  telepon?: string | null;
  is_active: boolean;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDTO {
  nama: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  cabang_id?: number | null;
  unit_id?: number | null;
  telepon?: string | null;
}

export interface UpdateUserDTO {
  nama?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role_id?: number;
  cabang_id?: number | null;
  unit_id?: number | null;
  telepon?: string | null;
  is_active?: boolean;
}

// ============ ROLE ============
export interface Role {
  id: number;
  name: RoleName;
  display_name: string;
  description?: string | null;
}

export type RoleName = 'super_admin' | 'admin_cabang' | 'admin_unit' | 'petugas';

// ============ INSTANSI ============
export interface Instansi {
  id: number;
  nama_instansi: string;
  alamat?: string | null;
  telepon?: string | null;
  email?: string | null;
  logo?: string | null;
  kepala_instansi?: string | null;
  nip_kepala?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateInstansiDTO {
  nama_instansi?: string;
  alamat?: string | null;
  telepon?: string | null;
  email?: string | null;
  logo?: string | null;
  kepala_instansi?: string | null;
  nip_kepala?: string | null;
}

// ============ CABANG ============
// ============ CABANG ============
export interface Cabang {
  id: number;
  instansi_id: number;
  instansi?: Instansi;
  kode_cabang: string;
  nama_cabang: string;
  alamat?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telepon?: string | null;
  email?: string | null;
  kepala_cabang?: string | null;
  nip_kepala?: string | null;
  plafon_kas: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCabangDTO {
  instansi_id: number;
  kode_cabang: string;
  nama_cabang: string;
  alamat?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telepon?: string | null;
  email?: string | null;
  kepala_cabang?: string | null;
  nip_kepala?: string | null;
  plafon_kas?: number;
}

export interface UpdateCabangDTO {
  kode_cabang?: string;
  nama_cabang?: string;
  alamat?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telepon?: string | null;
  email?: string | null;
  kepala_cabang?: string | null;
  nip_kepala?: string | null;
  plafon_kas?: number;
  is_active?: boolean;
}

// ============ UNIT ============
export interface Unit {
  id: number;
  cabang_id: number;
  cabang?: Cabang;
  kode_unit: string;
  nama_unit: string;
  kepala_unit?: string | null;
  nip_kepala?: string | null;
  plafon_kas: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUnitDTO {
  cabang_id: number;
  kode_unit: string;
  nama_unit: string;
  kepala_unit?: string | null;
  nip_kepala?: string | null;
  plafon_kas?: number;
}

export interface UpdateUnitDTO {
  kode_unit?: string;
  nama_unit?: string;
  kepala_unit?: string | null;
  nip_kepala?: string | null;
  plafon_kas?: number;
  is_active?: boolean;
}

// ============ AKUN AAS ============
export interface AkunAAS {
  id: number;
  unit_id: number;
  unit?: Unit;
  kode_akun: string;
  nama_akun: string;
  jenis: 'debet' | 'kredit';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAkunAASDTO {
  unit_id: number;
  kode_akun: string;
  nama_akun: string;
  jenis: 'debet' | 'kredit';
}

export interface UpdateAkunAASDTO {
  kode_akun?: string;
  nama_akun?: string;
  jenis?: 'debet' | 'kredit';
  is_active?: boolean;
}

// ============ MATA ANGGARAN ============
export interface MataAnggaran {
  id: number;
  kode_matanggaran: string;
  akun_aas_id: number;
  saldo: number;
  akun_aas?: AkunAAS;
  // Computed attributes
  nama_matanggaran?: string; // Computed from akun_aas
  unit?: Unit; // Accessed through akun_aas
}

export interface CreateMataAnggaranDTO {
  kode_matanggaran: string;
  akun_aas_id: number;
  saldo?: number;
}

export interface UpdateMataAnggaranDTO {
  kode_matanggaran?: string;
  akun_aas_id?: number;
  saldo?: number;
}

// ============ TRANSAKSI ============
export interface Transaksi {
  id: number;
  cabang_id: number;
  unit_id?: number | null;
  cabang?: Cabang;
  unit?: Unit | null;
  tanggal: string;
  no_bukti?: string | null;
  keterangan: string;
  kategori: TransaksiKategori;
  jumlah: number;
  kode_matanggaran?: string | null;
  mata_anggaran?: MataAnggaran | null;
  lampiran?: string | null;
  lampiran2?: string | null;
  lampiran3?: string | null;
  id_pengisian?: number | null;
  user_id: number;
  user?: User;
  created_at: string;
  updated_at: string;
}

export type TransaksiKategori = 'pembentukan' | 'pengeluaran' | 'pengisian';

export interface CreateTransaksiDTO {
  cabang_id: number;
  unit_id?: number | null;
  tanggal: string;
  no_bukti?: string | null;
  keterangan: string;
  kategori: TransaksiKategori;
  jumlah: number;
  kode_matanggaran?: string | null;
  lampiran?: File | null;
  lampiran2?: File | null;
  lampiran3?: File | null;
}

export interface UpdateTransaksiDTO {
  tanggal?: string;
  no_bukti?: string | null;
  keterangan?: string;
  jumlah?: number;
  kode_matanggaran?: string | null;
}

export interface TransaksiFilter {
  cabang_id?: number;
  unit_id?: number;
  kategori?: TransaksiKategori;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

// ============ DRAFT (TRANSAKSI SHADOW) ============
export interface Draft {
  id: number;
  cabang_id: number;
  unit_id?: number | null;
  cabang?: Cabang;
  unit?: Unit | null;
  tanggal: string;
  no_bukti?: string | null;
  keterangan: string;
  kategori: string;
  jumlah: number;
  kode_matanggaran?: string | null;
  mata_anggaran?: MataAnggaran | null;
  lampiran?: string | null;
  lampiran2?: string | null;
  lampiran3?: string | null;
  status: DraftStatus;
  catatan_approval?: string | null;
  user_id: number;
  user?: User;
  approved_by?: number | null;
  approver?: User | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type DraftStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface CreateDraftDTO {
  cabang_id: number;
  unit_id?: number | null;
  tanggal: string;
  no_bukti?: string | null;
  keterangan: string;
  jumlah: number;
  kode_matanggaran?: string | null;
  lampiran?: File | null;
  lampiran2?: File | null;
  lampiran3?: File | null;
}

export interface UpdateDraftDTO {
  tanggal?: string;
  no_bukti?: string | null;
  keterangan?: string;
  jumlah?: number;
  kode_matanggaran?: string | null;
}

export interface DraftFilter {
  cabang_id?: number;
  unit_id?: number;
  status?: DraftStatus;
  kategori?: TransaksiKategori | string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ApprovalDTO {
  catatan?: string | null;
}

// ============ PENGISIAN ============
export interface PengisianPending {
  transaksi: Transaksi[];
  total: number;
}

export interface ProcessPengisianDTO {
  cabang_id: number;
  unit_id?: number | null;
  tanggal: string;
  no_bukti?: string | null;
  keterangan?: string;
}

export interface PengisianHistory {
  id: number;
  tanggal: string;
  no_bukti?: string | null;
  jumlah: number;
  keterangan: string;
  transaksi_count: number;
  user?: User;
  created_at: string;
}

// ============ DASHBOARD ============
export interface UnitSummary {
  id: number;
  nama_unit: string;
  kode_unit: string;
  cabang: string;
  plafon: number;
  total_pengeluaran: number;
  total_pengisian: number;
  total_draft: number;
  sisa_kas: number;
  persentase_pemakaian: number;
}

export interface DashboardSummary {
  plafon: number;
  total_pengeluaran: number;
  sisa_kas: number;
  persentase_pemakaian: number;
  pending_approvals?: number;
  total_draft_pengisian: number;
  monthly_summary?: {
    month: string;
    pengeluaran: number;
    pengisian: number;
  }[];
  total_transaksi?: number;
  unit_summaries?: UnitSummary[];
}

export interface ChartData {
  tanggal: string;
  total: number;
}

export interface TopAnggaran {
  kode_matanggaran: string;
  nama_matanggaran: string;
  total: number;
  percentage: number;
}

export interface DashboardFilter {
  cabang_id?: number;
  unit_id?: number;
  period?: '7d' | '30d' | '1y';
}

// ============ NOTIFICATION ============
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  body?: string | null;
  type?: NotificationType | null;
  data?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

export type NotificationType =
  | 'draft_submitted'
  | 'draft_approved'
  | 'draft_rejected'
  | 'pengisian_completed'
  | 'low_balance'
  | 'system';

// ============ LAPORAN ============
export interface LaporanBukuKas {
  periode: {
    from: string;
    to: string;
  };
  cabang?: Cabang;
  unit?: Unit;
  saldo_awal: number;
  total_masuk: number;
  total_keluar: number;
  saldo_akhir: number;
  transaksi: Transaksi[];
}

export interface LaporanRekapAnggaran {
  tahun: number;
  cabang?: Cabang;
  mata_anggaran: {
    kode: string;
    nama: string;
    pagu: number;
    realisasi: number;
    sisa: number;
    persentase: number;
  }[];
  total_pagu: number;
  total_realisasi: number;
  total_sisa: number;
}

export interface LaporanFilter {
  cabang_id?: number;
  unit_id?: number;
  from?: string;
  to?: string;
  tahun?: number;
}

// ============ API RESPONSE ============
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============ SETTINGS ============
export interface Setting {
  id: number;
  cabang_id?: number | null;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingDTO {
  key: string;
  value: string;
  cabang_id?: number | null;
}
