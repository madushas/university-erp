import { Page } from '@playwright/test';

export class AuthHelper {
  static async loginAsStudent(page: Page) {
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: process.env.TEST_STUDENT_USERNAME || 'john_doe',
        email: process.env.TEST_STUDENT_EMAIL || 'john@university.com',
        firstName: process.env.TEST_STUDENT_FIRST_NAME || 'John',
        lastName: process.env.TEST_STUDENT_LAST_NAME || 'Doe',
        role: 'STUDENT'
      }));
    });
  }

  static async loginAsAdmin(page: Page) {
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        username: process.env.TEST_ADMIN_USERNAME || 'admin',
        email: process.env.TEST_ADMIN_EMAIL || 'admin@university.com',
        firstName: process.env.TEST_ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.TEST_ADMIN_LAST_NAME || 'User',
        role: 'ADMIN'
      }));
    });
  }

  static async loginAsInstructor(page: Page) {
    await page.evaluate(() => {
      localStorage.setItem('authToken', process.env.TEST_FAKE_JWT_TOKEN || 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({
        id: 3,
        username: process.env.TEST_INSTRUCTOR_USERNAME || 'dr_smith',
        email: process.env.TEST_INSTRUCTOR_EMAIL || 'dr.smith@university.com',
        firstName: process.env.TEST_INSTRUCTOR_FIRST_NAME || 'Dr. Sarah',
        lastName: process.env.TEST_INSTRUCTOR_LAST_NAME || 'Smith',
        role: 'INSTRUCTOR'
      }));
    });
  }

  static async logout(page: Page) {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
    });
  }

  static async fillLoginForm(page: Page, email: string, password: string) {
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
  }

  static async fillRegisterForm(
    page: Page,
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) {
    await page.getByLabel('First Name').fill(firstName);
    await page.getByLabel('Last Name').fill(lastName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
  }
}

export class NavigationHelper {
  static async goToLogin(page: Page) {
    await page.goto('/login');
  }

  static async goToRegister(page: Page) {
    await page.goto('/register');
  }

  static async goToDashboard(page: Page) {
    await page.goto('/dashboard');
  }

  static async goToAdmin(page: Page) {
    await page.goto('/admin');
  }
}

export class TestData {
  static getUniqueEmail(): string {
    return `test${Date.now()}@example.com`;
  }

  static getValidPassword(): string {
    return process.env.TEST_VALID_PASSWORD || 'TestPassword123!';
  }

  static getStudentUser() {
    return {
      id: 2,
      username: process.env.TEST_STUDENT_USERNAME || 'john_doe',
      email: process.env.TEST_STUDENT_EMAIL || 'john@university.com',
      firstName: process.env.TEST_STUDENT_FIRST_NAME || 'John',
      lastName: process.env.TEST_STUDENT_LAST_NAME || 'Doe',
      role: 'STUDENT'
    };
  }

  static getAdminUser() {
    return {
      id: 1,
      username: process.env.TEST_ADMIN_USERNAME || 'admin',
      email: process.env.TEST_ADMIN_EMAIL || 'admin@university.com',
      firstName: process.env.TEST_ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.TEST_ADMIN_LAST_NAME || 'User',
      role: 'ADMIN'
    };
  }

  static getInstructorUser() {
    return {
      id: 3,
      username: process.env.TEST_INSTRUCTOR_USERNAME || 'dr_smith',
      email: process.env.TEST_INSTRUCTOR_EMAIL || 'dr.smith@university.com',
      firstName: process.env.TEST_INSTRUCTOR_FIRST_NAME || 'Dr. Sarah',
      lastName: process.env.TEST_INSTRUCTOR_LAST_NAME || 'Smith',
      role: 'INSTRUCTOR'
    };
  }
}
