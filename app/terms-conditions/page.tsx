import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AlertTriangle, HardHat, Info } from "lucide-react";

import { PageHeader } from "@/components/sections/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { absoluteUrl, routeMetadata, siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Terms & Conditions route (`/terms-conditions`) — one of the eight
 * content-parity routes (Requirements 1.1, 1.2). Content is derived from the
 * legacy `terms-conditions.html` page.
 *
 * Layout follows the design's "Cross-Page Layout Pattern": the shared
 * {@link PageHeader} band (overline + h1 + lead) followed by long-form prose in
 * the narrower `max-w-3xl` measure called out in "Spacing & Layout". Styling is
 * token-only (no color/typography literals) — headings inherit the display type
 * treatment, body copy uses `--muted`, emphasis uses `--foreground`, callouts
 * sit on `--surface`, and warning callouts use the `--warning` semantic token.
 */

const route = routeMetadata.terms;

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
  alternates: { canonical: absoluteUrl(route.path) },
  openGraph: {
    type: route.ogType,
    siteName: siteConfig.name,
    title: route.title,
    description: route.description,
    url: absoluteUrl(route.path),
    images: [{ url: route.ogImage, width: 1200, height: 630, alt: route.title }],
  },
  twitter: {
    card: route.twitterCard,
    title: route.title,
    description: route.description,
    images: [route.ogImage],
  },
};

/** A long-form prose section: anchorable `h2` heading + body content. */
function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <ScrollReveal>
      <section id={id} className="scroll-mt-24 space-y-4">
        <h2 className="text-2xl text-foreground md:text-3xl">{title}</h2>
        {children}
      </section>
    </ScrollReveal>
  );
}

/** Sub-section heading inside a {@link LegalSection}. */
function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 text-lg font-semibold text-foreground">{children}</h3>
  );
}

/** Standard body paragraph in the prose measure. */
function Paragraph({ children }: { children: ReactNode }) {
  return <p className="text-muted">{children}</p>;
}

/** Bulleted list with token styling. */
function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-6 text-muted">{children}</ul>;
}

/** Inline emphasis that reads against the muted body color. */
function Term({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

/**
 * A tinted callout box. The `note` variant sits on `--surface`; the `warning`
 * variant uses the `--warning` semantic token for critical, non-clinical-use
 * notices.
 */
function Callout({
  icon: Icon,
  title,
  variant = "note",
  children,
}: {
  icon: typeof Info;
  title: string;
  variant?: "note" | "warning";
  children: ReactNode;
}) {
  const isWarning = variant === "warning";
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        isWarning ? "border-warning/40 bg-warning/10" : "border-border bg-surface",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn("size-4", isWarning ? "text-warning" : "text-primary")}
          aria-hidden="true"
        />
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      <div className="mt-2 space-y-2 text-muted">{children}</div>
    </div>
  );
}

