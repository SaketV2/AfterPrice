import { PricingToggle } from '@/components/marketing/pricing-toggle'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Pricing' }

export default function PricingPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={styles.pricingPageHero}>
        <div className={styles.pageContainer}>
          <p className={styles.sectionMarker}>Plans with a clear edge</p>
          <h1>Pay for more watching, not more noise.</h1>
          <p>Choose the number of records you need to keep and the depth of history you want to inspect. The checkout is not connected in this prototype.</p>
        </div>
      </section>
      <section className={styles.pricingSection}>
        <div className={styles.pageContainer}><PricingToggle /></div>
      </section>
      <section className={styles.pricingBoundary}>
        <div className={styles.pageContainer}>
          <p className={styles.sectionMarker}>Prototype boundary</p>
          <h2>No charge is taken here.</h2>
          <p>AfterPrice V1 does not connect to your bank, submit claims or process payments. Use the demo to inspect the workflow before a production service exists.</p>
        </div>
      </section>
    </main>
  )
}
