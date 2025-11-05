import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three")) return "three";
            if (id.includes("pdfjs-dist")) return "pdfjs";
            if (id.includes("@fortawesome")) return "icons";
            return "vendor";
          }
        }
      }
    }
  }
});
