import styles from './marketing.module.css'

export function DataPrivacyContent() {
  return (
    <main id="main-content" tabIndex={-1} className={[styles.legalPage, styles.privacyPage].join(' ')}>
      <div className={styles.pageContainer}>
        <div className={styles.privacyIntro}>
          <h1>Your records stay yours.</h1>
          <p>AfterPrice uses authenticated account access and stores the purchase, subscription and preference records you add in your private workspace.</p>
        </div>
        <div className={styles.privacyGrid}>
          <section><h2>What AfterPrice stores</h2><p>Records you add, including purchase details, subscription details, observations, notification preferences and outcomes you choose to record.</p></section>
          <section><h2>What it does not need</h2><p>AfterPrice does not connect to bank accounts or retailer logins. Do not enter bank credentials, retailer passwords or other secrets.</p></section>
          <section><h2>Pro billing</h2><p>Stripe-hosted Checkout handles Pro payment details. AfterPrice stores the billing identifiers and subscription state needed to provide access and open the hosted customer portal.</p></section>
          <section><h2>What stays manual in V1</h2><p>Unsupported provider checks, claim submission and subscription cancellation remain manual. A lower price is a prompt to review terms, not proof of a refund.</p></section>
          <section><h2>Public examples</h2><p>Examples on public pages are illustrative and are not copied into your account. Your workspace starts with the records you add.</p></section>
        </div>
      </div>
    </main>
  )
}
