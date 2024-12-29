import { test, expect } from '@playwright/test';

test('User 25100173@lums.edu.pk Signs In', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');

});

