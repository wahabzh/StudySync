import { test, expect } from '@playwright/test';

test('User 25100173@lums.edu.pk Sucessfully shares a document with anyone using link', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  const initialURL = page.url();
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  // const elements = page.locator('button');
  // const count = await elements.count();
  // for (let i = 0; i < count; i++) {
  //   const button12 = elements.nth(i);
  //   const id = await button12.getAttribute('id');
  //   const className = await button12.getAttribute('class');
  //   console.log(`ID: ${id}, Class: ${className}`);
  // }
  // await elements.nth(7).click();
  const dropdownTrigger = page.locator('button:has-text("User")'); // Adjust the text if different
  await dropdownTrigger.click();

  // Click the "Log out" button
  const logOutButton = page.locator('text=Log out');
  await logOutButton.click();

  

});
