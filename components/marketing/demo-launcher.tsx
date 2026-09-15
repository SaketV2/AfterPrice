import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { MonitorPreview } from './product-preview'
import styles from './marketing.module.css'

export function DemoLauncher() {
  return (
    <div className={`${styles.pageContainer} ${styles.heroGrid}`}>
      <div className={styles.heroCopy}>
        <p className={styles.sectionMarker}>A public product example</p>
        <h1>See what AfterPrice catches.</h1>
        <p>Use the public example to understand the workflow, then sign in to track your own purchases and subscriptions. Your account starts with no user-owned records.</p>
        <Link href="/login?next=/app" className={styles.buttonPrimary}>
          Sign in to open AfterPrice <ArrowUpRight aria-hidden="true" size={17} className="ml-2" />
        </Link>
        <p className={styles.heroNote}>The visual example is illustrative. No bank connection or retailer login is required.</p>
      </div>
      <div className={styles.heroRail}><MonitorPreview /></div>
    </div>
  )
}
