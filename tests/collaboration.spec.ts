import { test, expect } from '@playwright/test';

test('Tests real time collaboration', async ({ browser }) => {
  const user1 = await browser.newContext();
  const user2 = await browser.newContext();

  const page1 = await user1.newPage();
  const page2 = await user1.newPage();

  await page1.goto('https://www.studysync.site/');
  await page2.goto('https://www.studysync.site/');


  // Expect a title "to contain" a substring.
  await page1.getByRole('link', { name: 'Sign In' }).click();
  await page2.getByRole('link', { name: 'Sign In' }).click();
  await page1.fill('input[name="email"]', 'shebuali2.1@gmail.com');
  await page2.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page1.fill('input[name="password"]', '12345678');
  await page2.fill('input[name="password"]', '12345678');
  await page1.click('button[type="submit"]');
  await page2.click('button[type="submit"]');
  await page1.waitForURL('**/dashboard');
  await page2.waitForURL('**/dashboard');

  const initialURL1 = page1.url();
  const initialURL2 = page2.url();
  const logOutButton1 = page1.locator('text=Owned by me');
  await logOutButton1.click();
  const logOutButton2 = page1.locator('text=Shared with me');
  await logOutButton2.click();
  const documentLocator1 = page1.locator('h3', { hasText: 'collaboration test' });
  const documentLocator2 = page2.locator('h3', { hasText: 'collaboration test' });
  const documentContainer1 = documentLocator1.locator('..').locator('..');
  const documentContainer2 = documentLocator2.locator('..').locator('..');
  await documentContainer1.click();
  await documentContainer2.click();

  // Wait for the URL to change
  await page1.waitForFunction(
      (url) => window.location.href !== url,
      initialURL1
  );

  // Wait for the URL to change
  await page2.waitForFunction(
    (url) => window.location.href !== url,
    initialURL2
);
  

   const editorSelector1 = '.ProseMirror'
   const editorSelector2 = '.ProseMirror'

  // Ensure the editor is present
  const editor1 = await page1.locator('[contenteditable="true"]');
  const editor2 = await page2.locator('[contenteditable="true"]');
  await expect(editor1).toBeVisible();
  await expect(editor2).toBeVisible();
  



  // Add text to the editor
  const inputText1 = 'Hello, I AM SHEHBAZ!';
  const inputText2 = 'Hello, I AM 25100173!';
  await editor1.click(); // Focus the editor
  await editor2.click(); // Focus the editor

  await editor1.press('Control+A'); // Select all (use 'Meta+A' on macOS if needed)
  await editor2.press('Control+A'); // Select all (use 'Meta+A' on macOS if needed)

  await editor1.press('Backspace'); // Delete selected text
  await editor2.press('Backspace'); // Delete selected text

  // Verify the editor is empty
  await expect(editor1).toBeEmpty();
  await expect(editor2).toBeEmpty();

  await editor1.type(inputText1); // Type into the editor
  //await editor2.type(inputText2); // Type into the editor
  // Wait for debounce delay + saving time
  await page1.waitForTimeout(3000); // Adjust the wait time if necessary
  await page2.waitForTimeout(3000); // Adjust the wait time if necessary

  // Selector for the SaveStatusIndicator
  const statusSelector1 = '[class*="rounded-full bg-background/95 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur"]'; // Adjust if a more specific class or ID is used
  const statusSelector2 = '[class*="rounded-full bg-background/95 px-3 py-1.5 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-800 backdrop-blur"]'; // Adjust if a more specific class or ID is used
  const status1 = await page1.locator(statusSelector1);
  const status2 = await page1.locator(statusSelector2);

  // Ensure the status is visible
  await expect(status1).toBeVisible();
  await expect(status2).toBeVisible();

  // Verify the status is "Saved"
  await expect(status1).toContainText('Saved');
  await expect(status2).toContainText('Saved');

  // await page1.goto('http://localhost:3000/dashboard');

  // const documentLocator1 = page1.locator('h3', { hasText: 'edit test' });
  // const documentContainer1 = documentLocator1.locator('..').locator('..');
  // await documentContainer1.click();

  // // Wait for the URL to change
  // await page1.waitForFunction(
  //     (url) => window.location.href !== url,
  //     initialURL
  // );

  // const editor1 = await page1.locator(editorSelector);
  // await expect(editor1).toBeVisible();
  await expect(editor2).toContainText(inputText1);

});
