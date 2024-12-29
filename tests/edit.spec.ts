import { test, expect } from '@playwright/test';

test('Edits a document called edit test', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  const initialURL = page.url();
  const documentLocator = page.locator('h3', { hasText: 'edit test' });
  const documentContainer = documentLocator.locator('..').locator('..');
  await documentContainer.click();

  // Wait for the URL to change
  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );
  

   const editorSelector = '.ProseMirror'

  // Ensure the editor is present
  const editor = await page.locator(editorSelector);
  await expect(editor).toBeVisible();

  // Add text to the editor
  const inputText = 'Hello, Playwright!';
  await editor.click(); // Focus the editor

  await editor.press('Control+A'); // Select all (use 'Meta+A' on macOS if needed)
  await editor.press('Backspace'); // Delete selected text

  // Verify the editor is empty
  await expect(editor).toBeEmpty();

  await editor.type(inputText); // Type into the editor
  // Wait for debounce delay + saving time
  await page.waitForTimeout(3000); // Adjust the wait time if necessary

  // Selector for the SaveStatusIndicator
  const statusSelector = '[class*="rounded-full bg-background/95 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur"]'; // Adjust if a more specific class or ID is used
  const status = await page.locator(statusSelector);

  // Ensure the status is visible
  await expect(status).toBeVisible();

  // Verify the status is "Saved"
  await expect(status).toContainText('Saved');

  await page.goto('http://localhost:3000/dashboard');

  const documentLocator1 = page.locator('h3', { hasText: 'edit test' });
  const documentContainer1 = documentLocator1.locator('..').locator('..');
  await documentContainer1.click();

  // Wait for the URL to change
  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );

  const editor1 = await page.locator(editorSelector);
  await expect(editor1).toBeVisible();
  await expect(editor1).toContainText(inputText);

});
