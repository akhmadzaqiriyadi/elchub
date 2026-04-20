import Link from 'next/link';
import { redirect } from 'next/navigation';

const links = [
  { href: '/login', title: 'Login', description: 'Masuk ke akun yang sudah ada.' },
  { href: '/register', title: 'Register', description: 'Buat akun baru.' },
  { href: '/forgot-password', title: 'Lupa Password', description: 'Kirim email reset password.' },
  { href: '/reset-password', title: 'Reset Password', description: 'Set password baru dengan token.' },
];

export default function AuthIndexPage() {
  // Redirect to login page by default
  redirect('/login');
}
