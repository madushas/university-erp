'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/generated';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

// Types from OpenAPI schema (loosely typed for safety)
import type { paths } from '@/lib/api/schema';

type UserResponse = paths['/api/v1/admin/users/{id}']['get']['responses']['200']['content']['*/*'] extends infer T
  ? T
  : unknown;

type PagedUsers = paths['/api/v1/admin/users']['get']['responses']['200']['content']['*/*'] extends infer T
  ? T & { content?: UserResponse[]; totalElements?: number; totalPages?: number; page?: number; size?: number }
  : { content?: UserResponse[] };

type AdminUsersQuery = paths['/api/v1/admin/users']['get']['parameters']['query'];
type UserStatusType = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "GRADUATED" | "PENDING_APPROVAL";

type BasicResponse = { data?: unknown; error?: unknown };

// Only backend-supported roles
const ROLES = ['ADMIN', 'INSTRUCTOR', 'STUDENT'] as const;
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED', 'PENDING_APPROVAL'] as const;

export default function AdminUsersList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PagedUsers | null>(null);

  // Query state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'id' | 'firstName' | 'lastName' | 'email'>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = { page, size, sortBy, sortDir };
      if (role) params.role = role;
      if (status) params.status = status;

      const res = await api.admin.users.getAll(params as AdminUsersQuery);
      if ((res as unknown as BasicResponse).error) throw new Error(String((res as unknown as BasicResponse).error));
      setData((res as unknown as BasicResponse).data as PagedUsers);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load users';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, role, status, sortBy, sortDir]);

  const filtered = useMemo(() => {
    if (!data?.content) return [] as UserResponse[];
    if (!search.trim()) return data.content as UserResponse[];
    const q = search.toLowerCase();
    return (data.content as UserResponse[]).filter((u: UserResponse) => {
      const fields = [u.username, u.email, u.firstName, u.lastName].filter(
        (x): x is string => typeof x === 'string' && x.length > 0
      );
      return fields.some((v) => v.toLowerCase().includes(q));
    });
  }, [data?.content, search]);

  const handleDelete = async (id: number) => {
    try {
      if (!confirm('Are you sure you want to delete this user?')) return;
      const res = await api.admin.users.delete(id);
      if ((res as unknown as BasicResponse).error) throw new Error(String((res as unknown as BasicResponse).error));
      toast.success('User deleted');
      // reload current page
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleStatusChange = async (id: number, newStatus: UserStatusType) => {
    try {
      const res = await api.admin.users.updateStatus(id, newStatus);
      if ((res as unknown as BasicResponse).error) throw new Error(String((res as unknown as BasicResponse).error));
      toast.success('Status updated');
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and roles.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void load()}>Refresh</Button>
          <Button onClick={() => router.push('/admin/users/new')}>
            <Plus className="h-4 w-4 mr-2" /> New User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6 items-end">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Select value={role ?? 'all'} onValueChange={(v) => setRole(v === 'all' ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {ROLES.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={status ?? 'all'} onValueChange={(v) => setStatus(v === 'all' ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'id' | 'firstName' | 'lastName' | 'email')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortDir} onValueChange={(v) => setSortDir(v as 'asc' | 'desc')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading users...
            </div>
          ) : error ? (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" /> {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered?.length ? (
                    (filtered as UserResponse[]).map((u: UserResponse) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-4">{u.id}</td>
                        <td className="py-2 pr-4">{u.firstName} {u.lastName}</td>
                        <td className="py-2 pr-4">{u.email}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary">{u.role}</Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <Select value={u.status || ''} onValueChange={(v) => { if (typeof u.id === 'number') void handleStatusChange(u.id, v as UserStatusType); }}>
                            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2 pr-0 text-right space-x-2">
                          <Button size="sm" variant="outline" disabled={typeof u.id !== 'number'} onClick={() => { if (typeof u.id === 'number') router.push(`/admin/users/${u.id}`); }}>View</Button>
                          <Button size="sm" variant="destructive" disabled={typeof u.id !== 'number'} onClick={() => { if (typeof u.id === 'number') void handleDelete(u.id); }}>Delete</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 text-sm">
                <div>
                  Page {(data?.page ?? page) + 1} of {data?.totalPages ?? 1} • {data?.totalElements ?? filtered.length} total
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={!!data ? ((data.page ?? page) >= ((data.totalPages ?? 1) - 1)) : false} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
