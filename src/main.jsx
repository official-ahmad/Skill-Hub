import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import MaintenancePage from "./components/pages/MaintenancePage.jsx";

const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === "true";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {maintenanceMode ? (
      <MaintenancePage />
    ) : (
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <>
          <App />
          <Toaster position="bottom-right" toastOptions={{ duration: 3200, style: { background: "#1a1a1e", color: "#f2f2f4", border: "1px solid rgba(255,255,255,.08)", borderRadius: "8px", fontSize: "13px" } }} />
        </>
      </GoogleOAuthProvider>
    )}
  </StrictMode>,
);
