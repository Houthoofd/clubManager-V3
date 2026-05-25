import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Array format ensures specific aliases are matched before the generic @
    alias: [
      {
        find: "@/types",
        replacement: path.resolve(__dirname, "../packages/types/src"),
      },
      {
        find: "@/features",
        replacement: path.resolve(__dirname, "./src/features"),
      },
      {
        find: "@/shared",
        replacement: path.resolve(__dirname, "./src/shared"),
      },
      {
        find: "@/layouts",
        replacement: path.resolve(__dirname, "./src/layouts"),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },

  server: {
    // En mode e2e, Playwright injecte E2E_FRONTEND_PORT via process.env.
    // Vite utilise ce port au lieu de 5173 pour ne pas entrer en conflit
    // avec le serveur de développement déjà en cours.
    // En dév normal (E2E_FRONTEND_PORT non défini) : port 5173, auto-increment OK.
    port: process.env.E2E_FRONTEND_PORT
      ? parseInt(process.env.E2E_FRONTEND_PORT)
      : 5173,
    strictPort: !!process.env.E2E_FRONTEND_PORT,
    host: true,
    open: !process.env.E2E_FRONTEND_PORT,
    proxy: {
      // En mode e2e, Playwright injecte VITE_API_TARGET pour rediriger
      // vers le bon port backend (détecté dynamiquement, ex: 3001 si 3000 est
      // occupé par un autre projet). En dev normal : http://localhost:3000.
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/shared/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/shared/test/",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
});
