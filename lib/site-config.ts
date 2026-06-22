/**
 * Site configuration — single source of truth for navigation, brand/logo,
 * per-route SEO metadata defaults, and the press article data source.
 *
 * This module is consumed by the navbar/mobile-nav (nav source + CTA), the
 * root layout and per-route metadata exports (brand + route metadata), and the
 * press page (press article data source). Keeping these in one place enforces
 * the single-nav-source and content-parity guarantees from the design.
 *
 * Requirements covered:
 *  - 2.1  Navbar renders the logo, horizontal links, and exactly one primary CTA
 *         from a single navigation-item source.
 *  - 8.1  Every route has a non-empty title (<= 60 chars) and a description
 *         (50–160 chars).
 *  - 7.1/7.2 Press articles expose stable, unique anchor slugs matching
 *         ^[a-z0-9-]+$ (including the legacy `partnership-renewal` anchor).
 */

/** Absolute production origin. All canonical URLs are rooted here. */
export const SITE_URL = "https://bioanalytix.info" as const;

/** Google Analytics measurement id (preserved from the legacy site). */
export const GA_MEASUREMENT_ID = "G-J5QG3LXERQ" as const;

/** Default Open Graph / Twitter share image (>= 1200x630; asset migrated in a later task). */
export const DEFAULT_OG_IMAGE = "/images/og-default.png" as const;

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/** A single navigation entry. `href` may be a route ("/about") or an in-page anchor ("#contact"). */
export interface NavItem {
  label: string;
  href: string;
  /** When true the link points off-site and should open with rel/target safeguards. */
  external?: boolean;
  /** Optional supporting copy (used in the Products popover menu). */
  description?: string;
  /** Optional sub-items rendered as a popover/submenu (e.g. the Products menu). */
  children?: NavItem[];
}

/** The single primary call-to-action shown in the navbar. */
export interface NavCta {
  label: string;
  href: string;
}

/**
 * Product sub-items shown in the navbar "Products" popover and the mobile
 * drawer's Products group.
 */
export const productNav: NavItem[] = [
  {
    label: "Orasis AI",
    href: "/product",
    description: "AI-assisted brain CT & medical imaging for radiologists.",
  },
  {
    label: "Gnosis AI",
    href: "/gnosis-ai",
    description: "AI study companion for university students.",
  },
];

/**
 * The single navigation-item source for the navbar and mobile drawer.
 * The primary CTA (see `mainNavCta`) is rendered separately and is NOT part of
 * this list, so the navbar shows exactly one CTA button (Requirement 2.1).
 */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/product", children: productNav },
  { label: "Press", href: "/press" },
  { label: "Careers", href: "/careers" },
];

/** The single primary CTA in the navbar / mobile drawer. */
export const mainNavCta: NavCta = {
  label: "Request beta access",
  href: "/beta",
};

/** Footer link groups (legal links are surfaced separately, see `legalNav`). */
export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Platform",
    items: [
      { label: "Orasis AI", href: "/product" },
      { label: "Gnosis AI", href: "/gnosis-ai" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Press", href: "/press" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/#contact" },
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms-conditions" },
    ],
  },
];

/** Legal links shown in the footer baseline row. */
export const legalNav: NavItem[] = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms-conditions" },
];

// ---------------------------------------------------------------------------
// Brand / logo configuration
// ---------------------------------------------------------------------------

export interface SiteConfig {
  name: string;
  shortName: string;
  /** Title template applied to per-route titles, e.g. "About | BioAnalytiX". */
  titleTemplate: string;
  description: string;
  url: string;
  /** Primary logo (light backgrounds). */
  logoSrc: string;
  /** Wordmark/banner logo used in the navbar/footer. */
  bannerSrc: string;
  /** Favicon / app icon. */
  iconSrc: string;
  tagline: string;
  social: NavItem[];
}

