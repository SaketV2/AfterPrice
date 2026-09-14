'use client'

import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock3, FileSearch, ShieldAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { changeTypes, lifecycleSteps, liveChanges, type ChangeRecord } from './marketing-data'
import styles from './marketing.module.css'

const lifecycleActivationBand = {
  top: 0.3,
  bottom: 0.52,
} as const

export function ChangeRail() {
  const bars = [
    { label: 'Paid', value: '$349', height: 82, tone: 'bg-[#8792ff]' },
    { label: 'Day 4', value: '$339', height: 78, tone: 'bg-[#8792ff]' },
    { label: 'Day 8', value: '$329', height: 72, tone: 'bg-[#8792ff]' },
    { label: 'Day 12', value: '$299', height: 58, tone: 'bg-[#b7bd91]' },
  ]

  return <div className="rounded-[16px] bg-[#101a2a] p-4 text-white sm:p-6" role="img" aria-label="Illustrative price after purchase: you paid 349 dollars, the same product later reached 299 dollars, creating a potential 50 dollar saving before the return window ends."><div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#283241] pb-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b9c4ff]">Price after purchase</p><h2 className="mt-2 max-w-[15ch] font-[family-name:var(--font-display)] text-2xl font-700 leading-tight tracking-[-0.03em] sm:text-[1.75rem]">A lower price becomes useful when you can still act.</h2></div><span className="shrink-0 rounded-full border border-[#3b485b] px-2.5 py-1 text-[10px] font-semibold text-[#c0c8d2]">Illustrative example</span></div><div className="mt-6 grid grid-cols-[1fr_auto] gap-5 sm:grid-cols-[1fr_auto_auto] sm:items-end"><div><p className="text-xs text-[#aab3c0]">Sony WH-1000XM6</p><p className="mt-1 text-3xl font-bold tabular-nums tracking-[-0.04em]">$349 <span className="text-lg font-normal text-[#aab3c0]">paid</span></p></div><div className="text-right"><p className="text-xs text-[#aab3c0]">Current match</p><p className="mt-1 text-2xl font-bold tabular-nums text-[#b7bd91]">$299</p></div><div className="col-span-2 rounded-lg bg-[#1a2230] px-3 py-2 sm:col-span-1"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#aab3c0]">Potential saving</p><p className="mt-1 text-lg font-bold tabular-nums text-[#b7bd91]">$50</p></div></div><div className="mt-6 rounded-[12px] border border-[#283241] bg-[#131922] p-4"><div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.12em] text-[#aab3c0]"><span>Price observed after checkout</span><span>Return window</span></div><div className="relative mt-4 h-52 border-b border-[#3b485b] pt-3"><div className="pointer-events-none absolute inset-x-0 top-9 border-t border-dashed border-[#3b485b]" /><div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-[#283241]" /><div className="pointer-events-none absolute bottom-[22%] left-0 right-0 border-t border-dashed border-[#b7bd91]" /><span className="absolute bottom-[22%] right-0 -translate-y-1/2 rounded bg-[#b7bd91] px-2 py-1 text-[10px] font-bold text-[#192119]">$299 found</span><div className="relative flex h-full items-end gap-3 px-1 sm:gap-5">{bars.map(bar => <div key={bar.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className={`w-full max-w-12 rounded-t-md ${bar.tone}`} style={{ height: `${bar.height}%` }} /><span className="text-[10px] text-[#aab3c0]">{bar.label}</span></div>)}</div></div><div className="mt-4 grid gap-2 text-xs leading-5 sm:grid-cols-[1fr_auto]"><p className="text-[#c0c8d2]">AfterPrice keeps the original price, the later match and the timing in one record.</p><p className="font-semibold text-[#b7bd91] sm:text-right">4 days left to review terms</p></div></div></div>
}

