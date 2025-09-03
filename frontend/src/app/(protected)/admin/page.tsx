'use client';

import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const { isAdmin } = useRoleAccess();

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don&apos;t have permission to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}