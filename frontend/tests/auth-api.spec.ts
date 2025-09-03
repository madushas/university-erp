import { test, expect } from '@playwright/test';
import { AuthHelper, TestData } from './helpers';

test.describe('Authentication API Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cookies before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form with valid credentials (using username, not email)
    await AuthHelper.fillLoginForm(
      page,
      process.env.TEST_ADMIN_USERNAME || 'admin',
      process.env.TEST_VALID_PASSWORD || 'password'
    );

    // Submit form
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');

    // Verify we're on dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user data is stored
    const userData = await page.evaluate(() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    });

    expect(userData).toBeTruthy();
    expect(userData.username).toBe('admin');
    expect(userData.email).toBe(process.env.TEST_ADMIN_EMAIL || 'admin@university.com');
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form with invalid credentials
    await AuthHelper.fillLoginForm(page, process.env.TEST_INVALID_EMAIL || 'invalid@example.com', process.env.TEST_INVALID_PASSWORD || 'wrongpassword');

    // Submit form
    await page.getByRole('button', { name: 'Login' }).click();

    // Should stay on login page or show error
    await expect(page).toHaveURL(/\/login/);

    // Check for error message
    await expect(page.getByText(/invalid|error|failed/i)).toBeVisible();
  });

  test('should successfully register a new user', async ({ page }) => {
    await page.goto('/register');

    const uniqueEmail = TestData.getUniqueEmail();

    // Fill registration form
    await AuthHelper.fillRegisterForm(
      page,
      'Test',
      'User',
      uniqueEmail,
      TestData.getValidPassword()
    );

    // Submit form
    await page.getByRole('button', { name: 'Register' }).click();

    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/\/login|\/dashboard/);

    // If redirected to login, try logging in with the new credentials
    if (page.url().includes('/login')) {
      await AuthHelper.fillLoginForm(page, uniqueEmail, TestData.getValidPassword());
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('/dashboard');
    }

    // Verify user data
    const userData = await page.evaluate(() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    });

    expect(userData).toBeTruthy();
    expect(userData.email).toBe(uniqueEmail);
  });

  test('should handle token refresh', async ({ page }) => {
    // First login to get tokens
    await page.goto('/login');
    await AuthHelper.fillLoginForm(page, process.env.TEST_ADMIN_USERNAME || 'admin', process.env.TEST_VALID_PASSWORD || 'password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');

    // Get initial token
    const initialToken = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(initialToken).toBeTruthy();

    // Wait for token to potentially expire (or simulate expiration)
    // In a real scenario, you might need to wait or mock the token expiration
    await page.waitForTimeout(1000);

    // Navigate to a protected route to trigger token refresh
    await page.goto('/dashboard');

    // Verify we're still authenticated
    await expect(page).toHaveURL('/dashboard');

    // Check if token was refreshed (this depends on your token expiration time)
    const currentToken = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(currentToken).toBeTruthy();
  });

  test('should handle session persistence across page reloads', async ({ page }) => {
    // Login
    await page.goto('/login');
    await AuthHelper.fillLoginForm(page, process.env.TEST_ADMIN_USERNAME || 'admin', process.env.TEST_VALID_PASSWORD || 'password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');

    // Reload the page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard');

    // User data should still be available
    const userData = await page.evaluate(() => {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    });

    expect(userData).toBeTruthy();
    expect(userData.username).toBe('admin');
    expect(userData.email).toBe(process.env.TEST_ADMIN_EMAIL || 'admin@university.com');
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await AuthHelper.fillLoginForm(page, process.env.TEST_ADMIN_USERNAME || 'admin', process.env.TEST_VALID_PASSWORD || 'password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');

    // Click logout (adjust selector based on your UI)
    await page.getByRole('button', { name: /logout|sign out/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Auth data should be cleared
    const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
    const userData = await page.evaluate(() => localStorage.getItem('user'));

    expect(authToken).toBeNull();
    expect(userData).toBeNull();
  });

  test('should protect routes for unauthenticated users', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle role-based access control', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await AuthHelper.fillLoginForm(page, process.env.TEST_STUDENT_USERNAME || 'john_doe', process.env.TEST_VALID_PASSWORD || 'password');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('/dashboard');

    // Try to access admin route
    await page.goto('/admin');

    // Should be denied access (either redirect or show error)
    await expect(page).toHaveURL(/\/admin|\/dashboard|\/unauthorized/);

    // Should not show admin content
    await expect(page.getByText(/admin panel|user management/i)).not.toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure by blocking API calls
    await page.route('**/api/v1/auth/**', route => route.abort());

    await page.goto('/login');
    await AuthHelper.fillLoginForm(page, process.env.TEST_NETWORK_ERROR_EMAIL || 'admin@example.com', process.env.TEST_NETWORK_ERROR_PASSWORD || 'admin123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Should show network error message
    await expect(page.getByText(/network|connection|error/i)).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/login');

    // Test empty email
    await page.getByLabel('Password').fill(process.env.TEST_FORM_VALIDATION_PASSWORD || 'password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/email.*required|email.*empty/i)).toBeVisible();

    // Test empty password
    await page.getByLabel('Email').fill(process.env.TEST_FORM_VALIDATION_EMAIL || 'test@example.com');
    await page.getByLabel('Password').clear();
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/password.*required|password.*empty/i)).toBeVisible();

    // Test invalid email format
    await page.getByLabel('Email').fill(process.env.TEST_INVALID_EMAIL_FORMAT || 'invalid-email');
    await page.getByLabel('Password').fill(process.env.TEST_FORM_VALIDATION_PASSWORD || 'password123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText(/invalid.*email|email.*format/i)).toBeVisible();
  });
});
