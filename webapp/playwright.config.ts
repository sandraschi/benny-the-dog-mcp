import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: "http://127.0.0.1:11143",
    headless: true,
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "uv run uvicorn benny_the_dog_mcp.server:app --host 127.0.0.1 --port 11142 --log-level warning",
      port: 11142,
      cwd: "..",
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: "bun run dev --port 11143 --host",
      port: 11143,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
