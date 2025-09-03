import { Metadata } from 'next';
import { CourseManagement } from '@/components/university/courses';

export const metadata: Metadata = {
  title: 'Course Management | University ERP',
  description: 'Manage courses, schedules, and enrollment in the university system',
};

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CourseManagement />
    </div>
  );
}