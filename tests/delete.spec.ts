import { test, expect } from '@playwright/test';

test('User 25100173@lums.edu.pk Sucessfully delete a document named asd', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  
  await page.click('button[type="submit"]');
  
  await page.getByRole('button', { name: 'New Document' }).first().click();

  const initialURL = page.url();
  const documentTitle = 'Delete test Document';
  await page.fill( 'input#title', documentTitle);

  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForTimeout(2000);
  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  // await page.getByRole('link', { name: 'StudySync' }).click();
  const documentLocator = page.locator('h3', { hasText: documentTitle });
  const documentContainer = documentLocator.locator('..').locator('..');
  //await documentContainer.click()

  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(5000);
  await expect(documentLocator).toHaveCount(0);
});

// test('User atauqeer12@gmail.com Sucessfully delete a document named asd', async ({ page }) => {
//   await page.goto('http://localhost:3000/');

//   // Expect a title "to contain" a substring.
//   await page.getByRole('link', { name: 'Sign In' }).click();
//   await page.fill('input[name="email"]', 'atauqeer12@gmail.com');
//   await page.fill('input[name="password"]', 'abc123');
//   await page.click('button[type="submit"]');
//   const initialURL = page.url();
//   // await page.getByRole('button', { name: 'New Document' }).click();


//   const documentTitle = 'Delete test Document';
//   // await page.fill( 'input#title', documentTitle);

//   // await page.getByRole('button', { name: 'Create' }).click();

//   // await page.waitForFunction(
//   //     (url) => window.location.href !== url,
//   //     initialURL
//   // );
  
//   await page.getByRole('link', { name: 'StudySync' }).click();
//   const documentLocator = page.locator('h2', { hasText: documentTitle });
//   const documentContainer = documentLocator.locator('..').locator('..');

//   await documentContainer.getByRole('button', { name: 'Open menu' }).click();
//   await page.getByRole('menuitem', { name: 'Delete' }).click();
//   await page.getByRole('button', { name: 'Delete' }).click();
//   await expect(documentLocator).toHaveCount(0);
// });

test('User 25100173@lums.edu.pk Choses to not delete a document', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  const documentTitle = 'Do Not Delete';
  const documentLocator = page.locator('h3', { hasText: documentTitle });
  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  const dialog = page.getByRole('alertdialog');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(documentLocator).toHaveCount(1);
});

