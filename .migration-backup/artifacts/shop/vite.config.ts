import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isVercel = process.env["VERCEL"] === "1";
const isReplit = process.env["REPL_ID"] !== undefined;

const rawPort = process.env["PORT"];
const port = rawPort ? Number(rawPort) : 3000;

if (!isVercel && rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env["BASE_PATH"] ?? "/";

if (!isVercel && !basePath && isReplit) {
  throw new Error("BASE_PATH environment variable is required but was not provided.");
}

const plugins = [
  react(),
  tailwindcss(),
];

if (!isVercel) {
  const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
  plugins.push(runtimeErrorOverlay());
}

if (!isVercel && process.env["NODE_ENV"] !== "production" && isReplit) {
  const [cartographerMod, devBannerMod] = await Promise.all([
    import("@replit/vite-plugin-cartographer"),
    import("@replit/vite-plugin-dev-banner"),
  ]);
  plugins.push(
    cartographerMod.cartographer({ root: path.resolve(import.meta.dirname, "..") }),
    devBannerMod.devBanner(),
  );
}

export default defineConfig({
  base: basePath,
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
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
          vendor: ["react", "react-dom"],
          router: ["wouter"],
          query: ["@tanstack/react-query"],
          ui: ["lucide-react"],
        },
      },
    },
  },
  server: {
    port: isVercel ? 3000 : port,
    strictPort: !isVercel,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { strict: true },
  },
  preview: {
    port: isVercel ? 3000 : port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
