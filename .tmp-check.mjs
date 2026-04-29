import { chromium } from "playwright";
const browser = await chromium.connectOverCDP("http://localhost:29229");
const context = browser.contexts()[0] ?? await browser.newContext();
const page = await context.newPage();

// 1) Login
await page.goto("https://dashboard-ads-eta.vercel.app/admin/login", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const onLogin = page.url().includes("/admin/login");
if (onLogin) {
  await page.fill('input[type="email"]', process.env.DASHBOARD_ADMIN_EMAIL);
  await page.fill('input[type="password"]', process.env.DASHBOARD_ADMIN_PASSWORD);
  await page.waitForTimeout(400);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
}
console.log("after login:", page.url());

// 2) Look at /admin/products listing
await page.goto("https://dashboard-ads-eta.vercel.app/admin/products", { waitUntil: "networkidle" });
const productsHtml = await page.content();
const totalMatch = productsHtml.match(/(\d+)\s*total/);
const titles = [...productsHtml.matchAll(/<td[^>]*>\s*<div[^>]*>([^<]+)<\/div>\s*<\/td>/g)].map(m=>m[1]).slice(0,10);
const rows = (productsHtml.match(/<tr[^>]*class="[^"]*row-hover/g) || []).length;
const slugs = [...productsHtml.matchAll(/\/go\/([a-z0-9-]+)/g)].map(m=>m[1]);
const codes = [...productsHtml.matchAll(/\/(?!go\/)([a-zA-Z0-9_-]{2,40})\b<\/code>/g)].map(m=>m[1]);
console.log("/admin/products: total =", totalMatch?.[1], "rows =", rows);
console.log("titles:", titles.slice(0,5));
console.log("slugs in /go/:", slugs.slice(0,10));
console.log("short codes:", codes.slice(0,10));

// 3) Check API directly  
const apiResp = await page.request.get("https://dashboard-ads-eta.vercel.app/api/products?pageSize=50", {
  headers: { "x-api-key": "noop" },
});
console.log("api/products status:", apiResp.status());

// 4) Check public redirects
const redResp = await page.request.get("https://dashboard-ads-eta.vercel.app/api/redirects?pageSize=50");
console.log("api/redirects status:", redResp.status());
if (redResp.ok()) {
  const j = await redResp.json();
  console.log("redirects total:", j.meta?.total, "items:", j.data?.length);
  for (const r of (j.data || []).slice(0,10)) {
    console.log(" -", r.title, "slug:", r.slug, "short:", r.short_code, "url:", r.redirect_url);
  }
}

// 5) Take screenshot
await page.setViewportSize({ width: 1400, height: 900 });
await page.goto("https://dashboard-ads-eta.vercel.app/admin/products", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: "/home/ubuntu/ds-products-now.png", fullPage: true });

// 6) Overview screenshot
await page.goto("https://dashboard-ads-eta.vercel.app/admin", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: "/home/ubuntu/ds-overview-now.png", fullPage: true });

console.log("done");
