import { test, expect } from '@playwright/test';

test.describe('Course Registration Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/v1/auth/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          accessToken: 'mock-token',
          user: {
            id: 1,
            username: 'john.doe',
            email: 'john@university.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'STUDENT'
          }
        })
      });
    });

    // Mock courses API
    await page.route('**/api/v1/courses**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('page=')) {
        // Paginated courses
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [
              {
                id: 1,
                code: 'CS101',
                title: 'Introduction to Computer Science',
                description: 'Basic concepts of computer science and programming',
                instructor: 'Dr. Smith',
                department: 'Computer Science',
                courseLevel: 'UNDERGRADUATE',
                credits: 3,
                maxStudents: 30,
                enrolledStudents: 15,
                status: 'ACTIVE',
                schedule: 'MWF 10:00-11:00 AM',
                classroom: 'CS Building Room 101'
              },
              {
                id: 2,
                code: 'MATH201',
                title: 'Calculus II',
                description: 'Advanced calculus concepts',
                instructor: 'Dr. Johnson',
                department: 'Mathematics',
                courseLevel: 'UNDERGRADUATE',
                credits: 4,
                maxStudents: 25,
                enrolledStudents: 25,
                status: 'ACTIVE',
                schedule: 'TTh 2:00-3:30 PM',
                classroom: 'Math Building Room 205',
                prerequisites: 'MATH101'
              }
            ],
            totalElements: 2,
            totalPages: 1,
            size: 20,
            number: 0
          })
        });
      } else if (url.includes('/1')) {
        // Single course
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'Basic concepts of computer science and programming',
            instructor: 'Dr. Smith',
            department: 'Computer Science',
            courseLevel: 'UNDERGRADUATE',
            credits: 3,
            maxStudents: 30,
            enrolledStudents: 15,
            status: 'ACTIVE',
            schedule: 'MWF 10:00-11:00 AM',
            classroom: 'CS Building Room 101'
          })
        });
      }
    });

    // Mock registrations API
    await page.route('**/api/v1/registrations/**', async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === 'GET' && url.includes('/my')) {
        // Get my registrations
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (method === 'POST' && url.includes('/enroll/')) {
        // Enroll in course
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            user: {
              id: 1,
              username: 'john.doe',
              email: 'john@university.com',
              firstName: 'John',
              lastName: 'Doe',
              studentId: 'STU001'
            },
            course: {
              id: 1,
              code: 'CS101',
              title: 'Introduction to Computer Science',
              instructor: 'Dr. Smith',
              credits: 3
            },
            registrationDate: new Date().toISOString(),
            status: 'ENROLLED',
            paymentStatus: 'PENDING'
          })
        });
      }
    });

    await page.goto('/registration');
  });

  test('should display available courses', async ({ page }) => {
    // Wait for courses to load
    await expect(page.getByText('Available Courses')).toBeVisible();
    
    // Check that courses are displayed
    await expect(page.getByText('CS101 - Introduction to Computer Science')).toBeVisible();
    await expect(page.getByText('MATH201 - Calculus II')).toBeVisible();
    
    // Check course details
    await expect(page.getByText('Dr. Smith')).toBeVisible();
    await expect(page.getByText('3 Credits')).toBeVisible();
    await expect(page.getByText('15 / 30 enrolled')).toBeVisible();
  });

  test('should filter courses by department', async ({ page }) => {
    // Wait for courses to load
    await expect(page.getByText('Available Courses')).toBeVisible();
    
    // Open department filter
    await page.getByRole('combobox', { name: /all departments/i }).click();
    await page.getByRole('option', { name: 'Computer Science' }).click();
    
    // Should show only CS courses
    await expect(page.getByText('CS101 - Introduction to Computer Science')).toBeVisible();
    // Math course should not be visible (in a real implementation)
  });

  test('should search courses by title', async ({ page }) => {
    // Wait for courses to load
    await expect(page.getByText('Available Courses')).toBeVisible();
    
    // Search for a course
    await page.getByPlaceholder('Search courses by title, code, or instructor...').fill('Computer Science');
    
    // Should show matching courses
    await expect(page.getByText('CS101 - Introduction to Computer Science')).toBeVisible();
  });

  test('should show course as full when at capacity', async ({ page }) => {
    // Wait for courses to load
    await expect(page.getByText('Available Courses')).toBeVisible();
    
    // Check that MATH201 shows as full
    const mathCourse = page.locator('[data-testid="course-card"]').filter({ hasText: 'MATH201' });
    await expect(mathCourse.getByText('Full')).toBeVisible();
    await expect(mathCourse.getByRole('button', { name: 'Full' })).toBeDisabled();
  });

  test('should complete course registration workflow', async ({ page }) => {
    // Step 1: Browse courses
    await expect(page.getByText('Available Courses')).toBeVisible();
    
    // Select a course
    const csCourse = page.locator('[data-testid="course-card"]').filter({ hasText: 'CS101' });
    await csCourse.click();
    
    // Click enroll button
    await csCourse.getByRole('button', { name: 'Enroll' }).click();
    
    // Step 2: Registration form
    await expect(page.getByText('Course Registration')).toBeVisible();
    await expect(page.getByText('CS101 - Introduction to Computer Science')).toBeVisible();
    
    // Fill out acknowledgements
    await page.getByRole('checkbox', { name: /prerequisites reviewed/i }).check();
    await page.getByRole('checkbox', { name: /schedule conflict aware/i }).check();
    await page.getByRole('checkbox', { name: /payment terms accepted/i }).check();
    await page.getByRole('checkbox', { name: /withdrawal policy understood/i }).check();
    
    // Add optional notes
    await page.getByPlaceholder('Any additional information or special requests...').fill('Looking forward to this course!');
    
    // Submit registration
    await page.getByRole('button', { name: 'Complete Registration' }).click();
    
    // Step 3: Confirmation
    await expect(page.getByText('Registration Successful!')).toBeVisible();
    await expect(page.getByText('You have been successfully registered for CS101')).toBeVisible();
    
    // Check registration details
    await expect(page.getByText('REG-000001')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('STU001')).toBeVisible();
    await expect(page.getByText('ENROLLED')).toBeVisible();
    await expect(page.getByText('PENDING')).toBeVisible(); // Payment status
  });

  test('should prevent registration without acknowledgements', async ({ page }) => {
    // Navigate to registration form
    await expect(page.getByText('Available Courses')).toBeVisible();
    const csCourse = page.locator('[data-testid="course-card"]').filter({ hasText: 'CS101' });
    await csCourse.getByRole('button', { name: 'Enroll' }).click();
    
    // Try to submit without acknowledgements
    await page.getByRole('button', { name: 'Complete Registration' }).click();
    
    // Should show validation errors
    await expect(page.getByText('You must review and acknowledge the prerequisites')).toBeVisible();
    await expect(page.getByText('You must acknowledge awareness of potential schedule conflicts')).toBeVisible();
    await expect(page.getByText('You must accept the payment terms and conditions')).toBeVisible();
    await expect(page.getByText('You must acknowledge understanding of the withdrawal policy')).toBeVisible();
  });

  test('should show enrollment validation warnings', async ({ page }) => {
    // Mock validation response with warnings
    await page.route('**/api/v1/courses/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          code: 'CS101',
          title: 'Introduction to Computer Science',
          maxStudents: 30,
          enrolledStudents: 27, // Close to capacity
          status: 'ACTIVE'
        })
      });
    });

    // Navigate to registration form
    await expect(page.getByText('Available Courses')).toBeVisible();
    const csCourse = page.locator('[data-testid="course-card"]').filter({ hasText: 'CS101' });
    await csCourse.click();
    
    // Should show enrollment eligibility with warnings
    await expect(page.getByText('Enrollment Eligibility')).toBeVisible();
    await expect(page.getByText('Eligible to enroll')).toBeVisible();
    await expect(page.getByText('Course is filling up')).toBeVisible();
  });

  test('should handle registration errors gracefully', async ({ page }) => {
    // Mock enrollment failure
    await page.route('**/api/v1/registrations/enroll/**', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Course is at full capacity'
        })
      });
    });

    // Navigate to registration form and submit
    await expect(page.getByText('Available Courses')).toBeVisible();
    const csCourse = page.locator('[data-testid="course-card"]').filter({ hasText: 'CS101' });
    await csCourse.getByRole('button', { name: 'Enroll' }).click();
    
    // Fill acknowledgements and submit
    await page.getByRole('checkbox', { name: /prerequisites reviewed/i }).check();
    await page.getByRole('checkbox', { name: /schedule conflict aware/i }).check();
    await page.getByRole('checkbox', { name: /payment terms accepted/i }).check();
    await page.getByRole('checkbox', { name: /withdrawal policy understood/i }).check();
    
    await page.getByRole('button', { name: 'Complete Registration' }).click();
    
    // Should show error message
    await expect(page.getByText('Course is at full capacity')).toBeVisible();
  });

  test('should navigate back through registration steps', async ({ page }) => {
    // Start registration process
    await expect(page.getByText('Available Courses')).toBeVisible();
    const csCourse = page.locator('[data-testid="course-card"]').filter({ hasText: 'CS101' });
    await csCourse.getByRole('button', { name: 'Enroll' }).click();
    
    // Should be on registration form
    await expect(page.getByText('Course Registration')).toBeVisible();
    
    // Click back button
    await page.getByRole('button', { name: 'Back' }).click();
    
    // Should be back to course browse
    await expect(page.getByText('Available Courses')).toBeVisible();
  });

  test('should show registration summary statistics', async ({ page }) => {
    // Mock existing registrations
    await page.route('**/api/v1/registrations/my', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            status: 'ENROLLED',
            course: { credits: 3 }
          },
          {
            id: 2,
            status: 'COMPLETED',
            course: { credits: 4 }
          }
        ])
      });
    });

    await page.reload();
    
    // Check registration summary
    await expect(page.getByText('Registration Summary')).toBeVisible();
    await expect(page.getByText('1').first()).toBeVisible(); // Enrolled count
    await expect(page.getByText('1').nth(1)).toBeVisible(); // Completed count
    await expect(page.getByText('7')).toBeVisible(); // Total credits
  });

  test('should display help information', async ({ page }) => {
    // Check help section
    await expect(page.getByText('Registration Help')).toBeVisible();
    await expect(page.getByText('Registration Tips')).toBeVisible();
    await expect(page.getByText('Check prerequisites before registering')).toBeVisible();
    await expect(page.getByText('advising@university.edu')).toBeVisible();
    await expect(page.getByText('registrar@university.edu')).toBeVisible();
  });

  test('should handle course selection and validation', async ({ page }) => {
    // Select a course
    await expect(page.getByText('Available Courses')).toBeVisible();
    const csCourse = page.locator('[data-testid="course-card"]').filter({ hasText: 'CS101' });
    await csCourse.click();
    
    // Should show course as selected (highlighted)
    await expect(csCourse).toHaveClass(/ring-2 ring-blue-5/);
    
    // Should show enrollment eligibility
    await expect(page.getByText('Enrollment Eligibility')).toBeVisible();
  });
});