function statusClass(tone: ChangeRecord['statusTone']) {
  return {
    positive: 'bg-[#e1f3ea] text-[#237a57]',
    warning: 'bg-[#fff0d6] text-[#8b5514]',
    negative: 'bg-[#fce5e5] text-[#9d3636]',
  }[tone]
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
    <section id="catches" className="bg-[#0c1016] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12">
          <div>
            <h2 className="max-w-xl font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] sm:text-5xl">Three ways the cost can move after purchase.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-[#c0c8d2]">Each illustrative record keeps the baseline, current state, evidence and next action in the same view.</p>
            <p className="mt-5 text-xs leading-5 text-[#aab3c0]">Sample data · last checked 06 Sep 2026</p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter change records">
              {filters.map(value => (
                <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={['min-h-11 rounded-[10px] border px-3.5 text-sm font-semibold transition', filter === value ? 'border-[#b7bd91] bg-[#b7bd91] text-[#192119]' : 'border-[#3b485b] text-[#c0c8d2] hover:border-[#8792ff] hover:text-white'].join(' ')}>
                  {value}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              {visibleRecords.map(record => {
                const active = selected.id === record.id
                return (
                  <button type="button" key={record.id} onClick={() => setSelectedId(record.id)} aria-pressed={active} className={[styles.feedRecord, active ? styles.feedRecordActive : '', 'grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 rounded-[12px] p-4 text-left'].join(' ')}>
                    <span className="col-span-2 flex flex-wrap items-center gap-2">
                      <span className={['rounded-full px-2 py-1 text-[10px] font-bold', statusClass(record.statusTone)].join(' ')}>{reviewed.has(record.id) ? 'Reviewed' : record.status}</span>
                      <span className="text-xs text-[#aab3c0]">{record.provider}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-5 text-[#f5f7fa]">{record.title}</span>
                      <span className="mt-1 block text-sm font-medium leading-5 tabular-nums text-[#c0c8d2]">{record.difference}</span>
                    </span>
                    <span className="inline-flex items-center self-center gap-1 text-xs font-semibold text-[#b7bd91]">Inspect <ArrowUpRight size={14} aria-hidden="true" /></span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={[styles.feedDetail, 'mt-6 grid gap-6 rounded-[16px] border border-[#283241] bg-[#131922] p-5 sm:p-7 lg:grid-cols-[1fr_0.9fr] lg:gap-8'].join(' ')} key={selected.id} aria-live="polite">
          <div>
            <div className="flex items-start justify-between gap-5">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-700 leading-tight tracking-[-0.03em] sm:text-3xl">{selected.title}</h3>
                <p className="mt-2 text-sm text-[#aab3c0]">{selected.label} · {selected.provider}</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#1a2230] text-[#b7bd91]"><FileSearch aria-hidden="true" size={19} /></span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#c0c8d2]">{selected.summary}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[#283241] py-4 sm:grid-cols-3">
              <div><p className="text-xs text-[#aab3c0]">Baseline</p><p className="mt-1 text-lg font-bold leading-6 tabular-nums">{selected.baseline}</p></div>
              <div><p className="text-xs text-[#aab3c0]">Current</p><p className="mt-1 text-lg font-bold leading-6 tabular-nums text-[#cfe3f5]">{selected.current}</p></div>
              <div className="col-span-2 sm:col-span-1"><p className="text-xs text-[#aab3c0]">Deadline</p><p className="mt-1 text-sm font-semibold leading-6 text-[#b7bd91]">{selected.deadline}</p></div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={toggleReviewed} className="inline-flex min-h-11 items-center gap-2 rounded-[12px] bg-[#b7bd91] px-4 text-sm font-semibold text-[#192119] hover:bg-[#d1d6a8]">
                <CheckCircle2 aria-hidden="true" size={16} /> {isReviewed ? 'Reopen record' : 'Mark reviewed'}
              </button>
              <span className="text-xs leading-5 text-[#aab3c0]">{selected.action}</span>
            </div>
          </div>
          <aside className="border-t border-[#283241] pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" aria-label="Evidence for selected change">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold">Evidence</h4>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#b7bd91]"><CheckCircle2 aria-hidden="true" size={14} /> Source available</span>
            </div>
            <dl className="mt-5 divide-y divide-[#283241]">
              {selected.evidence.map(row => <div key={row.label} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[0.8fr_1.2fr] sm:gap-3"><dt className="text-xs text-[#aab3c0]">{row.label}</dt><dd className="text-sm leading-6 text-[#f5f7fa]">{row.value}</dd></div>)}
            </dl>
            <p className="mt-5 flex items-center gap-2 border-t border-[#283241] pt-4 text-xs leading-5 text-[#aab3c0]"><Clock3 aria-hidden="true" size={14} className="shrink-0" /> Observed {selected.observed}</p>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function Lifecycle() {
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const stepRefs = useRef<Array<HTMLLIElement | null>>([])

  useEffect(() => {
    let frameId: number | null = null

    const updateActive = () => {
      frameId = null

      const bandTop = window.innerHeight * lifecycleActivationBand.top
      const bandBottom = window.innerHeight * lifecycleActivationBand.bottom
      const steps = stepRefs.current
        .map((element, index) => element ? { element, index } : null)
        .filter((step): step is { element: HTMLLIElement; index: number } => step !== null)
        .map(({ element, index }) => ({ index, rect: element.getBoundingClientRect() }))

      if (!steps.length) return

      let nextIndex = 0
      let bestIntersectionRatio = 0
      let hasIntersectingStep = false

      steps.forEach(({ index, rect }) => {
        const intersectionHeight = Math.max(0, Math.min(rect.bottom, bandBottom) - Math.max(rect.top, bandTop))
        const intersectionRatio = rect.height > 0 ? intersectionHeight / rect.height : 0

        if (intersectionRatio > bestIntersectionRatio) {
          bestIntersectionRatio = intersectionRatio
          nextIndex = index
          hasIntersectingStep = true
        }
      })

      if (!hasIntersectingStep) {
        nextIndex = steps[0].rect.top > bandBottom ? 0 : steps[steps.length - 1].index
      }

      if (nextIndex !== activeRef.current) {
        activeRef.current = nextIndex
        setActive(nextIndex)
      }
    }

    const requestUpdate = () => {
      if (frameId === null) frameId = window.requestAnimationFrame(updateActive)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frameId !== null) window.cancelAnimationFrame(frameId)
    }
  }, [])

  const current = lifecycleSteps[active]

  return (
    <section id="lifecycle" className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-10 max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-700 leading-[1.08] tracking-[-0.035em] sm:text-5xl">A change becomes useful when the sequence stays intact.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5d6673]">Scroll through the lifecycle. The state panel follows the record from baseline to resolution, so potential money never gets mistaken for money recovered.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
          <div className={styles.timelineStage}>
            <div className={styles.timelineStagePanel} aria-live="polite">
              <div className="flex items-center justify-between gap-4 border-b border-[#283241] px-5 py-4 text-xs text-[#aab3c0] sm:px-7">
                <span>Sample lifecycle</span>
                <span className="font-mono text-[#b7bd91]">{String(active + 1).padStart(2, '0')} / 06</span>
              </div>
              <div key={current.name} className={[styles.timelineStageContent, 'px-5 py-6 sm:px-7 sm:py-7'].join(' ')}>
                <p className="text-sm font-semibold text-[#8792ff]">{current.name}</p>
                <p className={['mt-5', styles.timelineStageValue].join(' ')}>{current.value}</p>
                <p className="mt-3 text-sm text-[#c0c8d2]">{current.subvalue}</p>
                <div className="mt-6 border-t border-[#283241] pt-5">
                  <p className="font-semibold">{current.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[#aab3c0]">{current.description}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <ol className={[styles.timeline, 'space-y-6'].join(' ')}>
              {lifecycleSteps.map((step, index) => (
                <li
                  key={step.name}
                  ref={element => { stepRefs.current[index] = element }}
                  data-index={index}
                  className={[styles.timelineStep, active === index ? styles.timelineStepActive : '', 'flex gap-4'].join(' ')}
                  aria-current={active === index ? 'step' : undefined}
                >
                  <span className={styles.timelineMarker}>{String(index + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 pb-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-[family-name:var(--font-display)] text-lg font-700 tracking-[-0.025em]">{step.name}</h3>
                      <span className={['rounded-full bg-[#e7eafe] px-2 py-1 text-[10px] font-bold text-[#3258d4]', active === index ? '' : 'invisible'].join(' ')}>In view</span>
                    </div>
                    <p className="mt-1 text-base font-semibold text-[#0c0f14]">{step.title}</p>
                    <p className="mt-1 max-w-lg text-sm leading-6 text-[#5d6673]">{step.description}</p>
                    <p className="mt-2 text-sm font-semibold tabular-nums text-[#3258d4] lg:hidden">{step.value}<span className="font-normal text-[#5d6673]"> · {step.subvalue}</span></p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

export function MonitorPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={['overflow-hidden rounded-[16px] bg-[#101a2a] p-4 text-white', compact ? '' : 'sm:p-6'].join(' ')}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#283241] pb-4">
        <div className="flex min-w-0 items-center gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-[#b7bd91] text-[10px] font-bold text-[#192119]">AP</span><span className="text-sm font-semibold tracking-tight">AfterPrice change ledger</span></div>
        <span className="shrink-0 rounded-full border border-[#3b485b] px-2.5 py-1 text-[10px] font-semibold text-[#c0c8d2]">Demo data</span>
      </div>
      <div className="mt-5 divide-y divide-[#283241]">
        {changeTypes.map((item, index) => (
          <div key={item.category} className="grid gap-3 py-4 first:pt-0 sm:grid-cols-[0.8fr_1fr_auto] sm:items-center">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8792ff]">{item.category}</p><p className="mt-1 text-sm font-semibold">{item.title}</p></div>
            <div className="text-sm text-[#c0c8d2]"><span className="text-[#aab3c0]">{item.baseline}</span><span className="mx-2 text-[#b7bd91]">to</span><span>{item.current}</span></div>
            <div className="flex items-center gap-2 text-right text-xs"><span className={index === 0 ? 'text-[#b7bd91]' : index === 1 ? 'text-[#f0bd71]' : 'text-[#b9c4ff]'}>{item.action}</span>{index === 0 ? <ArrowDownRight size={15} aria-hidden="true" /> : <ArrowUpRight size={15} aria-hidden="true" />}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-[#283241] pt-4 text-xs leading-5 text-[#c0c8d2]"><ShieldAlert aria-hidden="true" size={15} className="shrink-0 text-[#b7bd91]" /> Potential figures stay labelled until resolved.</div>
    </div>
  )
}
