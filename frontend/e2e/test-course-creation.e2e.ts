import { test, expect } from '@playwright/test';

test.describe('Course Creation E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Login as admin user
    await page.fill('#username', 'admin');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Navigate to courses page
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new course and send request to backend', async ({ page }) => {
    // Set up network monitoring
    const requests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/v1/courses') && request.method() === 'POST') {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
        console.log('🔍 Captured POST request:', request.url());
      }
    });

    const responses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/v1/courses') && response.request().method() === 'POST') {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log('🔍 Captured POST response:', response.status(), response.url());
      }
    });

    // Click the "Add Course" button
    await page.click('button:has-text("+ Add Course")');
    
    // Wait for form to appear
    await page.waitForSelector('form');
    
    // Fill out the course form
    await page.fill('input[placeholder="e.g., CS101"]', 'TEST101');
    await page.fill('input[placeholder="e.g., Introduction to Computer Science"]', 'Test Course');
    await page.fill('textarea[placeholder="Course description..."]', 'This is a test course');
    
    // Select instructor (using the custom InstructorSelect component)
    const instructorSelectButton = page.locator('button:has-text("Select an instructor...")');
    const combobox = page.locator('[role="combobox"]');
    
    if (await instructorSelectButton.isVisible()) {
      await instructorSelectButton.click();
    } else if (await combobox.isVisible()) {
      await combobox.click();
    } else {
      console.log('Instructor select not found');
    }
    
    // Wait a moment for dropdown to open
    await page.waitForTimeout(1000);
    
    // Try to select first instructor from dropdown
    const firstOption = page.locator('.cursor-pointer').first();
    if (await firstOption.isVisible()) {
      await firstOption.click();
    } else {
      console.log('No instructor options found');
    }
    
    // Fill schedule
    await page.fill('input[placeholder="e.g., MWF 9:00-10:30"]', 'MWF 10:00-11:30');
    
    // Fill dates
    await page.fill('input[type="date"]:first-of-type', '2024-01-15');
    await page.fill('input[type="date"]:last-of-type', '2024-05-15');
    
    // Submit the form
    console.log('🚀 Submitting course creation form...');
    await page.click('button[type="submit"]:has-text("Create Course")');
    
    // Wait a bit for the request to be made
    await page.waitForTimeout(3000);
    
    // Check if any requests were made
    console.log('📊 Network Analysis:');
    console.log('POST requests captured:', requests.length);
    console.log('POST responses captured:', responses.length);
    
    if (requests.length > 0) {
      console.log('✅ Request details:', requests[0]);
    } else {
      console.log('❌ No POST requests were captured');
    }
    
    if (responses.length > 0) {
      console.log('✅ Response details:', responses[0]);
    } else {
      console.log('❌ No POST responses were captured');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'course-creation-debug.png', fullPage: true });
    
    // Verify that at least one POST request was made to the courses endpoint
    expect(requests.length).toBeGreaterThan(0);
  });

  test('should handle form validation errors', async ({ page }) => {
    // Click the "Add Course" button
    await page.click('button:has-text("+ Add Course")');
    
    // Wait for form to appear
    await page.waitForSelector('form');
    
    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("Create Course")');
    
    // Check for validation errors
    const errorMessages = await page.locator('.text-red-500').count();
    expect(errorMessages).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: 'course-validation-debug.png', fullPage: true });
  });
});
