import { ArrowUpRightIcon, ButtonLink } from '@/components/marketing/marketing-ui'
import { ChangeRail, Lifecycle } from '@/components/marketing/product-preview'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'How it works' }

const steps = [
  ['Add a baseline', 'Enter the price, date and plan details that establish what was true.'],
  ['Inspect the evidence', 'Compare the source, observed time and before/after values.'],
  ['Choose an outcome', 'Review, claim, keep, change or mark the record resolved.'],
]

export default function HowItWorksPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={styles.heroSection}>
        <div className={`${styles.pageContainer} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.sectionMarker}>The record, in order</p>
            <h1>Keep the baseline. Catch the change.</h1>
            <p>AfterPrice turns a purchase, plan or renewal into a seven-stage record: baseline, observe, change, evidence, deadline, action and resolution.</p>
            <div className={styles.heroActions}><ButtonLink href="/demo">View the sample record <ArrowUpRightIcon /></ButtonLink><ButtonLink href="/pricing" variant="secondary">See pricing</ButtonLink></div>
          </div>
          <div className={styles.heroRail}><ChangeRail /></div>
        </div>
      </section>
      <Lifecycle />
      <section className={`${styles.sectionWhite} ${styles.coverageSection}`}>
        <div className={`${styles.pageContainer} ${styles.coverageGrid}`}>
          <div><p className={styles.sectionMarker}>What you can do</p><h2>The record is useful before every check is automatic.</h2></div>
          <div className={styles.ruleList}>
            {steps.map(([title, body]) => <div key={title} className="py-5"><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-ink)]">{body}</p></div>)}
          </div>
        </div>
      </section>
      <section className={styles.finalCtaSection}>
        <div className={`${styles.pageContainer} ${styles.finalCta}`}><div><h2>Follow one change from baseline to resolution.</h2></div><ButtonLink href="/demo">View sample record <ArrowUpRightIcon /></ButtonLink></div>
      </section>
    </main>
  )
}
