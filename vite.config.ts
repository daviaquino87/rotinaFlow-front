import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

const rawPort = process.env.PORT?.trim() || "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      // "script" injects a same-origin <script src="/registerSW.js"> tag —
      // "inline" would embed the registration JS directly in index.html,
      // which the app's CSP (script-src 'self', no 'unsafe-inline') blocks.
      injectRegister: "script",
      manifest: {
        name: "rotinaFlow — Organizador Inteligente",
        short_name: "rotinaFlow",
        description:
          "Organize sua rotina semanal com inteligência artificial e sincronize com o Google Calendar.",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#7c3aed",
        lang: "pt-BR",
        icons: [
          { src: "/images/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/images/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "/images/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Only precache the built static assets — never let the service
        // worker's navigation fallback touch /api/*, which includes the SSE
        // chat stream and every credit/calendar mutation.
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@app": path.resolve(import.meta.dirname, "src/app"),
      "@modules": path.resolve(import.meta.dirname, "src/modules"),
      "@shared": path.resolve(import.meta.dirname, "src/shared"),
      "@ui": path.resolve(import.meta.dirname, "src/shared/ui"),
      "@lib": path.resolve(import.meta.dirname, "src/shared/lib"),
      "@hooks": path.resolve(import.meta.dirname, "src/shared/hooks"),
      "@layouts": path.resolve(import.meta.dirname, "src/layouts"),
      "@config": path.resolve(import.meta.dirname, "src/config"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/react-dom/") || id.includes("/react/") || id.includes("/scheduler/")) {
            return "vendor-react";
          }
          if (id.includes("@tanstack/react-query")) return "vendor-query";
          if (id.includes("framer-motion") || id.includes("@radix-ui")) return "vendor-ui";
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
