import { execSync } from "child_process";
import path from "path";

// Point the app's Prisma client at an isolated test database.
process.env.DATABASE_URL = "file:./test.db";

export default function setup() {
  execSync("npx prisma db push --force-reset --skip-generate", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "inherit",
  });
}
