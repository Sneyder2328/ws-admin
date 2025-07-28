import { redirect } from 'next/navigation';

interface PrivacyPageProps {
  params: {
    projectId: string;
  };
}

export default function PrivacyPage({ params }: PrivacyPageProps) {
  // Redirect to the API route that generates the HTML privacy policy
  redirect(`/api/privacy/${params.projectId}`);
}