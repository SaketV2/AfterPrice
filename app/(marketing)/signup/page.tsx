import { AuthForm } from '@/components/marketing/auth-form'

export const metadata = { title: 'Sign up' }

export default function SignupPage() { return <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8"><AuthForm mode="signup" /></main> }
