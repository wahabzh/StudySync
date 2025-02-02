import { test, expect } from '@playwright/test';

test('Perform OCR', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100129@lums.edu.pk');
  await page.fill('input[name="password"]', 'Password');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'New Document' }).first().click();

  const initialURL = page.url();
  const documentTitle = 'OCR Test Document';
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

  page.once('dialog', async dialog => {
    await dialog.accept('https://docs.unity3d.com/Packages/com.unity.textmeshpro@3.2/manual/images/TMP_RichTextLineIndent.png'); // Provide image URL
  });

  const inputText = '/image';
  await editor.type(inputText); // Type into the editor
  const dropdownOption = page.locator('text=Insert React Image');
  await expect(dropdownOption).toBeVisible();
  await dropdownOption.click();

  await page.waitForTimeout(1000);
  const imageLocator = editor.locator('img[src="https://docs.unity3d.com/Packages/com.unity.textmeshpro@3.2/manual/images/TMP_RichTextLineIndent.png"]');
  await expect(imageLocator).toBeVisible();

  await editor.getByRole('button', { name: 'Get Text' }).click();
  await page.waitForTimeout(2000);
  const OcrText = "This is the first line ofthis text example.This is the second lineof the same text."
  await expect(editor).toContainText(OcrText);

  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  
  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForTimeout(5000);
  
});
