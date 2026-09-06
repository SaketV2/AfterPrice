export type ResourceCategory = 'PriceClaim' | 'PlanGuard' | 'RenewalAudit' | 'Practical'

export type Resource = {
  slug: string
  title: string
  excerpt: string
  category: ResourceCategory
  readTime: string
  date: string
  accent: string
  sections: Array<{ heading: string; body: string }>
}

export const resources: Resource[] = [
  {
    slug: 'post-purchase-price-adjustments',
    title: 'How post-purchase price adjustments work',
    excerpt: 'A practical way to check whether a price drop is still inside a retailer’s adjustment window.',
    category: 'PriceClaim',
    readTime: '6 min read',
    date: '18 Jun 2026',
    accent: 'from-[#dceaf6] to-[#eef2ff]',
    sections: [
      { heading: 'A purchase is not the end of the story', body: 'Retail prices move constantly. Some retailers offer a short adjustment window after you buy, while others handle a claim through a support form or store policy. SpendGuard keeps the original purchase price beside the current price so you know when it is worth checking.' },
      { heading: 'What to check first', body: 'Start with the retailer’s policy, the exact product variant and the dates. A lower price alone is not a promise of money back. It is a signal to review the terms and decide whether a claim is worth your time.' },
      { heading: 'A calmer way to monitor it', body: 'Instead of remembering every price you paid, save the purchase once. SpendGuard can flag a meaningful drop, show the remaining window and give you a clear checklist for the next step.' },
    ],
  },
  {
    slug: 'software-subscriptions-get-expensive',
    title: 'Why software subscriptions quietly become more expensive',
    excerpt: 'Price changes are only one part of a plan change. Read the terms that tend to move underneath you.',
    category: 'PlanGuard',
    readTime: '7 min read',
    date: '12 Jun 2026',
    accent: 'from-[#e9e9f8] to-[#e4f3ee]',
    sections: [
      { heading: 'The price is the obvious signal', body: 'A monthly fee can rise without an obvious change to your workflow. The harder part is noticing when storage, usage limits, exports or included seats move at the same time.' },
      { heading: 'Compare the promise with the current plan', body: 'Keep a snapshot of the plan you chose. Then compare price, limits and the features you actually rely on when renewal approaches.' },
      { heading: 'Make a deliberate decision', body: 'A plan change does not automatically mean cancel. It means you have a better decision to make: keep it, downgrade, renegotiate or move your work elsewhere.' },
    ],
  },
  {
    slug: 'audit-recurring-payments',
    title: 'How to audit your recurring payments',
    excerpt: 'A simple quarterly review for finding renewals that deserve a second look.',
    category: 'RenewalAudit',
    readTime: '5 min read',
    date: '04 Jun 2026',
    accent: 'from-[#faedcf] to-[#f8e4e7]',
    sections: [
      { heading: 'Work from the next renewal', body: 'Start with the subscriptions renewing soonest. The closer the date, the more useful a clear comparison between last year and this year becomes.' },
      { heading: 'Measure annual impact', body: 'A small monthly increase is easy to dismiss. Multiplying the difference by twelve gives you the number that belongs in the decision.' },
      { heading: 'Keep only what earns its place', body: 'Review the value you received, the alternatives available and whether you still need the service. A renewal should be an active choice, not a default.' },
    ],
  },
  {
    slug: 'before-an-annual-renewal',
    title: 'What to check before an annual subscription renews',
    excerpt: 'A five-minute checklist for the date, price and terms that matter most.',
    category: 'Practical',
    readTime: '4 min read',
    date: '28 May 2026',
    accent: 'from-[#e4f2f1] to-[#e6e8fa]',
    sections: [
      { heading: 'Check the date and the amount', body: 'Confirm the renewal date, the amount that will be charged and the payment method. Then compare each against last year’s baseline.' },
      { heading: 'Read the current limits', body: 'Look for changes to seats, storage, exports, usage and support. Annual plans often change in the details that are not visible in a simple price comparison.' },
      { heading: 'Choose an action', body: 'Decide before the reminder becomes an emergency. Keeping, changing or cancelling are all valid outcomes when they are deliberate.' },
    ],
  },
  {
    slug: 'track-saas-plan-changes',
    title: 'How to track whether a SaaS plan changed',
    excerpt: 'The useful baseline is the plan you bought, not the plan shown on the pricing page today.',
    category: 'PlanGuard',
    readTime: '6 min read',
    date: '19 May 2026',
    accent: 'from-[#eceaf8] to-[#f4efe4]',
    sections: [
      { heading: 'Save the original plan', body: 'Record the plan name, price and limits at the time you subscribe. That snapshot gives you something concrete to compare later.' },
      { heading: 'Watch for quiet reductions', body: 'A plan can become less useful even when the name stays the same. Storage caps, quotas, seats and included tools are all part of the value.' },
      { heading: 'Make changes visible', body: 'A short, plain-language summary is more useful than a dense change log. See what changed, what it costs and what you can do next.' },
    ],
  },
  {
    slug: 'when-a-lower-price-qualifies',
    title: 'When a lower retail price may qualify for an adjustment',
    excerpt: 'The difference between spotting a lower price and having a useful next step.',
    category: 'PriceClaim',
    readTime: '5 min read',
    date: '08 May 2026',
    accent: 'from-[#e6f0f6] to-[#ececf9]',
    sections: [
      { heading: 'Start with the policy', body: 'Retailers set their own rules, exclusions and timing. Check the policy for the item and region before assuming an adjustment applies.' },
      { heading: 'Match the exact item', body: 'Colour, size, condition, seller and fulfilment can change whether two listings are actually comparable. SpendGuard helps you keep that context beside the price.' },
      { heading: 'Use the signal wisely', body: 'A flag is a prompt to review, not a guaranteed outcome. The goal is to reclaim opportunities without spending an hour chasing a small difference.' },
    ],
  },
]

