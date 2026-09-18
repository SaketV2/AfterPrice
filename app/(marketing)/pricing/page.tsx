import { PricingToggle } from '@/components/marketing/pricing-toggle'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Pricing' }

export default function PricingPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={styles.pricingPageHero}>
        <div className={styles.pageContainer}>
          <p className={styles.sectionMarker}>Pricing, plainly stated</p>
          <h1>Start free. Add the full loop when you need it.</h1>
          <p>Create an account and add the records you want to review. Pro is A$6/month or A$59/year through Stripe-hosted Checkout.</p>
        </div>
      </section>
      <section className={styles.pricingSection}>
        <div className={styles.pageContainer}><PricingToggle /></div>
      </section>
      <section className={styles.pricingBoundary}>
        <div className={styles.pageContainer}>
          <p className={styles.sectionMarker}>V1 boundary</p>
          <h2>Account access is available now.</h2>
          <p>AfterPrice does not connect to your bank, submit claims or cancel services. Stripe handles payment details in hosted Checkout; AfterPrice records only the billing state needed to provide Pro access.</p>
        </div>
      </section>
    </main>
  )
}
