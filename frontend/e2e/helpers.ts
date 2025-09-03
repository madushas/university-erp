import { Page } from '@playwright/test';

/**
 * Authentication helper for E2E tests
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login as admin user
   */
  async loginAsAdmin() {
    await this.login(
      process.env.TEST_ADMIN_USERNAME || 'admin',
      process.env.TEST_VALID_PASSWORD || 'TestPassword123!'
    );
  }

  /**
   * Login as instructor user
   */
  async loginAsInstructor() {
    await this.login(
      process.env.TEST_INSTRUCTOR_USERNAME || 'dr_smith',
      process.env.TEST_VALID_PASSWORD || 'TestPassword123!'
    );
  }

  /**
   * Login as student user
   */
  async loginAsStudent() {
    await this.login(
      process.env.TEST_STUDENT_USERNAME || 'john_doe',
      process.env.TEST_VALID_PASSWORD || 'TestPassword123!'
    );
  }

  /**
   * Generic login method
   */
  private async login(username: string, password: string) {
    await this.page.goto('/login');

    // Fill in credentials
    await this.page.fill('input[name="username"]', username);
    await this.page.fill('input[name="password"]', password);

    // Submit login form
    await this.page.click('button[type="submit"]');

    // Wait for navigation to dashboard or courses
    await this.page.waitForURL(/\/(dashboard|courses|admin)/);
  }

  /**
   * Logout current user
   */
  async logout() {
    // Click logout button (adjust selector based on actual implementation)
    const logoutButton = this.page.locator('button').filter({ hasText: 'Logout' }).or(
      this.page.locator('[data-testid="logout-button"]')
    );

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.page.waitForURL('/login');
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    // Check for presence of logout button or user menu
    const logoutButton = this.page.locator('button').filter({ hasText: 'Logout' });
    const userMenu = this.page.locator('[data-testid="user-menu"]');

    return await logoutButton.isVisible() || await userMenu.isVisible();
  }

  /**
   * Get current user role (if detectable from UI)
   */
  async getCurrentUserRole(): Promise<string | null> {
    // Try to detect role from UI elements
    const adminIndicator = this.page.locator('text=Admin').or(this.page.locator('[data-testid="admin-badge"]'));
    const instructorIndicator = this.page.locator('text=Instructor').or(this.page.locator('[data-testid="instructor-badge"]'));
    const studentIndicator = this.page.locator('text=Student').or(this.page.locator('[data-testid="student-badge"]'));

    if (await adminIndicator.isVisible()) return 'ADMIN';
    if (await instructorIndicator.isVisible()) return 'INSTRUCTOR';
    if (await studentIndicator.isVisible()) return 'STUDENT';

    return null;
  }
}

/**
 * Course management helper for E2E tests
 */
export class CourseHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to courses page
   */
  async goToCourses() {
    await this.page.goto('/courses');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for courses
   */
  async searchCourses(searchTerm: string) {
    const searchInput = this.page.getByPlaceholder('Search by title...').or(
      this.page.locator('input[type="search"]')
    );

    await searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for search to complete
  }

  /**
   * Filter courses by level
   */
  async filterByLevel(level: string) {
    const levelSelect = this.page.locator('select').filter({ hasText: 'Level' }).or(
      this.page.locator('[data-testid="level-filter"]')
    );

    if (await levelSelect.isVisible()) {
      await levelSelect.selectOption(level);
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Filter courses by status
   */
  async filterByStatus(status: string) {
    const statusSelect = this.page.locator('select').filter({ hasText: 'Status' }).or(
      this.page.locator('[data-testid="status-filter"]')
    );

    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption(status);
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Click on a course card
   */
  async clickCourseCard(courseTitle: string) {
    const courseCard = this.page.locator('.course-card').filter({ hasText: courseTitle }).or(
      this.page.locator('[data-testid="course-card"]').filter({ hasText: courseTitle })
    );

    await courseCard.click();
  }

  /**
   * Click add course button
   */
  async clickAddCourse() {
    const addButton = this.page.locator('button').filter({ hasText: '+ Add Course' }).or(
      this.page.locator('[data-testid="add-course-button"]')
    );

    await addButton.click();
  }

  /**
   * Fill course creation form
   */
  async fillCourseForm(courseData: {
    code: string;
    title: string;
    instructor: string;
    credits?: number;
    description?: string;
  }) {
    // Wait for form to be visible
    await this.page.waitForTimeout(1000);

    // Fill course code - exact placeholder match
    const codeInput = this.page.locator('input[placeholder="e.g., CS101"]');
    await codeInput.fill(courseData.code);

    // Fill course title - exact placeholder match
    const titleInput = this.page.locator('input[placeholder="e.g., Introduction to Computer Science"]');
    await titleInput.fill(courseData.title);

    // Fill instructor - exact placeholder match
    const instructorInput = this.page.locator('input[placeholder="Instructor name"]');
    await instructorInput.fill(courseData.instructor);

    // Fill credits if provided
    if (courseData.credits) {
      const creditsInput = this.page.locator('input[type="number"]').first();
      await creditsInput.fill(courseData.credits.toString());
    }

    // Fill description if provided
    if (courseData.description) {
      const descriptionTextarea = this.page.locator('textarea[placeholder="Course description..."]');
      await descriptionTextarea.fill(courseData.description);
    }
  }

  /**
   * Submit course form
   */
  async submitCourseForm() {
    const submitButton = this.page.locator('button[type="submit"]').or(
      this.page.locator('button').filter({ hasText: 'Create' })
    );

    await submitButton.click();
  }

  /**
   * Check if course exists in list
   */
  async courseExists(courseTitle: string): Promise<boolean> {
    const courseCard = this.page.locator('.course-card').filter({ hasText: courseTitle }).or(
      this.page.locator('[data-testid="course-card"]').filter({ hasText: courseTitle })
    );

    return await courseCard.isVisible();
  }
}

/**
 * Test data helpers using environment variables
 */
export const TestData = {
  // Valid test credentials from environment
  get adminCredentials() {
    return {
      username: process.env.TEST_ADMIN_USERNAME || 'admin',
      password: process.env.TEST_VALID_PASSWORD || 'TestPassword123!',
      email: process.env.TEST_ADMIN_EMAIL || 'admin@university.com'
    };
  },

  get studentCredentials() {
    return {
      username: process.env.TEST_STUDENT_USERNAME || 'john_doe',
      password: process.env.TEST_VALID_PASSWORD || 'TestPassword123!',
      email: process.env.TEST_STUDENT_EMAIL || 'john@university.com'
    };
  },

  get instructorCredentials() {
    return {
      username: process.env.TEST_INSTRUCTOR_USERNAME || 'dr_smith',
      password: process.env.TEST_VALID_PASSWORD || 'TestPassword123!',
      email: process.env.TEST_INSTRUCTOR_EMAIL || 'dr.smith@university.com'
    };
  },

  // Sample course data for testing
  get sampleCourse() {
    return {
      code: 'TEST101',
      title: 'Test Course for E2E Testing',
      description: 'This is a test course created during E2E testing',
      instructor: 'Dr. Test Instructor',
      credits: 3,
      maxStudents: 30,
      courseLevel: 'UNDERGRADUATE',
      status: 'DRAFT'
    };
  }
};

export class CoursePage {}
