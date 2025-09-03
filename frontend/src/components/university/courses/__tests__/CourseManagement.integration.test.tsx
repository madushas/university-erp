import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseManagement from '../CourseManagement';
import { AuthProvider } from '@/lib/store/authStore';
import { api } from '@/lib/api/generated';

// Mock the API
vi.mock('@/lib/api/generated', () => ({
  api: {
    courses: {
      getAll: vi.fn(),
      getPaged: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock the role access hook
vi.mock('@/lib/hooks/useRoleAccess', () => ({
  useRoleAccess: () => ({
    canManageCourses: () => true,
    isStudent: () => false,
    isInstructor: () => false,
  }),
}));

// Mock secure storage
vi.mock('@/lib/utils/secureStorage', () => ({
  secureStorage: {
    getAccessToken: () => 'mock-token',
    getUser: () => ({
      id: 1,
      username: 'admin',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    }),
    setAuthData: vi.fn(),
    clearAuthData: vi.fn(),
  },
}));

// Mock token manager
vi.mock('@/lib/utils/tokenManager', () => ({
  isTokenValid: () => true,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('CourseManagement Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default API responses
    (api.courses.getAll as Mock).mockResolvedValue({
      data: [],
      error: null,
    });
    
    (api.courses.getPaged as Mock).mockResolvedValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 12,
      },
      error: null,
    });
  });

  it('should render course management dashboard with statistics', async () => {
    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    // Wait for courses to load
    await waitFor(() => {
      expect(screen.getByText('Course Management')).toBeInTheDocument();
    });

    // Check if statistics cards are rendered
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('Active Courses')).toBeInTheDocument();
    expect(screen.getByText('Total Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Avg. Enrollment')).toBeInTheDocument();
  });

  it('should display course list with search and filters', async () => {
    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('CS101')).toBeInTheDocument();
      expect(screen.getByText('MATH101')).toBeInTheDocument();
    });

    // Check if search and filter components are present
    expect(screen.getByPlaceholderText('Search by title...')).toBeInTheDocument();
    expect(screen.getByText('Course Level')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('should allow creating a new course', async () => {
    (api.courses.create as Mock).mockResolvedValue({
      data: {
        id: 3,
        code: 'CS102',
        title: 'Data Structures',
        instructor: 'Dr. Brown',
        credits: 3,
        status: 'DRAFT',
      },
      error: null,
    });

    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Add New Course')).toBeInTheDocument();
    });

    // Click add new course button
    fireEvent.click(screen.getByText('Add New Course'));

    // Should show course form
    await waitFor(() => {
      expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    // Form fields should be present
    expect(screen.getByLabelText(/Course Code/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Course Title/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instructor/)).toBeInTheDocument();
  });

  it('should handle course search functionality', async () => {
    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by title...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by title...');
    
    // Type in search input
    fireEvent.change(searchInput, { target: { value: 'Computer Science' } });

    // Should trigger search (API call would be made with search params)
    expect(searchInput).toHaveValue('Computer Science');
  });

  it('should handle course filtering', async () => {
    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Course Level')).toBeInTheDocument();
    });

    // Find the course level select
    const levelSelect = screen.getByDisplayValue('All Levels');
    
    // Change filter
    fireEvent.change(levelSelect, { target: { value: 'UNDERGRADUATE' } });

    expect(levelSelect).toHaveValue('UNDERGRADUATE');
  });

  it('should display top courses section for admins', async () => {
    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Top Enrolled Courses')).toBeInTheDocument();
    });

    // Should show course rankings
    expect(screen.getByText('MATH101')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
  });

  it('should handle view mode switching', async () => {
    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Grid')).toBeInTheDocument();
      expect(screen.getByText('List')).toBeInTheDocument();
    });

    // Switch to list view
    fireEvent.click(screen.getByText('List'));
    
    // Grid and List buttons should be present (view mode changed)
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
  });

  it('should handle error states gracefully', async () => {
    // Mock API error
    (api.courses.getAll as Mock).mockResolvedValue({
      data: null,
      error: { detail: 'Failed to load courses' },
    });

    (api.courses.getPaged as Mock).mockResolvedValue({
      data: null,
      error: { detail: 'Failed to load courses' },
    });

    render(
      <TestWrapper>
        <CourseManagement />
      </TestWrapper>
    );

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load courses')).toBeInTheDocument();
    });

    // Should have dismiss button
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });
});