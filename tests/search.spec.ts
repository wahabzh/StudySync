import { test, expect } from '@playwright/test';

test('User 25100173@lums.edu.pk Sucessfully delete a document named asd', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'New Document' }).first().click();

  const initialURL = page.url();
  const documentTitle = 'Search test Document';
  await page.fill( 'input#title', documentTitle);

  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForTimeout(2000);
  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  const searchBox = page.locator('input[placeholder="Search documents..."]');
  // Type a search query into the search box
  await searchBox.fill(documentTitle);
  await page.waitForTimeout(3000);
  const documentLocator = page.locator('h3', { hasText: documentTitle });
  await expect(documentLocator).toHaveCount(1);
  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForTimeout(5000);

  
});
