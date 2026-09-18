export type ResourceCategory = 'Price change' | 'Plan change' | 'Renewal' | 'Practical'

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

export type ChangeRecord = {
  id: string
  category: 'Price' | 'Plan' | 'Renewal'
  label: string
  title: string
  provider: string
  status: string
  statusTone: 'positive' | 'warning' | 'negative'
  baseline: string
  current: string
  difference: string
  observed: string
  deadline: string
  summary: string
  evidence: Array<{ label: string; value: string }>
  action: string
}

export const liveChanges: ChangeRecord[] = [
  {
    id: 'sony-price-drop',
    category: 'Price',
    label: 'Price change',
    title: 'WH-1000XM6 headphones',
    provider: 'Sony Store',
    status: 'Price drop',
    statusTone: 'positive',
    baseline: '$349',
    current: '$299',
    difference: 'Potential $50 difference',
    observed: '06 Sep 2026, 11:42 AM',
    deadline: '4 days remaining',
    summary: 'The same model is listed $50 below the saved purchase price.',
    evidence: [
      { label: 'Saved baseline', value: 'Receipt · 02 Sep 2026' },
      { label: 'Latest source', value: 'Sony Store product page' },
      { label: 'Source status', value: 'Available · matched model' },
    ],
    action: 'Review the retailer adjustment policy',
  },
  {
    id: 'designtool-plan-change',
    category: 'Plan',
    label: 'Plan change',
    title: 'DesignTool Pro',
    provider: 'DesignTool',
    status: 'Plan changed',
    statusTone: 'negative',
    baseline: '100 GB storage',
    current: '50 GB storage',
    difference: 'Included storage reduced',
    observed: '05 Sep 2026, 4:16 PM',
    deadline: 'Review before next renewal',
    summary: 'The saved plan included 100 GB. The current plan page lists 50 GB.',
    evidence: [
      { label: 'Saved baseline', value: 'Plan snapshot · 16 Aug 2026' },
      { label: 'Latest source', value: 'DesignTool pricing page' },
      { label: 'Source status', value: 'Available · plan name matched' },
    ],
    action: 'Compare current plan limits',
  },
  {
    id: 'internet-renewal',
    category: 'Renewal',
    label: 'Renewal',
    title: 'Home internet plan',
    provider: 'Northline Internet',
    status: 'Renewal soon',
    statusTone: 'warning',
    baseline: '$69 / month',
    current: '$84 / month',
    difference: '+$180 / year',
    observed: '04 Sep 2026, 8:05 AM',
    deadline: '8 days remaining',
    summary: 'The next renewal is $15 more per month than the saved price.',
    evidence: [
      { label: 'Saved baseline', value: 'Invoice · 10 Sep 2025' },
      { label: 'Latest source', value: 'Provider renewal notice' },
      { label: 'Source status', value: 'Available · date confirmed' },
    ],
    action: 'Check alternatives before renewal',
  },
]

export const lifecycleSteps = [
  {
    name: 'Baseline',
    title: 'Save what was true when you bought.',
    description: 'A receipt, plan snapshot or renewal amount becomes the reference point for every later check.',
    value: '$349',
    subvalue: 'Sony WH-1000XM6 · 02 Sep 2026',
    tone: 'baseline',
  },
  {
    name: 'Observe',
    title: 'Keep the later signal beside the record.',
    description: 'An observation adds a source and time to the record, whether the source is supported or the check is still manual.',
    value: '06 Sep',
    subvalue: 'Sony Store · source available',
    tone: 'observe',
  },
  {
    name: 'Change',
    title: 'See the difference, not just an alert.',
    description: 'AfterPrice puts the original value beside the latest observed value so the change has context.',
    value: '$299',
    subvalue: 'Current listing · $50 below baseline',
    tone: 'change',
  },
  {
    name: 'Evidence',
    title: 'Inspect where the signal came from.',
    description: 'Each record keeps the source, timestamp and match status beside the comparison.',
    value: '11:42',
    subvalue: '06 Sep 2026 · source available',
    tone: 'evidence',
  },
  {
    name: 'Deadline',
    title: 'Know if waiting makes it less useful.',
    description: 'A countdown puts the relevant window next to the difference. No countdown means no invented urgency.',
    value: '4 days',
    subvalue: 'Retailer adjustment window',
    tone: 'deadline',
  },
  {
    name: 'Action',
    title: 'Choose the next move.',
    description: 'Review, claim, keep, change or dismiss. AfterPrice gives guidance, while the outcome stays yours.',
    value: 'Review',
    subvalue: 'Retailer policy and exact model',
    tone: 'action',
  },
  {
    name: 'Resolution',
    title: 'Record what happened.',
    description: 'Potential money remains potential until an outcome is confirmed and recorded in the ledger.',
    value: 'Open',
    subvalue: 'No recovery recorded yet',
    tone: 'resolution',
  },
]

