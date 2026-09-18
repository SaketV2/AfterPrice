'use client'

import { ArrowDownRight, ArrowRight, ArrowUpRight, CheckCircle2, Clock3, FileSearch, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { changeTypes, lifecycleSteps, liveChanges, type ChangeRecord } from './marketing-data'
import styles from './marketing.module.css'

function ProductGlyph({ compact = false }: { compact?: boolean }) {
  return (
    <svg className={compact ? styles.productGlyphCompact : styles.productGlyph} viewBox="0 0 120 90" fill="none" aria-hidden="true">
      <path d="M28 56V39c0-17 13-30 30-30s30 13 30 30v17" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M26 48h-4c-7 0-12 5-12 12v7c0 6 5 11 11 11h7c4 0 7-3 7-7V55c0-4-3-7-7-7Zm68 0h4c7 0 12 5 12 12v7c0 6-5 11-11 11h-7c-4 0-7-3-7-7V55c0-4 3-7 7-7Z" fill="currentColor" />
      <path d="M48 80h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}

export function HeroPurchaseRecord() {
  return (
    <div className={styles.heroRecordStage} role="img" aria-label="Illustrative Sony WH-1000XM6 purchase record showing a 349 dollar baseline, a current price of 299 dollars, a potential 50 dollar difference, source evidence and four days left to review the retailer policy.">
      <div className={styles.heroPaper} aria-hidden="true">
        <div className={styles.heroPaperRule} />
        <span className={styles.heroPaperLabel}>after checkout</span>
        <ProductGlyph />
        <span className={styles.heroPaperNote}>same model<br />new signal</span>
      </div>
      <div className={styles.heroReceipt} aria-hidden="true">
        <span>PRICE CHECK</span>
        <strong>$299</strong>
        <small>06 SEP 2026</small>
        <div className={styles.receiptRule} />
        <span>SONY STORE</span>
      </div>
      <article className={styles.heroRecord}>
        <div className={styles.recordTopline}><span>Purchase tracked</span><span>Sample record</span></div>
        <div className={styles.recordIdentity}>
          <div>
            <p className={styles.recordMeta}>Sony</p>
            <h2>WH-1000XM6</h2>
            <p className={styles.recordSubcopy}>Wireless noise-cancelling headphones</p>
          </div>
          <div className={styles.productBadge}><ProductGlyph compact /></div>
        </div>
        <div className={styles.recordValues}>
          <div><p className={styles.recordMeta}>Your price</p><strong>$349</strong><span>02 Sep 2026</span></div>
          <div><p className={styles.recordMeta}>Observed</p><strong>$299</strong><span>06 Sep 2026</span></div>
          <div className={styles.changeHighlight}><p>Potential difference</p><strong>$50 below</strong><span>your baseline</span></div>
        </div>
        <div className={styles.recordTrail}>
          <div><span className={styles.trailDot} /><strong>Purchased</strong><small>02 Sep</small></div>
          <div><span className={styles.trailDot} /><strong>Observed</strong><small>06 Sep</small></div>
          <div><span className={styles.trailDotActive} /><strong>Deadline</strong><small>4 days left</small></div>
          <div><span className={styles.trailDotEmpty} /><strong>Action</strong><small>Review</small></div>
        </div>
        <div className={styles.recordEvidence}>
          <div><p className={styles.recordMeta}>Observed source</p><strong>Sony Store · price page</strong><span>06 Sep 2026 · 11:42 AM</span></div>
          <span className={styles.recordAction}>Review options <ArrowRight aria-hidden="true" size={15} /></span>
        </div>
      </article>
    </div>
  )
}

export function ChangeRail() {
  return (
    <div className={styles.rail} role="img" aria-label="Illustrative AfterPrice Trail for a price change: you paid 349 dollars, the same product later reached 299 dollars, creating a potential 50 dollar difference before the return window ends.">
      <div className={styles.railHeader}>
        <div><p className={styles.mossKicker}>AfterPrice Trail</p><h2>A lower price matters when there is still time to act.</h2></div>
        <span className={styles.sampleTag}>Illustrative example</span>
      </div>
      <div className={styles.railSummary}>
        <div><p>Baseline</p><strong>$349</strong><span>Sony WH-1000XM6 · paid</span></div>
        <div><p>Current</p><strong className={styles.saffronValue}>$299</strong><span>same model · observed</span></div>
        <div className={styles.railDelta}><p>Potential difference</p><strong>$50</strong><span>review before the window closes</span></div>
      </div>
      <div className={styles.railChart}>
        <div className={styles.railChartLabels}><span>price observed after checkout</span><span>return window</span></div>
        <svg className={styles.railSvg} viewBox="0 0 760 210" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.railGridLine} d="M0 44H760M0 104H760M0 166H760" />
          <path className={styles.railTrackShadow} d="M42 50C166 55 222 72 332 82s167 20 228 42 91 26 158 32" />
          <path className={styles.railTrack} d="M42 50C166 55 222 72 332 82s167 20 228 42 91 26 158 32" />
          <circle cx="42" cy="50" r="6" className={styles.railPoint} /><circle cx="332" cy="82" r="6" className={styles.railPoint} /><circle cx="560" cy="124" r="6" className={styles.railPointActive} /><circle cx="718" cy="156" r="6" className={styles.railPoint} />
        </svg>
        <div className={styles.railChartTicks}><span>Paid</span><span>Day 4</span><span>Day 8</span><span>Day 12</span></div>
      </div>
      <div className={styles.railFooter}><span>Baseline → later observation → difference</span><strong>4 days left to review terms</strong></div>
    </div>
  )
}

function statusClass(tone: ChangeRecord['statusTone']) {
  return { positive: styles.statusPositive, warning: styles.statusWarning, negative: styles.statusNegative }[tone]
}

type FeedFilter = 'All' | 'Price' | 'Plan' | 'Renewal'

export function LiveChangeFeed() {
  const [filter, setFilter] = useState<FeedFilter>('All')
  const [selectedId, setSelectedId] = useState(liveChanges[0].id)
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())
  const visibleRecords = filter === 'All' ? liveChanges : liveChanges.filter(record => record.category === filter)
  const selected = visibleRecords.find(record => record.id === selectedId) ?? visibleRecords[0] ?? liveChanges[0]
  const isReviewed = reviewed.has(selected.id)
  const filters: FeedFilter[] = ['All', 'Price', 'Plan', 'Renewal']

  function toggleReviewed() {
    setReviewed(current => {
      const next = new Set(current)
      if (next.has(selected.id)) next.delete(selected.id)
      else next.add(selected.id)
      return next
    })
  }

  return (
    <section id="catches" className={styles.feedSection}>
      <div className={styles.pageContainer}>
        <div className={styles.feedHeading}>
          <div><p className={styles.sectionMarker}>01 · change types</p><h2>Three ways the trail can move.</h2></div>
          <p>One record can hold a lower price, a changed plan or a more expensive renewal. The useful part is the same: what was true, what changed, where it came from and what to review next.</p>
        </div>
        <div className={styles.feedBrowser}>
          <div className={styles.feedList}>
            <div className={styles.filterRow} role="group" aria-label="Filter change records">
              <span>Sample records</span>
              <div>{filters.map(value => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={filter === value ? styles.filterActive : styles.filterButton}>{value}</button>)}</div>
            </div>
            <div className={styles.feedRecords}>
              {visibleRecords.map(record => {
                const active = selected.id === record.id
                return <button type="button" key={record.id} onClick={() => setSelectedId(record.id)} aria-pressed={active} className={[styles.feedRecord, active ? styles.feedRecordActive : ''].join(' ')}>
                  <span className={styles.feedRecordTop}><span className={[styles.statusTag, statusClass(record.statusTone)].join(' ')}>{reviewed.has(record.id) ? 'Reviewed' : record.status}</span><span>{record.provider}</span></span>
                  <span className={styles.feedRecordTitle}>{record.title}</span>
                  <span className={styles.feedRecordDifference}>{record.difference}</span>
                  <span className={styles.feedRecordInspect}>Inspect <ArrowUpRight size={14} aria-hidden="true" /></span>
                </button>
              })}
            </div>
          </div>
          <article className={styles.feedDetail} key={selected.id} aria-live="polite">
            <div className={styles.detailMain}>
              <div className={styles.detailTitleRow}><div><p className={styles.sectionMarker}>{selected.label} · {selected.provider}</p><h3>{selected.title}</h3></div><span className={styles.detailIcon}><FileSearch aria-hidden="true" size={19} /></span></div>
              <p className={styles.detailSummary}>{selected.summary}</p>
              <div className={styles.detailFacts}><div><span>Baseline</span><strong>{selected.baseline}</strong></div><div><span>Current</span><strong className={styles.detailCurrent}>{selected.current}</strong></div><div><span>Deadline</span><strong className={styles.detailDeadline}>{selected.deadline}</strong></div></div>
              <div className={styles.detailActionRow}><button type="button" onClick={toggleReviewed} className={styles.reviewButton}><CheckCircle2 aria-hidden="true" size={16} /> {isReviewed ? 'Reopen record' : 'Mark reviewed'}</button><span>{selected.action}</span></div>
            </div>
            <aside className={styles.evidencePanel} aria-label="Evidence for selected change">
              <div className={styles.evidenceHeader}><h4>Evidence</h4><span><CheckCircle2 aria-hidden="true" size={14} /> Source available</span></div>
              <dl>{selected.evidence.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
              <p className={styles.observedLine}><Clock3 aria-hidden="true" size={14} /> Observed {selected.observed}</p>
            </aside>
          </article>
        </div>
      </div>
    </section>
  )
}

export function Lifecycle() {
  const [active, setActive] = useState(0)
  const current = lifecycleSteps[active]

  return (
    <section id="lifecycle" className={styles.lifecycleSection}>
      <div className={styles.pageContainer}>
        <div className={styles.lifecycleHeading}><p className={styles.sectionMarker}>02 · the decision path</p><h2>Keep the useful sequence intact.</h2><p>AfterPrice turns a baseline into a practical next step. Select a stage to see what it contributes to the record.</p></div>
        <div className={styles.lifecycleGrid}>
          <div className={styles.timelineStage}>
            <div className={styles.timelineStagePanel} aria-live="polite">
              <div className={styles.stageTopline}><span>Sample lifecycle</span><span>{String(active + 1).padStart(2, '0')} / 07</span></div>
              <div className={styles.timelineStageContent}>
                <p className={styles.mossKicker}>{current.name}</p>
                <p className={styles.timelineStageValue}>{current.value}</p>
                <p className={styles.stageSubvalue}>{current.subvalue}</p>
                <div className={styles.stageExplanation}><strong>{current.title}</strong><p>{current.description}</p></div>
              </div>
            </div>
          </div>
          <ol className={styles.timeline}>
            {lifecycleSteps.map((step, index) => <li key={step.name} className={[styles.timelineStep, active === index ? styles.timelineStepActive : ''].join(' ')}>
              <button type="button" className={styles.timelineStepButton} aria-current={active === index ? 'step' : undefined} onClick={() => setActive(index)}>
                <span className={styles.timelineMarker}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.timelineStepCopy}><span className={styles.timelineStepTitle}>{step.name}{active === index && <span className={styles.inView}>In view</span>}</span><strong>{step.title}</strong><small>{step.description}</small><em>{step.value} · {step.subvalue}</em></span>
              </button>
            </li>)}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function MonitorPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={[styles.monitorPreview, compact ? styles.monitorPreviewCompact : ''].join(' ')}>
      <div className={styles.monitorTopline}><div><span className={styles.monitorMark}>AP</span><span>AfterPrice change ledger</span></div><span className={styles.sampleTag}>Illustrative records</span></div>
      <div className={styles.monitorRows}>{changeTypes.map((item, index) => <div key={item.category} className={styles.monitorRow}><div><p>{item.category}</p><strong>{item.title}</strong></div><div><span>{item.baseline}</span><b>→</b><strong>{item.current}</strong></div><span className={index === 0 ? styles.monitorOpportunity : index === 1 ? styles.monitorPressure : styles.monitorWatch}>{item.action} {index === 0 ? <ArrowDownRight size={15} aria-hidden="true" /> : <ArrowUpRight size={15} aria-hidden="true" />}</span></div>)}</div>
      <p className={styles.monitorNote}><ShieldAlert aria-hidden="true" size={15} /> Potential figures stay labelled until an outcome is recorded.</p>
    </div>
  )
}
