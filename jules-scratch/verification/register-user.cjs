const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5000/auth/register', { waitUntil: 'networkidle' });

    console.log('Navigated to registration page.');

    // Fill out the registration form
    await page.selectOption('select[name="role"]', 'citizen');
    await page.fill('input[name="firstName"]', 'Jules');
    await page.fill('input[name="lastName"]', 'Verne');
    await page.fill('input[name="email"]', 'jules.verne.2@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="password"]', 'StrongPassword123!');
    await page.fill('input[name="confirmPassword"]', 'StrongPassword123!');
    await page.check('input[name="terms"]');

    console.log('Filled out the form.');

    // Submit the form
    await page.click('button[type="submit"]');

    console.log('Submitted the form.');

    // Wait for navigation to the login page, which indicates successful registration
    await page.waitForURL('**/login');

    console.log('Successfully registered and navigated to the login page.');

  } catch (error) {
    console.error('An error occurred during registration:', error);
    await page.screenshot({ path: 'jules-scratch/verification/registration-error.png' });
    console.log('Screenshot of the error has been saved.');
  } finally {
    await browser.close();
  }
})();
