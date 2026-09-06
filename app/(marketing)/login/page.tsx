import { AuthForm } from '@/components/marketing/auth-form'

export const metadata = { title: 'Log in' }

export default function LoginPage() { return <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8"><AuthForm mode="login" /></main> }
