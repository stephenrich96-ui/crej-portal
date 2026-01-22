import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/get-session';
import DashboardPage from './dashboard/page';

export default async function HomePage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (!session.roles || session.roles.length === 0) {
    redirect('/select-role');
  }

  return <DashboardPage />;
}
