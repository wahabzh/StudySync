import { test, expect } from '@playwright/test';

test('Updates his username', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  const initialURL = page.url();
  
  await page.goto('http://localhost:3000/dashboard/profile');
  await page.waitForTimeout(2000);
  await page.fill('input[name="username"]', 'Shehbaz');
  await page.getByRole('button', { name: 'Update Profile' }).first().click();
  await page.getByRole('button', { name: 'Confirm' }).first().click();
  await page.waitForTimeout(1000);
  await page.goto('http://localhost:3000/dashboard/');
  await page.waitForTimeout(1000);
  await page.goto('http://localhost:3000/dashboard/profile');
  await page.waitForTimeout(2000);

  const usernameText = await page.locator('h2').textContent();

  // Check if the username is equal to "User123"
  expect(usernameText).toBe('Shehbaz');
  await page.fill('input[name="username"]', 'Shehbaz123');
  await page.getByRole('button', { name: 'Update Profile' }).first().click();
  await page.getByRole('button', { name: 'Confirm' }).first().click();
  await page.waitForTimeout(1000);


});
