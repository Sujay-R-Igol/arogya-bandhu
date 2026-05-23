import { redirect } from 'next/navigation';

export default function PWARoot() {
  // Temporarily redirect to the Home screen for development
  redirect('/home');
}
