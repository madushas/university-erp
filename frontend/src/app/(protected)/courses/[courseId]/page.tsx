'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LegacyCourseDetailsRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params.courseId as string;
    if (id) {
      router.replace(`/course/${id}`);
    } else {
      router.replace('/courses');
    }
  }, [params.courseId, router]);

  return null;
}
