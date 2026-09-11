import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// The app is served from the site root ("/") on Netlify. Only set
// VITE_BASE_PATH (e.g. /oc-lesson-planner/) if ever deploying to a sub-path
// such as GitHub Pages project sites.
const BASE = process.env.VITE_BASE_PATH || "/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
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
    })
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
