import { ArrowUpRightIcon, ButtonLink } from '@/components/marketing/marketing-ui'
import { HeroPurchaseRecord } from '@/components/marketing/product-preview'
import { coverageItems } from '@/components/marketing/marketing-data'
import styles from '@/components/marketing/marketing.module.css'

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={styles.heroSection}>
        <div className={[styles.pageContainer, styles.heroGrid].join(' ')}>
          <div className={styles.heroCopy}>
            <h1>The purchase is over. The price might not be.</h1>
            <p>AfterPrice keeps what you paid beside later changes, evidence and timing so you know what is worth reviewing next.</p>
            <div className={styles.heroActions}>
              <ButtonLink href="/signup">Create a record <ArrowUpRightIcon /></ButtonLink>
              <ButtonLink href="/how-it-works" variant="quiet" className={styles.heroSecondaryLink}>See how it works <ArrowUpRightIcon /></ButtonLink>
            </div>
            <p className={styles.heroNote}>V1: add only the purchases and subscriptions you choose. No bank connection.</p>
            <div className={styles.heroSequence} aria-label="AfterPrice record sequence"><span>Baseline</span><span>Change</span><span>Evidence</span><span>Timing</span><span>Action</span></div>
          </div>
          <div className={styles.heroRail}><HeroPurchaseRecord /></div>
        </div>
      </section>

      <section id="why" className={styles.explanationSection}>
        <div className={styles.pageContainer}>
          <div className={styles.explanationIntro}>
            <h2>A small record makes the next decision clearer.</h2>
            <p>Save the baseline once. When a useful difference appears, the source and the next practical step stay attached to it.</p>
          </div>
          <div className={styles.explanationList}>
            <div className={styles.explanationRow}><span>01</span><div><h3>Start with what was true.</h3><p>Add a purchase price, plan detail or renewal amount while you still have the receipt or notice.</p></div></div>
            <div className={styles.explanationRow}><span>02</span><div><h3>Keep the later signal beside it.</h3><p>Compare the original value with a later observation, its source and the time it was seen.</p></div></div>
            <div className={styles.explanationRow}><span>03</span><div><h3>Review while the option is useful.</h3><p>AfterPrice points to a review. You decide whether to claim, change, keep or dismiss it.</p></div></div>
          </div>
          <div className={styles.explanationLink}><ButtonLink href="/how-it-works" variant="secondary">Read the full sequence <ArrowUpRightIcon /></ButtonLink></div>
        </div>
      </section>

      <section className={styles.compactInfoSection}>
        <div className={[styles.pageContainer, styles.compactInfoGrid].join(' ')}>
          <div className={styles.compactInfoBlock}>
            <h2>What fits the record</h2>
            <ul className={styles.compactList}>{coverageItems.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
            <ButtonLink href="/coverage" variant="quiet">See coverage <ArrowUpRightIcon /></ButtonLink>
          </div>
          <div className={styles.compactInfoBlock}>
            <h2>Private by default</h2>
            <p>Your records belong to your authenticated account. Add the details you need; never enter bank credentials or retailer passwords.</p>
            <ButtonLink href="/data-privacy" variant="quiet">Read data privacy <ArrowUpRightIcon /></ButtonLink>
          </div>
          <div className={styles.compactInfoBlock}>
            <h2>Free + Pro</h2>
            <p>Start free, or choose Pro at A$6/month or A$59/year for the full monitoring loop.</p>
            <ButtonLink href="/pricing" variant="quiet">See pricing <ArrowUpRightIcon /></ButtonLink>
          </div>
        </div>
      </section>

      <section className={styles.finalCtaSection}>
        <div className={[styles.pageContainer, styles.finalCta].join(' ')}>
          <div><h2>Bought something recently?</h2><p>Save the baseline now so a later change has something to compare against.</p></div>
          <ButtonLink href="/signup">Get started <ArrowUpRightIcon /></ButtonLink>
        </div>
      </section>
    </main>
  )
}