export const faqItems = [
  { question: 'What does SpendGuard actually monitor?', answer: 'SpendGuard monitors purchase prices after you buy, subscription prices and plan terms, and upcoming renewals. It brings relevant changes into one alert stream so you can decide what to do.' },
  { question: 'Does SpendGuard automatically claim refunds?', answer: 'No. V1 gives you the price difference, timing and claim instructions so you can review the retailer policy and submit a claim yourself. We do not pretend to automate an outcome we cannot control.' },
  { question: 'Do I need to connect my bank account?', answer: 'No. The V1 demo is manual-first. You can add a purchase or subscription, save a receipt workflow and see how the monitoring engine would work without giving up banking credentials.' },
  { question: 'What happens to my data?', answer: 'The demo uses local sample data in your browser. SpendGuard is designed around the minimum information needed to monitor a purchase or plan, with clear control over what you add and remove.' },
  { question: 'Is the demo real or just a visual mock-up?', answer: 'It is an interactive product demo with seeded data. Search, filters, details, alerts and add-item flows work locally. Authentication, retailer checks and payment processing are intentionally mocked for V1.' },
  { question: 'Can I cancel a subscription from SpendGuard?', answer: 'Not in V1. SpendGuard highlights the renewal and plan change so you can make an informed choice, but it does not cancel services or submit changes on your behalf.' },
]

export const productSignals = [
  { eyebrow: 'PRICECLAIM', title: 'A lower price should not become someone else’s profit.', description: 'Keep the price you paid next to the price today, with the claim window and a sensible next step.', label: 'Potential claim', value: '$50', meta: '4 days left' },
  { eyebrow: 'PLANGUARD', title: 'Know when the plan you bought becomes worse.', description: 'See price, limits and included benefits side by side, so a quiet downgrade becomes an obvious decision.', label: 'Plan change', value: '52.6%', meta: 'price increase' },
  { eyebrow: 'RENEWALAUDIT', title: 'Review the price before it renews.', description: 'See the next charge, annual impact and plan context before a recurring payment becomes automatic.', label: 'Annual impact', value: '+$180', meta: '8 days remaining' },
]

export const valueStrip = ['Watch purchases', 'Monitor subscriptions', 'Review renewals', 'Recover opportunities']
