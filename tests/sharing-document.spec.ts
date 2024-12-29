import { test, expect } from '@playwright/test';

test('User 25100173@lums.edu.pk Sucessfully shares a document with anyone using link', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  const initialURL = page.url();
  await page.click('button[type="submit"]');
  
  await page.getByRole('button', { name: 'New Document' }).first().click();


  const documentTitle = 'Sharing test Document';
  await page.fill( 'input#title', documentTitle);

  await page.getByRole('button', { name: 'Create' }).click();

  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:3000/dashboard');
  // await page.getByRole('link', { name: 'StudySync' }).click();
  await page.waitForTimeout(2000);
  const documentLocator = page.locator('h3', { hasText: documentTitle });
  const documentContainer = documentLocator.locator('..').locator('..');
  await documentContainer.click()

  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Share' }).click();
  const elements = page.locator('button');
  // const count = await elements.count();
  // for (let i = 0; i < count; i++) {
  //   console.log(await elements.nth(i).textContent());
  // }
  //await elements.nth(12).click();
  const sharelink = page.locator('text = Anyone'); // Adjust the text if different
  await sharelink.click();

  const docurl = page.url();

  await page.waitForTimeout(2000);

  await page.goto('http://localhost:3000/dashboard');

  const dropdownTrigger = page.locator('button:has-text("User")'); // Adjust the text if different
  await dropdownTrigger.click();

  // Click the "Log out" button
  const logOutButton = page.locator('text=Log out');
  await logOutButton.click();
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', 'atauqeer12@gmail.com');
  await page.fill('input[name="password"]', 'abc123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.goto(docurl);
  await page.locator('text=Sharing test Document');
  const dropdownTrigger1 = page.locator('button:has-text("User")'); // Adjust the text if different
  await dropdownTrigger1.click();
  const logOutButton1 = page.locator('text=Log out');
  await logOutButton1.click();
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  // await page.getByRole('link', { name: 'StudySync' }).click();
  const documentLocator1 = page.locator('h3', { hasText: documentTitle });
  const documentContainer1 = documentLocator1.locator('..').locator('..');
  //await documentContainer.click()

  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(5000);
  await expect(documentLocator).toHaveCount(0);

});

test('User atauqeer@lums.edu.pk Tries unsucessfully to open a document not shared with him', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  const initialURL = page.url();
  await page.click('button[type="submit"]');
  
  await page.getByRole('button', { name: 'New Document' }).first().click();


  const documentTitle = 'Sharing test Document';
  await page.fill( 'input#title', documentTitle);

  await page.getByRole('button', { name: 'Create' }).click();
  await page.waitForTimeout(2000);
  await page.waitForFunction(
      (url) => window.location.href !== url,
      initialURL
  );
  await page.goto('http://localhost:3000/dashboard');
  // await page.getByRole('link', { name: 'StudySync' }).click();
  await page.waitForTimeout(2000);
  const documentLocator = page.locator('h3', { hasText: documentTitle });
  const documentContainer = documentLocator.locator('..').locator('..');
  await documentContainer.click()

  await page.waitForTimeout(2000);

  // await page.getByRole('button', { name: 'Share' }).click();
  // const elements = page.locator('button');
  // // const count = await elements.count();
  // // for (let i = 0; i < count; i++) {
  // //   console.log(await elements.nth(i).textContent());
  // // }
  // await elements.nth(12).click();

  const docurl = page.url();

  // await page.waitForTimeout(2000);

  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);

  const dropdownTrigger = page.locator('button:has-text("User")'); // Adjust the text if different
  await dropdownTrigger.click();

  // Click the "Log out" button
  const logOutButton = page.locator('text=Log out');
  await logOutButton.click();
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', 'atauqeer12@gmail.com');
  await page.fill('input[name="password"]', 'abc123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  await page.goto(docurl);
  await page.waitForTimeout(2000);
  await page.locator('text=404');
  await page.goto('http://localhost:3000/dashboard');
  const dropdownTrigger1 = page.locator('button:has-text("User")'); // Adjust the text if different
  await dropdownTrigger1.click();
  const logOutButton1 = page.locator('text=Log out');
  await logOutButton1.click();
  await page.waitForTimeout(2000);

  await page.fill('input[name="email"]', '25100173@lums.edu.pk');
  await page.fill('input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // await page.getByRole('link', { name: 'StudySync' }).click();
  const documentLocator1 = page.locator('h3', { hasText: documentTitle });
  const documentContainer1 = documentLocator1.locator('..').locator('..');
  //await documentContainer.click()

  await page.getByRole('button', { name: 'Open menu' }).first().click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.waitForTimeout(2000);
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(5000);
  await expect(documentLocator).toHaveCount(0);



});
