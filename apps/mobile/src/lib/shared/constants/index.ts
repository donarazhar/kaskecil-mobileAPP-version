// ===========================================
// Kas Kecil - Shared Constants
// ===========================================

// ============ ROLES ============
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_CABANG: 'admin_cabang',
  ADMIN_UNIT: 'admin_unit',
  PETUGAS: 'petugas',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN_CABANG]: 'Admin Cabang',
  [ROLES.ADMIN_UNIT]: 'Admin Unit',
  [ROLES.PETUGAS]: 'Petugas',
};

export const ROLE_HIERARCHY: Record<string, number> = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ADMIN_CABANG]: 3,
  [ROLES.ADMIN_UNIT]: 2,
  [ROLES.PETUGAS]: 1,
};

// ============ TRANSAKSI KATEGORI ============
export const TRANSAKSI_KATEGORI = {
  PEMBENTUKAN: 'pembentukan',
  PENGELUARAN: 'pengeluaran',
  PENGISIAN: 'pengisian',
} as const;

export const TRANSAKSI_KATEGORI_LABELS: Record<string, string> = {
  [TRANSAKSI_KATEGORI.PEMBENTUKAN]: 'Pembentukan',
  [TRANSAKSI_KATEGORI.PENGELUARAN]: 'Pengeluaran',
  [TRANSAKSI_KATEGORI.PENGISIAN]: 'Pengisian Kembali',
};

export const TRANSAKSI_KATEGORI_COLORS: Record<string, string> = {
  [TRANSAKSI_KATEGORI.PEMBENTUKAN]: '#10B981', // green
  [TRANSAKSI_KATEGORI.PENGELUARAN]: '#EF4444', // red
  [TRANSAKSI_KATEGORI.PENGISIAN]: '#3B82F6', // blue
};

// ============ DRAFT STATUS ============
export const DRAFT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const DRAFT_STATUS_LABELS: Record<string, string> = {
  [DRAFT_STATUS.DRAFT]: 'Draft',
  [DRAFT_STATUS.PENDING]: 'Menunggu Persetujuan',
  [DRAFT_STATUS.APPROVED]: 'Disetujui',
  [DRAFT_STATUS.REJECTED]: 'Ditolak',
};

export const DRAFT_STATUS_COLORS: Record<string, string> = {
  [DRAFT_STATUS.DRAFT]: '#6B7280', // gray
  [DRAFT_STATUS.PENDING]: '#F59E0B', // yellow
  [DRAFT_STATUS.APPROVED]: '#10B981', // green
  [DRAFT_STATUS.REJECTED]: '#EF4444', // red
};

// ============ NOTIFICATION TYPES ============
export const NOTIFICATION_TYPES = {
  DRAFT_SUBMITTED: 'draft_submitted',
  DRAFT_APPROVED: 'draft_approved',
  DRAFT_REJECTED: 'draft_rejected',
  PENGISIAN_COMPLETED: 'pengisian_completed',
  LOW_BALANCE: 'low_balance',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  [NOTIFICATION_TYPES.DRAFT_SUBMITTED]: 'Draft Diajukan',
  [NOTIFICATION_TYPES.DRAFT_APPROVED]: 'Draft Disetujui',
  [NOTIFICATION_TYPES.DRAFT_REJECTED]: 'Draft Ditolak',
  [NOTIFICATION_TYPES.PENGISIAN_COMPLETED]: 'Pengisian Selesai',
  [NOTIFICATION_TYPES.LOW_BALANCE]: 'Saldo Rendah',
  [NOTIFICATION_TYPES.SYSTEM]: 'Sistem',
};

// ============ AKUN JENIS ============
export const AKUN_JENIS = {
  DEBET: 'debet',
  KREDIT: 'kredit',
} as const;

export const AKUN_JENIS_LABELS: Record<string, string> = {
  [AKUN_JENIS.DEBET]: 'Debet',
  [AKUN_JENIS.KREDIT]: 'Kredit',
};

// ============ PAGINATION ============
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============ DATE FORMATS ============
export const DATE_FORMAT = {
  DISPLAY: 'dd MMMM yyyy',
  DISPLAY_SHORT: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd MMMM yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
} as const;

// ============ CURRENCY ============
export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  LOCALE: 'id-ID',
} as const;

// ============ FILE UPLOAD ============
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 3,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
} as const;

// ============ VALIDATION ============
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^(\+62|62|0)[0-9]{9,13}$/,
  NIP_REGEX: /^[0-9]{18}$/,
} as const;

