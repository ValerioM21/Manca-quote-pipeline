export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "720px", margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif", lineHeight: 1.6 }}>
      <h1>Privacy Policy - Manca: Quote Analytics</h1>
      <p><em>Effective date: August 11, 2026</em></p>

      <h2>1. Information We Collect</h2>
      <p>
        This app collects aggregated business data derived from your store's draft orders via
        Shopify webhooks: draft order ID, creation date, total value, currency, status
        (open, completed, deleted), and related timestamps.
      </p>
      <p>
        We do not collect, store, or process any personal information about your customers,
        including names, emails, addresses, phone numbers, or order line item details.
      </p>

      <h2>2. How We Use This Information</h2>
      <p>
        Aggregated data is used solely to power in-app analytics (such as open quote counts,
        conversion rate, and stale quotes) and to answer merchant questions through the
        Shopify Sidekick integration.
      </p>

      <h2>3. Data Storage</h2>
      <p>Data is stored in a PostgreSQL database hosted on Render, in the Frankfurt (EU) region.</p>

      <h2>4. Data Retention and Deletion</h2>
      <p>
        Data associated with your store is retained while the app is installed. Upon
        uninstallation, we comply with Shopify's mandatory compliance webhooks (customer
        data request, customer redact, shop redact) as required by the Shopify Partner Program.
      </p>

      <h2>5. Third-Party Sharing</h2>
      <p>We do not sell or share your data with third parties. Data is used exclusively to operate the app for your store.</p>

      <h2>6. Contact</h2>
      <p>For privacy-related questions or requests, contact: mancavalerio1@gmail.com</p>
    </div>
  );
}
