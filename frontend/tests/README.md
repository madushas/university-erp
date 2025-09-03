# Playwright E2E Tests for University ERP Frontend

This directory contains end-to-end tests for the University ERP frontend application using Playwright.

## Test Structure

### Test Files

- **`auth.spec.ts`** - Basic authentication UI tests (form validation, navigation)
- **`dashboard.spec.ts`** - Dashboard functionality and role-based access
- **`auth-api.spec.ts`** - Full API integration tests with real backend
- **`helpers.ts`** - Utility functions and test data helpers

### Test Categories

#### Authentication Tests (`auth.spec.ts`)

- Login page display and form validation
- Registration page display and form validation
- Navigation between login/register pages
- Invalid credentials handling
- Password confirmation validation
- Session persistence and logout

#### Dashboard Tests (`dashboard.spec.ts`)

- Protected route access control
- User information display
- Role-based access control
- Admin dashboard functionality

#### API Integration Tests (`auth-api.spec.ts`)

- Real backend authentication flow
- Token refresh handling
- Session persistence
- Network error handling
- Form validation with API responses

## Prerequisites

1. **Backend must be running** on `http://localhost:8080`
2. **Frontend dev server** will be started automatically by Playwright
3. **Test users** should exist in the backend:
   - Admin: `admin` / `password` (username: `admin`, email: `admin@university.com`)
   - Student: `john_doe` / `password` (username: `john_doe`, email: `john@university.com`)

## Running Tests

### Install Dependencies

```bash
pnpm install
```

### Install Playwright Browsers

```bash
npx playwright install
```

### Run All Tests

```bash
pnpm test
```

### Run Tests in Headed Mode (see browser)

```bash
pnpm run test:headed
```

### Run Tests with UI Mode

```bash
pnpm run test:ui
```

### Run Tests in Debug Mode

```bash
pnpm run test:debug
```

### Run Specific Test File

```bash
npx playwright test auth.spec.ts
npx playwright test dashboard.spec.ts
npx playwright test auth-api.spec.ts
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Configuration

The test configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (frontend)
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start dev server**: Yes
- **Parallel execution**: Enabled
- **Retries**: 2 on CI, 0 locally
- **Traces**: Collected on first retry

## Test Data

### Helper Functions

- `AuthHelper.loginAsStudent(page)` - Simulate student login
- `AuthHelper.loginAsAdmin(page)` - Simulate admin login
- `AuthHelper.loginAsInstructor(page)` - Simulate instructor login
- `AuthHelper.fillLoginForm(page, email, password)` - Fill login form
- `AuthHelper.fillRegisterForm(page, ...)` - Fill registration form

### Test Users

- **Admin**: `admin` / `password` (username: `admin`, email: `admin@university.com`)
- **Student**: `john_doe` / `password` (username: `john_doe`, email: `john@university.com`)
- **Instructor**: `instructor@example.com` / `instructor123`

## Test Coverage

### Authentication Flow

- ✅ Login with valid/invalid credentials
- ✅ User registration
- ✅ Form validation
- ✅ Password confirmation
- ✅ Session persistence
- ✅ Token refresh
- ✅ Logout functionality

### Authorization

- ✅ Protected route access
- ✅ Role-based access control
- ✅ Admin panel restrictions
- ✅ Redirect on unauthorized access

### UI/UX

- ✅ Form display and interaction
- ✅ Navigation between pages
- ✅ Error message display
- ✅ Loading states
- ✅ Responsive design

### API Integration

- ✅ Real backend communication
- ✅ Error handling
- ✅ Token management
- ✅ Network failure scenarios

## Debugging Tests

### View Test Results

```bash
npx playwright show-report
```

### Debug Specific Test

```bash
npx playwright test --debug auth.spec.ts
```

### Slow Motion Mode

```bash
npx playwright test --slowMo=1000
```

## Best Practices

1. **Test Isolation**: Each test clears localStorage and cookies
2. **Realistic Data**: Use realistic test data that matches your backend
3. **Wait Strategies**: Use `waitForURL()` and `waitForTimeout()` appropriately
4. **Error Handling**: Tests handle both success and failure scenarios
5. **Accessibility**: Tests use semantic selectors (`getByRole`, `getByLabel`)

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run E2E Tests
  run: |
    cd frontend
    pnpm install
    npx playwright install
    pnpm test
```

## Troubleshooting

### Backend Not Running

```text
Error: connect ECONNREFUSED 127.0.0.1:8080
```

**Solution**: Start the backend server before running tests

### Frontend Not Starting

```text
Error: connect ECONNREFUSED 127.0.0.1:3000
```

**Solution**: Check if port 3000 is available or update `playwright.config.ts`

### Test Timeouts

**Solution**: Increase timeout in `playwright.config.ts` or add `page.waitForTimeout()`

### Flaky Tests

**Solution**: Add proper wait conditions and avoid race conditions
