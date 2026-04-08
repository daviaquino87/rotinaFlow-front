import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/shared/lib/security/index.ts",
        "src/modules/schedule/utils/validators.ts",
        "src/lib/security.ts",
        "src/pages/routine-form.tsx",
      ],
    },
  },
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
  },
});