// ============ API ENDPOINTS ============
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/update-profile',
    FCM_TOKEN: '/auth/fcm-token',
  },

  // Dashboard
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    CHART: '/dashboard/chart',
    RECENT: '/dashboard/recent',
    TOP_ANGGARAN: '/dashboard/top-anggaran',
    PENDING_APPROVALS: '/dashboard/pending-approvals',
  },

  // Cabang
  CABANG: {
    LIST: '/cabang',
    CREATE: '/cabang',
    DETAIL: (id: number) => `/cabang/${id}`,
    UPDATE: (id: number) => `/cabang/${id}`,
    DELETE: (id: number) => `/cabang/${id}`,
    SUMMARY: (id: number) => `/cabang/${id}/summary`,
  },

  // Unit
  UNIT: {
    LIST: '/unit',
    CREATE: '/unit',
    DETAIL: (id: number) => `/unit/${id}`,
    UPDATE: (id: number) => `/unit/${id}`,
    DELETE: (id: number) => `/unit/${id}`,
    SUMMARY: (id: number) => `/unit/${id}/summary`,
  },

  // Transaksi
  TRANSAKSI: {
    LIST: '/transaksi',
    CREATE: '/transaksi',
    DETAIL: (id: number) => `/transaksi/${id}`,
    UPDATE: (id: number) => `/transaksi/${id}`,
    DELETE: (id: number) => `/transaksi/${id}`,
    UPLOAD: '/transaksi/upload',
    CAIRKAN: (shadowId: number) => `/transaksi/cairkan/${shadowId}`,
  },

  // Draft
  DRAFT: {
    LIST: '/draft',
    CREATE: '/draft',
    DETAIL: (id: number) => `/draft/${id}`,
    UPDATE: (id: number) => `/draft/${id}`,
    DELETE: (id: number) => `/draft/${id}`,
    SUBMIT: (id: number) => `/draft/${id}/submit`,
    APPROVE: (id: number) => `/draft/${id}/approve`,
    REJECT: (id: number) => `/draft/${id}/reject`,
  },

  // Pengisian
  PENGISIAN: {
    PENDING: '/pengisian/pending',
    PROCESS: '/pengisian/process',
    HISTORY: '/pengisian/history',
    DETAIL: (id: number) => `/pengisian/${id}`,
  },

  // Master
  MASTER: {
    AKUN_AAS: {
      LIST: '/master/akun-aas',
      CREATE: '/master/akun-aas',
      UPDATE: (id: number) => `/master/akun-aas/${id}`,
      DELETE: (id: number) => `/master/akun-aas/${id}`,
    },
    MATA_ANGGARAN: {
      LIST: '/master/mata-anggaran',
      CREATE: '/master/mata-anggaran',
      UPDATE: (id: number) => `/master/mata-anggaran/${id}`,
      DELETE: (id: number) => `/master/mata-anggaran/${id}`,
    },
    INSTANSI: {
      GET: '/master/instansi',
      UPDATE: '/master/instansi',
    },
  },

  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
    TOGGLE_STATUS: (id: number) => `/users/${id}/toggle-status`,
  },

  // Roles
  ROLES: {
    LIST: '/roles',
  },

  // Laporan
  LAPORAN: {
    BUKU_KAS: '/laporan/buku-kas',
    REKAP_ANGGARAN: '/laporan/rekap-anggaran',
    EXPORT_PDF: '/laporan/export/pdf',
    EXPORT_EXCEL: '/laporan/export/excel',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    READ: (id: number) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    DELETE: (id: number) => `/notifications/${id}`,
  },
} as const;

// ============ QUERY KEYS ============
export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'],
  },
  DASHBOARD: {
    SUMMARY: ['dashboard', 'summary'],
    CHART: ['dashboard', 'chart'],
    RECENT: ['dashboard', 'recent'],
    TOP_ANGGARAN: ['dashboard', 'top-anggaran'],
  },
  CABANG: {
    ALL: ['cabang'],
    LIST: (filters?: object) => ['cabang', 'list', filters],
    DETAIL: (id: number) => ['cabang', 'detail', id],
  },
  UNIT: {
    ALL: ['unit'],
    LIST: (filters?: object) => ['unit', 'list', filters],
    DETAIL: (id: number) => ['unit', 'detail', id],
  },
  TRANSAKSI: {
    ALL: ['transaksi'],
    LIST: (filters?: object) => ['transaksi', 'list', filters],
    DETAIL: (id: number) => ['transaksi', 'detail', id],
  },
  DRAFT: {
    ALL: ['draft'],
    LIST: (filters?: object) => ['draft', 'list', filters],
    DETAIL: (id: number) => ['draft', 'detail', id],
  },
  PENGISIAN: {
    ALL: ['pengisian'],
    PENDING: (filters?: object) => ['pengisian', 'pending', filters],
    HISTORY: (filters?: object) => ['pengisian', 'history', filters],
  },
  MASTER: {
    AKUN_AAS: ['master', 'akun-aas'],
    MATA_ANGGARAN: (filters?: object) => ['master', 'mata-anggaran', filters],
    INSTANSI: ['master', 'instansi'],
  },
  USERS: {
    ALL: ['users'],
    LIST: (filters?: object) => ['users', 'list', filters],
    DETAIL: (id: number) => ['users', 'detail', id],
  },
  ROLES: ['roles'],
  LAPORAN: {
    BUKU_KAS: (filters?: object) => ['laporan', 'buku-kas', filters],
    REKAP_ANGGARAN: (filters?: object) => ['laporan', 'rekap-anggaran', filters],
  },
  NOTIFICATIONS: {
    ALL: ['notifications'],
    LIST: (filters?: object) => ['notifications', 'list', filters],
  },
} as const;

// ============ STORAGE KEYS ============
export const STORAGE_KEYS = {
  TOKEN: 'kas_kecil_token',
  USER: 'kas_kecil_user',
  THEME: 'kas_kecil_theme',
  SIDEBAR_COLLAPSED: 'kas_kecil_sidebar_collapsed',
  SELECTED_CABANG: 'kas_kecil_selected_cabang',
  SELECTED_UNIT: 'kas_kecil_selected_unit',
} as const;

// ============ APP CONFIG ============
export const APP_CONFIG = {
  NAME: 'Kas Kecil',
  VERSION: '1.0.0',
  DESCRIPTION: 'Aplikasi Pengelolaan Kas Kecil',
  COPYRIGHT_YEAR: new Date().getFullYear(),
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
  LOW_BALANCE_THRESHOLD: 0.2, // 20% of plafon
} as const;
