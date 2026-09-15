import { ArrowUpRightIcon, ButtonLink, FaqAccordion } from '@/components/marketing/marketing-ui'
import { HeroPurchaseRecord, Lifecycle, LiveChangeFeed, MonitorPreview } from '@/components/marketing/product-preview'
import { capabilityRows, changeTypes, coverageItems, faqItems } from '@/components/marketing/marketing-data'
import styles from '@/components/marketing/marketing.module.css'

function HeadphoneMark() {
  return <svg className="h-auto w-full max-w-[250px] text-[var(--moss)]" viewBox="0 0 240 170" fill="none" aria-hidden="true"><path d="M55 112V75c0-37 29-67 65-67s65 30 65 67v37" stroke="currentColor" strokeWidth="12" strokeLinecap="round" /><path d="M52 94h-8c-16 0-28 12-28 28v13c0 12 10 22 22 22h13c8 0 14-6 14-14v-35c0-8-6-14-13-14Zm136 0h8c16 0 28 12 28 28v13c0 12-10 22-22 22h-13c-8 0-14-6-14-14v-35c0-8 6-14 13-14Z" fill="currentColor" /><path d="M97 151h46" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity=".35" /></svg>
}

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className={styles.heroSection}>
        <div className={[styles.pageContainer, styles.heroGrid].join(' ')}>
          <div className={styles.heroCopy}>
            <h1>Keep an eye on what changes after checkout.</h1>
            <p>AfterPrice keeps the original price, later changes, evidence and timing together so you can decide what to do next.</p>
            <div className={styles.heroActions}><ButtonLink href="/signup">Track a purchase <ArrowUpRightIcon /></ButtonLink><a href="#example" className={styles.heroSecondaryLink}>See an example <ArrowUpRightIcon /></a></div>
            <p className={styles.heroNote}>Add only the purchases or subscriptions you choose. No bank connection.</p>
            <div className={styles.heroSequence} aria-label="AfterPrice record sequence"><span>Baseline</span><span>Change</span><span>Evidence</span><span>Deadline</span><span>Action</span></div>
          </div>
          <div className={styles.heroRail}><HeroPurchaseRecord /></div>
        </div>
      </section>

      <section id="example" className={styles.exampleSection}>
        <div className={styles.pageContainer}>
          <div className={styles.sectionHeading}><div><p className={styles.sectionMarker}>A sample record</p><h2>The price changed. The receipt still matters.</h2><p>Four days remain to check the retailer’s adjustment policy.</p></div><p>The example is illustrative. A lower price is a prompt to review the terms, not a guaranteed refund.</p></div>
          <div className={styles.exampleLayout}>
            <div className={styles.exampleVisual}><div className={styles.exampleVisualTop}><span>Sony Store</span><span>02 → 06 Sep 2026</span></div><div className={styles.exampleVisualObject}><HeadphoneMark /></div><p className={styles.exampleVisualCaption}>WH-1000XM6<br /><span className="text-[var(--moss)]">$349 paid → $299 observed</span></p></div>
            <dl className={styles.exampleProof}><div className={[styles.proofRow, styles.proofRowHighlight].join(' ')}><dt>Baseline</dt><dd>$349 · Receipt saved 02 Sep 2026</dd></div><div className={[styles.proofRow, styles.proofRowHighlight].join(' ')}><dt>Later price</dt><dd>$299 · Sony Store product page</dd></div><div className={styles.proofRow}><dt>Potential difference</dt><dd>$50 below the saved price</dd></div><div className={[styles.proofRow, styles.proofRowPressure].join(' ')}><dt>Next useful step</dt><dd>Review the retailer adjustment policy · 4 days left</dd></div><p className={styles.proofNote}>Observed 06 Sep 2026 at 11:42 AM. Potential amounts stay labelled until an outcome is recorded.</p></dl>
          </div>
        </div>
      </section>

      <LiveChangeFeed />
      <Lifecycle />

      <section className={styles.changeTypesSection}>
        <div className={styles.pageContainer}>
          <div className={styles.changeTypesHeading}><div><p className={styles.sectionMarker}>The same trail, different changes</p><h2>Price, plan and renewal records in one view.</h2></div><p>After checkout, the decision still needs the same ingredients: what was true, what moved, where it came from and what to review.</p></div>
          <div className={styles.ledgerRows}>{changeTypes.map(item => <div key={item.category} className={styles.ledgerRow}><div><p className={styles.sectionMarker}>{item.category}</p><h3>{item.title}</h3></div><div><span>Baseline</span><strong>{item.baseline}</strong></div><div><span>Current</span><strong>{item.current}</strong></div><div><span>Why it matters</span><strong>{item.consequence}</strong></div><div><span>Next action</span><strong>{item.action}</strong></div></div>)}</div>
          <p className={styles.illustrativeNote}>Illustrative records · the amount shown is potential until you record an outcome.</p>
        </div>
      </section>

      <section className={styles.productSection}>
        <div className={[styles.pageContainer, styles.productSectionGrid].join(' ')}><div><p className={styles.sectionMarker}>A practical counterpart</p><h2>Your records, without the finance dashboard.</h2><p>See the signal, its source and the timing in the same place. Your account starts with the records you add.</p><ButtonLink href="/demo" variant="light">Open the sample ledger <ArrowUpRightIcon /></ButtonLink></div><MonitorPreview /></div>
      </section>

      <section id="coverage" className={styles.coverageSection}><div className={[styles.pageContainer, styles.coverageGrid].join(' ')}><div><p className={styles.sectionMarker}>What fits the record</p><h2>Track what can change after the receipt.</h2><p className={styles.limitsIntro}>Start with a purchase or subscription detail that is useful to compare later.</p></div><ul className={styles.coverageList}>{coverageItems.map(item => <li key={item}>{item}</li>)}</ul></div></section>

      <section id="data" className={styles.limitsSection}><div className={[styles.pageContainer, styles.limitsGrid].join(' ')}><div><p className={styles.sectionMarker}>Clear boundaries</p><h2>Useful now. Honest about what is still manual.</h2><p className={styles.limitsIntro}>AfterPrice shows the change and points to a next review. You decide whether to claim, change, keep or dismiss it.</p></div><table className={styles.capabilityTable}><caption className="sr-only">AfterPrice capabilities in V1</caption><thead><tr><th scope="col">Capability</th><th scope="col">V1 status</th></tr></thead><tbody>{capabilityRows.map(([capability, status]) => <tr key={capability}><th scope="row">{capability}</th><td className={status.startsWith('Available') ? styles.capabilityAvailable : styles.capabilityManual}>{status}</td></tr>)}</tbody></table></div></section>

      <section className={styles.faqSection}><div className={[styles.pageContainer, styles.faqGrid].join(' ')}><div><p className={styles.sectionMarker}>Questions, answered</p><h2>Start with what you bought.</h2><p className={styles.limitsIntro}>The short version of what the current product does and does not do.</p></div><div><FaqAccordion items={faqItems} /><div className={styles.faqCta}><div><h3>See the product with sample data.</h3><p>Understand the record before you create one.</p></div><ButtonLink href="/demo" variant="secondary">Open demo <ArrowUpRightIcon /></ButtonLink></div></div></div></section>

      <section className={styles.finalCtaSection}><div className={[styles.pageContainer, styles.finalCta].join(' ')}><div><p className={styles.sectionMarker}>Start the paper trail</p><h2>Bought something recently?</h2><p>Save the baseline now so the next change has something to compare against.</p></div><ButtonLink href="/signup">Get started <ArrowUpRightIcon /></ButtonLink></div></section>
    </main>
  )
}
