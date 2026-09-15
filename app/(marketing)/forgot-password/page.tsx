import { AuthForm } from '@/components/marketing/auth-form'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Forgot password' }
export default function ForgotPasswordPage() { return <main id="main-content" tabIndex={-1} className={[styles.authFrame, 'flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-16 sm:px-8'].join(' ')}><AuthForm mode="forgot" /></main> }
