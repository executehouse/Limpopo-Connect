const { chromium } = require('@playwright/test');
const fs = require('fs');

const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/diagnostic',
  '/health',
  '/explore',
  '/business-directory',
  '/events',
  '/tourism',
  '/news',
  '/contact',
];

const protectedRoutes = [
  '/complete-onboarding',
  '/dashboard/visitor',
  '/dashboard/citizen',
  '/dashboard/business',
  '/dashboard/admin',
  '/home',
  '/business-dashboard',
  '/admin',
  '/marketplace',
  '/connections',
  '/connections/friendship-partners',
  '/connections/meaningful-relationships',
  '/connections/casual-meetups',
  '/connections/shared-interests',
  '/connections/community-stories',
  '/connections/missed-moments',
  '/profile',
  '/profile/me',
  '/profile/me/edit',
  '/chat-demo',
];

const screenshotDir = 'screenshots';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const email = 'victorraluswinga@gmail.com';
  const password = '1234567';

  try {
    // Take screenshots of public routes
    for (const route of publicRoutes) {
      const url = `http://localhost:5000${route}`;
      const screenshotPath = `${screenshotDir}${route.replace(/\//g, '_') || '_index'}.png`;
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.screenshot({ path: screenshotPath });
        console.log(`Successfully captured screenshot of ${url}`);
      } catch (error) {
        console.error(`Failed to capture screenshot of ${url}:`, error);
      }
    }

    // Log in
    await page.goto('http://localhost:5000/auth/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for the generic "User" button to appear in the header
    await page.waitForSelector('button:has-text("User")');

    console.log('Successfully logged in.');

    // Take screenshots of protected routes
    for (const route of protectedRoutes) {
      const url = `http://localhost:5000${route}`;
      const screenshotPath = `${screenshotDir}${route.replace(/\//g, '_')}.png`;
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.screenshot({ path: screenshotPath });
        console.log(`Successfully captured screenshot of ${url}`);
      } catch (error) {
        console.error(`Failed to capture screenshot of ${url}:`, error);
      }
    }

  } catch (error) {
    console.error('An error occurred during the screenshot process:', error);
  } finally {
    await browser.close();
  }
})();
