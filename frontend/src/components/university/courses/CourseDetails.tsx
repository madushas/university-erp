'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCourse } from '@/lib/hooks/useCourses';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCourseRegistrations, RegistrationService } from '@/lib/api/registrations';
import { RegistrationDto } from '@/lib/types/registration';

interface CourseDetailsProps {
  courseId: number;
  onEdit?: () => void;
  onBack?: () => void;
  onRegister?: (courseId: number) => void;
  initialTab?: TabType;
}

type TabType = 'overview' | 'schedule' | 'enrollment' | 'students' | 'gradebook';

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PUBLISHED':
      return 'bg-blue-100 text-blue-800';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800';
    case 'ARCHIVED':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatTime = (time?: unknown) => {
  if (!time) return 'TBA';
  if (typeof time === 'string') {
    const parts = time.split(':');
    if (parts.length >= 2) {
      const [hh, mm] = parts;
      return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
    }
    return time;
  }
  if (typeof time === 'object' && time !== null && 'hour' in (time as Record<string, unknown>)) {
    const t = time as { hour?: number; minute?: number };
    const hour = String(t.hour ?? 0).padStart(2, '0');
    const minute = String(t.minute ?? 0).padStart(2, '0');
    return `${hour}:${minute}`;
  }
  return 'TBA';
};

