import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SignInForm from '@/components/auth/signin-form';

interface SignInPageProps {
  searchParams: {
    callbackUrl?: string;
    error?: string;
  };
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm callbackUrl={searchParams.callbackUrl} />
    </Suspense>
  );
}
