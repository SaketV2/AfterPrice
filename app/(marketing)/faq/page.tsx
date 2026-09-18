import { ArrowUpRightIcon, ButtonLink, FaqAccordion } from '@/components/marketing/marketing-ui'
import { faqItems } from '@/components/marketing/marketing-data'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'FAQ' }

export default function FaqPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={styles.heroSection}>
        <div className={`${styles.pageContainer} ${styles.pricingPageHero}`}>
          <p className={styles.sectionMarker}>Questions, answered plainly</p>
          <h1>The useful answers.</h1>
          <p>AfterPrice is specific about what the current product can monitor and what still belongs to you.</p>
        </div>
      </section>
      <section className={styles.faqSection}>
        <div className={`${styles.pageContainer} ${styles.faqGrid}`}>
          <div>
            <p className={styles.sectionMarker}>Before you start</p>
            <h2>Keep the record useful.</h2>
          </div>
          <div>
            <FaqAccordion items={faqItems} />
            <div className={styles.faqCta}>
              <div>
                <h3>See one change with its evidence.</h3>
                <p>The sample record is the fastest way to understand the workflow.</p>
              </div>
              <ButtonLink href="/demo">View sample <ArrowUpRightIcon /></ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
