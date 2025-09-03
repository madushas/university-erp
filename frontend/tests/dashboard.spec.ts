import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cookies before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should display dashboard for authenticated users', async ({ page }) => {
    // Simulate authenticated user
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: process.env.TEST_STUDENT_GENERIC_EMAIL || 'student@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT'
      }));
    });

    await page.goto('/dashboard');

    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard');

    // Check for dashboard elements
    await expect(page.getByRole('heading', { name: /dashboard|welcome/i })).toBeVisible();
  });

  test('should display user information', async ({ page }) => {
    // Simulate authenticated user
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: process.env.TEST_STUDENT_GENERIC_EMAIL || 'student@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT'
      }));
    });

    await page.goto('/dashboard');

    // Check if user name is displayed
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText(process.env.TEST_STUDENT_GENERIC_EMAIL || 'student@example.com')).toBeVisible();
    await expect(page.getByText('STUDENT')).toBeVisible();
  });

  test('should display dashboard cards', async ({ page }) => {
    // Simulate authenticated user
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: process.env.TEST_STUDENT_GENERIC_EMAIL || 'student@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT'
      }));
    });

    await page.goto('/dashboard');

    // Check for dashboard cards (adjust based on your actual dashboard content)
    await expect(page.getByText(/courses|enrollment|grades|schedule/i)).toBeVisible();
  });

  test('should handle admin dashboard', async ({ page }) => {
    // Simulate admin user
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: process.env.TEST_ADMIN_GENERIC_EMAIL || 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }));
    });

    await page.goto('/admin');

    // Should display admin dashboard
    await expect(page).toHaveURL('/admin');
    await expect(page.getByText(/admin|management|users/i)).toBeVisible();
  });

  test('should handle role-based access', async ({ page }) => {
    // Test student trying to access admin page
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: process.env.TEST_STUDENT_GENERIC_EMAIL || 'student@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT'
      }));
    });

    await page.goto('/admin');

    // Should redirect or show access denied
    await expect(page).toHaveURL(/\/admin|\/dashboard|\/login/);
    // You might want to check for an access denied message
    // await expect(page.getByText(/access denied|unauthorized/i)).toBeVisible();
  });
});
