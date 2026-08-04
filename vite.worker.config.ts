import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { sites } from "./build/sites-vite-plugin";

function workerConfig(): Plugin {
  return {
    name: "portal-worker-config",
    apply: "build",
    async closeBundle() {
      const directory = resolve(process.cwd(), "dist", "server");
      await mkdir(directory, { recursive: true });
      await writeFile(resolve(directory, "wrangler.json"), JSON.stringify({
        name: "portal-soutelo",
        main: "index.js",
        compatibility_date: "2026-05-15",
        assets: { directory: "../client", binding: "ASSETS" },
        d1_databases: [{ binding: "DB", database_name: "site-creator-d1", database_id: "00000000-0000-4000-8000-000000000000" }],
        migrations: [],
      }));
    },
  };
}

export default defineConfig({
  plugins: [workerConfig(), sites()],
  build: {
    ssr: "worker/index.ts",
    outDir: "dist/server",
    emptyOutDir: true,
    rollupOptions: {
      output: { entryFileNames: "index.js", format: "es" },
    },
  },
});