export default function CourseDetails({ 
  courseId, 
  onEdit, 
  onBack, 
  onRegister,
  initialTab
}: CourseDetailsProps) {
  const { course, loading, error, clearError } = useCourse(courseId);
  const { canManageCourses, isStudent, isInstructor } = useRoleAccess();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab ?? 'overview');
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<number, string>>({});

  const canManage = canManageCourses();
  const isStudentUser = isStudent();
  const isInstructorUser = isInstructor();
  const canViewStudents = canManage || (isInstructorUser && typeof user?.id === 'number' && course?.instructorId === user.id);
  const canGrade = canManage; // TODO: enable instructor grading when backend allows

  useEffect(() => {
    if (!(activeTab === 'students' || activeTab === 'gradebook')) return;
    if (!canViewStudents) return;
    const run = async () => {
      try {
        setRegLoading(true);
        setRegError(null);
        const data = await getCourseRegistrations(courseId);
        setRegistrations(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load enrolled students';
        setRegError(msg);
      } finally {
        setRegLoading(false);
      }
    };
    run();
  }, [activeTab, canViewStudents, courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex justify-between items-center">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" size="sm" onClick={clearError}>
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Course not found</p>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  const enrollmentPercentage = course.maxStudents && course.maxStudents > 0
    ? ((course.enrolledStudents || 0) / course.maxStudents) * 100
    : 0;

  const canEnroll = isStudentUser && 
    course.status === 'ACTIVE' && 
    (course.enrolledStudents || 0) < (course.maxStudents || 0);

  // Build tab list dynamically based on permissions
  const baseTabs: TabType[] = ['overview', 'schedule', 'enrollment'];
  const extraTabs: TabType[] = canViewStudents ? ['students', 'gradebook'] : [];
  const tabs: TabType[] = [...baseTabs, ...extraTabs];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{course.code}</h1>
              <Badge className={getStatusColor(course.status)}>
                {course.status}
              </Badge>
            </div>
            <h2 className="text-xl text-gray-700">{course.title}</h2>
          </div>
        </div>

        <div className="flex gap-2">
          {canEnroll && (
            <Button
              onClick={() => onRegister?.(course.id!)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Register for Course
            </Button>
          )}
          {canManage && (
            <Button variant="outline" onClick={onEdit}>
              Edit Course
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TabType)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {course.description || 'No description available for this course.'}
              </p>
            </Card>

            {course.prerequisites && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h3>
                <p className="text-gray-700">{course.prerequisites}</p>
              </Card>
            )}

            {course.textbook && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Textbook</h3>
                <p className="text-gray-700">{course.textbook}</p>
              </Card>
            )}

            {course.syllabusUrl && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Materials</h3>
                <a
                  href={course.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View Syllabus
                </a>
              </Card>
            )}
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Instructor:</span>
                  <span className="text-gray-900 font-medium">{course.instructorName || 'TBA'}</span>
                </div>
                {course.instructorEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <a
                      href={`mailto:${course.instructorEmail}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {course.instructorEmail}
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Credits:</span>
                  <span className="text-gray-900 font-medium">{course.credits}</span>
                </div>
                {course.department && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span className="text-gray-900 font-medium">{course.department}</span>
                  </div>
                )}
                {course.courseLevel && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Level:</span>
                    <span className="text-gray-900 font-medium">{course.courseLevel}</span>
                  </div>
                )}
                {course.passingGrade && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passing Grade:</span>
                    <span className="text-gray-900 font-medium">{course.passingGrade}</span>
                  </div>
                )}
                {course.courseFee && course.courseFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Course Fee:</span>
                    <span className="text-gray-900 font-medium">${course.courseFee}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Enrolled:</span>
                  <span className="text-gray-900 font-medium">
                    {course.enrolledStudents || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacity:</span>
                  <span className="text-gray-900 font-medium">
                    {course.maxStudents || 'No limit'}
                  </span>
                </div>
                {course.minStudents && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Minimum:</span>
                    <span className="text-gray-900 font-medium">{course.minStudents}</span>
                  </div>
                )}
                
                {course.maxStudents && course.maxStudents > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Enrollment Progress</span>
                      <span>{Math.round(enrollmentPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, enrollmentPercentage)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Schedule
                </label>
                <p className="text-gray-900">{course.schedule || 'TBA'}</p>
              </div>
              
              {course.daysOfWeek && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Days of Week
                  </label>
                  <p className="text-gray-900">{course.daysOfWeek}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Start Time
                  </label>
                  <p className="text-gray-900">{formatTime(course.startTime)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    End Time
                  </label>
                  <p className="text-gray-900">{formatTime(course.endTime)}</p>
                </div>
              </div>
              
              {course.classroom && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Classroom
                  </label>
                  <p className="text-gray-900">{course.classroom}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Dates</h3>
            <div className="space-y-4">
              {course.startDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(course.startDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {course.endDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    End Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(course.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {course.startDate && course.endDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Duration
                  </label>
                  <p className="text-gray-900">
                    {Math.ceil(
                      (new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) 
                      / (1000 * 60 * 60 * 24 * 7)
                    )} weeks
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'enrollment' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {course.enrolledStudents || 0}
                </div>
                <div className="text-sm text-gray-500">Enrolled Students</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {course.maxStudents || '∞'}
                </div>
                <div className="text-sm text-gray-500">Maximum Capacity</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {course.maxStudents 
                    ? Math.max(0, course.maxStudents - (course.enrolledStudents || 0))
                    : '∞'
                  }
                </div>
                <div className="text-sm text-gray-500">Available Spots</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(enrollmentPercentage)}%
                </div>
                <div className="text-sm text-gray-500">Enrollment Rate</div>
              </div>
            </div>
            
            {course.maxStudents && course.maxStudents > 0 && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, enrollmentPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>0</span>
                  <span>{course.maxStudents} students</span>
                </div>
              </div>
            )}
          </Card>

          {(canManage || (isInstructorUser && typeof user?.id === 'number' && course.instructorId === user.id)) && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Management</h3>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setActiveTab('students')}>
                  View Enrolled Students
                </Button>
                <Button variant="outline">
                  Export Student List
                </Button>
                <Button variant="outline">
                  Manage Waitlist
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Students</h3>
            {regLoading && (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {regError && (
              <div className="text-red-600 text-sm">{regError}</div>
            )}
            {!regLoading && !regError && (
              registrations.length === 0 ? (
                <div className="text-gray-600">No students enrolled yet.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {registrations.map((reg) => (
                    <Card key={reg.id} className="p-4">
                      <div className="font-medium text-gray-900">{reg.user?.firstName} {reg.user?.lastName}</div>
                      <div className="text-sm text-gray-600">{reg.user?.email}</div>
                      <div className="text-sm text-gray-700 mt-2">Status: {reg.status}</div>
                      {reg.grade && <div className="text-sm text-gray-700">Grade: {reg.grade}</div>}
                    </Card>
                  ))}
                </div>
              )
            )}
          </Card>
        </div>
      )}

      {activeTab === 'gradebook' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gradebook</h3>
            {!canViewStudents && (
              <div className="text-gray-600">You are not authorized to view this section.</div>
            )}
            {canViewStudents && (
              registrations.length === 0 ? (
                <div className="text-gray-600">No registrations available.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Grade</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Grade</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((reg) => (
                        <tr key={reg.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{reg.user?.firstName} {reg.user?.lastName}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{reg.status}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{reg.grade || '-'}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                              placeholder="e.g. A"
                              disabled={!canGrade}
                              value={gradeInputs[reg.id!] || ''}
                              onChange={(e) => setGradeInputs((prev) => ({ ...prev, [reg.id!]: e.target.value }))}
                            />
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canGrade}
                              onClick={async () => {
                                const grade = gradeInputs[reg.id!];
                                if (!grade) return;
                                const updated = await RegistrationService.updateRegistrationGrade(reg.id!, grade);
                                if (updated) {
                                  const data = await getCourseRegistrations(courseId);
                                  setRegistrations(data);
                                }
                              }}
                            >
                              Update
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!canGrade && (
                    <p className="text-xs text-gray-500 mt-2">Grade updates are restricted to administrators. (TODO: enable instructor grading)</p>
                  )}
                </div>
              )
            )}
          </Card>
        </div>
      )}
    </div>
  );
}