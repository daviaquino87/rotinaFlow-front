import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@/api-client";
import { apiUrl, getApiOrigin } from "@/lib/api";

setBaseUrl(getApiOrigin());

const originalFetch = window.fetch.bind(window);
window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
  if (typeof input === "string" && input.startsWith("/api/")) {
    return originalFetch(apiUrl(input), init);
  }
  return originalFetch(input, init);
};

createRoot(document.getElementById("root")!).render(<App />);
