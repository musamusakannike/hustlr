import { spawn } from "child_process";
import path from "path";
import { APP_NAME } from "../config/constants.config";

const scripts = [
  "seedAdmin.script.ts",
  "seedPlans.script.ts",
  "seedCategories.script.ts",
  "seedTemplates.script.ts",
];

async function runOne(file: string): Promise<void> {
  const full = path.join(__dirname, file);
  await new Promise<void>((resolve, reject) => {
    const child = spawn("pnpm", ["exec", "tsx", full], { stdio: "inherit", cwd: path.join(__dirname, "../..") });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${file} exited ${code}`))));
  });
}

async function run(): Promise<void> {
  for (const script of scripts) {
    console.log(`[${APP_NAME}] running ${script}`);
    await runOne(script);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
