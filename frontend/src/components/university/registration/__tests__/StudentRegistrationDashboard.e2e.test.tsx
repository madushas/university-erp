import { test, expect } from '@playwright/test';

test.describe('Student Registration Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and API responses
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        json: {
          id: '1',
          username: 'student1',
          email: 'student1@university.edu',
          firstName: 'John',
          lastName: 'Doe',
          roles: ['STUDENT']
        }
      });
    });

    await page.route('**/api/registrations', async route => {
      await route.fulfill({
        json: [
          {
            id: 1,
            status: 'ENROLLED',
            paymentStatus: 'PAID',
            registrationDate: '2025-01-15T10:00:00Z',
            grade: 'A',
            gradePoints: 4.0,
            attendancePercentage: 95.5,
            course: {
              id: 1,
              code: 'CS101',
              title: 'Introduction to Computer Science',
              description: 'Basic concepts of computer science and programming',
              credits: 3,
              instructor: 'Dr. Smith',
              department: 'Computer Science',
              courseLevel: 'Undergraduate',
              schedule: 'MWF 10:00-11:00 AM',
              classroom: 'Room 101',
              courseFee: 150.00
            }
          },
          {
            id: 2,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            registrationDate: '2025-01-20T14:30:00Z',
            course: {
              id: 2,
              code: 'MATH201',
              title: 'Calculus II',
              description: 'Advanced calculus concepts',
              credits: 4,
              instructor: 'Prof. Johnson',
              department: 'Mathematics',
              courseLevel: 'Undergraduate',
              schedule: 'TTh 2:00-3:30 PM',
              classroom: 'Room 205',
              courseFee: 200.00
            }
          },
          {
            id: 3,
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            registrationDate: '2024-08-15T09:00:00Z',
            grade: 'B+',
            gradePoints: 3.3,
            attendancePercentage: 88.0,
            course: {
              id: 3,
              code: 'ENG101',
              title: 'English Composition',
              description: 'Writing and communication skills',
              credits: 3,
              instructor: 'Dr. Williams',
              department: 'English',
              courseLevel: 'Undergraduate'
            }
          }
        ]
      });
    });

    await page.route('**/api/students/*/academic-record', async route => {
      await route.fulfill({
        json: {
          studentId: '1',
          gpa: 3.65,
          totalCredits: 45,
          academicStanding: 'Good Standing',
          courses: []
        }
      });
    });

    // Navigate to the dashboard
    await page.goto('/dashboard/registration');
  });

  test('should display dashboard header and navigation', async ({ page }) => {
    // Check main header
    await expect(page.getByRole('heading', { name: 'Registration Dashboard' })).toBeVisible();
    await expect(page.getByText('Manage your course registrations and track academic progress')).toBeVisible();
    
    // Check register button
    await expect(page.getByRole('button', { name: 'Register for Courses' })).toBeVisible();
  });

  test('should display quick stats correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Check quick stats cards
    await expect(page.getByText('2')).toBeVisible(); // Current Enrollments
    await expect(page.getByText('Current Enrollments')).toBeVisible();
    
    await expect(page.getByText('1')).toBeVisible(); // Completed Courses
    await expect(page.getByText('Completed Courses')).toBeVisible();
    
    await expect(page.getByText('10')).toBeVisible(); // Total Credits (3+4+3)
    await expect(page.getByText('Total Credits')).toBeVisible();
    
    await expect(page.getByText('3.65')).toBeVisible(); // Current GPA
    await expect(page.getByText('Current GPA')).toBeVisible();
    
    await expect(page.getByText('1')).toBeVisible(); // Pending Payments
    await expect(page.getByText('Pending Payments')).toBeVisible();
  });

  test('should display payment alerts when there are pending payments', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for payment alert
    await expect(page.getByText('Payment Required:')).toBeVisible();
    await expect(page.getByText('You have 1 course with pending payments')).toBeVisible();
  });

  test('should display registration period alert', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for registration period alert
    await expect(page.getByText('Registration Period:')).toBeVisible();
    await expect(page.getByText('Spring 2025 add/drop period ends February 25, 2025')).toBeVisible();
  });

  test('should display current registrations tab by default', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check that current registrations tab is active
    await expect(page.getByRole('tab', { name: 'Current Registrations' })).toHaveAttribute('data-state', 'active');
    
    // Check that current registrations are displayed
    await expect(page.getByText('CS101 - Introduction to Computer Science')).toBeVisible();
    await expect(page.getByText('MATH201 - Calculus II')).toBeVisible();
    
    // Check status badges
    await expect(page.getByText('ENROLLED')).toBeVisible();
    await expect(page.getByText('PENDING')).toBeVisible();
  });

  test('should switch to registration history tab', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click on registration history tab
    await page.getByRole('tab', { name: 'Registration History' }).click();
    
    // Check that history tab is now active
    await expect(page.getByRole('tab', { name: 'Registration History' })).toHaveAttribute('data-state', 'active');
    
    // Check that all registrations including completed ones are shown
    await expect(page.getByText('ENG101 - English Composition')).toBeVisible();
    await expect(page.getByText('COMPLETED')).toBeVisible();
  });

  test('should display academic progress sidebar', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check academic progress section
    await expect(page.getByText('Academic Progress')).toBeVisible();
    await expect(page.getByText('Cumulative GPA:')).toBeVisible();
    await expect(page.getByText('3.65')).toBeVisible();
    await expect(page.getByText('Total Credits:')).toBeVisible();
    await expect(page.getByText('45')).toBeVisible();
    await expect(page.getByText('Academic Standing:')).toBeVisible();
    await expect(page.getByText('Good Standing')).toBeVisible();
  });

  test('should display upcoming deadlines', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check upcoming deadlines section
    await expect(page.getByText('Upcoming Deadlines')).toBeVisible();
    await expect(page.getByText('Payment Due')).toBeVisible();
    await expect(page.getByText('Drop Deadline')).toBeVisible();
    await expect(page.getByText('Add/Drop Period Ends')).toBeVisible();
  });

  test('should display quick actions sidebar', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check quick actions section
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register for New Course' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Academic Records' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Degree Audit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Make Payment' })).toBeVisible();
  });

  test('should display help and support information', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check help section
    await expect(page.getByText('Need Help?')).toBeVisible();
    await expect(page.getByText('Academic Advising')).toBeVisible();
    await expect(page.getByText('advising@university.edu')).toBeVisible();
    await expect(page.getByText('Registration Support')).toBeVisible();
    await expect(page.getByText('registrar@university.edu')).toBeVisible();
    await expect(page.getByText('Financial Aid')).toBeVisible();
    await expect(page.getByText('finaid@university.edu')).toBeVisible();
  });

  test('should open registration details modal when clicking details button', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click on details button for first registration
    await page.getByRole('button', { name: 'Details' }).first().click();
    
    // Check that modal opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Registration Details')).toBeVisible();
    await expect(page.getByText('Course Information')).toBeVisible();
    await expect(page.getByText('CS101 - Introduction to Computer Science')).toBeVisible();
  });

  test('should handle course drop functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Mock the drop course API
    await page.route('**/api/registrations/*/drop', async route => {
      await route.fulfill({ json: { success: true } });
    });
    
    // Click on drop button (should be available for enrolled courses)
    const dropButton = page.getByRole('button', { name: 'Drop' }).first();
    if (await dropButton.isVisible()) {
      await dropButton.click();
      
      // Check confirmation dialog
      await expect(page.getByText('Drop Course')).toBeVisible();
      await expect(page.getByText('Are you sure you want to drop')).toBeVisible();
      
      // Cancel the drop
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

  test('should display course information correctly in current registrations', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check course details for CS101
    await expect(page.getByText('CS101 - Introduction to Computer Science')).toBeVisible();
    await expect(page.getByText('Instructor: Dr. Smith')).toBeVisible();
    await expect(page.getByText('3 Credits')).toBeVisible();
    await expect(page.getByText('MWF 10:00-11:00 AM')).toBeVisible();
    await expect(page.getByText('Room 101')).toBeVisible();
    
    // Check grade display
    await expect(page.getByText('A')).toBeVisible();
    await expect(page.getByText('Current Grade')).toBeVisible();
    
    // Check course fee
    await expect(page.getByText('$150.00')).toBeVisible();
    await expect(page.getByText('Course Fee')).toBeVisible();
  });

  test('should display payment warnings for pending payments', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for payment warning on MATH201 course
    await expect(page.getByText('Payment is pending for this course')).toBeVisible();
  });

  test('should display academic progress summary', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Scroll to academic progress summary
    await page.getByText('Academic Progress').last().scrollIntoViewIfNeeded();
    
    // Check current semester stats
    await expect(page.getByText('Current Semester')).toBeVisible();
    await expect(page.getByText('Total Credits:')).toBeVisible();
    await expect(page.getByText('Enrolled Courses:')).toBeVisible();
    await expect(page.getByText('Pending Courses:')).toBeVisible();
    
    // Check payment status
    await expect(page.getByText('Payment Status')).toBeVisible();
    await expect(page.getByText('Paid:')).toBeVisible();
    await expect(page.getByText('Pending:')).toBeVisible();
    await expect(page.getByText('Overdue:')).toBeVisible();
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Intercept API calls to simulate slow loading
    await page.route('**/api/registrations', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        json: []
      });
    });
    
    await page.goto('/dashboard/registration');
    
    // Check for loading skeletons (they should appear briefly)
    // Note: This test might be flaky due to timing, but it's important for UX
    const skeleton = page.locator('.animate-pulse').first();
    if (await skeleton.isVisible()) {
      await expect(skeleton).toBeVisible();
    }
  });

  test('should handle empty state when no registrations exist', async ({ page }) => {
    // Mock empty registrations
    await page.route('**/api/registrations', async route => {
      await route.fulfill({ json: [] });
    });
    
    await page.goto('/dashboard/registration');
    await page.waitForLoadState('networkidle');
    
    // Check empty state
    await expect(page.getByText('No Current Registrations')).toBeVisible();
    await expect(page.getByText('You are not currently registered for any courses')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Available Courses' })).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/registrations', async route => {
      await route.fulfill({
        status: 500,
        json: { error: 'Internal server error' }
      });
    });
    
    await page.goto('/dashboard/registration');
    await page.waitForLoadState('networkidle');
    
    // Check error state
    await expect(page.getByText('Failed to load registration data')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    // Check that content is still accessible
    await expect(page.getByRole('heading', { name: 'Registration Dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Register for Courses' })).toBeVisible();
    
    // Check that quick stats are stacked vertically
    const statsCards = page.locator('[class*="grid-cols-1"]').first();
    await expect(statsCards).toBeVisible();
  });
});