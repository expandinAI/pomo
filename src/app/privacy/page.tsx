'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Privacy Policy Page
 *
 * GDPR-compliant privacy policy
 * Route: /privacy
 *
 * Design: Marketing page style, minimal, readable
 * - The Particle
 * - Back button
 * - Structured content sections
 */
export default function PrivacyPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-background light:bg-background-dark print:bg-white">
      {/* Header - hidden in print */}
      <header className="sticky top-0 z-10 bg-background/80 light:bg-background-dark/80 backdrop-blur-sm border-b border-tertiary/10 light:border-tertiary-dark/10 print:hidden">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              className="w-2 h-2 rounded-full bg-primary light:bg-primary-dark"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400 }}
            />
            <span className="text-sm font-medium text-primary light:text-primary-dark">
              Particle
            </span>
          </div>

          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Particle
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-12 print:py-8">
        <motion.div
          className="print:!opacity-100 print:!transform-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          {/* Title */}
          <h1 className="text-2xl font-bold text-primary light:text-primary-dark print:!text-black mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-tertiary light:text-tertiary-dark print:!text-gray-500 mb-8">
            Last updated: February 2026
          </p>

          <div className="space-y-8 print:space-y-6">
            {/* Introduction */}
            <section>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700">
                Particle (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy.
                This policy explains how we collect, use, and safeguard your data when you use our focus timer application.
              </p>
            </section>

            {/* 1. Controller */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                1. Data Controller
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700 mb-2">
                The data controller responsible for your personal data is:
              </p>
              <address className="text-secondary light:text-secondary-dark print:!text-gray-700 not-italic">
                Particle<br />
                Email: <a href="mailto:privacy@particle.app" className="text-accent hover:underline print:!text-black print:!underline">privacy@particle.app</a>
              </address>
            </section>

            {/* 2. What Data We Collect */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                2. What Data We Collect
              </h2>
              <ul className="space-y-3 text-secondary light:text-secondary-dark print:!text-gray-700">
                <li>
                  <strong className="text-primary light:text-primary-dark print:!text-black">Account Data:</strong>{' '}
                  Email address, name, and profile picture (via authentication provider)
                </li>
                <li>
                  <strong className="text-primary light:text-primary-dark print:!text-black">Usage Data:</strong>{' '}
                  Focus sessions (start time, duration, task descriptions, project assignments)
                </li>
                <li>
                  <strong className="text-primary light:text-primary-dark print:!text-black">AI Coach Data:</strong>{' '}
                  Conversation history with the AI Coach (for personalized insights)
                </li>
                <li>
                  <strong className="text-primary light:text-primary-dark print:!text-black">Payment Data:</strong>{' '}
                  Subscription status and billing history (processed by Stripe, we don&apos;t store card details)
                </li>
                <li>
                  <strong className="text-primary light:text-primary-dark print:!text-black">Settings:</strong>{' '}
                  Your preferences (timer durations, theme, notification settings)
                </li>
              </ul>
            </section>

            {/* 3. Why We Collect This Data */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                3. Why We Collect This Data
              </h2>
              <ul className="space-y-2 text-secondary light:text-secondary-dark print:!text-gray-700 list-disc list-inside">
                <li><strong className="print:!text-black">Service Delivery:</strong> To provide the core focus timer functionality</li>
                <li><strong className="print:!text-black">Personalization:</strong> To sync your data across devices and provide AI insights</li>
                <li><strong className="print:!text-black">Billing:</strong> To process payments and manage subscriptions</li>
                <li><strong className="print:!text-black">Improvement:</strong> To understand usage patterns and improve the product (if analytics enabled)</li>
              </ul>
            </section>

            {/* 4. How Long We Keep Data */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                4. Data Retention
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700">
                We retain your data until you delete your account. After account deletion:
              </p>
              <ul className="mt-2 space-y-1 text-secondary light:text-secondary-dark print:!text-gray-700 list-disc list-inside">
                <li>Personal data is deleted within 30 days</li>
                <li>Anonymized analytics may be retained indefinitely</li>
                <li>Payment records are kept as required by law (typically 7 years)</li>
              </ul>
            </section>

            {/* 5. Sub-processors */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                5. Service Providers (Sub-processors)
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700 mb-4">
                We use the following third-party services to operate Particle:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-tertiary/20 light:border-tertiary-dark/20 print:!border-gray-300">
                      <th className="text-left py-2 pr-4 text-primary light:text-primary-dark print:!text-black font-medium">Service</th>
                      <th className="text-left py-2 pr-4 text-primary light:text-primary-dark print:!text-black font-medium">Purpose</th>
                      <th className="text-left py-2 text-primary light:text-primary-dark print:!text-black font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody className="text-secondary light:text-secondary-dark print:!text-gray-700">
                    <tr className="border-b border-tertiary/10 light:border-tertiary-dark/10 print:!border-gray-200">
                      <td className="py-2 pr-4">Supabase</td>
                      <td className="py-2 pr-4">Database & Storage</td>
                      <td className="py-2">EU (Frankfurt)</td>
                    </tr>
                    <tr className="border-b border-tertiary/10 light:border-tertiary-dark/10 print:!border-gray-200">
                      <td className="py-2 pr-4">Clerk</td>
                      <td className="py-2 pr-4">Authentication</td>
                      <td className="py-2">USA</td>
                    </tr>
                    <tr className="border-b border-tertiary/10 light:border-tertiary-dark/10 print:!border-gray-200">
                      <td className="py-2 pr-4">Stripe</td>
                      <td className="py-2 pr-4">Payment Processing</td>
                      <td className="py-2">USA</td>
                    </tr>
                    <tr className="border-b border-tertiary/10 light:border-tertiary-dark/10 print:!border-gray-200">
                      <td className="py-2 pr-4">Anthropic</td>
                      <td className="py-2 pr-4">AI Coach</td>
                      <td className="py-2">USA</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4">Vercel</td>
                      <td className="py-2 pr-4">Hosting</td>
                      <td className="py-2">Global (Edge)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 6. Data Transfers */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                6. International Data Transfers
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700">
                Some of our service providers are located in the USA. For these transfers, we rely on:
              </p>
              <ul className="mt-2 space-y-1 text-secondary light:text-secondary-dark print:!text-gray-700 list-disc list-inside">
                <li>EU-U.S. Data Privacy Framework (where applicable)</li>
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
              </ul>
            </section>

            {/* 7. Your Rights */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                7. Your Rights
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700 mb-3">
                Under GDPR and similar regulations, you have the right to:
              </p>
              <ul className="space-y-2 text-secondary light:text-secondary-dark print:!text-gray-700 list-disc list-inside">
                <li><strong className="print:!text-black">Access:</strong> Request a copy of your data (use the Export feature in Settings)</li>
                <li><strong className="print:!text-black">Rectification:</strong> Correct inaccurate personal data</li>
                <li><strong className="print:!text-black">Erasure:</strong> Delete your account and all associated data</li>
                <li><strong className="print:!text-black">Portability:</strong> Export your data in a machine-readable format (JSON)</li>
                <li><strong className="print:!text-black">Object:</strong> Opt-out of analytics tracking in Settings</li>
                <li><strong className="print:!text-black">Complaint:</strong> Lodge a complaint with your local data protection authority</li>
              </ul>
            </section>

            {/* 8. Analytics */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                8. Analytics
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700">
                We use privacy-focused, cookieless analytics to understand how Particle is used.
                Analytics data is anonymized and cannot be linked to individual users.
                You can opt-out of analytics entirely in Settings → Privacy.
              </p>
            </section>

            {/* 9. Changes */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                9. Changes to This Policy
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700">
                We may update this privacy policy from time to time. For significant changes,
                we will notify you via email or in-app notification. Continued use of Particle
                after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* 10. Contact */}
            <section>
              <h2 className="text-lg font-semibold text-primary light:text-primary-dark print:!text-black mb-3">
                10. Contact Us
              </h2>
              <p className="text-secondary light:text-secondary-dark print:!text-gray-700">
                For privacy-related questions or to exercise your rights, contact us at:{' '}
                <a href="mailto:privacy@particle.app" className="text-accent hover:underline print:!text-black print:!underline">
                  privacy@particle.app
                </a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer - hidden in print */}
      <footer className="border-t border-tertiary/10 light:border-tertiary-dark/10 py-6 print:hidden">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm text-tertiary light:text-tertiary-dark">
            © {new Date().getFullYear()} Particle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
