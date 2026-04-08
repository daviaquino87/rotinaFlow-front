import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@/api-client";
import { getApiOrigin } from "@/lib/api";

// In development the Vite proxy forwards /api/* to the backend, so API calls
// stay same-origin and cookies are sent without any cross-origin restrictions.
// VITE_API_BASE_URL can override this for deployments where the API lives on a
// different host (e.g. a CDN-fronted frontend calling a separate API domain).
setBaseUrl(getApiOrigin());

createRoot(document.getElementById("root")!).render(<App />);
