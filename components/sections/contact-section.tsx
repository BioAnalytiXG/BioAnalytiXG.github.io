import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ContactForm } from "@/components/forms/contact-form";

/**
 * Contact section (Home Page Section Design item 7; Requirements 1.2, 1.3).
 *
 * The final home-page section. It frames the shared {@link ContactForm} with an
 * `overline` eyebrow, a bold `h2`, and a supporting `lead` paragraph, and
 * carries `id="contact"` so the navbar / CTA "contact" anchors resolve here.
 *
 * Styling is token-only (no color literals): the standard `py-16 md:py-24`
 * rhythm inside the `max-w-7xl` `container`, an `overline` eyebrow in
 * `--primary`, a bold `h2`, `--muted` lead copy, and a constrained form column
 * (`max-w-xl`) on the `--surface` canvas. Entrance uses the reduced-motion-aware
 * {@link ScrollReveal} wrapper.
 */
export function ContactSection() {
  return (
    <section id="contact" className="bg-surface py-16 md:py-24">
      <div className="container">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
            Get in touch
          </p>
          <h2 className="mt-4 text-foreground">Let&rsquo;s talk</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Have a question about Orasis AI or want to explore how BioAnalytiX
            fits your clinical workflow? Send us a message and our team will get
            back to you.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={120} className="mx-auto mt-12 max-w-xl">
          <ContactForm />
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ContactSection;
