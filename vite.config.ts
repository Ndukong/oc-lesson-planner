import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import fs from "node:fs";

// GitHub Pages serves project sites from https://<user>.github.io/<repo>/,
// so all asset URLs must be relative to that sub-path. Netlify/other hosts
// serve from the site root ("/"). Override with VITE_BASE_PATH=/ when needed.
const BASE = process.env.VITE_BASE_PATH || "/oc-lesson-planner/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon-192x192.png", "icons/icon-512x512.png"],
      manifest: {
        name: "Lesson Planner",
        short_name: "Lesson Planner",
        description: "Offline lesson planner for Cameroonian secondary school teachers",
        theme_color: "#4f46e5",
        background_color: "#f8fafc",
        display: "standalone",
        orientation: "portrait",
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: `${BASE}index.html`
      }
    }),
    // GitHub Pages serves 404.html for unknown deep links, so make it a copy
    // of index.html to let the SPA router take over client-side.
    {
      name: "copy-index-to-404",
      apply: "build",
      closeBundle() {
        const outDir = path.resolve(__dirname, "dist");
        fs.copyFileSync(
          path.join(outDir, "index.html"),
          path.join(outDir, "404.html")
        );
        // Tell GitHub Pages not to run Jekyll over the output.
        fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          dexie: ["dexie", "dexie-react-hooks"],
          ai: ["@google/generative-ai", "groq-sdk"],
          jspdf: ["jspdf"],
          docx: ["docx"],
          zustand: ["zustand"]
        }
      }
    }
  }
});
