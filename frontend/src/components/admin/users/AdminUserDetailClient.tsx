'use client';

import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import AdminUserForm from '@/components/admin/users/AdminUserForm';

export default function AdminUserDetailClient({ id }: { id: number }) {
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">User #{id}</h1>
      <AdminUserForm mode="edit" userId={id} />
    </div>
  );
}
