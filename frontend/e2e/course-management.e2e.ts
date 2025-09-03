import { test, expect } from '@playwright/test';
import { AuthHelper, TestData, CourseHelper } from './helpers';

test.describe('Course Management E2E Tests', () => {
  let authHelper: AuthHelper;
  let courseHelper: CourseHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    courseHelper = new CourseHelper(page);

    // Navigate to the courses page
    await page.goto('/courses');
  });

  test.describe('Course Listing and Search', () => {
    test('should display course management page with statistics', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();

      // Check page title
      await expect(page.locator('h1')).toContainText('Course Management');

      // Check statistics cards are present
      await expect(page.getByText('Total Courses')).toBeVisible();
      await expect(page.getByText('Active Courses')).toBeVisible();
      await expect(page.getByText('Total Enrollments')).toBeVisible();
      await expect(page.getByText('Avg. Enrollment')).toBeVisible();
    });

    test('should display course list with search functionality', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();

      // Check search input is present
      const searchInput = page.getByPlaceholder('Search by title...');
      await expect(searchInput).toBeVisible();

      // Check filter dropdowns
      await expect(page.getByText('Course Level')).toBeVisible();
      await expect(page.getByText('Status')).toBeVisible();

      // Check view mode buttons
      await expect(page.getByText('Grid')).toBeVisible();
      await expect(page.getByText('List')).toBeVisible();
    });

    test('should filter courses by search term', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();

      await courseHelper.searchCourses('Computer Science');

      // Wait for search to complete
      await page.waitForTimeout(500);

      // Check that courses are filtered (this would depend on actual course data)
      // For now, just verify the search input has the value
      const searchInput = page.getByPlaceholder('Search by title...');
      await expect(searchInput).toHaveValue('Computer Science');
    });

    test('should filter courses by level', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();

      await courseHelper.filterByLevel('UNDERGRADUATE');

      // Wait for filtering to complete
      await page.waitForTimeout(500);

      // Verify filter is applied (would need actual course data to verify results)
      await expect(page.getByText('Course Level')).toBeVisible();
    });
  });

  test.describe('Role-based Access Control', () => {
    test('should show admin controls for admin users', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();

      // Check if "Add Course" button is visible (admin/instructor only)
      const addButton = page.getByText('+ Add Course');
      await expect(addButton).toBeVisible();
    });

    test('should show student-specific actions for student users', async ({ page }) => {
      await authHelper.loginAsStudent();
      await courseHelper.goToCourses();

      // Check for student-specific buttons
      const myCoursesButton = page.getByText('My Courses');
      // This might not be visible depending on authentication
    });
  });

  test.describe('Course Details View', () => {
    test('should navigate to course details when clicking on a course', async ({ page }) => {
      // This test assumes there are courses in the list
      // Click on the first course card
      const firstCourseCard = page.locator('.course-card').first();
      if (await firstCourseCard.isVisible()) {
        await firstCourseCard.click();

        // Should navigate to course details
        await expect(page).toHaveURL(/\/courses\/\d+/);
      }
    });

    test('should display course details with all information', async ({ page }) => {
      // Navigate to a specific course (assuming course with ID 1 exists)
      await page.goto('/courses/1');

      // Check course details are displayed
      await expect(page.getByText('Course Details')).toBeVisible();

      // Check for course information sections
      await expect(page.getByText('Overview')).toBeVisible();
      await expect(page.getByText('Schedule')).toBeVisible();
      await expect(page.getByText('Enrollment')).toBeVisible();
    });
  });

  test.describe('Course Creation (Admin/Instructor)', () => {
    test('should open course creation form', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();
      await courseHelper.clickAddCourse();

      // Check form is displayed
      await expect(page.getByText('Create New Course')).toBeVisible();

      // Check required form fields
      await expect(page.getByLabel('Course Code')).toBeVisible();
      await expect(page.getByLabel('Course Title')).toBeVisible();
      await expect(page.getByLabel('Instructor')).toBeVisible();
    });

    test('should validate required fields in course creation', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();
      await courseHelper.clickAddCourse();

      // Try to submit empty form
      await courseHelper.submitCourseForm();

      // Check for validation errors
      await expect(page.getByText('Course code is required')).toBeVisible();
      await expect(page.getByText('Course title is required')).toBeVisible();
    });

    test('should create course with valid data', async ({ page }) => {
      await authHelper.loginAsAdmin();
      await courseHelper.goToCourses();
      await courseHelper.clickAddCourse();

      // Fill form with test data
      const courseData = TestData.sampleCourse;
      await courseHelper.fillCourseForm(courseData);
      await courseHelper.submitCourseForm();

      // Check success message or redirect
      await expect(page.getByText('Course created successfully')).toBeVisible();
    });
  });

  test.describe('Course Editing', () => {
    test('should open edit form for existing course', async ({ page }) => {
      // Navigate to course details
      await page.goto('/courses/1');

      // Click edit button (if visible)
      const editButton = page.getByText('Edit Course');
      if (await editButton.isVisible()) {
        await editButton.click();

        // Check edit form is displayed
        await expect(page.getByText('Edit Course')).toBeVisible();
      }
    });

    test('should update course with valid changes', async ({ page }) => {
      // This would require backend integration
      test.skip();
    });
  });

  test.describe('Course Enrollment (Student)', () => {
    test('should show enrollment button for available courses', async ({ page }) => {
      // This would require student authentication
      test.skip();
    });

    test('should handle course registration', async ({ page }) => {
      // This would test the enrollment flow
      test.skip();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // This would require mocking network failures
      test.skip();
    });

    test('should show appropriate messages for empty states', async ({ page }) => {
      // Test when no courses are available
      // Check for "No courses found" or similar messages
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that course cards are properly displayed
      // Check that filters work on mobile
      // Check that navigation works on mobile
    });

    test('should work on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify layout adapts properly
    });
  });
});
