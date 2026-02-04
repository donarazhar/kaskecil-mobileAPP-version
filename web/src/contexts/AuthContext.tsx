// Auth Context implementation to prevent redirect loops
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

interface User {
  id: number;
  nama: string;
  email: string;
  role?: {
    name: string;
    display_name?: string;
  };
  unit_id?: number;
  foto?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  hasToken: boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  isLoginLoading: boolean;
  loginError: Error | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check auth on mount - only once
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("kas_kecil_token");
      console.log("[AuthContext] Checking auth, token exists:", !!token);

      if (!token) {
        console.log("[AuthContext] No token, setting initialized");
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        console.log("[AuthContext] Fetching user data...");
        const response = await apiClient.get("/auth/me");
        const userData = response.data.data || response.data;
        console.log("[AuthContext] User data received:", userData?.nama);
        setUser(userData);
      } catch (error: any) {
        console.log(
          "[AuthContext] Auth check failed:",
          error?.response?.status,
        );
        localStorage.removeItem("kas_kecil_token");
        delete apiClient.defaults.headers.common["Authorization"];
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log("[AuthContext] Initialized");
      }
    };

    checkAuth();
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      console.log("[AuthContext] Attempting login...");
      const response = await apiClient.post("/auth/login", credentials);
      console.log("[AuthContext] Login response:", response.data);

      // Backend returns: { success, message, data: { user, token, token_type } }
      const tokenFromResponse =
        response.data.data?.token || response.data.token;
      if (tokenFromResponse) {
        console.log("[AuthContext] Token saved");
        localStorage.setItem("kas_kecil_token", tokenFromResponse);
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${tokenFromResponse}`;
      } else {
        console.error("[AuthContext] No token in response!");
        throw new Error("Login gagal: Token tidak ditemukan");
      }

      // User data already included in login response
      const userData = response.data.data?.user || response.data.user;
      console.log("[AuthContext] User after login:", userData?.nama);

      if (userData) {
        setUser(userData);
      } else {
        // Fallback: fetch user data if not in response
        console.log("[AuthContext] Fetching user data from /auth/me...");
        const userResponse = await apiClient.get("/auth/me");
        const fetchedUserData = userResponse.data.data || userResponse.data;
        console.log("[AuthContext] User fetched:", fetchedUserData?.nama);
        setUser(fetchedUserData);
      }

      return response.data;
    },
  });

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    localStorage.removeItem("kas_kecil_token");
    delete apiClient.defaults.headers.common["Authorization"];
    setUser(null);
    queryClient.clear();
    window.location.href = "/login";
  }, [queryClient]);

  const hasToken = !!localStorage.getItem("kas_kecil_token");
  const isAuthenticated = !!user;

  console.log(
    "[AuthContext] State - isLoading:",
    isLoading,
    "isInitialized:",
    isInitialized,
    "isAuthenticated:",
    isAuthenticated,
    "user:",
    user?.nama,
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isInitialized,
        hasToken,
        login: loginMutation.mutateAsync,
        logout,
        isLoginLoading: loginMutation.isPending,
        loginError: loginMutation.error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
