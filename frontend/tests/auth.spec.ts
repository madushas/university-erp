import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cookies before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check if login form elements are present
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    // Check if register form elements are present
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');

    // Click login without filling form
    await page.getByRole('button', { name: 'Login' }).click();

    // Check for validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show validation errors for empty register form', async ({ page }) => {
    await page.goto('/register');

    // Click register without filling form
    await page.getByRole('button', { name: 'Register' }).click();

    // Check for validation errors
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Last name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should navigate to register from login page', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page.getByRole('link', { name: 'Register here' }).click();

    // Should navigate to register page
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  });

  test('should navigate to login from register page', async ({ page }) => {
    await page.goto('/register');

    // Click login link
    await page.getByRole('link', { name: 'Login here' }).click();

    // Should navigate to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill invalid credentials
    await page.getByLabel('Email').fill(process.env.TEST_INVALID_EMAIL || 'invalid@example.com');
    await page.getByLabel('Password').fill(process.env.TEST_INVALID_PASSWORD || 'wrongpassword');

    // Submit form
    await page.getByRole('button', { name: 'Login' }).click();

    // Should show error message (this will depend on your backend response)
    // You might need to adjust this based on your actual error handling
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible();
  });

  test('should handle successful registration', async ({ page }) => {
    await page.goto('/register');

    // Generate unique email to avoid conflicts
    const timestamp = Date.now();
    const email = `test${timestamp}@${process.env.TEST_GENERIC_EMAIL?.split('@')[1] || 'example.com'}`;

    // Fill registration form
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(process.env.TEST_VALID_PASSWORD || 'TestPassword123!');

    // Submit form
    await page.getByRole('button', { name: 'Register' }).click();

    // Should either redirect to login or show success message
    // Adjust based on your app's behavior
    await expect(page).toHaveURL(/\/login|\/dashboard/);
  });

  test('should handle password confirmation mismatch', async ({ page }) => {
    await page.goto('/register');

    // Fill form with mismatched passwords
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');
    await page.getByLabel('Email').fill(process.env.TEST_GENERIC_EMAIL || 'test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByLabel('Confirm Password').fill('differentpassword');

    // Submit form
    await page.getByRole('button', { name: 'Register' }).click();

    // Should show password mismatch error
    await expect(page.getByText(/password.*match|confirm.*password/i)).toBeVisible();
  });

  test('should redirect authenticated users from login page', async ({ page }) => {
    // First, simulate login by setting auth token in localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: process.env.TEST_GENERIC_EMAIL || 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT'
      }));
    });

    // Reload page to trigger auth check
    await page.reload();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle logout functionality', async ({ page }) => {
    // Simulate logged in user
    await page.goto('/dashboard');
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: process.env.TEST_GENERIC_EMAIL || 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'STUDENT'
      }));
    });
    await page.reload();

    // Click logout button (adjust selector based on your UI)
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Auth data should be cleared
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(authToken).toBeNull();
  });
});
