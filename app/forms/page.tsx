import { getServerSession } from '@/lib/get-session';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { FileText, Mail } from 'lucide-react';

export default async function FormsPage() {
  const session = await getServerSession();

  if (!session || !session.roles || session.roles.length === 0) {
    redirect('/login');
  }

  return (
    <DashboardLayout user={session}>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-black tracking-tight">DSPD Access Forms</h1>
          <p className="mt-2 text-base text-black">Fill out and submit required access forms for USTEPS and UPI</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Form 0-2 */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-crej-primary" />
                <CardTitle className="text-xl font-semibold text-black">Form 0-2</CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-600">
                DHHS Private Support Coordinator USTEPS Access Form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Complete this form to request USTEPS access. After completion, you can download the form or receive it via email to forward to usteps@utah.gov.
              </p>
              <Link href="/forms/0-2-usteps-access">
                <button className="w-full bg-crej-primary hover:bg-crej-dark text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Fill Out Form
                </button>
              </Link>
            </CardContent>
          </Card>

          {/* Form 0-8 */}
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-crej-primary" />
                <CardTitle className="text-xl font-semibold text-black">Form 0-8</CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-600">
                UPI ACCESS Form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Complete this form to request UPI access. After completion, you can download the form or receive it via email to forward to usteps@utah.gov.
              </p>
              <Link href="/forms/0-8-upi-access">
                <button className="w-full bg-crej-primary hover:bg-crej-dark text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Fill Out Form
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200 bg-crej-light">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-crej-primary mt-0.5" />
              <div>
                <p className="font-medium text-black mb-1">Submission Instructions</p>
                <p className="text-sm text-gray-600">
                  After completing either form, you will receive a filled PDF via email. Forward the completed form to{' '}
                  <a href="mailto:usteps@utah.gov" className="text-crej-primary hover:text-crej-dark underline">
                    usteps@utah.gov
                  </a>
                  {' '}using your CREJ email address.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
