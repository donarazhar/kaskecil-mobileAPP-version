import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Always fetch fresh data
      retry: 1,
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
