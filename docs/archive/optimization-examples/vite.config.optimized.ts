import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

/**
 * Configuration Vite Optimisée - ClubManager V3
 *
 * Optimisations incluses:
 * - Code splitting avancé (vendor + feature chunks)
 * - Compression Brotli + Gzip
 * - Minification Terser optimale
 * - PWA avec service worker
 * - Image optimization (WebP, AVIF)
 * - Bundle analyzer
 * - Source maps conditionnels
 * - Cache optimization
 */

export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";
  const isStaging = mode === "staging";
  const isDevelopment = mode === "development";

  console.log(`🚀 Building in ${mode} mode`);

  return {
    plugins: [
      // React with SWC (plus rapide que Babel)
      react(),

      // Split vendor chunks automatiquement
      splitVendorChunkPlugin(),

      // Bundle analyzer (seulement si ANALYZE=true)
      ...(process.env.ANALYZE
        ? [
            visualizer({
              filename: "./dist/stats.html",
              open: true,
              gzipSize: true,
              brotliSize: true,
              template: "treemap", // ou "sunburst", "network"
            }),
          ]
        : []),

      // Compression Brotli (meilleure que gzip, ~20% plus petit)
      ...(isProduction || isStaging
        ? [
            viteCompression({
              algorithm: "brotliCompress",
              ext: ".br",
              threshold: 1024, // Compresser fichiers >1KB
              deleteOriginFile: false,
              compressionOptions: {
                level: 11, // Max compression (0-11)
              },
            }),
          ]
        : []),

      // Compression Gzip (fallback pour anciens navigateurs)
      ...(isProduction || isStaging
        ? [
            viteCompression({
              algorithm: "gzip",
              ext: ".gz",
              threshold: 1024,
              deleteOriginFile: false,
              compressionOptions: {
                level: 9, // Max compression (0-9)
              },
            }),
          ]
        : []),

      // PWA avec Service Worker
      ...(isProduction
        ? [
            VitePWA({
              registerType: "autoUpdate",
              includeAssets: [
                "favicon.ico",
                "robots.txt",
                "apple-touch-icon.png",
              ],
              manifest: {
                name: "ClubManager V3",
                short_name: "ClubManager",
                description: "Application de gestion de club sportif",
                theme_color: "#2563eb",
                background_color: "#ffffff",
                display: "standalone",
                start_url: "/",
                scope: "/",
                icons: [
                  {
                    src: "pwa-192x192.png",
                    sizes: "192x192",
                    type: "image/png",
                  },
                  {
                    src: "pwa-512x512.png",
                    sizes: "512x512",
                    type: "image/png",
                    purpose: "any maskable",
                  },
                ],
              },
              workbox: {
                // Cache strategies
                runtimeCaching: [
                  {
                    // API calls - Network First (données fraîches)
                    urlPattern: /^https?:\/\/.*\/api\/.*/i,
                    handler: "NetworkFirst",
                    options: {
                      cacheName: "api-cache",
                      expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 60 * 60 * 24, // 24h
                      },
                      cacheableResponse: {
                        statuses: [0, 200],
                      },
                      networkTimeoutSeconds: 10,
                    },
                  },
                  {
                    // Images - Cache First (rarement changent)
                    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                    handler: "CacheFirst",
                    options: {
                      cacheName: "images-cache",
                      expiration: {
                        maxEntries: 200,
                        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
                      },
                    },
                  },
                  {
                    // Fonts - Cache First (jamais changent)
                    urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
                    handler: "CacheFirst",
                    options: {
                      cacheName: "fonts-cache",
                      expiration: {
                        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
                      },
                    },
                  },
                  {
                    // Static assets - Cache First
                    urlPattern: /\.(?:js|css)$/i,
                    handler: "StaleWhileRevalidate",
                    options: {
                      cacheName: "static-resources",
                      expiration: {
                        maxEntries: 60,
                        maxAgeSeconds: 60 * 60 * 24 * 7, // 1 semaine
                      },
                    },
                  },
                ],
                // Navigation fallback
                navigateFallback: "/index.html",
                navigateFallbackDenylist: [/^\/api/],
              },
            }),
          ]
        : []),

      // Image Optimization
      ViteImageOptimizer({
        png: {
          quality: 80,
        },
        jpeg: {
          quality: 80,
        },
        jpg: {
          quality: 80,
        },
        webp: {
          quality: 80,
          lossless: false,
        },
        avif: {
          quality: 70,
          lossless: false,
        },
      }),
    ],

    // Path aliases
    resolve: {
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

    // Dev Server
    server: {
      port: 5173,
      host: true,
      open: true,
      cors: true,
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
      // HMR optimization
      hmr: {
        overlay: true,
      },
    },

    // Preview Server
    preview: {
      port: 4173,
      host: true,
      open: true,
    },

    // Build Configuration
    build: {
      outDir: "dist",
      assetsDir: "assets",

      // Target modern browsers (smaller bundle)
      target: "es2020",

      // Minification
      minify: isProduction ? "terser" : false,

      // Terser options (minification avancée)
      terserOptions: isProduction
        ? {
            compress: {
              // Supprimer console.log en production
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ["console.log", "console.info", "console.debug"],
              // Optimisations supplémentaires
              passes: 2,
              unsafe: true,
              unsafe_comps: true,
              unsafe_math: true,
              unsafe_proto: true,
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false, // Supprimer commentaires
              ecma: 2020,
            },
          }
        : undefined,

      // Source maps
      sourcemap: isProduction
        ? "hidden" // Source maps générés mais non référencés (pour Sentry)
        : isDevelopment
        ? true // Source maps complets en dev
        : false, // Pas de source maps en staging

      // Chunk size warning
      chunkSizeWarningLimit: 1000, // 1000 KB

      // CSS code splitting
      cssCodeSplit: true,

      // CSS minification
      cssMinify: true,

      // Rollup options
      rollupOptions: {
        output: {
          // Naming avec hash pour cache busting
          entryFileNames: "assets/[name].[hash].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || "";
            const ext = name.split(".").pop();

            // Organiser par type
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext || "")) {
              return "assets/images/[name].[hash][extname]";
            }
            if (/woff|woff2|ttf|eot/i.test(ext || "")) {
              return "assets/fonts/[name].[hash][extname]";
            }
            if (/css/i.test(ext || "")) {
              return "assets/css/[name].[hash][extname]";
            }
            return "assets/[name].[hash][extname]";
          },

          // Code splitting avancé
          manualChunks: (id) => {
            // Node modules (vendor chunks)
            if (id.includes("node_modules")) {
              // React ecosystem
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("scheduler")
              ) {
                return "react-vendor";
              }

              // React Router
              if (id.includes("react-router")) {
                return "router-vendor";
              }

              // React Query (data fetching)
              if (id.includes("@tanstack/react-query")) {
                return "query-vendor";
              }

              // State management
              if (id.includes("zustand")) {
                return "state-vendor";
              }

              // Forms (grouper ensemble car souvent utilisés ensemble)
              if (
                id.includes("react-hook-form") ||
                id.includes("@hookform") ||
                id.includes("zod")
              ) {
                return "form-vendor";
              }

              // Icons
              if (
                id.includes("@heroicons") ||
                id.includes("@patternfly/react-icons")
              ) {
                return "icons-vendor";
              }

              // UI utilities
              if (id.includes("sonner")) {
                return "toast-vendor";
              }

              // Heavy libraries (lazy load recommandé)
              if (id.includes("@stripe")) {
                return "stripe-vendor";
              }

              // HTTP client
              if (id.includes("axios")) {
                return "http-vendor";
              }

              // Date utilities
              if (id.includes("date-fns")) {
                return "date-vendor";
              }

              // Charts (si utilisé)
              if (
                id.includes("recharts") ||
                id.includes("@patternfly/react-charts")
              ) {
                return "charts-vendor";
              }

              // Autres vendors
              return "vendor";
            }

            // Feature-based splitting (code applicatif)
            if (id.includes("/features/statistics/")) {
              return "feature-statistics";
            }
            if (id.includes("/features/payments/")) {
              return "feature-payments";
            }
            if (id.includes("/features/messaging/")) {
              return "feature-messaging";
            }
            if (id.includes("/features/courses/")) {
              return "feature-courses";
            }
            if (id.includes("/features/users/")) {
              return "feature-users";
            }
            if (id.includes("/features/families/")) {
              return "feature-families";
            }
            if (id.includes("/features/settings/")) {
              return "feature-settings";
            }
            if (id.includes("/features/store/")) {
              return "feature-store";
            }
            if (id.includes("/features/auth/")) {
              return "feature-auth";
            }

            // Shared code
            if (id.includes("/shared/components/")) {
              return "shared-components";
            }
            if (id.includes("/shared/hooks/")) {
              return "shared-hooks";
            }
            if (id.includes("/shared/utils/")) {
              return "shared-utils";
            }
          },
        },

        // External dependencies (ne pas bundler)
        external: [],

        // Tree shaking
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },

      // Report compressed size
      reportCompressedSize: true,

      // Increase the limit before warning about large chunks
      commonjsOptions: {
        include: [/node_modules/],
        extensions: [".js", ".cjs"],
      },
    },

    // Dependency optimization
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "axios",
        "zustand",
      ],
      exclude: [
        "@stripe/stripe-js", // Charger dynamiquement
      ],
      // Force pre-bundling
      force: false,
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version || "3.0.0"),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      __STAGING__: isStaging,
    },

    // Environnement variables prefix
    envPrefix: "VITE_",

    // CSS
    css: {
      devSourcemap: isDevelopment,
      modules: {
        localsConvention: "camelCase",
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/shared/styles/variables.scss";`,
        },
      },
    },

    // JSON
    json: {
      namedExports: true,
      stringify: false,
    },

    // Workers
    worker: {
      format: "es",
      plugins: [],
    },

    // ESBuild options
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      legalComments: "none",
      drop: isProduction ? ["console", "debugger"] : [],
    },

    // Test configuration (Vitest)
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
          "**/dist/**",
        ],
      },
    },

    // Logger level
    logLevel: isDevelopment ? "info" : "warn",

    // Clear screen
    clearScreen: true,
  };
});
