import { test, expect } from '@playwright/test';

test('Create quiz', async ({ page }) => {
    await page.goto('http://localhost:3000/');
  
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.click('text=Quizzes');
    await page.waitForURL('**/dashboard/quizzes');
    
    await page.click('text=Create Quiz');
    await page.waitForURL('**/dashboard/quizzes?create=true');
    
    await page.fill('#title', 'Sample Quiz Title');
    await page.fill('#description', 'This is a sample quiz description.');
    await page.fill('#question-0', 'What is the capital of France?');
    await page.fill('#answer_a-0', 'Berlin');
    await page.fill('#answer_b-0', 'Madrid');
    await page.fill('#answer_c-0', 'Paris');
    await page.fill('#answer_d-0', 'Rome');
    await page.check('#correct-0-c');

    await page.click('text=Add Question');
    await page.fill('#question-1', 'What is the capital of the UK?');
    await page.fill('#answer_a-1', 'London');
    await page.fill('#answer_b-1', 'Islamabad');
    await page.fill('#answer_c-1', 'Paris');
    await page.fill('#answer_d-1', 'Los Angeles');
    await page.check('#correct-1-a');

    await page.getByRole('button', { name: 'Create Quiz' }).click();

    await page.waitForURL('**/dashboard/quizzes');
    await expect(page.locator('text=Sample Quiz Title')).toBeVisible();
});

test('Edit quiz', async ({ page }) => {
    await page.goto('http://localhost:3000/');
  
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.click('text=Quizzes');
    await page.waitForURL('**/dashboard/quizzes');

    await page.click('#radix-\\:r3\\:');
    await page.click('text=Edit');
    await page.waitForTimeout(1000);

    await page.click('text=Add Question');
    await page.fill('#question-2', 'What is the capital of Pakistan?');
    await page.fill('#answer_a-2', 'Peshawar');
    await page.fill('#answer_b-2', 'Islamabad');
    await page.fill('#answer_c-2', 'Karachi');
    await page.fill('#answer_d-2', 'Lahore');
    await page.check('#correct-2-b');

    await page.getByRole('button', { name: 'Save Quiz' }).click();

    await page.waitForURL('**/dashboard/quizzes');
    await expect(page.getByRole('status')).toHaveText(/Quiz updated successfully/);
})

test('Take quiz', async ({ page }) => {
    await page.goto('http://localhost:3000/');
  
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.click('text=Quizzes');
    await page.waitForURL('**/dashboard/quizzes');

    const quizCard = page.locator('div.rounded-xl', {
        has: page.getByText('Sample Quiz Title'),
      });
      
    await quizCard.getByRole('button', { name: 'Study' }).click();   
    
    await page.click('text=Paris');
    await page.click('text=Next');
    await page.click('text=Los Angeles');
    await page.click('text=Next');
    await page.click('text=Islamabad');
    await page.click('text=Finish');

    await expect(page.locator('text=You answered 2 out of 3 correctly (66.67%).')).toBeVisible();
})

test('Delete quiz', async ({ page }) => {
    await page.goto('http://localhost:3000/');
  
    await page.getByRole('link', { name: 'Sign In' }).click();
    await page.fill('input[name="email"]', '25100129@lums.edu.pk');
    await page.fill('input[name="password"]', 'Password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.click('text=Quizzes');
    await page.waitForURL('**/dashboard/quizzes');

    await page.click('#radix-\\:r3\\:');
    await page.click('text=Delete');

    await page.getByRole('button', { name: 'Delete' }).click();

    await page.waitForTimeout(1000);
    await expect(page.getByText('Sample Quiz Title')).not.toBeVisible();
})