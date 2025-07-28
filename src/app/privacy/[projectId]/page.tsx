import { redirect } from 'next/navigation';

interface PrivacyPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { projectId } = await params;
  // Redirect to the API route that generates the HTML privacy policy
  redirect(`/api/privacy/${projectId}`);
}