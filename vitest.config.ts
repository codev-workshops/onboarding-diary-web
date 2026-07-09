import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/setup-db.ts"],
    env: { DATABASE_URL: "file:./test.db" },
    fileParallelism: false,
    server: {
      deps: {
        // Process next-auth through Vite so the "next/server" alias applies.
        inline: ["next-auth", "@auth/core"],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // next-auth imports "next/server" without an extension; resolve it for ESM.
      "next/server": path.resolve(
        __dirname,
        "node_modules/next/server.js",
      ),
    },
  },
});
