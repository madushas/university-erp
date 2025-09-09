'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { paths } from '@/lib/api/schema';

// Only backend-supported roles
const ROLES = ['ADMIN', 'INSTRUCTOR', 'STUDENT'] as const;
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'PENDING_APPROVAL'] as const;

type BasicResponse = { data?: unknown; error?: unknown };
type CreateUserBody = paths['/api/v1/admin/users']['post']['requestBody']['content']['application/json'];
type UpdateUserBody = paths['/api/v1/admin/users/{id}']['put']['requestBody']['content']['application/json'];
type UserResponse = paths['/api/v1/admin/users/{id}']['get']['responses']['200']['content']['*/*'];

type AdminUserFormProps = {
  mode: 'create' | 'edit';
  userId?: number;
  initialData?: Partial<{
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    phoneNumber?: string;
    department?: string;
  }>;
  onSuccess?: (userId?: number) => void;
};

export default function AdminUserForm({ mode, userId, initialData, onSuccess }: AdminUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit' && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    username: initialData?.username || '',
    email: initialData?.email || '',
    password: '', // only used on create
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    role: (initialData?.role as string) || 'STUDENT',
    status: (initialData?.status as string) || 'ACTIVE',
    phoneNumber: initialData?.phoneNumber || '',
    department: initialData?.department || '',
  });

  // If editing and no initial data supplied, fetch it
  useEffect(() => {
    const fetchUser = async () => {
      if (mode === 'edit' && userId && !initialData) {
        try {
          setLoading(true);
          const res = await api.admin.users.getById(userId);
          if ((res as unknown as BasicResponse).error) throw new Error(String((res as unknown as BasicResponse).error));
          const u = (res as unknown as BasicResponse).data as UserResponse;
          setForm((prev) => ({
            ...prev,
            username: u.username || '',
            email: u.email || '',
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            role: u.role || 'STUDENT',
            status: u.status || 'ACTIVE',
            phoneNumber: u.phoneNumber || '',
            department: u.department || '',
          }));
          setError(null);
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Failed to load user';
          setError(msg);
          toast.error(msg);
        } finally {
          setLoading(false);
        }
      }
    };
    void fetchUser();
  }, [mode, userId, initialData]);

  const validate = (): boolean => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('First and last name are required');
      return false;
    }
    if (mode === 'create') {
      if (!form.username.trim()) { toast.error('Username is required'); return false; }
      if (!form.email.trim()) { toast.error('Email is required'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { toast.error('Invalid email'); return false; }
      if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validate()) return;
      setSaving(true);

      if (mode === 'create') {
        const body = {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role,
          status: form.status,
          phoneNumber: form.phoneNumber || undefined,
          department: form.department || undefined,
        } as unknown as CreateUserBody;
        const res = await api.admin.users.create(body);
        if ((res as unknown as BasicResponse).error) throw new Error(String((res as unknown as BasicResponse).error));
        const created = (res as unknown as BasicResponse).data as UserResponse;
        toast.success('User created');
        onSuccess?.((created as { id?: number }).id);
        router.push('/admin/users');
      } else {
        if (!userId) throw new Error('Missing user id');
        const body = {
          username: form.username.trim(),
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role,
          status: form.status,
          phoneNumber: form.phoneNumber || undefined,
          department: form.department || undefined,
        } as unknown as UpdateUserBody;
        const res = await api.admin.users.update(userId, body);
        if ((res as unknown as BasicResponse).error) throw new Error(String((res as unknown as BasicResponse).error));
        toast.success('User updated');
        onSuccess?.(userId);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== 'edit' || !userId) return;
    try {
      if (!confirm('Are you sure you want to delete this user?')) return;
      setSaving(true);
      const res = await api.admin.users.delete(userId);
      if ((res as unknown as BasicResponse).error) throw new Error(String((res as unknown as BasicResponse).error));
      toast.success('User deleted');
      router.push('/admin/users');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading user...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" /> {error}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{mode === 'create' ? 'Create User' : 'Edit User'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" disabled={mode === 'edit'} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </div>
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Optional" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {mode === 'edit' ? (
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          ) : <div />}
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
