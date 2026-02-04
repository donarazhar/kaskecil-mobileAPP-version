
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
};

export const formatDate = (date: string | Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Types Stub
export type User = any;
export type TransaksiKategori = any;
export type UnitSummary = any;
export type Transaksi = any;
