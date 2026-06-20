import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HardHat, Info, Lock } from "lucide-react";

import { PageHeader } from "@/components/sections/page-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { absoluteUrl, routeMetadata, siteConfig } from "@/lib/site-config";

/**
 * Privacy Policy route (`/privacy-policy`) — one of the eight content-parity
 * routes (Requirements 1.1, 1.2). Content is derived from the legacy
 * `privacy-policy.html` page.
 *
 * Layout follows the design's "Cross-Page Layout Pattern": the shared
 * {@link PageHeader} band (overline + h1 + lead) followed by long-form prose in
 * the narrower `max-w-3xl` measure called out in "Spacing & Layout". Styling is
 * token-only (no color/typography literals) — headings inherit the display type
 * treatment, body copy uses `--muted`, emphasis uses `--foreground`, and the
 * "Last updated" meta line uses muted small text.
 */

const route = routeMetadata.privacy;

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

/** A tinted note/callout box on the `--surface` canvas. */
function Callout({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Info;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" aria-hidden="true" />
        <p className="font-semibold text-foreground">{title}</p>
      </div>
      <div className="mt-2 space-y-2 text-muted">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subhead="Learn how we collect, use, and protect your data as we build our AI products for healthcare and education — Orasis AI and Gnosis AI."
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
                    BioAnalytiX is currently under development. This privacy policy
                    outlines our commitment to data protection and our intended
                    practices. As we progress toward launch and obtain necessary
                    certifications, this policy will be updated accordingly.
                  </p>
                </Callout>
              </ScrollReveal>

              <LegalSection id="overview" title="Overview">
                <Paragraph>
                  BioAnalytiX (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
                  &ldquo;us&rdquo;) builds AI products for healthcare and
                  education: <Term>Orasis AI</Term>, an AI assistant that helps
                  radiologists analyze brain CT scans faster and more
                  accurately, and <Term>Gnosis AI</Term>, an AI study companion
                  for university students grounded in their official course
                  material. While several of our products are still in
                  development and piloting, we are committed to the highest
                  standards of data protection and privacy from the outset.
                </Paragraph>
                <Paragraph>
                  This Privacy Policy explains our intended practices for
                  collecting, using, and protecting information as our products
                  mature. We are working toward compliance with:
                </Paragraph>
                <List>
                  <li>
                    General Data Protection Regulation (GDPR) &mdash; in progress
                  </li>
                  <li>
                    Health Insurance Portability and Accountability Act (HIPAA),
                    for healthcare data via Orasis AI &mdash; planned
                  </li>
                  <li>
                    Education data-protection standards, for student data via
                    Gnosis AI &mdash; under review
                  </li>
                  <li>
                    Other applicable healthcare, education, and privacy
                    regulations &mdash; under review
                  </li>
                </List>
                <Callout icon={Info} title="Current status">
                  <p>
                    Our products are in development and limited release: Orasis
                    AI is in closed beta using only anonymized or synthetic
                    medical images, and Gnosis AI is running a university pilot
                    (starting with Anatomy). Participation is voluntary and
                    consent-based. We do not process real patient data, and we
                    are not yet a commercial service.
                  </p>
                </Callout>
              </LegalSection>

              <LegalSection
                id="data-collection"
                title="Information we currently collect"
              >
                <SubHeading>Pilot &amp; beta participant data</SubHeading>
                <Paragraph>
                  During our development, beta, and pilot phases, we collect:
                </Paragraph>
                <List>
                  <li>
                    <Term>Participant information:</Term> name, email, and role
                    or institution (if applicable)
                  </li>
                  <li>
                    <Term>Orasis AI test data:</Term> sample medical images
                    (anonymized or synthetic only)
                  </li>
                  <li>
                    <Term>Gnosis AI pilot data:</Term> study activity and
                    progress (e.g. quizzes taken, topics practiced) tied to your
                    official course material
                  </li>
                  <li>
                    <Term>Feedback:</Term> bug reports, feature suggestions, and
                    user-experience feedback
                  </li>
                  <li>
                    <Term>Usage analytics:</Term> how participants interact with
                    our products
                  </li>
                </List>

                <SubHeading>Website visitor information</SubHeading>
                <List>
                  <li>
                    <Term>Contact forms:</Term> information you provide when
                    contacting us
                  </li>
                  <li>
                    <Term>Basic analytics:</Term> page views and browser type
                    (anonymized)
                  </li>
                </List>

                <SubHeading>Future data collection (planned)</SubHeading>
                <Paragraph>
                  As our products mature, we intend to process the data below.
                  This will only occur after obtaining the necessary approvals
                  and implementing all required security measures.
                </Paragraph>
                <List>
                  <li>
                    <Term>Medical images (Orasis AI):</Term> CT scans, MRI
                    images, and X-rays (with proper authorization)
                  </li>
                  <li>
                    <Term>Healthcare-professional accounts:</Term> credentials
                    and contact details
                  </li>
                  <li>
                    <Term>Diagnostic data:</Term> AI-generated analysis and
                    reports
                  </li>
                  <li>
                    <Term>Student accounts (Gnosis AI):</Term> institutional
                    email, course enrollment, and learning progress
                  </li>
                </List>

                <SubHeading>Cookies and tracking</SubHeading>
                <Paragraph>
                  We use essential cookies that are necessary for the site to
                  function. We also use Google Analytics to understand how
                  visitors use the site &mdash; these analytics cookies are{" "}
                  <Term>only set after you give consent</Term> via our cookie
                  banner, and we enable IP anonymization. We do not use marketing
                  or advertising cookies. You can accept, decline, or change your
                  choice at any time using the &ldquo;Cookie settings&rdquo; link
                  in the footer.
                </Paragraph>
              </LegalSection>

              <LegalSection id="data-use" title="How we use your information">
                <SubHeading>Current use (development phase)</SubHeading>
                <List>
                  <li>
                    <Term>Platform development:</Term> improving our AI
                    algorithms and user interface
                  </li>
                  <li>
                    <Term>Beta testing:</Term> evaluating functionality and
                    gathering feedback
                  </li>
                  <li>
                    <Term>Communication:</Term> sending progress updates to
                    interested parties
                  </li>
                  <li>
                    <Term>Research:</Term> understanding user needs and market
                    requirements
                  </li>
                </List>

                <SubHeading>Future use (when operational)</SubHeading>
                <Paragraph>
                  As our products launch, we plan to use data to:
                </Paragraph>
                <List>
                  <li>
                    Process medical images and generate diagnostic reports
                    (Orasis AI)
                  </li>
                  <li>
                    Personalize study plans, explanations, and practice for
                    learners (Gnosis AI)
                  </li>
                  <li>
                    Improve AI accuracy through anonymized, aggregated data
                  </li>
                  <li>Provide customer support and platform maintenance</li>
                  <li>Comply with legal and regulatory requirements</li>
                </List>

                <SubHeading>What we will never do</SubHeading>
                <List>
                  <li>Sell personal, health, or education data to third parties</li>
                  <li>Use health or education data for advertising purposes</li>
                  <li>Share identifiable information without explicit consent</li>
                  <li>
                    Process real patient data before obtaining proper
                    certifications
                  </li>
                </List>
              </LegalSection>

              <LegalSection
                id="data-protection"
                title="Data protection & security"
              >
                <SubHeading>Current security measures</SubHeading>
                <Paragraph>
                  Even in our development phase, we implement security best
                  practices:
                </Paragraph>
                <List>
                  <li>
                    <Term>Encryption:</Term> SSL/TLS for all data transmission
                  </li>
                  <li>
                    <Term>Access control:</Term> access limited to the
                    development team only
                  </li>
                  <li>
                    <Term>Secure development:</Term> following secure coding
                    practices
                  </li>
                  <li>
                    <Term>Regular updates:</Term> keeping all systems and
                    dependencies current
                  </li>
                </List>

                <SubHeading>Planned security enhancements</SubHeading>
                <Paragraph>
                  Before processing any real medical data, we will implement:
                </Paragraph>
                <List>
                  <li>End-to-end encryption for all medical images</li>
                  <li>HIPAA-compliant infrastructure (pending certification)</li>
                  <li>Multi-factor authentication for all users</li>
                  <li>Regular third-party security audits</li>
                  <li>24/7 security monitoring and incident response</li>
                </List>

                <Callout icon={Lock} title="Security commitment">
                  <p>
                    We are committed to achieving the highest security standards
                    before handling any real patient data. Our platform will not
                    be available for clinical use until all necessary security
                    measures and certifications are in place.
                  </p>
                </Callout>
              </LegalSection>

              <LegalSection
                id="compliance"
                title="Planned compliance & certifications"
              >
                <Paragraph>
                  As a company under development, we are actively working toward
                  GDPR compliance, HIPAA readiness, medical-device regulations in
                  our target markets, and relevant ISO standards. Our compliance
                  roadmap targets full GDPR compliance before any EU launch,
                  HIPAA certification before any US launch, and CE marking under
                  the Medical Device Regulation as we mature the platform.
                </Paragraph>
                <Callout icon={Info} title="Important notice">
                  <p>
                    BioAnalytiX is not yet certified as a medical device. Our
                    platform is currently for research and development purposes
                    only and should not be used for clinical decision-making.
                  </p>
                </Callout>
              </LegalSection>

              <LegalSection id="rights" title="Your rights">
                <SubHeading>Current rights (participants &amp; visitors)</SubHeading>
                <Paragraph>
                  As a beta or pilot participant, or a website visitor, you have
                  the right to:
                </Paragraph>
                <List>
                  <li>Access any personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Withdraw from a beta or pilot at any time</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of communications</li>
                </List>

                <SubHeading>Future rights (when operational)</SubHeading>
                <Paragraph>
                  Once fully operational, we will ensure all users have rights
                  under applicable laws, including GDPR rights for EU users
                  (access, rectification, erasure, restriction, portability, and
                  objection) and HIPAA rights for US healthcare (access to health
                  information, amendments to records, an accounting of
                  disclosures, and restrictions on uses).
                </Paragraph>
              </LegalSection>

              <LegalSection id="beta-testing" title="Pilot &amp; beta program data">
                <Paragraph>For our beta and pilot programs:</Paragraph>
                <List>
                  <li>
                    <Term>Voluntary participation:</Term> all testing and pilots
                    are voluntary
                  </li>
                  <li>
                    <Term>Orasis AI:</Term> we use only anonymized or synthetic
                    medical images &mdash; never real patient data
                  </li>
                  <li>
                    <Term>Gnosis AI:</Term> the pilot is grounded in official
                    course material, and we process only the study data needed
                    to personalize learning
                  </li>
                  <li>
                    <Term>Confidentiality:</Term> unreleased features are
                    confidential
                  </li>
                </List>
                <Callout icon={Info} title="Participant consent">
                  <p>
                    All participants provide explicit consent before joining a
                    beta or pilot. You may withdraw at any time by contacting
                    us.
                  </p>
                </Callout>
              </LegalSection>

              <LegalSection id="data-retention" title="Data retention">
                <Paragraph>
                  We retain data only as long as needed for its purpose. Beta
                  tester information is kept until the end of the beta plus six
                  months for program management; test images are kept until the
                  end of development for algorithm training; anonymized feedback
                  may be retained indefinitely for product improvement; and
                  website inquiries are kept for up to two years for business
                  development.
                </Paragraph>
              </LegalSection>

              <LegalSection id="international" title="International data">
                <Paragraph>As we develop our platform:</Paragraph>
                <List>
                  <li>Our development team is based in Greece (EU)</li>
                  <li>
                    We use cloud services that may process data internationally
                  </li>
                  <li>
                    We will implement appropriate safeguards before any
                    commercial launch
                  </li>
                  <li>
                    Beta testers will be informed of any international transfers
                  </li>
                </List>
              </LegalSection>

              <LegalSection id="updates" title="Updates to this policy">
                <Paragraph>This Privacy Policy will be updated as we:</Paragraph>
                <List>
                  <li>Progress through development phases</li>
                  <li>Obtain necessary certifications</li>
                  <li>Expand our services</li>
                  <li>Respond to legal requirements</li>
                </List>
                <Paragraph>
                  We will notify all registered users and beta testers of
                  significant changes via email.
                </Paragraph>
              </LegalSection>

              <LegalSection id="contact" title="Contact us">
                <Paragraph>
                  For privacy questions or to exercise your rights, email us at{" "}
                  <a
                    href="mailto:info@bioanalytix.info"
                    className="font-medium text-primary underline underline-offset-4 hover:text-primary-hover"
                  >
                    info@bioanalytix.info
                  </a>
                  . We aim to respond within 72 hours. Our team is based in
                  Greece (EU).
                </Paragraph>
              </LegalSection>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
