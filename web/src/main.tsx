import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppProvider } from "@/providers/AppProvider.tsx";
import { configureApiClient } from "@/lib/api";

// Configure API client with environment variable
const apiUrl =
  import.meta.env.VITE_API_URL || "https://api.donarazhar.site/api";
configureApiClient({ apiUrl });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
);
