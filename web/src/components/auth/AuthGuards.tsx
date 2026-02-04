import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Protected Route - hanya bisa diakses jika sudah login
export function ProtectedRoute() {
  const { isAuthenticated, isLoading, isInitialized, hasToken } = useAuth();

  console.log(
    "[ProtectedRoute] Check - isLoading:",
    isLoading,
    "isInitialized:",
    isInitialized,
    "hasToken:",
    hasToken,
    "isAuthenticated:",
    isAuthenticated,
  );

  // Show loading until auth is initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0053C5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (after initialization is complete)
  if (!isAuthenticated) {
    console.log("[ProtectedRoute] Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Public Route - hanya bisa diakses jika belum login
export function PublicRoute() {
  const { isAuthenticated, isLoading, isInitialized, hasToken } = useAuth();

  console.log(
    "[PublicRoute] Check - isLoading:",
    isLoading,
    "isInitialized:",
    isInitialized,
    "hasToken:",
    hasToken,
    "isAuthenticated:",
    isAuthenticated,
  );

  // Show loading until auth is initialized (only if there's a token to check)
  if (hasToken && (!isInitialized || isLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#0053C5] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    console.log(
      "[PublicRoute] Already authenticated, redirecting to dashboard",
    );
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
