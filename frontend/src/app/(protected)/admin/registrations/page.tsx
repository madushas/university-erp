export const dynamic = 'force-dynamic';
import AdminRegistrationsClient from './AdminRegistrationsClient';

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
  return <AdminRegistrationsClient />;
}
