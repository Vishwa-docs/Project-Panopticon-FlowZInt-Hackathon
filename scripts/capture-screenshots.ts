import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const target = process.env.PANOPTICON_URL ?? "http://127.0.0.1:3000";
const screenshotDir = path.join(process.cwd(), "submission", "screenshots");

async function main() {
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 1 });
  await page.goto(target, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(screenshotDir, "01-dashboard-ready.png"), fullPage: true });

  await page.getByRole("button", { name: "Payment outage" }).click();
  await page.waitForSelector("text=Finalized", { timeout: 15000 });
  await page.screenshot({ path: path.join(screenshotDir, "02-payment-outage-guardrail.png"), fullPage: true });

  await page.getByRole("button", { name: "Trick question" }).click();
  await page.waitForSelector("text=human database specialist", { timeout: 15000 });
  await page.screenshot({ path: path.join(screenshotDir, "03-trick-question-safe-response.png"), fullPage: true });

  await browser.close();
  console.log(`Screenshots saved to ${screenshotDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
