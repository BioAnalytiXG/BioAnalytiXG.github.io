import Image from "next/image";

/**
 * Orasis AI reading-workspace preview, shown inside a laptop frame.
 *
 * Renders the Orasis AI mockup screenshot (`/images/orasisai-mockup.jpg`) on a
 * stylized laptop: a dark rounded screen bezel wrapping the image and a metallic
 * base/deck below. The screen keeps the image's native 1560×1008 aspect ratio so
 * nothing is distorted, and the whole unit scales fluidly with its container.
 */

// Native size of the mockup image (keeps the screen aspect ratio exact).
const IMG_W = 1560;
const IMG_H = 1008;

export function OrasisDashboardPreview() {
  return (
    <div className="relative w-full">
      {/* Laptop screen (dark bezel) */}
      <div
        className="overflow-hidden rounded-[18px] bg-[#0b1220] p-[1%] shadow-[0_30px_60px_-20px_rgba(8,20,30,0.45),0_12px_24px_-12px_rgba(8,20,30,0.3)]"
      >
        <div
          className="relative w-full overflow-hidden rounded-[10px] bg-[#05070b]"
          style={{ aspectRatio: `${IMG_W} / ${IMG_H}` }}
        >
          <Image
            src="/images/orasisai-mockup.jpg"
            alt="The Orasis AI radiology reading workspace showing a non-contrast head CT with AI insights"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Laptop base / deck */}
      <div className="relative mx-auto h-2.5 w-full sm:h-3">
        <div className="absolute left-1/2 top-0 h-full w-[106%] -translate-x-1/2 rounded-b-[16px] bg-gradient-to-b from-[#c7ccd6] via-[#aab1bd] to-[#8b93a1] shadow-[0_14px_22px_-10px_rgba(8,20,30,0.35)]">
          {/* Hinge notch */}
          <div className="absolute left-1/2 top-0 h-1/3 w-[12%] -translate-x-1/2 rounded-b-[9px] bg-gradient-to-b from-[#7c8492] to-[#99a1ae]" />
        </div>
      </div>
    </div>
  );
}

export default OrasisDashboardPreview;
