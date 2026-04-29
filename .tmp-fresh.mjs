import { chromium } from "playwright";
const browser = await chromium.connectOverCDP("http://localhost:29229");
const context = browser.contexts()[0] ?? await browser.newContext();
const page = await context.newPage();

// Login (cookies should still be valid)
await page.goto("https://dashboard-ads-eta.vercel.app/admin", { waitUntil: "networkidle" });
if (page.url().includes("/admin/login")) {
  await page.waitForTimeout(2500);
  await page.fill('input[type="email"]', process.env.DASHBOARD_ADMIN_EMAIL);
  await page.fill('input[type="password"]', process.env.DASHBOARD_ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
}

// Cache-busted product list
const cb = Date.now();
await page.goto(`https://dashboard-ads-eta.vercel.app/admin/products?_=${cb}`, { waitUntil: "networkidle" });
const html = await page.content();
const totalMatch = html.match(/(\d+)\s*total/);
const titleCells = [...html.matchAll(/<td class="font-medium text-ink">([^<]+)<\/td>/g)].map(m=>m[1]);
const slugCells = [...html.matchAll(/<td class="text-muted">([^<]+)<\/td>/g)].map(m=>m[1]);
console.log("FRESH /admin/products: total =", totalMatch?.[1]);
console.log("titles found:", titleCells);
console.log("slugs found:", slugCells);

// List raw redirect codes too
const redirectCodes = [...html.matchAll(/text-brand-300">\s*\/([^\s<]+)\s*</g)].map(m=>m[1]);
console.log("redirect codes:", redirectCodes);

// Now also check /api/redirects from same session
const redResp = await page.request.get(`https://dashboard-ads-eta.vercel.app/api/redirects?_=${cb}`);
const j = await redResp.json();
console.log("/api/redirects total:", j.meta?.total, "items count:", j.data?.length);
console.log("items:", (j.data||[]).map(d=>({title:d.title,slug:d.slug,short:d.short_code,url:d.redirect_url})));