export const siteConfig: SiteConfig = {
  name: "BioAnalytiX",
  shortName: "BioAnalytiX",
  titleTemplate: "%s | BioAnalytiX",
  description:
    "AI-powered medical imaging diagnostics that help radiologists detect anomalies faster and with greater accuracy.",
  url: SITE_URL,
  logoSrc: "/images/bioanalytix.PNG",
  bannerSrc: "/images/bioanalytix.PNG",
  iconSrc: "/images/bioanalytix.PNG",
  tagline: "Rethink Intelligence",
  social: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/bioanalytixinc/",
      external: true,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/bioanalytix/",
      external: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Per-route SEO metadata defaults
// ---------------------------------------------------------------------------

export interface PageMetadata {
  /** Page title segment (<= 60 chars). Combined with the title template at render time. */
  title: string;
  /** Meta description (50–160 chars). */
  description: string;
  /** Canonical path relative to `metadataBase` (e.g. "/about"). Resolves to an absolute URL. */
  path: string;
  /** Open Graph / Twitter share image. */
  ogImage: string;
  /** Open Graph `type`. */
  ogType: "website" | "article";
  twitterCard: "summary_large_image";
  /** When true the route is excluded from indexing and the sitemap (e.g. 404). */
  noindex?: boolean;
}

/** Known route keys for the rebuilt site (Requirement 1.1). */
export type RouteKey =
  | "home"
  | "about"
  | "product"
  | "gnosis"
  | "beta"
  | "dataPartner"
  | "press"
  | "careers"
  | "privacy"
  | "terms"
  | "notFound";

/**
 * Per-route metadata defaults. Descriptions are kept within 50–160 chars and
 * titles within 60 chars to satisfy Requirement 8.1. The 404 route is marked
 * `noindex` and is excluded from the sitemap (Requirement 8.5).
 */
export const routeMetadata: Record<RouteKey, PageMetadata> = {
  home: {
    title: "AI-Powered Medical Diagnostics",
    description:
      "BioAnalytiX builds AI-powered medical imaging diagnostics that help radiologists detect anomalies faster and more accurately.",
    path: "/",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  about: {
    title: "About",
    description:
      "Learn about BioAnalytiX, the team revolutionizing radiology with clinically validated, AI-powered diagnostic technology.",
    path: "/about",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  product: {
    title: "Orasis AI — Our Product",
    description:
      "Discover Orasis AI, the BioAnalytiX platform for fast, accurate AI-assisted analysis of brain CT scans and medical imaging.",
    path: "/product",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  gnosis: {
    title: "Gnosis AI — AI Study Companion",
    description:
      "Gnosis AI is the BioAnalytiX study companion for university students: personalized study plans, grounded explanations, quizzes, and flashcards.",
    path: "/gnosis-ai",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  beta: {
    title: "Gnosis AI Beta Access",
    description:
      "Request beta access to Gnosis AI, the BioAnalytiX AI study companion for university students. Be first to try personalized, course-grounded learning.",
    path: "/beta",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  dataPartner: {
    title: "Orasis AI — Clinical Data Partnership",
    description:
      "Partner with BioAnalytiX to build Orasis AI. Contribute anonymized brain CT data and radiology expertise, and get first access to the clinical pilot.",
    path: "/data-partner",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  press: {
    title: "Press & News",
    description:
      "Latest news, press coverage, awards, and announcements from BioAnalytiX as we advance AI-powered medical diagnostics.",
    path: "/press",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  careers: {
    title: "Careers",
    description:
      "Join BioAnalytiX and help build the future of AI for healthcare and education. Explore our team and talent pool.",
    path: "/careers",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "Read the BioAnalytiX privacy policy describing how we collect, use, and protect your personal data across our services.",
    path: "/privacy-policy",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  terms: {
    title: "Terms & Conditions",
    description:
      "Review the BioAnalytiX terms and conditions governing your use of our website and our AI products for healthcare and education.",
    path: "/terms-conditions",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
  },
  notFound: {
    title: "Page Not Found",
    description:
      "The page you are looking for could not be found. Return to the BioAnalytiX home page to continue exploring our work.",
    path: "/404",
    ogImage: DEFAULT_OG_IMAGE,
    ogType: "website",
    twitterCard: "summary_large_image",
    noindex: true,
  },
};

/** Route keys that should be indexed (every route except the 404 page). */
export const indexableRouteKeys: RouteKey[] = (
  Object.keys(routeMetadata) as RouteKey[]
).filter((key) => !routeMetadata[key].noindex);

/** Resolve a path relative to `SITE_URL` into an absolute canonical URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// ---------------------------------------------------------------------------
// Press article data source
// ---------------------------------------------------------------------------

/** A reference to external coverage of an article. */
export interface PressSource {
  label: string;
  href: string;
}

/**
 * An anchor-addressable press article. `slug` doubles as the element id, so it
 * must match ^[a-z0-9-]+$ and be unique across all articles (Requirement 7.2).
 */
export interface PressArticle {
  /** Stable anchor id / URL slug. Matches ^[a-z0-9-]+$ and is unique. */
  slug: string;
  title: string;
  /** ISO 8601 date (YYYY-MM-DD). */
  date: string;
  /** Human-readable date label as shown on the legacy site. */
  dateLabel: string;
  category: "Company News" | "Press Coverage" | "Awards" | "Research";
  excerpt: string;
  /** Article body as markdown. */
  body: string;
  /** External coverage links, when available. */
  sources?: PressSource[];
  featured?: boolean;
}

/**
 * Press articles derived from the legacy press page. Order is newest-first.
 * The legacy anchor `partnership-renewal` is preserved (Requirement 7.1).
 */
export const pressArticles: PressArticle[] = [
  {
    slug: "pappajohn-award-2026",
    title: "BioAnalytiX Wins John & Mary Pappajohn Business Plan Award",
    date: "2026-06-22",
    dateLabel: "June 22, 2026",
    category: "Awards",
    excerpt:
      "BioAnalytiX is honored to receive one of five major prizes at the prestigious John & Mary Pappajohn Business Plan Awards, organized by the Entrepreneurship Hub at Anatolia College — earning €4,000 and access to a powerful mentoring and business-support network.",
    featured: true,
    body: [
      "FOR IMMEDIATE RELEASE",
      "",
      "## BioAnalytiX Among the Winners of the John & Mary Pappajohn Business Plan Awards",
      "",
      "**Thessaloniki, June 22, 2026** — BioAnalytiX, the Greek AI startup bringing advanced diagnostics to radiology, is proud to announce its recognition at the distinguished **John & Mary Pappajohn Business Plan Awards**, organized by the Entrepreneurship Hub at Anatolia College.",
      "",
      "BioAnalytiX stood out among dozens of innovative proposals from across the Greek region, winning one of **five major cash prizes of €4,000** along with access to a powerful business-support and mentoring network.",
      "",
      "## About the Competition",
      "",
      "The competition bears the name of renowned Greek-American entrepreneur **John Pappajohn** and is organized by the **Entrepreneurship Hub at Anatolia College** — a leading innovation accelerator in Northern Greece. The jury evaluated each business plan across three key criteria:",
      "",
      "- **Innovation and Sustainability:** The uniqueness of the company's approach to solving contemporary challenges.",
      "- **Growth Prospects:** BioAnalytiX's potential to successfully enter and scale in international markets.",
      "- **Team and Expertise:** The knowledge and passion of the founders to realize their vision.",
      "",
      "## What the Prize Means for BioAnalytiX",
      "",
      "This award is an important validation of the hard work our team has put into building AI-powered medical imaging technology that matters. The recognition from a competition tied to the legacy of John Pappajohn — a figure synonymous with backing bold, transformative ideas — is deeply meaningful to us.",
      "",
      "The €4,000 prize will be invested directly into advancing BioAnalytiX's technology and strengthening our market presence. Equally important, the mentoring and entrepreneurship network unlocked through the Entrepreneurship Hub at Anatolia College provides invaluable support as we prepare to scale.",
      "",
      "## Company Statement",
      "",
      '> \u201cThis award is a wonderful recognition of our team\'s hard work and an important boost for the future of BioAnalytiX. The support from the Entrepreneurship Hub at Anatolia College and the legacy of John Pappajohn give us the tools to accelerate our growth and take the next big step.\u201d',
      "> — The BioAnalytiX Founding Team",
      "",
      "## About BioAnalytiX",
      "",
      "Founded in March 2024 and headquartered in Thessaloniki, Greece, BioAnalytiX builds AI products for healthcare and education. Our flagship product, **Orasis AI**, is an AI-assisted platform that helps radiologists analyze brain CT scans faster and with greater accuracy, reducing time-to-diagnosis for critical conditions. Our second product, **Gnosis AI**, is an AI study companion for university students grounded in their official course material.",
      "",
      "BioAnalytiX has previously been recognized in the Forbes Greece \u201830 Under 30\u2019 list, won first place at Ennovation 2024 and YERAME 2024, and placed second at InnoHealth 2024. The company holds strategic partnerships with the General Hospital of Larissa and ACTA Lab.",
      "",
      "---",
      "",
      "**Media Contact:**",
      "Email: info@bioanalytix.info",
      "Website: https://bioanalytix.info",
      "LinkedIn: https://www.linkedin.com/company/bioanalytixinc/",
    ].join("\n"),
  },
  {
    slug: "partnership-renewal",
    title:
      "Strategic Partnership with General Hospital of Larissa Renewed and Expanded",
    date: "2025-11-21",
    dateLabel: "November 21, 2025",
    category: "Company News",
    excerpt:
      "BioAnalytiX announces the renewal and expansion of our strategic partnership with the General Hospital of Larissa, marking another milestone in advancing medical diagnostics and healthcare innovation.",
    featured: true,
    body: [
      "We are proud to announce the renewal and expansion of our strategic partnership with the General Hospital of Larissa, a collaboration that continues to drive innovation in medical diagnostics and healthcare technology.",
      "",
      "## A Milestone in Healthcare Innovation",
      "This renewed partnership marks another important milestone in our mission to advance medical diagnostics and foster innovation in healthcare. Together, we are building a future where cutting-edge bioanalytical technologies support hospitals, healthcare professionals, and — most importantly — patients.",
      "",
      "## Expanding Our Collaboration",
      "The expansion of our partnership with General Hospital of Larissa reflects our shared commitment to:",
      "",
      "- Implementing AI-powered diagnostic solutions in real-world clinical settings",
      "- Supporting radiologists and healthcare professionals with advanced analytical tools",
      "- Improving patient care through faster, more accurate diagnoses",
      "- Advancing medical research and innovation in diagnostic imaging",
      "- Establishing best practices for AI integration in healthcare facilities",
      "",
      "## Real-World Clinical Validation",
      "Our partnership with General Hospital of Larissa provides invaluable opportunities to validate and refine our AI technology in actual clinical environments. This collaboration enables us to gather feedback from experienced radiologists, understand real-world workflow requirements, and ensure our solutions deliver tangible benefits to both healthcare providers and patients.",
      "",
      "## Gratitude and Recognition",
      "We extend our sincere gratitude to Mr. Vlachakis Grigoris, Administrator of the General Hospital of Larissa, for his visionary leadership and continued support; Mr. Alexiou Evangelos, Director of the Radiology Department, for his expertise, collaboration, and trust in our technology; and the entire team at General Hospital of Larissa for their dedication to advancing healthcare through innovation.",
      "",
      "## Looking Ahead",
      "This expanded partnership strengthens our position as a leader in AI-powered medical diagnostics and demonstrates the real-world applicability of our solutions. We look forward to continuing our work with General Hospital of Larissa to push the boundaries of what's possible in diagnostic medicine.",
      "",
      "Larissa, Greece | November 21, 2025",
    ].join("\n"),
  },
  {
    slug: "forbes",
    title: 'BioAnalytiX Named to Forbes Greece "30 Under 30"',
    date: "2025-10-01",
    dateLabel: "October 2025",
    category: "Press Coverage",
    excerpt:
      'Our team has been recognized by Forbes Greece for our innovative contributions to the Healthtech sector, marking a significant milestone in our journey.',
    body: [
      'We are thrilled to announce that BioAnalytiX has been recognized in the prestigious Forbes Greece "30 Under 30" list for 2026, marking a significant milestone in our journey to revolutionize medical diagnostics through artificial intelligence.',
      "",
      "## A Recognition of Innovation and Impact",
      "This honor celebrates our team's dedication to transforming healthcare through cutting-edge AI technology. Being named among Greece's most promising young innovators validates our mission to make advanced medical diagnostics accessible and accurate for healthcare professionals worldwide.",
      "",
      "## Our Journey So Far",
      "Since our founding in March 2024, BioAnalytiX has been at the forefront of developing AI-powered solutions for medical imaging analysis. Our flagship product focuses on brain CT scan analysis, helping radiologists detect anomalies with unprecedented accuracy and speed.",
      "",
      "## What This Means for Healthcare",
      "This recognition amplifies our commitment to:",
      "",
      "- Enhancing diagnostic accuracy through advanced AI algorithms",
      "- Reducing time-to-diagnosis for critical conditions",
      "- Supporting healthcare professionals with intelligent decision-making tools",
      "- Making cutting-edge medical technology accessible to healthcare facilities of all sizes",
      "",
      "## Looking Forward",
      "This achievement motivates us to push boundaries further. We're continuing to refine our technology, expand our partnerships, and work towards our vision of AI-assisted diagnostics becoming a standard of care in medical institutions globally.",
    ].join("\n"),
    sources: [
      {
        label: "Forbes Greece",
        href: "https://www.forbesgreece.gr/greek-lists-forbes/3953859/forbes-30-under-30---i-elliniki-lista",
      },
      {
        label: "ERT News",
        href: "https://www.ertnews.gr/perifereiakoi-stathmoi/volos/voliotis-foititis-sti-lista-tou-forbes-h-kainotoma-startup-bioanalytix-fernei-tin-texniti-noimosyni-stin-iatriki-diagnosi/",
      },
      {
        label: "Eleftheria",
        href: "https://www.eleftheria.gr/sti-lista-forbes-oi-3-tis-bioanalytix/",
      },
      {
        label: "New Money",
        href: "https://www.newmoney.gr/roh/palmos-oikonomias/business-stories/bioanalytix-i-techniti-noimosini-stin-igia-diakrisi-gia-elliniki-startup-apo-ton-volo/",
      },
      {
        label: "Larissa Press",
        href: "https://www.larissapress.gr/2025/10/31/treis-neoi-epistimones-apo-to-panepistimio-thessalias-sti-lista-forbes-30-under-30-greece-2026/",
      },
    ],
  },
  {
    slug: "acta",
    title: "Strategic Partnership with ACTA Lab",
    date: "2025-05-01",
    dateLabel: "May 2025",
    category: "Company News",
    excerpt:
      "Announcing our collaboration with ACTA Lab to advance medical-imaging AI through shared infrastructure, datasets, and peer-reviewed research.",
    body: [
      "BioAnalytiX is excited to announce a strategic partnership with ACTA Lab, a leading research institution in medical imaging and artificial intelligence. This collaboration marks a pivotal step in advancing our AI-powered diagnostic solutions.",
      "",
      "## Partnership Objectives",
      "Through this partnership, we aim to:",
      "",
      "- Share cutting-edge research infrastructure and computational resources",
      "- Collaborate on peer-reviewed research publications",
      "- Access diverse medical imaging datasets for algorithm training",
      "- Accelerate the development and validation of our AI models",
      "",
      "## Advancing Medical AI Research",
      "ACTA Lab brings years of expertise in medical imaging and machine learning research. Their advanced facilities and research methodologies will enable us to refine our algorithms and expand our diagnostic capabilities beyond brain imaging.",
      "",
      "## Impact on Healthcare",
      "This partnership will accelerate the development of more robust, clinically validated AI solutions that healthcare professionals can trust. By combining academic rigor with entrepreneurial innovation, we're working to bridge the gap between research and real-world clinical applications.",
      "",
      "## Commitment to Scientific Excellence",
      "We remain committed to evidence-based development, ensuring our solutions meet the highest standards of medical accuracy and reliability. This partnership reinforces our dedication to scientific excellence and responsible AI development in healthcare.",
    ].join("\n"),
  },
  {
    slug: "innohealth",
    title: "Second Place at InnoHealth 2024",
    date: "2024-09-15",
    dateLabel: "September 2024",
    category: "Awards",
    excerpt:
      "Recognized for advancing healthcare through AI-driven diagnostic solutions at the prestigious InnoHealth 2024 innovation competition.",
    body: [
      "BioAnalytiX secured second place at the prestigious InnoHealth Forum 2024 Hackathon, competing against innovative healthtech startups. This achievement validates our approach to solving critical challenges in medical diagnostics.",
      "",
      "## The Competition",
      "InnoHealth Forum is one of Greece's premier healthcare innovation events, bringing together startups, healthcare professionals, investors, and technology experts. The hackathon challenged participants to present solutions that could transform healthcare delivery and improve patient outcomes.",
      "",
      "## Our Presentation",
      "We demonstrated how our AI-powered diagnostic platform addresses key challenges in radiology:",
      "",
      "- Reducing diagnostic time for emergency cases",
      "- Improving accuracy in detecting subtle abnormalities",
      "- Supporting radiologists with intelligent second opinions",
      "- Streamlining workflow in busy healthcare facilities",
      "",
      "## Feedback from Judges",
      "The judging panel, comprising leading healthcare professionals and investors, praised our solution's clinical relevance, technical sophistication, and potential for real-world impact. They particularly noted our focus on user experience and seamless integration with existing hospital systems.",
    ].join("\n"),
    sources: [
      {
        label: "University of Thessaly",
        href: "https://www.uth.gr/news/neo-brabeio-gia-tin-bioanalytix-sto-hackathon-toy-innohealth-forum-2024",
      },
      {
        label: "On Larissa",
        href: "https://www.onlarissa.gr/2024/09/26/neo-vraveio-gia-tin-bioanalytix-sto-hackathon-tou-innohealth-forum-2024/",
      },
      {
        label: "MAG24",
        href: "https://www.mag24.gr/neo-vraveio-gia-tin-bioanalytix-sto-hackathon-tou-innohealth-forum-2024/",
      },
    ],
  },
  {
    slug: "yerame",
    title: "First Place at YERAME 2024",
    date: "2024-09-01",
    dateLabel: "September 2024",
    category: "Awards",
    excerpt:
      "BioAnalytiX secures first place at YERAME 2024, recognized for excellence in developing AI-powered solutions for medical diagnostics and innovation in healthcare technology.",
    body: [
      "BioAnalytiX proudly achieved first place at YERAME 2024 (Young Entrepreneurs in Rural Areas Meet Europe), an innovation competition focused on sustainable development and technological solutions for rural communities.",
      "",
      "## Bridging Urban and Rural Healthcare",
      "While our technology is applicable worldwide, we emphasized its particular value for rural and underserved areas where access to specialized radiological expertise is limited. Our AI solution can provide expert-level diagnostic support regardless of geographic location.",
      "",
      "## Addressing Healthcare Disparities",
      "Rural healthcare facilities often face challenges including:",
      "",
      "- Limited access to specialized radiologists",
      "- Longer wait times for diagnostic reports",
      "- Need for patient transfers to urban centers",
      "- Higher costs due to resource scarcity",
      "",
      "Our AI-powered platform addresses these challenges by providing instant, accurate preliminary analysis that helps local physicians make informed decisions quickly.",
      "",
      "## Recognition of Social Impact",
      "The YERAME judges recognized not just our technological innovation but our commitment to healthcare equity. By making advanced diagnostic capabilities accessible to smaller facilities, we're working to ensure quality healthcare isn't determined by geography.",
    ].join("\n"),
    sources: [
      {
        label: "Innovation Hive",
        href: "https://innovationhive.eu/new-ideas-for-the-development-of-rural-areas-yerame-innovation-competition/",
      },
    ],
  },
  {
    slug: "ennovation",
    title: "First Place at Ennovation 2024",
    date: "2024-07-01",
    dateLabel: "July 2024",
    category: "Awards",
    excerpt:
      "BioAnalytiX wins the Young Entrepreneurship Award at Ennovation 2024 for innovative AI solutions in healthcare diagnostics.",
    body: [
      "BioAnalytiX won the Young Entrepreneurship Award at Ennovation 2024, one of Greece's most competitive startup competitions organized by the University of Thessaly. This is one of our first major recognitions and provided crucial early validation for our vision.",
      "",
      "## The Ennovation Challenge",
      "Ennovation brings together student entrepreneurs and early-stage startups to compete across various categories. We competed in the Technology and Innovation track, presenting our solution to a panel of experienced entrepreneurs, investors, and academic leaders.",
      "",
      "## Early Stage Recognition",
      "Winning this award just months after our founding was a turning point for BioAnalytiX. It provided:",
      "",
      "- Validation of our business model and technology approach",
      "- Increased visibility within the Greek startup ecosystem",
      "- Valuable feedback from industry experts",
      "- Connections with potential partners and mentors",
      "- Prize funding to support early development",
      "",
      "## Building on Success",
      "The recognition from Ennovation gave us momentum to pursue larger opportunities and attract attention from healthcare institutions interested in piloting our technology. It validated that our team's combination of medical knowledge, AI expertise, and entrepreneurial drive could create real value in healthcare.",
      "",
      "## Gratitude and Growth",
      "We're grateful to the University of Thessaly and Ennovation organizers for creating opportunities for young entrepreneurs. This award marked the beginning of our journey from concept to market-ready solution, and we continue to build on the foundation it helped establish.",
    ].join("\n"),
    sources: [
      {
        label: "University of Thessaly",
        href: "https://ds.uth.gr/2024/07/1st-position-ennovation-2024-young-entrepreneurship/",
      },
    ],
  },
  {
    slug: "founded",
    title: "BioAnalytiX Founded",
    date: "2024-03-01",
    dateLabel: "March 2024",
    category: "Company News",
    excerpt:
      "Our journey begins with a vision to revolutionize medical imaging through artificial intelligence and make advanced diagnostics accessible worldwide.",
    body: [
      "March 2024 marked the official founding of BioAnalytiX, born from a shared vision to transform medical diagnostics through artificial intelligence. Our journey began with a simple question: Could AI help doctors make faster, more accurate diagnoses?",
      "",
      "## The Genesis",
      "Our founding team brought together diverse expertise in medicine, computer science, and AI research. We recognized that while medical imaging technology had advanced tremendously, radiologists faced increasing workloads and pressure to deliver rapid, accurate diagnoses. We saw an opportunity to create AI tools that would augment—not replace—human expertise.",
      "",
      "## Our Mission",
      "From day one, we committed to:",
      "",
      "- Developing clinically validated AI solutions that healthcare professionals can trust",
      "- Making advanced diagnostic technology accessible to healthcare facilities of all sizes",
      "- Maintaining the highest standards of medical accuracy and patient safety",
      "- Fostering collaboration between AI technology and medical expertise",
      "- Contributing to healthcare equity through accessible technology",
      "",
      "## Early Challenges and Learning",
      "Starting a healthtech company meant navigating complex regulatory requirements, building relationships with healthcare institutions, and ensuring our technology met rigorous medical standards. Each challenge taught us valuable lessons about the intersection of healthcare and technology.",
      "",
      "## Looking Back, Moving Forward",
      "Less than two years since our founding, we've achieved multiple awards, formed strategic partnerships, and gained recognition on national platforms like Forbes Greece. But we're just getting started. Every day brings us closer to our vision of AI-assisted diagnostics becoming a standard of care in medical institutions worldwide.",
    ].join("\n"),
  },
];

/** Set of legacy press anchor ids that must remain stable (Requirement 7.1). */
export const legacyPressAnchors = [
  "pappajohn-award-2026",
  "partnership-renewal",
  "forbes",
  "acta",
  "innohealth",
  "yerame",
  "ennovation",
  "founded",
] as const;

/** Slug pattern that every press article anchor must satisfy (Requirement 7.2). */
export const PRESS_SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Look up a press article by its slug, or `undefined` when none matches. */
export function getPressArticle(slug: string): PressArticle | undefined {
  return pressArticles.find((article) => article.slug === slug);
}
