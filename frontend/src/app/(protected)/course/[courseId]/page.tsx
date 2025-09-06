'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CourseDetails from '@/components/university/courses/CourseDetails';
import { RegistrationService } from '@/lib/api/registrations';
import { toast } from 'sonner';

export default function UnifiedCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = params.courseId ? parseInt(params.courseId as string) : NaN;
  const tabParam = (searchParams.get('tab') || '').toLowerCase();
  const TABS = ['overview','schedule','enrollment','students','gradebook'] as const;
  type Tab = typeof TABS[number];
  const initialTab: Tab | undefined = (TABS as readonly string[]).includes(tabParam)
    ? (tabParam as Tab)
    : undefined;

  const handleBack = () => {
    router.push('/courses');
  };

  const handleEdit = () => {
    if (!isNaN(courseId)) {
      router.push(`/courses?edit=${courseId}`);
    }
  };

  const handleRegister = async (id: number) => {
    try {
      const res = await RegistrationService.enrollInCourse(id);
      if (res) {
        toast.success('Enrolled successfully');
      } else {
        toast.error('Failed to enroll');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to enroll';
      toast.error(msg);
    }
  };

  if (Number.isNaN(courseId)) {
    router.push('/courses');
    return null;
  }

  return (
    <CourseDetails
      courseId={courseId}
      onEdit={handleEdit}
      onBack={handleBack}
      onRegister={handleRegister}
      initialTab={initialTab}
    />
  );
}
