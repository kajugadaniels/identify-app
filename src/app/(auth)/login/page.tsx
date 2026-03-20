import { redirect } from 'next/navigation';

// Login is now handled via the AuthDialog — redirect to home
export default function LoginPage() {
    redirect('/');
}
