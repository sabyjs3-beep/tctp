import { redirect } from 'next/navigation';

export default function RootPage() {
  // Default to Goa for now as the seed city
  redirect('/goa');
}
