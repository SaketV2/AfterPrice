import { DemoLauncher } from '@/components/marketing/demo-launcher'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Product demo' }

export default function DemoPage() { return <main id="main-content" tabIndex={-1} className={[styles.heroSection, 'px-5 pb-28 pt-14 sm:px-8 sm:pb-40 sm:pt-24 lg:px-10'].join(' ')}><div className="mx-auto max-w-[1280px]"><DemoLauncher /></div></main> }
