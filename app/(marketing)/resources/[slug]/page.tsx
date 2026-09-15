import { notFound } from 'next/navigation'
import { ArrowUpRightIcon, ButtonLink } from '@/components/marketing/marketing-ui'
import { resources } from '@/components/marketing/marketing-data'
import styles from '@/components/marketing/marketing.module.css'

export function generateStaticParams() { return resources.map(resource => ({ slug: resource.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = resources.find(item => item.slug === slug)
  return resource ? { title: resource.title, description: resource.excerpt } : { title: 'Resource' }
}

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = resources.find(item => item.slug === slug)
  if (!resource) notFound()
  const markClass = resource.accent === 'amber' ? styles.resourceMarkAmber : resource.accent === 'green' ? styles.resourceMarkGreen : ''

  return (
    <main id="main-content" tabIndex={-1}>
      <article>
        <header className="px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:px-10"><div className="mx-auto max-w-3xl"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5967e8]">{resource.category} · {resource.readTime}</p><h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-750 leading-[0.96] tracking-[-0.065em] sm:text-7xl">{resource.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#5d6673]">{resource.excerpt}</p><p className="mt-6 text-xs text-[#68717e]">Published {resource.date}</p></div></header>
        <div className={[styles.resourceMark, markClass, 'mx-5 flex h-56 items-end p-6 sm:mx-8 sm:h-72 sm:p-10 lg:mx-auto lg:max-w-[1280px]'].join(' ')}><span className="relative z-10 max-w-xl font-[family-name:var(--font-display)] text-3xl font-700 tracking-[-0.05em] text-[#0c0f14] sm:text-5xl">A closer look at the baseline.</span></div>
        <div className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-2xl">{resource.sections.map((section, index) => <section key={section.heading} className="mb-12 last:mb-0"><p className="font-mono text-xs text-[#5967e8]">{String(index + 1).padStart(2, '0')}</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-700 tracking-[-0.05em]">{section.heading}</h2><p className="mt-4 text-base leading-8 text-[#5d6673]">{section.body}</p></section>)}<div className="mt-16 border-t border-[#d8dde5] pt-8"><ButtonLink href="/resources" variant="secondary">Back to resources <ArrowUpRightIcon /></ButtonLink></div></div></div>
      </article>
    </main>
  )
}
