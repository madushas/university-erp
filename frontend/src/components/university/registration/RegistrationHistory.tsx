'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  History, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Search,
  Download,
  Eye,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import { useRegistrations } from '@/lib/hooks/useRegistrations';
import { RegistrationValidationUtils } from '@/lib/utils/registrationValidation';
import type { RegistrationDto } from '@/lib/types/registration';

interface RegistrationHistoryProps {
  onViewDetails?: (registration: RegistrationDto) => void;
  className?: string;
}

export function RegistrationHistory({
  onViewDetails,
  className = ''
}: RegistrationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [semesterFilter] = useState<string>('all');

  const { registrations, loading, error } = useRegistrations();

  // Filter and search registrations
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Search filter
      const searchMatch = !searchTerm || 
        reg.course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.course?.instructor?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || reg.status === statusFilter;

      // Semester filter (simplified - would need actual semester data)
      const semesterMatch = semesterFilter === 'all'; // For now, show all

      return searchMatch && statusMatch && semesterMatch;
    });
  }, [registrations, searchTerm, statusFilter, semesterFilter]);

  // Group registrations by status
  const registrationsByStatus = useMemo(() => {
    return filteredRegistrations.reduce((acc, reg) => {
      const status = reg.status || 'UNKNOWN';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(reg);
      return acc;
    }, {} as Record<string, RegistrationDto[]>);
  }, [filteredRegistrations]);

  // Calculate academic statistics
  const academicStats = useMemo(() => {
    const completedRegistrations = registrations.filter(reg => reg.status === 'COMPLETED');
    const totalCredits = completedRegistrations.reduce((sum, reg) => sum + (reg.course?.credits || 0), 0);
    const gpa = RegistrationValidationUtils.calculateGPA(registrations);
    const completionRate = registrations.length > 0 
      ? (completedRegistrations.length / registrations.length) * 100 
      : 0;

    return {
      totalCourses: registrations.length,
      completedCourses: completedRegistrations.length,
      totalCredits,
      gpa,
      completionRate,
      academicStanding: RegistrationValidationUtils.getAcademicStanding(gpa, totalCredits)
    };
  }, [registrations]);

  // Get semester breakdown (simplified)
  const semesterBreakdown = useMemo(() => {
    const semesters = new Map<string, {
      courses: number;
      credits: number;
      gpa: number;
      registrations: RegistrationDto[];
    }>();

    registrations.forEach(reg => {
      // Simplified semester extraction from registration date
      const semester = reg.registrationDate 
        ? `${new Date(reg.registrationDate).getFullYear()} Fall` // Simplified
        : 'Unknown';

      if (!semesters.has(semester)) {
        semesters.set(semester, {
          courses: 0,
          credits: 0,
          gpa: 0,
          registrations: []
        });
      }

      const semesterData = semesters.get(semester)!;
      semesterData.courses += 1;
      semesterData.credits += reg.course?.credits || 0;
      semesterData.registrations.push(reg);
    });

    // Calculate GPA for each semester
    semesters.forEach((data) => {
      data.gpa = RegistrationValidationUtils.calculateGPA(data.registrations);
    });

    return Array.from(semesters.entries()).map(([semester, data]) => ({
      semester,
      ...data
    }));
  }, [registrations]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load registration history: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Registration History
          </CardTitle>
          <CardDescription>
            View your complete academic registration history and progress
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Academic Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {academicStats.totalCourses}
              </div>
              <div className="text-sm text-blue-600 font-medium">Total Courses</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {academicStats.gpa.toFixed(2)}
              </div>
              <div className="text-sm text-green-600 font-medium">Cumulative GPA</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {academicStats.totalCredits}
              </div>
              <div className="text-sm text-purple-600 font-medium">Total Credits</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {academicStats.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-600 font-medium">Completion Rate</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gray-600" />
              <span className="font-medium">Academic Standing:</span>
              <Badge variant="outline" className="ml-2">
                {academicStats.academicStanding}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by course code, title, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
                <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="semesters">By Semester</TabsTrigger>
          <TabsTrigger value="status">By Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Courses Tab */}
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Registrations Found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No registrations match your current filters.'
                    : 'You have no registration history yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRegistrations.map((registration) => (
              <RegistrationCard
                key={registration.id}
                registration={registration}
                onViewDetails={onViewDetails}
              />
            ))
          )}
        </TabsContent>

        {/* By Semester Tab */}
        <TabsContent value="semesters" className="space-y-4">
          {semesterBreakdown.map((semester) => (
            <Card key={semester.semester}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{semester.semester}</span>
                  <div className="flex gap-4 text-sm">
                    <span>{semester.courses} courses</span>
                    <span>{semester.credits} credits</span>
                    <span>GPA: {semester.gpa.toFixed(2)}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {semester.registrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    onViewDetails={onViewDetails}
                    compact
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* By Status Tab */}
        <TabsContent value="status" className="space-y-4">
          {Object.entries(registrationsByStatus).map(([status, regs]) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{status}</Badge>
                    <span className="text-lg">{regs.length} courses</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {regs.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                    onViewDetails={onViewDetails}
                    compact
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GPA Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  GPA Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {semesterBreakdown.map((semester) => (
                    <div key={semester.semester} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{semester.semester}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(semester.gpa / 4) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {semester.gpa.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                    const count = registrations.filter(reg => 
                      reg.grade?.startsWith(grade)
                    ).length;
                    const percentage = registrations.length > 0 
                      ? (count / registrations.length) * 100 
                      : 0;

                    return (
                      <div key={grade} className="flex justify-between items-center">
                        <span className="text-sm font-medium">Grade {grade}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                grade === 'A' ? 'bg-green-600' :
                                grade === 'B' ? 'bg-blue-600' :
                                grade === 'C' ? 'bg-yellow-600' :
                                grade === 'D' ? 'bg-orange-600' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Registration Card Component
interface RegistrationCardProps {
  registration: RegistrationDto;
  onViewDetails?: (registration: RegistrationDto) => void;
  compact?: boolean;
}

function RegistrationCard({ registration, onViewDetails, compact = false }: RegistrationCardProps) {
  const course = registration.course;

  return (
    <Card className={`${compact ? 'shadow-sm' : 'hover:shadow-md'} transition-shadow`}>
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
                {course?.code} - {course?.title}
              </h3>
              <Badge 
                variant="outline" 
                className={RegistrationValidationUtils.getStatusColor(registration.status)}
              >
                {registration.status}
              </Badge>
            </div>
            
            {!compact && (
              <p className="text-gray-600 mb-3 line-clamp-1">
                {course?.description || 'No description available'}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Instructor: {course?.instructor}</span>
              <span>{course?.credits} Credits</span>
              {registration.registrationDate && (
                <span>
                  {new Date(registration.registrationDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {registration.grade && (
              <div className="text-right">
                <div className={`text-lg font-semibold ${RegistrationValidationUtils.getGradeColor(registration.grade)}`}>
                  {registration.grade}
                </div>
                {registration.gradePoints && (
                  <div className="text-xs text-gray-500">
                    {registration.gradePoints.toFixed(2)} pts
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails?.(registration)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}