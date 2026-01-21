// ===========================================
// Kas Kecil - Shared Utilities
// ===========================================

import { CURRENCY, ROLE_HIERARCHY, ROLES } from '../constants';
import type { RoleName, User } from '../types';

// ============ CURRENCY FORMATTING ============

/**
 * Format number to Indonesian Rupiah currency
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return 'Rp0';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return 'Rp0';

  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

/**
 * Format number with thousand separator
 */
export function formatNumber(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '0';

  return new Intl.NumberFormat(CURRENCY.LOCALE).format(numValue);
}

/**
 * Parse formatted currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbol, dots (thousand separator), and replace comma with dot
  const cleaned = value
    .replace(/[Rp\s.]/g, '')
    .replace(',', '.');

  return parseFloat(cleaned) || 0;
}

// ============ DATE FORMATTING ============

/**
 * Format date to Indonesian locale
 */
export function formatDate(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString('id-ID', defaultOptions);
}

/**
 * Format date to short format (dd/MM/yyyy)
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date for API (yyyy-MM-dd)
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '-';

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  return formatDate(dateObj);
}

// ============ STRING UTILITIES ============

/**
 * Capitalize first letter of each word
 */
export function capitalize(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Slugify string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============ VALIDATION UTILITIES ============

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indonesian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate NIP format (18 digits)
 */
export function isValidNIP(nip: string): boolean {
  const nipRegex = /^[0-9]{18}$/;
  return nipRegex.test(nip);
}

// ============ ROLE UTILITIES ============

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null | undefined, role: RoleName): boolean {
  if (!user?.role) return false;
  return user.role.name === role;
}

/**
 * Check if user has minimum role level
 */
export function hasMinRole(user: User | null | undefined, minRole: RoleName): boolean {
  if (!user?.role) return false;

  const userLevel = ROLE_HIERARCHY[user.role.name] || 0;
  const minLevel = ROLE_HIERARCHY[minRole] || 0;

  return userLevel >= minLevel;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: User | null | undefined): boolean {
  return hasRole(user, ROLES.SUPER_ADMIN as RoleName);
}

/**
 * Check if user is admin (super admin or admin cabang)
 */
export function isAdmin(user: User | null | undefined): boolean {
  return hasMinRole(user, ROLES.ADMIN_CABANG as RoleName);
}

/**
 * Check if user can access cabang
 */
export function canAccessCabang(user: User | null | undefined, cabangId: number): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return user.cabang?.id === cabangId;
}

/**
 * Check if user can access unit
 */
export function canAccessUnit(user: User | null | undefined, unitId: number, cabangId?: number): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (hasRole(user, ROLES.ADMIN_CABANG as RoleName)) {
    return cabangId ? user.cabang?.id === cabangId : true;
  }
  return user.unit?.id === unitId;
}

// ============ FILE UTILITIES ============

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Check if file is image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileExtension(filename));
}

/**
 * Check if file is PDF
 */
export function isPdfFile(filename: string): boolean {
  return getFileExtension(filename) === 'pdf';
}

// ============ MISC UTILITIES ============

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Remove null/undefined values from object
 */
export function removeEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value != null)
  ) as Partial<T>;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100 * 100) / 100;
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}