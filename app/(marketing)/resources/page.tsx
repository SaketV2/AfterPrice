import Link from 'next/link'
import { ArrowUpRightIcon, ButtonLink } from '@/components/marketing/marketing-ui'
import { resources } from '@/components/marketing/marketing-data'
import styles from '@/components/marketing/marketing.module.css'

export const metadata = { title: 'Resources' }

function ResourceMark({ accent, label }: { accent: string; label: string }) {
  return <div className={[styles.resourceMark, accent === 'amber' ? styles.resourceMarkAmber : accent === 'green' ? styles.resourceMarkGreen : '', 'flex items-end p-5'].join(' ')}><span className="relative z-10 text-xs font-bold uppercase tracking-[0.14em] text-[hsl(var(--foreground))]">{label}</span></div>
}

export default function ResourcesPage() {
  const [featured, ...rest] = resources
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-20 lg:px-10"><div className="mx-auto max-w-[1280px]"><h1 className="max-w-4xl  text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl">Better questions for the costs you already pay.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[hsl(var(--foreground-secondary))]">Practical reading on price adjustments, plan changes and recurring payments that deserve a closer look.</p></div></section>
      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10"><div className="mx-auto max-w-[1280px]"><Link href={'/resources/' + featured.slug} className="group grid overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-surface lg:grid-cols-[1.05fr_0.95fr]"><ResourceMark accent={featured.accent} label={'Featured · ' + featured.category} /><div className="flex flex-col justify-center p-7 sm:p-10"><p className="text-xs text-[hsl(var(--foreground-muted))]">{featured.date} · {featured.readTime}</p><h2 className="mt-4  text-3xl font-bold leading-tight tracking-[-0.035em] group-hover:text-[hsl(var(--success))]">{featured.title}</h2><p className="mt-4 max-w-md text-sm leading-7 text-[hsl(var(--foreground-secondary))]">{featured.excerpt}</p><span className="mt-8 inline-flex items-center text-sm font-semibold text-[hsl(var(--foreground))]">Read the note <ArrowUpRightIcon className="ml-2 transition group-hover:translate-x-1" /></span></div></Link></div></section>
      <section className="border-t border-[hsl(var(--border))] px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-[1280px]"><div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--success))]">All resources</p><h2 className="mt-4  text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Read what helps.</h2></div><p className="text-sm text-[hsl(var(--foreground-muted))]">{resources.length} practical notes</p></div><div className="divide-y divide-[hsl(var(--border))] border-y border-[hsl(var(--border))]">{rest.map(resource => <Link href={'/resources/' + resource.slug} key={resource.slug} className="group grid gap-5 py-6 sm:grid-cols-[0.3fr_1fr_1.2fr_auto] sm:items-center"><ResourceMark accent={resource.accent} label={resource.category} /><div><p className="text-xs text-[hsl(var(--foreground-muted))]">{resource.date} · {resource.readTime}</p><h3 className="mt-2  text-xl font-bold leading-tight tracking-[-0.04em] group-hover:text-[hsl(var(--success))]">{resource.title}</h3></div><p className="text-sm leading-6 text-[hsl(var(--foreground-secondary))]">{resource.excerpt}</p><ArrowUpRightIcon className="text-[hsl(var(--success))]" /></Link>)}</div></div></section>
      <section className="px-5 pb-28 sm:px-8 sm:pb-40 lg:px-10"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-7 rounded-xl bg-[hsl(var(--surface-dark))] px-7 py-10 text-[hsl(var(--foreground-on-dark))] sm:flex-row sm:items-center sm:px-10"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--signal-lime))]">See it in context</p><h2 className="mt-4  text-3xl font-bold tracking-[-0.035em] sm:text-4xl">The product starts with the record.</h2></div><ButtonLink href="/demo" variant="light">View sample <ArrowUpRightIcon /></ButtonLink></div></section>
    </main>
  )
}
