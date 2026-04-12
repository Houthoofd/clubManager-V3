import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    // Array format ensures specific aliases are matched before the generic @
    alias: [
      { find: "@/types",    replacement: path.resolve(__dirname, "../packages/types/src") },
      { find: "@/features", replacement: path.resolve(__dirname, "./src/features") },
      { find: "@/shared",   replacement: path.resolve(__dirname, "./src/shared") },
      { find: "@/layouts",  replacement: path.resolve(__dirname, "./src/layouts") },
      { find: "@",          replacement: path.resolve(__dirname, "./src") },
    ],
  },

  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
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
      exclude: ["node_modules/", "src/shared/test/", "**/*.d.ts", "**/*.config.*"],
    },
  },
});