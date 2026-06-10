import { LegalPage } from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Privacy Policy | Korvex OS',
  description: 'How Korvex OS collects, uses, and protects your data.'
};

// Template policy — have legal counsel review before public launch.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 10, 2026">
      <p>
        Korvex OS (&ldquo;Korvex&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) helps you create, schedule, and analyze social media
        content. This policy explains what information we collect, how we use it, and the choices you have.
      </p>

      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> your name, email address, and password (stored as a secure hash by our authentication provider, Supabase).</li>
        <li><strong>Business profile and brand data:</strong> information you enter about your business, audience, brand voice, and goals so our AI can personalize content.</li>
        <li><strong>Content you create:</strong> drafts, captions, media, schedules, and campaign settings.</li>
        <li><strong>Connected social accounts:</strong> when you connect a platform (Instagram, Facebook, TikTok, LinkedIn, YouTube, X), we store the account name, handle, and encrypted access tokens. We never store your social media passwords.</li>
        <li><strong>Usage data:</strong> basic analytics about how you use the app, used to improve the product.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To provide the service: generating content, scheduling posts, and showing analytics.</li>
        <li>To personalize AI output using your business profile and brand kit.</li>
        <li>To publish content to social platforms you have explicitly connected and authorized.</li>
        <li>To communicate with you about your account and important product updates.</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal information.</p>

      <h2>3. AI processing</h2>
      <p>
        When you generate content or media, the text you provide (such as your topic and business profile) is sent to our AI
        providers (e.g. OpenAI or Google) to produce the result. These providers process the data under their own terms and do
        not use API data to train their models per their stated API policies.
      </p>

      <h2>4. Social platform data</h2>
      <p>
        Access tokens for connected social accounts are encrypted at rest. We request only the permissions needed to publish
        content and read basic account metrics. You can disconnect any account at any time from the Social Accounts page, which
        revokes our stored credentials. Data obtained from each platform is handled according to that platform&rsquo;s developer
        policies (including the Meta Platform Terms, TikTok Developer Terms, LinkedIn API Terms, Google API Services User Data
        Policy, and X Developer Agreement).
      </p>

      <h2>5. Data retention and deletion</h2>
      <p>
        We keep your data while your account is active. You may request deletion of your account and all associated data at any
        time by emailing us; we will complete deletion within 30 days.
      </p>

      <h2>6. Security</h2>
      <p>
        Data is stored with Supabase using row-level security so only you (and workspace members you invite) can access your
        records. Social tokens are encrypted with a dedicated key. All traffic is encrypted in transit (TLS).
      </p>

      <h2>7. Children</h2>
      <p>Korvex OS is not directed at children under 13, and we do not knowingly collect data from them.</p>

      <h2>8. Changes</h2>
      <p>We will post any changes to this policy on this page and update the date above.</p>
    </LegalPage>
  );
}
