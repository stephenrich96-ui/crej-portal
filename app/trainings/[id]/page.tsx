import { getServerSession } from '@/lib/get-session';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, ExternalLink, PlayCircle, FileText } from 'lucide-react';
import Link from 'next/link';
import TrainingCompletionButton from '@/components/training-completion-button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VideoEmbed } from '@/components/video-embed';
import { TrainingLinkActions } from '@/components/training-link-actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrainingDetailPage({ params }: PageProps) {
  try {
    const session = await getServerSession();

    if (!session || !session.roles || session.roles.length === 0) {
      redirect('/login');
    }

    const { id } = await params;

  const training = await prisma.training.findUnique({
    where: { id },
    include: {
      contentItem: true,
      completions: {
        where: { userId: session.id },
      },
    },
  });

    if (!training) {
      notFound();
    }

    const isCompleted = training.completions.length > 0;
    const completion = training.completions[0];

    return (
    <DashboardLayout user={session}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/trainings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trainings
            </Button>
          </Link>
          <h1 className="text-3xl font-semibold text-black mt-4 tracking-tight">{training.title}</h1>
          {training.description && (
            <p className="mt-3 text-base text-black leading-relaxed">{training.description}</p>
          )}
          {isCompleted && completion && (
            <div className="mt-4 p-3 bg-green-50/50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                Completed on {completion.completedAt.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Video */}
        {training.videoUrl && training.videoUrl.trim() !== '' && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-black">Training Video</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoEmbed videoUrl={training.videoUrl} title={training.title} />
            </CardContent>
          </Card>
        )}

        {/* Document Link */}
        {training.documentUrl && training.documentUrl.trim() !== '' && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-black">Training Link</CardTitle>
            </CardHeader>
            <CardContent>
              <TrainingLinkActions url={training.documentUrl} linkText="Open Training Link" />
            </CardContent>
          </Card>
        )}

        {/* Content Item */}
        {training.contentItem ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-black">Training Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {training.contentItem.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-center py-8">
                No content available for this training. 
                {session.roles.includes('ADMIN') || session.roles.includes('TRAINER') ? (
                  <Link href={`/admin/trainings/${training.id}/edit`} className="text-crej-primary hover:text-crej-dark ml-2">
                    Add content →
                  </Link>
                ) : null}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Completion Button */}
        <div className="flex justify-end">
          <TrainingCompletionButton trainingId={training.id} isCompleted={isCompleted} />
        </div>
      </div>
    </DashboardLayout>
    );
  } catch (error) {
    console.error('Error loading training:', error);
    redirect('/trainings');
  }
}
