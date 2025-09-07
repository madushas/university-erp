/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StudentRegistrationDashboard } from '../StudentRegistrationDashboard';

// Mock the hooks
jest.mock('@/lib/hooks/useRegistrations', () => ({
  useRegistrations: () => ({
    registrations: [
      {
        id: 1,
        status: 'ENROLLED',
        paymentStatus: 'PAID',
        registrationDate: '2025-01-15T10:00:00Z',
        grade: 'A',
        gradePoints: 4.0,
        course: {
          id: 1,
          code: 'CS101',
          title: 'Introduction to Computer Science',
          credits: 3,
          instructor: 'Dr. Smith',
          department: 'Computer Science'
        }
      }
    ],
    loading: false,
    error: null,
    dropCourse: jest.fn(),
    refresh: jest.fn()
  }),
  useStudentAcademicRecord: () => ({
    academicRecord: {
      gpa: 3.65,
      totalCredits: 45,
      academicStanding: 'Good Standing'
    },
    loading: false
  })
}));

describe('StudentRegistrationDashboard', () => {
  it('renders dashboard header', () => {
    render(<StudentRegistrationDashboard />);
    
    expect(screen.getByText('Registration Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage your course registrations and track academic progress')).toBeInTheDocument();
  });

  it('displays quick stats', () => {
    render(<StudentRegistrationDashboard />);
    
    expect(screen.getByText('Current Enrollments')).toBeInTheDocument();
    expect(screen.getByText('Completed Courses')).toBeInTheDocument();
    expect(screen.getByText('Total Credits')).toBeInTheDocument();
    expect(screen.getByText('Current GPA')).toBeInTheDocument();
  });

  it('displays academic progress information', () => {
    render(<StudentRegistrationDashboard />);
    
    expect(screen.getByText('Academic Progress')).toBeInTheDocument();
    expect(screen.getByText('3.65')).toBeInTheDocument();
    expect(screen.getByText('Good Standing')).toBeInTheDocument();
  });
});