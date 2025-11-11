import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecting...',
  description: 'Redirecting to login page',
};

export default function LoginRedirect() {
  redirect('/auth/login');
}