export const changeTypes = [
  {
    category: 'Price change',
    title: 'The price moved after checkout.',
    baseline: '$349 paid',
    current: '$299 now',
    consequence: '$50 potential difference',
    action: 'Review adjustment terms',
  },
  {
    category: 'Plan change',
    title: 'The plan became less useful.',
    baseline: '100 GB included',
    current: '50 GB listed',
    consequence: 'Storage reduced',
    action: 'Compare plan limits',
  },
  {
    category: 'Renewal',
    title: 'The next recurring charge increased.',
    baseline: '$69 / month',
    current: '$84 / month',
    consequence: '+$180 / year',
    action: 'Review before renewal',
  },
]

export const capabilityRows = [
  ['Save a purchase or subscription baseline', 'Available in V1'],
  ['Compare price, plan and renewal records', 'Available in V1'],
  ['Show source, observed time and a next action', 'Available in V1'],
  ['Automatically check every retailer', 'Not supported in V1'],
  ['Submit a claim, cancel a service or guarantee a refund', 'Not supported in V1'],
]

export const coverageItems = [
  'Retail purchase prices after checkout',
  'Subscription plan names, prices and included limits',
  'Recurring charges and upcoming renewal dates',
  'Manual records where an automated source is unavailable',
]

export const faqItems = [
  {
    question: 'What does AfterPrice monitor?',
    answer: 'AfterPrice compares a saved purchase price, subscription plan or renewal amount with later information. Public examples show all three as one change ledger, while your account records stay private.',
  },
  {
    question: 'Does AfterPrice claim refunds automatically?',
    answer: 'No. It shows the difference, evidence and relevant timing so you can review the provider policy and submit a claim yourself.',
  },
  {
    question: 'Do I need to connect my bank account?',
    answer: 'No. Add the purchase or subscription details you want to monitor. Account access uses Supabase authentication, and you should never enter bank credentials or retailer passwords.',
  },
  {
    question: 'What remains manual?',
    answer: 'Retailer checks without a supported source, claim submission and subscription cancellation remain manual in this V1. Pro billing runs through Stripe-hosted Checkout, while account authentication and access updates remain server-controlled.',
  },
]

export const resources: Resource[] = [
  {
    slug: 'post-purchase-price-adjustments',
    title: 'How post-purchase price adjustments work',
    excerpt: 'A practical way to check whether a price drop is still inside a retailer’s adjustment window.',
    category: 'Price change',
    readTime: '6 min read',
    date: '18 Jun 2026',
    accent: 'blue',
    sections: [
      { heading: 'A purchase is not the end of the story', body: 'Retail prices move constantly. Some retailers offer a short adjustment window after you buy, while others handle a claim through a support form or store policy. AfterPrice keeps the original purchase price beside the current price so you know when it is worth checking.' },
      { heading: 'What to check first', body: 'Start with the retailer’s policy, the exact product variant and the dates. A lower price alone is not a promise of money back. It is a signal to review the terms and decide whether a claim is worth your time.' },
      { heading: 'Use the signal well', body: 'Save the purchase once, then review the difference, deadline and evidence together. The goal is a specific decision, not another stream of vague notifications.' },
    ],
  },
  {
    slug: 'software-subscriptions-get-expensive',
    title: 'Why software subscriptions become more expensive',
    excerpt: 'Price changes are only one part of a plan change. Read the terms that tend to move underneath you.',
    category: 'Plan change',
    readTime: '7 min read',
    date: '12 Jun 2026',
    accent: 'green',
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
    category: 'Renewal',
    readTime: '5 min read',
    date: '04 Jun 2026',
    accent: 'amber',
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
    accent: 'blue',
    sections: [
      { heading: 'Check the date and the amount', body: 'Confirm the renewal date, the amount that will be charged and the payment method. Then compare each against last year’s baseline.' },
      { heading: 'Read the current limits', body: 'Look for changes to seats, storage, exports, usage and support. Annual plans often change in the details that are not visible in a simple price comparison.' },
      { heading: 'Choose an action', body: 'Decide before the reminder becomes an emergency. Keeping, changing or cancelling are all valid outcomes when they are deliberate.' },
    ],
  },
]
