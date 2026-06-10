import { LegalPage } from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Terms of Service | Korvex OS',
  description: 'The terms that govern your use of Korvex OS.'
};

// Template terms — have legal counsel review before public launch.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 10, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Korvex OS (the &ldquo;Service&rdquo;). By creating an
        account or using the Service you agree to these Terms.
      </p>

      <h2>1. Your account</h2>
      <p>
        You are responsible for your account credentials and for all activity under your account. You must provide accurate
        information and be at least 13 years old (or the minimum age in your jurisdiction).
      </p>

      <h2>2. Your content</h2>
      <p>
        You own the content you create with the Service, including AI-assisted drafts and media. You grant us the limited
        license needed to store, process, and publish that content on your behalf — for example, posting to a social account you
        connected. You are responsible for ensuring your content complies with the rules of each platform you publish to.
      </p>

      <h2>3. AI-generated content</h2>
      <p>
        AI output can be inaccurate or similar to content generated for others. Review everything before publishing. You are
        responsible for the content you publish, including compliance with advertising and disclosure laws.
      </p>

      <h2>4. Connected platforms</h2>
      <p>
        Connecting a social account authorizes us to act on your behalf within the permissions you grant. Each platform&rsquo;s
        own terms also apply. We may pause publishing if a platform changes or revokes API access.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>No spam, deceptive content, or impersonation.</li>
        <li>No unlawful, infringing, or harmful content.</li>
        <li>No attempts to disrupt, reverse engineer, or gain unauthorized access to the Service.</li>
      </ul>

      <h2>6. Subscriptions and billing</h2>
      <p>
        Paid plans renew automatically until cancelled. You can cancel anytime; access continues through the end of the billing
        period. Fees are non-refundable except where required by law.
      </p>

      <h2>7. Disclaimers and liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent permitted by law, our
        total liability for any claim is limited to the amount you paid us in the 12 months before the claim.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate accounts that violate these Terms. Upon
        termination you may request export or deletion of your data.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these Terms; material changes will be announced in the app or by email. Continued use after changes means
        you accept the new Terms.
      </p>
    </LegalPage>
  );
}
