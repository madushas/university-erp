'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GradebookStubPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gradebook (Coming Soon)</h1>
          <p className="text-gray-600 mt-1">Manage grades and assessments for course {courseId}.</p>
        </div>
        <Link href={`/course/${courseId}`}>
          <Button variant="outline">Back to Course</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planned Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-disc pl-5 text-gray-700">
            <li>Roster with enrolled students</li>
            <li>Assignment creation and weighting</li>
            <li>Grade entry with validation</li>
            <li>Export to CSV</li>
            <li>Audit log of grade changes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
