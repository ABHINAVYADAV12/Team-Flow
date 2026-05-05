import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({ children }) {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  return (
    <div className="app-layout">
      <Sidebar user={user} />
      <div className="main-content">
        <div className="page-content animate-fade">
          {children}
        </div>
      </div>
    </div>
  );
}
