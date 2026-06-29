import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | REIPro",
  description:
    "Privacy Policy for REIPro — Real Estate Investment Analysis Platform.",
};

export default function PrivacyPolicy() {
  const lastUpdated = "June 29, 2026";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>

        <div className="prose mt-10 max-w-none space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              1. Introduction
            </h2>
            <p>
              REIPro (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
              operates the website located at{" "}
              <strong>realestate-investment-pro.vercel.app</strong> (the
              &quot;Service&quot;). This Privacy Policy describes how we
              collect, use, disclose, and protect your information when you
              visit our website and use our real estate investment analysis
              tools. By accessing or using the Service, you agree to the
              collection and use of information in accordance with this
              policy.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-foreground mt-4">
              2.1 Information You Provide
            </h3>
            <p>
              When you use our property analysis tools, you may voluntarily
              provide property-related information such as property
              addresses, purchase prices, rental income estimates, and
              financial assumptions. This data is used solely to generate
              your investment analysis and is not stored on our servers
              beyond the duration of your session.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4">
              2.2 Automatically Collected Information
            </h3>
            <p>
              We may automatically collect certain information when you
              visit our website, including your IP address, browser type
              and version, operating system, referring URLs, pages viewed,
              time and date of your visit, and time spent on each page.
              This information is collected through cookies, log files, and
              similar tracking technologies.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4">
              2.3 Analytics Data
            </h3>
            <p>
              We use Vercel Analytics and similar services to understand
              how visitors interact with our website. These services may
              collect anonymized usage data including page views, session
              duration, and device information. This data does not
              personally identify you.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                To provide, operate, and maintain our real estate analysis
                tools
              </li>
              <li>
                To generate investment reports based on the property data
                you submit
              </li>
              <li>To improve, personalize, and expand our Service</li>
              <li>
                To understand and analyze how you use our website and
                identify usage trends
              </li>
              <li>
                To develop new products, services, features, and
                functionality
              </li>
              <li>
                To communicate with you, including for customer service and
                support
              </li>
              <li>To detect, prevent, and address technical issues</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              4. Data Retention
            </h2>
            <p>
              Property data submitted for analysis is processed in
              real-time and is not permanently stored on our servers. Your
              analysis results are generated on-demand and exist only
              during your active browser session. We do not maintain a
              database of user-submitted property information. Aggregated,
              anonymized analytics data may be retained for up to 24
              months to help us improve the Service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              5. Data Sharing and Disclosure
            </h2>
            <p>
              We do not sell, trade, or rent your personal information to
              third parties. We may share information in the following
              limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Service Providers:</strong> We may share data with
                third-party vendors who assist us in operating our website,
                including hosting providers (Vercel) and analytics services
              </li>
              <li>
                <strong>AI Processing:</strong> When AI-powered analysis
                is enabled, property data may be sent to third-party AI
                providers (such as OpenAI) for processing. This data is
                subject to the AI provider&apos;s privacy policy and is
                not stored by the provider for training purposes
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your
                information if required to do so by law or in response to
                valid requests by public authorities
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a
                merger, acquisition, or sale of assets, user information
                may be transferred to the acquiring entity
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              6. Cookies and Tracking Technologies
            </h2>
            <p>
              We use cookies and similar tracking technologies to track
              activity on our Service and hold certain information. Cookies
              are files with a small amount of data that may include an
              anonymous unique identifier. You can instruct your browser to
              refuse all cookies or indicate when a cookie is being sent.
              However, if you do not accept cookies, some portions of our
              Service may not function properly.
            </p>
            <p className="mt-2">Types of cookies we use:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Essential Cookies:</strong> Necessary for the
                website to function properly
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how
                visitors interact with our website
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings
                and preferences
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              7. Security
            </h2>
            <p>
              We implement appropriate technical and organizational
              security measures to protect the information we process.
              These measures include encryption of data in transit via
              SSL/TLS, secure hosting infrastructure, regular security
              assessments, and access controls. However, no method of
              transmission over the Internet or method of electronic
              storage is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              8. Your Rights
            </h2>
            <p>
              Depending on your location, you may have certain rights
              regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                The right to access the personal data we hold about you
              </li>
              <li>
                The right to request correction of inaccurate personal data
              </li>
              <li>
                The right to request deletion of your personal data
              </li>
              <li>
                The right to object to or restrict processing of your
                personal data
              </li>
              <li>The right to data portability</li>
              <li>
                The right to withdraw consent at any time where processing
                is based on consent
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at the
              email address listed below.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our Service is not directed to individuals under the age of
              18. We do not knowingly collect personal information from
              children under 18. If we become aware that we have collected
              personal data from a child under 18 without verification of
              parental consent, we take steps to remove that information
              from our servers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              10. Third-Party Links
            </h2>
            <p>
              Our Service may contain links to third-party websites that
              are not operated by us. We have no control over, and assume
              no responsibility for, the content, privacy policies, or
              practices of any third-party websites or services. We
              strongly advise you to review the Privacy Policy of every
              site you visit.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              11. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and maintained on
              servers located outside of your state, province, country, or
              other governmental jurisdiction where data protection laws
              may differ from those of your jurisdiction. By using our
              Service, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              12. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy
              on this page and updating the &quot;Last updated&quot; date
              at the top of this page. Changes are effective immediately
              upon posting. You are advised to review this Privacy Policy
              periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              13. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                By email:{" "}
                <a
                  href="mailto:privacy@reipro.app"
                  className="text-primary hover:underline"
                >
                  privacy@reipro.app
                </a>
              </li>
              <li>
                By visiting the contact section on our website
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
