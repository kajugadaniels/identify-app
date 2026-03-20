import { redirect } from 'next/navigation';

// Registration is now handled via the AuthDialog — redirect to home
export default function RegisterPage() {
    redirect('/');
}
