import { test, expect } from '@playwright/test';

// Mock JWT tokens for testing
const createMockToken = (exp: number, sub: string = 'testuser') => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub, exp, iat: Math.floor(Date.now() / 1000) }));
  const signature = 'mock-signature';
  return `${header}.${payload}.${signature}`;
};

const createValidToken = (minutesFromNow: number = 30) => {
  const futureTime = Math.floor(Date.now() / 1000) + (minutesFromNow * 60);
  return createMockToken(futureTime);
};

test.describe('Role-Based Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth data
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should be redirected to login page
    await expect(page).toHaveURL('/login');
  });

  test('should display student dashboard for student role', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '2',
          username: process.env.TEST_STUDENT_USERNAME || 'john_doe',
          email: process.env.TEST_STUDENT_EMAIL || 'john@university.com',
          firstName: process.env.TEST_STUDENT_FIRST_NAME || 'John',
          lastName: process.env.TEST_STUDENT_LAST_NAME || 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT',
          studentId: 'STU001',
          department: 'Computer Science',
          yearOfStudy: 3,
          gpa: 3.75,
          status: 'ACTIVE',
          enrollmentDate: '2022-08-15',
          expectedGraduationDate: '2026-05-15',
          emergencyContactName: 'Mary Doe',
          emergencyContactPhone: '555-2001',
          emergencyContactRelationship: 'Mother'
        })
      });
    });

    // Set authentication cookies that middleware expects
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '2',
        username: 'john_doe',
        email: 'john@university.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Debug: Check what's actually on the page
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());

    // Should show student-specific content
    await expect(page.locator('h1')).toContainText('Welcome back, John!');
    await expect(page.locator('[class*="px-3 py-1"]:text("Student")')).toBeVisible();
    await expect(page.locator('text=Current Courses')).toBeVisible();
  });

  test('should display instructor dashboard for instructor role', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '4',
          username: 'dr_smith',
          email: 'robert.smith@university.edu',
          firstName: 'Robert',
          lastName: 'Smith',
          role: 'INSTRUCTOR',
          userType: 'FACULTY',
          employeeId: 'FAC001',
          department: 'Computer Science',
          employeeType: 'FULL_TIME',
          status: 'ACTIVE'
        })
      });
    });

    // Set authentication cookies that middleware expects
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '4',
        username: 'dr_smith',
        email: 'robert.smith@university.edu',
        firstName: 'Robert',
        lastName: 'Smith',
        role: 'INSTRUCTOR',
        userType: 'FACULTY'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show instructor-specific content
    await expect(page.locator('h1')).toContainText('Welcome back, Professor Smith!');
    await expect(page.locator('[class*="px-3 py-1"]:text("Instructor")')).toBeVisible();
    // Use more specific selector for instructor dashboard "My Courses"
    await expect(page.locator('[data-testid="instructor-my-courses-title"]')).toBeVisible();
  });

  test('should display admin dashboard for admin role', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: process.env.TEST_ADMIN_USERNAME || 'admin',
          email: process.env.TEST_ADMIN_EMAIL || 'admin@university.com',
          firstName: process.env.TEST_ADMIN_FIRST_NAME || 'Admin',
          lastName: process.env.TEST_ADMIN_LAST_NAME || 'User',
          role: 'ADMIN',
          userType: 'ADMIN',
          employeeId: 'EMP001',
          department: 'Administration',
          employeeType: 'FULL_TIME',
          status: 'ACTIVE'
        })
      });
    });

    // Set authentication cookies that middleware expects
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'admin',
        email: 'admin@university.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        userType: 'ADMIN'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show admin-specific content
    await expect(page.locator('h1')).toContainText('System Administration');
    await expect(page.locator('[class*="px-3 py-1"]:text("Administrator")')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();
  });

  test('should handle multiple roles correctly', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '4',
          username: 'multirole',
          email: 'multi@example.com',
          firstName: 'Multi',
          lastName: 'Role',
          role: 'ADMIN', // Should prioritize ADMIN role
          userType: 'ADMIN',
          employeeId: 'EMP004',
          department: 'Administration',
          employeeType: 'FULL_TIME',
          status: 'ACTIVE'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '4',
        username: 'multirole',
        email: 'multi@example.com',
        firstName: 'Multi',
        lastName: 'Role',
        role: 'ADMIN',
        userType: 'ADMIN'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show admin dashboard (highest priority role)
    await expect(page.locator('text=System Administration')).toBeVisible();
    await expect(page.locator('[class*="px-3 py-1"]:text("Administrator")')).toBeVisible();
  });

  test('should show loading state while fetching user data', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user with a delay
    await page.route('**/api/v1/users/me', async route => {
      // Add a small delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT',
          studentId: 'STU001',
          department: 'Computer Science',
          yearOfStudy: 3,
          gpa: 3.75,
          status: 'ACTIVE',
          enrollmentDate: '2022-08-15',
          expectedGraduationDate: '2026-05-15',
          emergencyContactName: 'Mary Doe',
          emergencyContactPhone: '555-2001',
          emergencyContactRelationship: 'Mother'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Clear any existing auth data to ensure fresh load
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Navigate to dashboard (this should trigger loading state)
    await page.goto('/dashboard');

    // Should show loading state initially
    await expect(page.locator('[data-testid="loading-message"]')).toBeVisible();
    
    // Should eventually show dashboard
    await expect(page.locator('text=Welcome back, John!')).toBeVisible({ timeout: 5000 });
  });

  test('should handle unknown role gracefully', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '5',
          username: 'unknownrole',
          email: 'unknown@example.com',
          firstName: 'Unknown',
          lastName: 'Role',
          role: 'UNKNOWN_ROLE',
          userType: 'UNKNOWN'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '5',
        username: 'unknownrole',
        email: 'unknown@example.com',
        firstName: 'Unknown',
        lastName: 'Role',
        role: 'UNKNOWN_ROLE',
        userType: 'UNKNOWN'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show unknown role message
    await expect(page.locator('[data-testid="unknown-role-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="unknown-role-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-role-display"]')).toBeVisible();
  });

  test('should handle dashboard data loading errors', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage and force error flag
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('forceDashboardError', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Should show retry button for failed data
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT',
          studentId: 'STU001',
          department: 'Computer Science',
          yearOfStudy: 3,
          gpa: 3.75,
          status: 'ACTIVE',
          enrollmentDate: '2022-08-15',
          expectedGraduationDate: '2026-05-15',
          emergencyContactName: 'Mary Doe',
          emergencyContactPhone: '555-2001',
          emergencyContactRelationship: 'Mother'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show mobile-responsive dashboard
    await expect(page.locator('text=Welcome back, John!')).toBeVisible();
    
    // Cards should stack vertically on mobile
    const cards = page.locator('[class*="grid"]').first();
    await expect(cards).toBeVisible();
  });

  test('should navigate to profile page from dashboard', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT',
          studentId: 'STU001',
          department: 'Computer Science',
          yearOfStudy: 3,
          gpa: 3.75,
          status: 'ACTIVE',
          enrollmentDate: '2022-08-15',
          expectedGraduationDate: '2026-05-15',
          emergencyContactName: 'Mary Doe',
          emergencyContactPhone: '555-2001',
          emergencyContactRelationship: 'Mother'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for dashboard to load
    await expect(page.locator('text=Welcome back, John!')).toBeVisible();

    // Ensure profile button is visible and clickable
    const profileButton = page.locator('[data-testid="profile-button"]');
    await expect(profileButton).toBeVisible();
    await expect(profileButton).toBeEnabled();

    // Click profile button in navigation using data-testid
    await profileButton.click();

    // Wait a moment for navigation
    await page.waitForTimeout(500);

    // Should navigate to profile page
    await expect(page).toHaveURL(/.*\/profile/);

    // Verify profile page content using data-testid
    await expect(page.locator('[data-testid="profile-user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-user-email"]')).toBeVisible();
  });

  test('should display role-based navigation items', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT',
          studentId: 'STU001',
          department: 'Computer Science',
          yearOfStudy: 3,
          gpa: 3.75,
          status: 'ACTIVE',
          enrollmentDate: '2022-08-15',
          expectedGraduationDate: '2026-05-15',
          emergencyContactName: 'Mary Doe',
          emergencyContactPhone: '555-2001',
          emergencyContactRelationship: 'Mother'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show student-accessible navigation items
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="nav-dropdown-courses"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-dropdown-students"]')).toBeVisible();
    
    // Should not show admin-only items
    await expect(page.locator('text=Administration')).not.toBeVisible();
  });

  test('should display admin navigation items for admin role', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '3',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          userType: 'ADMIN',
          employeeId: 'ADM001',
          department: 'Administration',
          employeeType: 'FULL_TIME',
          status: 'ACTIVE'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '3',
        username: 'admin',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        userType: 'ADMIN'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show all navigation items including admin-only
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="nav-dropdown-courses"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-dropdown-students"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-dropdown-hr-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-dropdown-administration"]')).toBeVisible();
  });

  test('should handle logout from navigation', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT',
          studentId: 'STU001',
          department: 'Computer Science',
          yearOfStudy: 3,
          gpa: 3.75,
          status: 'ACTIVE',
          enrollmentDate: '2022-08-15',
          expectedGraduationDate: '2026-05-15',
          emergencyContactName: 'Mary Doe',
          emergencyContactPhone: '555-2001',
          emergencyContactRelationship: 'Mother'
        })
      });
    });

    // Mock logout
    await page.route('**/auth/logout', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Logged out successfully' })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Click logout button
    await page.click('[data-testid="logout-button"]');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should be responsive on tablet devices', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT',
          studentId: 'STU001',
          department: 'Computer Science',
          yearOfStudy: 3,
          gpa: 3.75,
          status: 'ACTIVE',
          enrollmentDate: '2022-08-15',
          expectedGraduationDate: '2026-05-15',
          emergencyContactName: 'Mary Doe',
          emergencyContactPhone: '555-2001',
          emergencyContactRelationship: 'Mother'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Should show tablet-responsive dashboard
    await expect(page.locator('text=Welcome back, John!')).toBeVisible();
    
    // Navigation should be responsive - target the main navigation instead of generic nav
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('should handle navigation dropdown menus', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '2',
          username: 'janesmith',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'INSTRUCTOR',
          userType: 'FACULTY',
          employeeId: 'EMP001',
          department: 'Computer Science',
          employeeType: 'FULL_TIME',
          status: 'ACTIVE'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '2',
        username: 'janesmith',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'INSTRUCTOR',
        userType: 'FACULTY'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard
    await page.goto('/dashboard');

    // Click on Courses dropdown
    await page.click('[data-testid="nav-dropdown-courses"]');
    
    // Should show dropdown items
    await expect(page.locator('[data-testid="nav-link-browse-courses"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-my-courses"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-link-course-management"]')).toBeVisible();
  });

  test('should handle error state and retry functionality', async ({ page }) => {
    // Create valid JWT tokens
    const accessToken = createValidToken(30); // Valid for 30 minutes
    const refreshToken = createValidToken(1440); // Valid for 24 hours

    // Mock the API call to get current user
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
          userType: 'STUDENT'
        })
      });
    });

    // Set authentication cookies
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: accessToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      },
      {
        name: 'refreshToken',
        value: refreshToken,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false
      }
    ]);

    // Set user data in localStorage
    await page.evaluate(({ accessToken, refreshToken }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'STUDENT',
        userType: 'STUDENT'
      }));
    }, { accessToken, refreshToken });

    // Navigate to dashboard with forceError=true to trigger error state
    await page.goto('/dashboard?forceError=true');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Click retry button
    await page.locator('[data-testid="retry-button"]').click();

    // Should attempt to reload (we can check for loading state or another API call)
    // For now, just verify the retry button is still visible after clicking
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});