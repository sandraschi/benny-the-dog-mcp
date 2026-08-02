import { test, expect } from "@playwright/test";

const BE = "http://127.0.0.1:11142";
const FE = "http://127.0.0.1:11143";

test.describe("Fleet Audit", () => {
  test("Backend health", async ({ request }) => {
    const resp = await request.get(`${BE}/api/health`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe("ok");
  });

  test("Frontend loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(FE, { timeout: 15000 });
    await expect(page.locator("#root")).toBeAttached();
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Sidebar navigation works", async ({ page }) => {
    await page.goto(FE, { timeout: 15000 });
    await page.getByTestId("nav-tools").click();
    await expect(page.locator('[data-testid="tools-page"]')).toBeVisible();
    await page.getByTestId("nav-settings").click();
    await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
  });
});