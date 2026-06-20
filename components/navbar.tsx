"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { mainNavCta } from "@/lib/site-config";

const PillNavbar = () => {
  const pathname = usePathname();
  // The beta program is exclusive to Gnosis AI, so the "Request beta access"
  // CTA only appears on the /gnosis-ai route.
  const showBetaCta = pathname?.startsWith("/gnosis-ai") ?? false;

  return (
    <nav className="fixed inset-x-4 top-4 mx-auto h-16 max-w-screen-xl rounded-full border bg-background/90 backdrop-blur-sm shadow-sm z-[60] sm:inset-x-6 sm:top-6 sm:h-20">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-8">
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            className="hidden rounded-full md:inline-flex"
            variant="outline"
            size="default"
          >
            <Link href="/#contact">Contact Us</Link>
          </Button>
          {showBetaCta ? (
            <Button asChild className="hidden rounded-full md:inline-flex" size="default">
              <Link href={mainNavCta.href}>{mainNavCta.label}</Link>
            </Button>
          ) : null}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PillNavbar;
