import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT ?? "5173";

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
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-ui": ["framer-motion", "@radix-ui/react-dialog", "@radix-ui/react-tooltip", "@radix-ui/react-toast"],
          "vendor-charts": ["recharts"],
          "vendor-form": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
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
