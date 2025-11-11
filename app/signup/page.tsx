import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecting...',
  description: 'Redirecting to sign up page',
};

export default function SignupRedirect() {
  redirect('/auth/sign-up');
}
