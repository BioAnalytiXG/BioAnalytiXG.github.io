import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const Logo = () => (
  <Link
    href="/"
    aria-label={`${siteConfig.name} home`}
    className="flex items-center gap-2 sm:gap-3"
  >
    <Image
      src="/images/bioanalytix-mark.svg"
      alt=""
      aria-hidden="true"
      width={124}
      height={112}
      sizes="64px"
      priority
      className="h-11 w-auto sm:h-14"
    />
    <span className="flex flex-col items-start justify-center leading-none">
      <Image
        src={siteConfig.bannerSrc}
        alt={siteConfig.name}
        width={200}
        height={44}
        sizes="200px"
        priority
        className="h-9 w-auto brightness-0 sm:h-11"
      />
      <span className="mt-1 pl-1.5 text-xs italic text-muted-foreground sm:pl-2 sm:text-sm">
        {siteConfig.tagline}
      </span>
    </span>
  </Link>
);
