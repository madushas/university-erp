'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRoleAccess } from '@/lib/hooks/useRoleAccess';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { api } from '@/lib/api/generated';

export const dynamic = 'force-dynamic';

// Narrow type that matches our backend RegistrationResponse mapping in AdminService
type RegStatus = 'ENROLLED' | 'COMPLETED' | 'DROPPED' | 'PENDING' | 'WITHDRAWN' | 'FAILED' | 'TRANSFERRED';
type PayStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'REFUNDED' | 'CANCELLED';

type AdminRegistration = {
  id: number;
  user?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  course?: {
    id?: number;
    code?: string;
    title?: string;
  };
  registrationDate?: string;
  grade?: string;
  status?: RegStatus;
  paymentStatus?: PayStatus | null;
  courseFeePaid?: number | string | null;
};

const PAYMENT_STATUSES: PayStatus[] = ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE', 'REFUNDED', 'CANCELLED'];
const REG_STATUSES: RegStatus[] = ['ENROLLED', 'COMPLETED', 'DROPPED', 'PENDING', 'WITHDRAWN', 'FAILED', 'TRANSFERRED'];

export default function AdminRegistrationsPage() {
  const { isAdmin } = useRoleAccess();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminRegistration[]>([]);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [status, setStatus] = useState<RegStatus | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PayStatus | ''>('');

  const canView = useMemo(() => isAdmin(), [isAdmin]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { page?: number; size?: number; status?: RegStatus; paymentStatus?: PayStatus } = {
        page,
        size,
      };
      if (status) params.status = status as RegStatus;
      if (paymentStatus) params.paymentStatus = paymentStatus as PayStatus;

      const res = await api.admin.registrations.getAll(params);
      const data = (res as unknown as { data?: unknown }).data as AdminRegistration[] | undefined;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load registrations';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, size, status, paymentStatus]);

  useEffect(() => {
    if (!canView) return;
    load();
  }, [canView, load]);

  if (!canView) {
    router.replace('/');
    return null;
  }

  const paymentBadge = (ps?: AdminRegistration['paymentStatus']) => {
    const color =
      ps === 'PAID' ? 'bg-green-100 text-green-800' :
      ps === 'OVERDUE' ? 'bg-red-100 text-red-800' :
      ps === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
      ps === 'REFUNDED' ? 'bg-blue-100 text-blue-800' :
      ps === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
      'bg-yellow-50 text-yellow-700';
    return <Badge className={color}>{ps ?? 'N/A'}</Badge>;
  };

  const regBadge = (rs?: AdminRegistration['status']) => {
    const color =
      rs === 'ENROLLED' ? 'bg-green-100 text-green-800' :
      rs === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
      rs === 'DROPPED' ? 'bg-red-100 text-red-800' :
      rs === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
      'bg-gray-100 text-gray-800';
    return <Badge className={color}>{rs ?? 'N/A'}</Badge>;
  };

  const updatePayment = async (id: number, next: NonNullable<AdminRegistration['paymentStatus']>) => {
    try {
      await api.admin.registrations.updatePaymentStatus(id, next);
      toast.success('Payment status updated');
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment status';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registration Management</h1>
          <p className="text-muted-foreground">Review and update manual payment statuses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => load()} disabled={loading}>Refresh</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <Select value={status || ''} onValueChange={(v) => { setStatus(v === 'ALL' ? '' : (v as RegStatus)); setPage(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {REG_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Payment Status</label>
              <Select value={paymentStatus || ''} onValueChange={(v) => { setPaymentStatus(v === 'ALL' ? '' : (v as PayStatus)); setPage(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  {PAYMENT_STATUSES.map(s => (
                    <SelectItem key={s ?? 'NA'} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Page Size</label>
              <Select value={String(size)} onValueChange={(v) => setSize(Number(v) || 50)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[25, 50, 100].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => { setPage(0); load(); }} disabled={loading}>Apply</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">No registrations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Course</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Payment</th>
                    <th className="px-3 py-2">Fee</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2 whitespace-nowrap">{r.user?.firstName} {r.user?.lastName}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.course?.code} - {r.course?.title}</td>
                      <td className="px-3 py-2">{regBadge(r.status)}</td>
                      <td className="px-3 py-2">{paymentBadge(r.paymentStatus)}</td>
                      <td className="px-3 py-2">{typeof r.courseFeePaid === 'number' ? `$${r.courseFeePaid}` : (r.courseFeePaid ?? '-') }</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Select onValueChange={(v) => updatePayment(r.id, v as NonNullable<AdminRegistration['paymentStatus']>)}>
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Set Payment" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_STATUSES.map(s => (
                                <SelectItem key={s ?? 'NA'} value={s ?? ''}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePayment(r.id, 'PAID')}
                          >
                            Mark Paid
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