export default function TermsConditionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        subhead="Please read these terms carefully before using our products (Orasis AI and Gnosis AI) or joining a beta or pilot program."
      >
        <p className="text-sm font-medium text-muted">
          Last updated: June 11, 2025
        </p>
      </PageHeader>

      <section className="pb-16 md:pb-24">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <article className="space-y-12 leading-relaxed">
              <ScrollReveal>
                <Callout icon={HardHat} title="Development phase notice">
                  <p>
                    BioAnalytiX products are in development and limited release.
                    Orasis AI is not certified as a medical device and is not
                    approved for clinical use. Gnosis AI is a study aid offered
                    through a university pilot. These terms apply to our beta,
                    pilot, and development activities.
                  </p>
                </Callout>
              </ScrollReveal>

              <LegalSection id="acceptance" title="Acceptance of terms">
                <Paragraph>
                  By accessing any BioAnalytiX product &mdash; Orasis AI or
                  Gnosis AI &mdash; or participating in our beta or pilot
                  programs (the &ldquo;Service&rdquo;), you acknowledge that:
                </Paragraph>
                <List>
                  <li>
                    You have read and understood these Terms and Conditions (the
                    &ldquo;Terms&rdquo;)
                  </li>
                  <li>
                    You understand our products are under development and that
                    Orasis AI is not certified for clinical use
                  </li>
                  <li>You agree to be bound by these Terms</li>
                  <li>
                    You are participating voluntarily in testing, pilot, and
                    development activities
                  </li>
                </List>
                <Paragraph>
                  If you disagree with any part of these Terms, you must not
                  access or use the Service.
                </Paragraph>
                <Callout icon={Info} title="Who can use the Service">
                  <p>Currently, access is limited to:</p>
                  <List>
                    <li>Approved beta and pilot participants</li>
                    <li>Development team members</li>
                    <li>Academic and research partners</li>
                    <li>
                      Healthcare professionals evaluating Orasis AI (non-clinical
                      use only)
                    </li>
                    <li>
                      Students and faculty taking part in the Gnosis AI pilot
                    </li>
                  </List>
                </Callout>
              </LegalSection>

              <LegalSection
                id="development-status"
                title="Development status & limitations"
              >
                <Callout
                  icon={AlertTriangle}
                  variant="warning"
                  title="Critical warning: Orasis AI is not a certified medical device"
                >
                  <List>
                    <li>
                      The platform is for research and development purposes only
                    </li>
                    <li>Not approved by the FDA, CE, or any regulatory body</li>
                    <li>Not intended for clinical decision-making</li>
                    <li>Not suitable for patient diagnosis or treatment</li>
                    <li>
                      Results are experimental and should not be relied upon
                    </li>
                  </List>
                </Callout>
                <Callout icon={Info} title="Gnosis AI is a study aid">
                  <p>
                    Gnosis AI supports your learning using your official course
                    material. It is not a substitute for your courses,
                    instructors, or official assessments, and its answers may
                    contain errors &mdash; always verify against your course
                    materials.
                  </p>
                </Callout>
                <SubHeading>Current platform status</SubHeading>
                <List>
                  <li>
                    <Term>Development phase:</Term> pre-certification beta testing
                  </li>
                  <li>
                    <Term>Regulatory status:</Term> no medical-device
                    certifications
                  </li>
                  <li>
                    <Term>Intended use:</Term> testing, feedback, and development
                    only
                  </li>
                  <li>
                    <Term>Data processing:</Term> test data and anonymized samples
                    only
                  </li>
                </List>
                <SubHeading>Future plans</SubHeading>
                <Paragraph>We are working toward:</Paragraph>
                <List>
                  <li>HIPAA compliance for US healthcare markets</li>
                  <li>CE marking under the Medical Device Regulation (MDR)</li>
                  <li>FDA clearance consideration</li>
                  <li>ISO certifications for quality management</li>
                </List>
              </LegalSection>

              <LegalSection id="beta" title="Beta &amp; pilot program terms">
                <SubHeading>Nature of the service</SubHeading>
                <Paragraph>
                  By participating in our beta or pilot programs, you understand
                  and accept that the Service is experimental and may contain
                  bugs or errors, that features may change or be removed without
                  notice, that the Service may experience downtime or data loss,
                  and that all results are for testing and learning purposes
                  only.
                </Paragraph>
                <SubHeading>Participant responsibilities</SubHeading>
                <List>
                  <li>
                    <Term>Orasis AI:</Term> use only anonymized or synthetic data
                    &mdash; never upload real patient data or identifiable health
                    information
                  </li>
                  <li>
                    <Term>Gnosis AI:</Term> use it as a study aid and follow your
                    institution&rsquo;s academic-integrity rules; do not use it to
                    complete graded work dishonestly
                  </li>
                  <li>Provide constructive feedback through designated channels</li>
                  <li>Report bugs, errors, and security concerns promptly</li>
                  <li>Maintain confidentiality about unreleased features</li>
                </List>
                <Callout icon={Info} title="Prohibited uses">
                  <p>Participants must not:</p>
                  <List>
                    <li>Use Orasis AI for actual patient diagnosis or treatment</li>
                    <li>Make clinical decisions based on Orasis AI output</li>
                    <li>
                      Represent Orasis AI as a certified medical device
                    </li>
                    <li>
                      Use Gnosis AI to violate academic-integrity or examination
                      policies
                    </li>
                    <li>Charge others for access to the Service</li>
                  </List>
                </Callout>
              </LegalSection>

              <LegalSection id="disclaimer" title="Disclaimers & warnings">
                <Callout
                  icon={AlertTriangle}
                  variant="warning"
                  title="Not medical advice"
                >
                  <p>
                    Orasis AI does not provide medical advice. All content,
                    including AI-generated analysis, is for informational and
                    testing purposes only. Always seek the advice of qualified
                    healthcare providers for medical decisions.
                  </p>
                </Callout>
                <Callout icon={Info} title="Not academic or professional advice">
                  <p>
                    Gnosis AI is a learning aid, not academic, professional, or
                    medical advice. It does not guarantee any grade or exam
                    outcome &mdash; always rely on your official course materials
                    and instructors.
                  </p>
                </Callout>
                <SubHeading>No warranties</SubHeading>
                <Paragraph>
                  The Service is provided &ldquo;as is&rdquo; and &ldquo;as
                  available&rdquo; without any warranties, including warranties of
                  accuracy, reliability, or completeness of results; fitness for
                  any particular purpose; merchantability or non-infringement; or
                  uninterrupted, error-free operation.
                </Paragraph>
                <SubHeading>Technology limitations</SubHeading>
                <List>
                  <li>
                    AI technology has inherent limitations and may produce errors
                  </li>
                  <li>
                    Results may vary significantly from final product performance
                  </li>
                  <li>The platform requires stable internet connectivity</li>
                  <li>Compatibility with all systems is not guaranteed</li>
                </List>
              </LegalSection>

              <LegalSection id="usage" title="Acceptable use policy">
                <SubHeading>Permitted uses</SubHeading>
                <Paragraph>You may use the Service only for:</Paragraph>
                <List>
                  <li>Testing and evaluating platform functionality</li>
                  <li>Providing feedback on the user experience</li>
                  <li>Academic research (with proper approval)</li>
                  <li>Studying with Gnosis AI as a learning aid</li>
                  <li>Learning about AI in medical imaging</li>
                  <li>
                    Demonstration purposes (clearly marked as a development
                    version)
                  </li>
                </List>
                <SubHeading>Prohibited activities</SubHeading>
                <List>
                  <li>Uploading real patient data or PHI to Orasis AI</li>
                  <li>Using Orasis AI for clinical diagnosis</li>
                  <li>
                    Using Gnosis AI to cheat or violate academic-integrity
                    policies
                  </li>
                  <li>Attempting to reverse engineer our algorithms</li>
                  <li>
                    Sharing login credentials or creating unauthorized accounts
                  </li>
                  <li>
                    Introducing malicious code or attempting system breaches
                  </li>
                  <li>
                    Misrepresenting the Service&rsquo;s capabilities or regulatory
                    status
                  </li>
                  <li>Violating any applicable laws or regulations</li>
                </List>
                <SubHeading>Account security</SubHeading>
                <Paragraph>
                  You are responsible for maintaining the confidentiality of your
                  credentials, all activities under your account, notifying us
                  immediately of unauthorized access, and using strong, unique
                  passwords.
                </Paragraph>
              </LegalSection>

              <LegalSection
                id="intellectual-property"
                title="Intellectual property rights"
              >
                <SubHeading>Our intellectual property</SubHeading>
                <Paragraph>
                  All rights in the Service are owned by BioAnalytiX, including
                  our AI algorithms and models, software code and architecture,
                  user-interface and experience design, documentation and
                  training materials, and trademarks, logos, and branding.
                </Paragraph>
                <SubHeading>Beta tester contributions</SubHeading>
                <Paragraph>
                  By providing feedback, suggestions, or ideas, you grant us a
                  perpetual, worldwide, royalty-free license to use your
                  contributions, waive any claims to compensation or attribution,
                  and represent that your contributions are original.
                </Paragraph>
                <SubHeading>Test data</SubHeading>
                <List>
                  <li>You retain ownership of your original data</li>
                  <li>
                    You grant us a license to process it for testing purposes
                  </li>
                  <li>
                    You confirm it contains no real patient information
                  </li>
                  <li>
                    We may use anonymized insights to improve our algorithms
                  </li>
                </List>
              </LegalSection>

              <LegalSection id="liability" title="Limitation of liability">
                <Callout
                  icon={AlertTriangle}
                  variant="warning"
                  title="No liability for medical or academic outcomes"
                >
                  <p>
                    Under no circumstances shall BioAnalytiX be liable for any
                    medical outcomes, misdiagnosis, health-related damages, or
                    academic and exam outcomes arising from use of these
                    development products.
                  </p>
                </Callout>
                <Paragraph>
                  To the maximum extent permitted by law, BioAnalytiX shall not be
                  liable for any indirect, incidental, special, or consequential
                  damages; loss of profits, data, or business opportunities;
                  personal injury or property damage; errors or inaccuracies in
                  the Service; unauthorized access or data breaches despite
                  security measures; or service interruptions and system
                  failures.
                </Paragraph>
                <SubHeading>Indemnification</SubHeading>
                <Paragraph>
                  You agree to indemnify and hold harmless BioAnalytiX from claims
                  arising from your use or misuse of the Service, violation of
                  these Terms, use of the Service for clinical purposes, upload of
                  real patient data, or any breach of applicable laws or
                  regulations.
                </Paragraph>
                <SubHeading>Total liability cap</SubHeading>
                <Paragraph>
                  Our total liability shall not exceed the amount you have paid us
                  (currently $0 for beta and pilot participants) in the twelve
                  months preceding any claim.
                </Paragraph>
              </LegalSection>

              <LegalSection id="privacy" title="Privacy and data protection">
                <Paragraph>
                  We are committed to protecting your data. Please see our{" "}
                  <a
                    href="/privacy-policy"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
                  >
                    Privacy Policy
                  </a>{" "}
                  for detailed information. We implement security best practices
                  even during development, keep beta tester data separate from any
                  future clinical data, and do not sell or share personal
                  information. We are working toward GDPR compliance for EU users,
                  HIPAA readiness for US healthcare, and international
                  data-protection standards.
                </Paragraph>
                <Callout icon={Info} title="Current limitations">
                  <p>
                    As we are not yet certified, we cannot guarantee full
                    regulatory compliance. Do not upload sensitive personal or
                    health information.
                  </p>
                </Callout>
              </LegalSection>

              <LegalSection id="termination" title="Termination">
                <SubHeading>Your right to terminate</SubHeading>
                <Paragraph>
                  You may stop using the Service at any time by contacting us to
                  close your beta or pilot account, uninstalling any test or
                  pilot applications, and requesting deletion of your data.
                </Paragraph>
                <SubHeading>Our right to terminate</SubHeading>
                <Paragraph>
                  We may terminate your access if you violate these Terms, upload
                  real patient data, attempt unauthorized access, misuse the
                  platform, or remain inactive for extended periods.
                </Paragraph>
                <SubHeading>Effect of termination</SubHeading>
                <List>
                  <li>Your access will be revoked immediately</li>
                  <li>Test data may be deleted or anonymized</li>
                  <li>Confidentiality obligations survive termination</li>
                  <li>
                    You must cease representing any association with BioAnalytiX
                  </li>
                </List>
              </LegalSection>

              <LegalSection id="general" title="General provisions">
                <SubHeading>Governing law</SubHeading>
                <Paragraph>
                  These Terms are governed by the laws of Greece and the European
                  Union, without regard to conflict-of-law principles.
                </Paragraph>
                <SubHeading>Changes to terms</SubHeading>
                <Paragraph>
                  We may update these Terms as we develop the platform. We will
                  notify beta testers of material changes via email.
                </Paragraph>
                <SubHeading>Severability</SubHeading>
                <Paragraph>
                  If any provision is found unenforceable, the remaining
                  provisions continue in effect.
                </Paragraph>
                <SubHeading>No waiver</SubHeading>
                <Paragraph>
                  Our failure to enforce any right or provision is not a waiver of
                  that right.
                </Paragraph>
                <SubHeading>Entire agreement</SubHeading>
                <Paragraph>
                  These Terms constitute the entire agreement between you and
                  BioAnalytiX regarding the Service.
                </Paragraph>
              </LegalSection>

              <ScrollReveal>
                <Callout icon={Info} title="Your agreement">
                  <p>
                    By using the BioAnalytiX development platform or participating
                    in our beta program, you acknowledge that you have read,
                    understood, and agree to these Terms and Conditions. Remember:
                    this platform is not approved for clinical use.
                  </p>
                </Callout>
              </ScrollReveal>

              <LegalSection id="contact" title="Contact information">
                <Paragraph>
                  For questions about these Terms or our beta and pilot
                  programs, email us at{" "}
                  <a
                    href="mailto:info@bioanalytix.info"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
                  >
                    info@bioanalytix.info
                  </a>
                  . Our team is based in Greece (EU).
                </Paragraph>
              </LegalSection>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
