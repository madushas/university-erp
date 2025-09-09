import AdminUserDetailClient from '@/components/admin/users/AdminUserDetailClient';

export const dynamic = 'force-dynamic';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  return <AdminUserDetailClient id={idNum} />;
}
