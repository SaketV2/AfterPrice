import { notFound } from 'next/navigation'
import { ButtonLink, Eyebrow } from '@/components/marketing/marketing-ui'
import { resources } from '@/components/marketing/marketing-data'

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
  return <main><article><header className="px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-24 lg:px-10"><div className="mx-auto max-w-3xl"><Eyebrow>{resource.category} · {resource.readTime}</Eyebrow><h1 className="font-[family-name:var(--font-display)] text-5xl font-750 leading-[.96] tracking-[-.07em] sm:text-7xl">{resource.title}</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#5d6673]">{resource.excerpt}</p><p className="mt-6 text-xs text-[#818b99]">Published {resource.date}</p></div></header><div className={`mx-5 h-56 rounded-[28px] bg-gradient-to-br sm:mx-8 sm:h-72 lg:mx-auto lg:max-w-[1280px] lg:px-10 ${resource.accent}`}><div className="flex h-full items-end p-6 sm:p-10"><span className="font-[family-name:var(--font-display)] text-3xl font-700 tracking-[-.05em] text-[#0c0f14] sm:text-5xl">A closer look at the baseline.</span></div></div><div className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10"><div className="mx-auto max-w-2xl">{resource.sections.map((section, index) => <section key={section.heading} className="mb-12 last:mb-0"><p className="font-mono text-xs text-[#6875f5]">0{index + 1}</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-700 tracking-[-.05em]">{section.heading}</h2><p className="mt-4 text-base leading-8 text-[#5d6673]">{section.body}</p></section>)}<div className="mt-16 border-t border-[#e1e5ea] pt-8"><ButtonLink href="/resources" variant="secondary">Back to resources <span aria-hidden="true">↗</span></ButtonLink></div></div></div></article></main>
}
