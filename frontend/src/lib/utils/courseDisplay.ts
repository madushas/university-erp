import type { CourseDto } from '@/lib/types/course';
import type { RegistrationDto } from '@/lib/types/registration';

// Accept either a CourseDto or a RegistrationDto with nested course
export type CourseSource = CourseDto | RegistrationDto;

function extractCourse(source: CourseSource): Partial<CourseDto> | null {
  if (source && typeof source === 'object' && 'course' in source) {
    const reg = source as RegistrationDto;
    return (reg.course as unknown as Partial<CourseDto>) ?? null;
  }
  return (source as unknown as Partial<CourseDto>) ?? null;
}

export function getCourseId(source: CourseSource): number | undefined {
  const c = extractCourse(source);
  return c?.id ?? undefined;
}

export function getCourseTitle(source: CourseSource): string {
  const c = extractCourse(source);
  return (c?.title ?? '').toString() || 'N/A';
}

export function getCourseCode(source: CourseSource): string {
  const c = extractCourse(source);
  return (c?.code ?? '').toString() || 'N/A';
}

export function getCourseInstructorName(source: CourseSource): string {
  const c = extractCourse(source);
  // Prefer normalized instructorName, fallback to legacy instructor string
  const name = (c?.instructorName ?? c?.instructor ?? '').toString();
  return name || 'N/A';
}

export function getCourseStatus(source: CourseSource): string {
  const c = extractCourse(source);
  return (c?.status ?? '').toString() || 'N/A';
}

export function getCourseCredits(source: CourseSource): string {
  const c = extractCourse(source);
  const credits = c?.credits;
  return typeof credits === 'number' ? String(credits) : 'N/A';
}

export function getCourseLevel(source: CourseSource): string {
  const c = extractCourse(source);
  return (c?.courseLevel ?? '').toString() || 'N/A';
}

export function getCourseDetailsLink(source: CourseSource): string {
  const id = getCourseId(source);
  return id ? `/course/${id}` : '/courses';
}
