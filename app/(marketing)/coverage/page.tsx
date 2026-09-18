import { ArrowUpRightIcon, ButtonLink } from '@/components/marketing/marketing-ui'
import { capabilityRows, coverageItems } from '@/components/marketing/marketing-data'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Coverage' }

export default function CoveragePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={styles.contentHero}>
        <div className={styles.pageContainer}>
          <h1>Track the changes that matter after checkout.</h1>
          <p>AfterPrice is built for a clear comparison: what you paid or chose, what changed later, where the signal came from and what is worth reviewing.</p>
          <div className={styles.heroActions}><ButtonLink href="/signup">Create a record <ArrowUpRightIcon /></ButtonLink><ButtonLink href="/how-it-works" variant="secondary">How it works</ButtonLink></div>
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={[styles.pageContainer, styles.detailGrid].join(' ')}>
          <div><h2>Four useful starting points.</h2><p>Start with a detail you already have and may need to compare again later.</p></div>
          <ul className={styles.coverageList}>{coverageItems.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className={styles.limitsSection}>
        <div className={[styles.pageContainer, styles.limitsGrid].join(' ')}>
          <div><h2>What V1 can and cannot do.</h2><p className={styles.limitsIntro}>The current product keeps the record and points to a next review. It does not make the decision or claim for you.</p></div>
          <table className={styles.capabilityTable}><caption className="sr-only">AfterPrice V1 capabilities</caption><thead><tr><th scope="col">Capability</th><th scope="col">Status</th></tr></thead><tbody>{capabilityRows.map(([capability, status]) => <tr key={capability}><th scope="row">{capability}</th><td className={status.startsWith('Available') ? styles.capabilityAvailable : styles.capabilityManual}>{status}</td></tr>)}</tbody></table>
        </div>
      </section>

      <section className={styles.finalCtaSection}><div className={[styles.pageContainer, styles.finalCta].join(' ')}><div><h2>Have a receipt or renewal notice nearby?</h2><p>Save the baseline while the details are easy to find.</p></div><ButtonLink href="/signup">Get started <ArrowUpRightIcon /></ButtonLink></div></section>
    </main>
  )
}
