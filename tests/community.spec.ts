import { test, expect } from '@playwright/test';

test('Publish document', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100129@lums.edu.pk');
  await page.fill('input[name="password"]', 'Password');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'New Document' }).first().click();

  const initialURL = page.url();
  const documentTitle = 'Community Document';
  await page.fill( 'input#title', documentTitle);

  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForTimeout(2000);
  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );

  const editorSelector = '.ProseMirror'
  // Ensure the editor is present
  const editor = await page.locator(editorSelector);
  await expect(editor).toBeVisible();
  await editor.click(); // Focus the editor
  await expect(editor).toBeEmpty();

  const inputText = 'This is a community document';
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
   await page.getByRole('button', { name: 'Publish' }).click();
   await page.waitForTimeout(1000);
   await expect(page.getByRole('button', { name: 'Unpublish' })).toBeVisible();

  await page.goto('http://localhost:3000/community');
  await page.waitForTimeout(2000);
  const documentLocator = page.locator('h3', { hasText: 'Community Document' });
  const documentContainer = documentLocator.locator('..').locator('..');
  await documentContainer.click();

  // Wait for the URL to change
  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );

  const editor1 = await page.locator(editorSelector);
  await expect(editor1).toBeVisible();
  await expect(editor1).toContainText(inputText);

  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForTimeout(5000);
  
});

test('Clap a document', async ({ page }) => {
    await page.goto('http://localhost:3000/');
  
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'New Document' }).first().click();
  
    const initialURL = page.url();
    const documentTitle = 'Community Document';
    await page.fill( 'input#title', documentTitle);
  
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(2000);
    await page.waitForFunction(
        (url) => window.location.href !== url,
        initialURL
    );
  
    const editorSelector = '.ProseMirror'
    // Ensure the editor is present
    const editor = await page.locator(editorSelector);
    await expect(editor).toBeVisible();
    await editor.click(); // Focus the editor
    await expect(editor).toBeEmpty();
  
    const inputText = 'This is a community document';
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
     await page.getByRole('button', { name: 'Publish' }).click();
     await page.waitForTimeout(1000);
     await expect(page.getByRole('button', { name: 'Unpublish' })).toBeVisible();
  
    await page.goto('http://localhost:3000/community');
    await page.waitForTimeout(2000);
    const documentLocator = page.locator('h3', { hasText: 'Community Document' });
    const documentContainer = documentLocator.locator('..').locator('..');
    await documentContainer.click();
  
    // Wait for the URL to change
    await page.waitForFunction(
        (url) => window.location.href !== url,
        initialURL
    );
  
    const editor1 = await page.locator(editorSelector);
    await expect(editor1).toBeVisible();
    await expect(editor1).toContainText(inputText);
    
    await expect(page.locator('[class*="lucide lucide-hand-heart h-4 w-4"]')).toBeVisible();
    const numberBefore = await page.locator('button span').textContent();
    const currentNumber = parseInt(numberBefore!, 10);
    await page.locator('[class*="lucide lucide-hand-heart h-4 w-4"]').click();
    await page.waitForTimeout(2000);
    const numberAfter = await page.locator('button span').textContent();
    const newNumber = parseInt(numberAfter!, 10);
    await expect(newNumber).toBe(currentNumber + 1);

    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Open menu' }).first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(5000);
    
  });

  test('View document as guest', async ({ page }) => {
    await page.goto('http://localhost:3000/');
  
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'New Document' }).first().click();
  
    const initialURL = page.url();
    const documentTitle = 'Community Document';
    await page.fill( 'input#title', documentTitle);
  
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(2000);
    await page.waitForFunction(
        (url) => window.location.href !== url,
        initialURL
    );
  
    const editorSelector = '.ProseMirror'
    // Ensure the editor is present
    const editor = await page.locator(editorSelector);
    await expect(editor).toBeVisible();
    await editor.click(); // Focus the editor
    await expect(editor).toBeEmpty();
  
    const inputText = 'This is a community document';
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
     await page.getByRole('button', { name: 'Publish' }).click();
     await page.waitForTimeout(1000);
     await expect(page.getByRole('button', { name: 'Unpublish' })).toBeVisible();
  
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.locator('button[data-sidebar="menu-button"]').click();
    await page.locator('[class*="lucide lucide-log-out"]').click();
    
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.locator('text=Browse Community').click();

    const documentLocator = page.locator('h3', { hasText: 'Community Document' });
    const documentContainer = documentLocator.locator('..').locator('..');
    await documentContainer.click();
  
    // Wait for the URL to change
    await page.waitForFunction(
        (url) => window.location.href !== url,
        initialURL
    );
  
    const editor1 = await page.locator(editorSelector);
    await expect(editor1).toBeVisible();
    await expect(editor1).toContainText(inputText);

    await page.goto('http://localhost:3000/sign-in');
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Open menu' }).first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(5000);
    
  });

  test('Guest claps document (should be unsuccessful)', async ({ page }) => {
    await page.goto('http://localhost:3000/');
  
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'New Document' }).first().click();
  
    const initialURL = page.url();
    const documentTitle = 'Community Document';
    await page.fill( 'input#title', documentTitle);
  
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForTimeout(2000);
    await page.waitForFunction(
        (url) => window.location.href !== url,
        initialURL
    );
  
    const editorSelector = '.ProseMirror'
    // Ensure the editor is present
    const editor = await page.locator(editorSelector);
    await expect(editor).toBeVisible();
    await editor.click(); // Focus the editor
    await expect(editor).toBeEmpty();
  
    const inputText = 'This is a community document';
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
     await page.getByRole('button', { name: 'Publish' }).click();
     await page.waitForTimeout(1000);
     await expect(page.getByRole('button', { name: 'Unpublish' })).toBeVisible();
  
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.locator('button[data-sidebar="menu-button"]').click();
    await page.locator('[class*="lucide lucide-log-out"]').click();
    
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.locator('text=Browse Community').click();

    const documentLocator = page.locator('h3', { hasText: 'Community Document' });
    const documentContainer = documentLocator.locator('..').locator('..');
    await documentContainer.click();
  
    // Wait for the URL to change
    await page.waitForFunction(
        (url) => window.location.href !== url,
        initialURL
    );
  
    const editor1 = await page.locator(editorSelector);
    await expect(editor1).toBeVisible();
    await expect(editor1).toContainText(inputText);

    await expect(page.locator('[class*="lucide lucide-hand-heart h-4 w-4"]')).toBeVisible();
    await page.locator('[class*="lucide lucide-hand-heart h-4 w-4"]').click();
    await page.waitForTimeout(1000);
    await expect(page.locator('div.text-sm.opacity-90')).toHaveText('Must be logged in to clap');

    await page.goto('http://localhost:3000/sign-in');
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: 'Open menu' }).first().click();
    await page.getByRole('menuitem', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(5000);
    
  });