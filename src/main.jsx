import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
        <App />
      </GoogleOAuthProvider>
    )}
  </StrictMode>,
);
