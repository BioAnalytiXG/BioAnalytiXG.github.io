/**
 * Hero illustration — a hand-authored SVG recreation of the reference artwork.
 *
 * Pure vector graphics (no bitmap): three stacked frosted-glass slabs floating
 * in a gentle isometric tilt, a realistic top-view 3D brain (light-gray gyri
 * with a mint-green right hemisphere) resting on the top slab and casting a
 * soft contact shadow, a glassy analytics dashboard (data rows + progress
 * donut) on the middle slab, and faint background sparkles.
 *
 * The three slabs share one isometric basis derived from the reference panel
 * corners — TL(415,78) TR(800,152) BL(305,255) BR(690,329): the long back edge
 * runs upper-left → right (vector ≈ 385,74) and the body extends down-left
 * toward the viewer (vector ≈ -110,177). Lower slabs reuse that basis scaled up
 * ~7% / ~14% and shifted down. UI content is drawn in each slab's local space
 * (x along the back edge, y down the left edge) so it sits flush on the glass.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1024 768"
      className={["hero-illustration", className].filter(Boolean).join(" ")}
      role="img"
      aria-label="A 3D brain resting on stacked glass dashboard panels"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Frosted glass */}
        <linearGradient id="glass" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.94" />
          <stop offset="1" stopColor="#e8f1ef" stopOpacity="0.74" />
        </linearGradient>

        {/* Brain volume — medium base so the light gyri "worms" read as bumps */}
        <radialGradient id="brainBody" cx="0.4" cy="0.3" r="0.92">
          <stop offset="0" stopColor="#e2eaea" />
          <stop offset="0.55" stopColor="#d2dcdc" />
          <stop offset="1" stopColor="#bac5c5" />
        </radialGradient>
        <linearGradient id="brainShade" x1="0.2" y1="0.1" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.58" stopColor="#74857f" stopOpacity="0" />
          <stop offset="1" stopColor="#6a7b79" stopOpacity="0.5" />
        </linearGradient>
        {/* Mint accent: transparent through the centre, saturating to the right */}
        <linearGradient id="brainMint" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.4" stopColor="#34d399" stopOpacity="0" />
          <stop offset="0.62" stopColor="#6ee7b7" stopOpacity="0.5" />
          <stop offset="0.85" stopColor="#43cd9d" stopOpacity="0.82" />
          <stop offset="1" stopColor="#23b083" stopOpacity="0.95" />
        </linearGradient>

        <radialGradient id="bgGlow" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#ecf6f3" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        <filter id="panelShadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="24" stdDeviation="24" floodColor="#9ab2ae" floodOpacity="0.3" />
        </filter>
        <filter id="brainShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="6" dy="18" stdDeviation="16" floodColor="#6f8986" floodOpacity="0.38" />
        </filter>
        <filter id="blurMd" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="blurSm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="sparkGlow" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="2" />
        </filter>

        {/* Organic warp for the fold lines — breaks the regular striping */}
        <filter id="brainWobble" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="4" result="w" />
          <feDisplacementMap in="SourceGraphic" in2="w" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Procedural 3D bump shading: fractal noise lit from upper-left.
            Multiplied over the folds it adds real relief in the valleys. */}
        <filter id="brainBump" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.064" numOctaves="3" seed="9" result="n" />
          <feDiffuseLighting in="n" surfaceScale="3.2" diffuseConstant="1" lightingColor="#ffffff" result="l">
            <feDistantLight azimuth="235" elevation="60" />
          </feDiffuseLighting>
          <feComposite in="l" in2="SourceAlpha" operator="in" />
        </filter>

        {/* Fine speckle highlight to suggest the glossy gyri tops */}
        <filter id="brainSpeck" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09 0.11" numOctaves="2" seed="3" result="s" />
          <feSpecularLighting in="s" surfaceScale="2" specularConstant="0.8" specularExponent="14" lightingColor="#ffffff" result="sl">
            <feDistantLight azimuth="235" elevation="62" />
          </feSpecularLighting>
          <feComposite in="sl" in2="SourceAlpha" operator="in" />
        </filter>

        {/* Brain silhouette (top view) — clips all interior detail */}
        <clipPath id="brainClip">
          <path d="M565 122 C588 112 620 116 644 134 C668 152 686 182 680 210 C690 230 684 256 666 270 C654 286 632 294 612 290 C606 304 590 312 576 306 C572 314 566 316 565 308 C564 316 558 314 554 306 C540 312 524 304 518 290 C498 294 476 286 464 270 C446 256 440 230 450 210 C444 182 462 152 486 134 C510 116 542 112 565 122 Z" />
        </clipPath>

        {/* Reusable 4-point sparkle */}
        <symbol id="spark" viewBox="-8 -8 16 16">
          <path
            d="M0 -8 C0.9 -0.9 0.9 -0.9 8 0 C0.9 0.9 0.9 0.9 0 8 C-0.9 0.9 -0.9 0.9 -8 0 C-0.9 -0.9 -0.9 -0.9 0 -8 Z"
            fill="#bfe6da"
          />
        </symbol>
      </defs>

      {/* soft ambient backdrop */}
      <rect x="150" y="70" width="740" height="620" fill="url(#bgGlow)" />

      {/* Background sparkles + faint constellation lines */}
      <g filter="url(#sparkGlow)">
        <g className="hero-constellation" stroke="#d4ebe4" strokeWidth="1" fill="none" opacity="0.7">
          <path d="M90 260 L168 312 L138 392" />
          <path d="M935 320 L866 372 L906 446" />
          <path d="M150 585 L240 616" />
        </g>
        <use className="hero-twinkle" href="#spark" x="80" y="252" width="13" height="13" opacity="0.85" />
        <use className="hero-twinkle" href="#spark" x="164" y="306" width="9" height="9" opacity="0.7" style={{ animationDelay: "0.4s" }} />
        <use className="hero-twinkle" href="#spark" x="132" y="384" width="10" height="10" opacity="0.65" style={{ animationDelay: "0.8s" }} />
        <use className="hero-twinkle" href="#spark" x="926" y="312" width="12" height="12" opacity="0.8" style={{ animationDelay: "1.2s" }} />
        <use className="hero-twinkle" href="#spark" x="900" y="438" width="9" height="9" opacity="0.6" style={{ animationDelay: "0.6s" }} />
        <use className="hero-twinkle" href="#spark" x="234" y="608" width="11" height="11" opacity="0.7" style={{ animationDelay: "1.6s" }} />
        <use className="hero-twinkle" href="#spark" x="470" y="640" width="8" height="8" opacity="0.55" style={{ animationDelay: "1s" }} />
        <use className="hero-twinkle" href="#spark" x="812" y="560" width="10" height="10" opacity="0.65" style={{ animationDelay: "2s" }} />
        <g fill="#d4ebe4" opacity="0.7">
          <circle className="hero-twinkle" cx="205" cy="214" r="2" style={{ animationDelay: "0.3s" }} />
          <circle className="hero-twinkle" cx="864" cy="236" r="2" style={{ animationDelay: "1.1s" }} />
          <circle className="hero-twinkle" cx="330" cy="662" r="2" style={{ animationDelay: "1.7s" }} />
          <circle className="hero-twinkle" cx="704" cy="656" r="2" style={{ animationDelay: "0.9s" }} />
        </g>
      </g>

      {/* ---- Bottom slab (back) ---- */}
      <g transform="matrix(1.090 0.210 -0.396 1.035 421.1 256.1)" filter="url(#panelShadow)">
        <rect width="392" height="266" rx="26" fill="url(#glass)" stroke="#cbe9df" strokeWidth="2.2" />
        <rect x="7" y="7" width="378" height="252" rx="22" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.4" />
        <path d="M16 258 L376 258 L384 16" fill="none" stroke="#cdeee0" strokeWidth="3" opacity="0.8" />
        <path d="M16 258 L376 258 L384 16" fill="none" stroke="#ffffff" strokeWidth="1.1" opacity="0.55" />
        <circle cx="384" cy="8" r="3" fill="#ffffff" opacity="0.8" />
      </g>

      {/* ---- Middle slab (dashboard) ---- */}
      <g transform="matrix(1.041 0.200 -0.378 0.988 411.3 192.0)" filter="url(#panelShadow)">
        <rect width="392" height="266" rx="26" fill="url(#glass)" stroke="#cbe9df" strokeWidth="2.2" />
        <rect x="7" y="7" width="378" height="252" rx="22" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.4" />
        <path d="M16 258 L376 258 L384 16" fill="none" stroke="#cdeee0" strokeWidth="3" opacity="0.8" />
        <path d="M16 258 L376 258 L384 16" fill="none" stroke="#ffffff" strokeWidth="1.1" opacity="0.55" />
        <circle cx="384" cy="8" r="3" fill="#ffffff" opacity="0.8" />

        {/* top-right cluster */}
        <g fill="#dbe7e4">
          <rect x="262" y="64" width="60" height="7" rx="3.5" />
          <rect x="262" y="78" width="42" height="7" rx="3.5" />
          <rect x="262" y="92" width="52" height="7" rx="3.5" />
        </g>
        <g fill="#cdddd9">
          <circle cx="264" cy="112" r="3.5" />
          <circle cx="278" cy="112" r="3.5" />
          <circle cx="292" cy="112" r="3.5" />
        </g>

        {/* left data rows (with mint highlights) */}
        <g>
          <rect x="42" y="120" width="118" height="10" rx="5" fill="#dbe7e4" />
          <rect className="hero-row-pulse" x="42" y="140" width="152" height="10" rx="5" fill="#6ee7b7" />
          <rect className="hero-row-pulse" x="42" y="160" width="96" height="10" rx="5" fill="#a7ead3" style={{ animationDelay: "0.7s" }} />
          <rect x="42" y="180" width="132" height="10" rx="5" fill="#dbe7e4" />
          <rect x="42" y="200" width="80" height="10" rx="5" fill="#dbe7e4" />
        </g>

        {/* progress donut */}
        <g transform="translate(224 178)">
          <circle r="28" fill="none" stroke="#dbe7e4" strokeWidth="9" />
          <circle
            className="hero-donut-arc"
            r="28"
            fill="none"
            stroke="#34d399"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray="176"
            strokeDashoffset="62"
            transform="rotate(-90)"
          />
        </g>

        {/* right-side rows near the donut */}
        <g fill="#dbe7e4">
          <rect x="272" y="170" width="56" height="8" rx="4" />
          <rect x="272" y="186" width="40" height="8" rx="4" />
          <rect x="272" y="202" width="50" height="8" rx="4" />
        </g>
      </g>

      {/* ---- Top slab (screen) ---- */}
      <g transform="matrix(0.982 0.189 -0.357 0.932 415 78)" filter="url(#panelShadow)">
        <rect width="392" height="266" rx="26" fill="url(#glass)" stroke="#cbe9df" strokeWidth="2.2" />
        <rect x="7" y="7" width="378" height="252" rx="22" fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.4" />
        <path d="M16 258 L376 258 L384 16" fill="none" stroke="#cdeee0" strokeWidth="3" opacity="0.8" />
        <path d="M16 258 L376 258 L384 16" fill="none" stroke="#ffffff" strokeWidth="1.1" opacity="0.55" />
        <circle cx="384" cy="8" r="3" fill="#ffffff" opacity="0.85" />

        {/* speaker pill (top-centre) */}
        <rect x="152" y="24" width="38" height="6" rx="3" fill="#dbe7e4" />

        {/* left-edge bezel: two sensor dots + tick marks */}
        <g>
          <circle cx="28" cy="150" r="9" fill="none" stroke="#9bd9c4" strokeWidth="2.5" />
          <circle cx="28" cy="184" r="9" fill="none" stroke="#cfe1dd" strokeWidth="2.5" />
          <rect x="46" y="147" width="30" height="6" rx="3" fill="#dbe7e4" />
          <rect x="46" y="181" width="22" height="6" rx="3" fill="#dbe7e4" />
        </g>

        {/* front-edge "•••" status dots */}
        <g fill="#cdddd9">
          <circle cx="180" cy="246" r="4" />
          <circle cx="196" cy="246" r="4" />
          <circle cx="212" cy="246" r="4" />
        </g>
      </g>

      {/* ---- Brain contact shadow on the top slab ---- */}
      <ellipse
        cx="590"
        cy="280"
        rx="132"
        ry="36"
        fill="#6f928b"
        opacity="0.2"
        filter="url(#blurMd)"
        transform="rotate(11 590 280)"
      />

      {/* ---- Brain (top view), resting on the top slab ---- */}
      <g transform="translate(0 -4)">
        {/* body base (medium tone) */}
        <path
          d="M565 122 C588 112 620 116 644 134 C668 152 686 182 680 210 C690 230 684 256 666 270 C654 286 632 294 612 290 C606 304 590 312 576 306 C572 314 566 316 565 308 C564 316 558 314 554 306 C540 312 524 304 518 290 C498 294 476 286 464 270 C446 256 440 230 450 210 C444 182 462 152 486 134 C510 116 542 112 565 122 Z"
          fill="url(#brainBody)"
          filter="url(#brainShadow)"
        />

        <g clipPath="url(#brainClip)">
          {/* soft ambient occlusion where the cerebellum meets the cerebrum */}
          <path
            d="M470 266 C520 280 612 280 664 264"
            fill="none"
            stroke="#8a9897"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.18"
            filter="url(#blurSm)"
          />

          {/* Fold structure (worms + grooves), warped by turbulence for an
              organic, irregular look; clipped, so strokes may overshoot. */}
          <g filter="url(#brainWobble)">
          <g stroke="#eef3f2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* right hemisphere — primary worms */}
            <path d="M568 133 C590 129 604 140 620 138 C640 136 654 150 670 150" />
            <path d="M568 144 C588 141 602 152 620 150 C640 148 656 160 672 162" />
            <path d="M569 156 C590 153 606 163 622 162 C642 160 656 172 670 176" />
            <path d="M569 168 C588 165 604 176 622 174 C642 172 658 184 672 188" />
            <path d="M570 180 C590 177 606 187 624 186 C644 184 660 196 674 200" />
            <path d="M571 192 C590 189 606 200 624 198 C644 197 660 208 676 212" />
            <path d="M572 204 C592 201 608 211 626 210 C646 208 662 220 676 224" />
            <path d="M573 216 C592 213 608 224 626 222 C646 221 662 232 674 236" />
            <path d="M575 228 C594 225 610 235 628 234 C646 233 660 244 672 248" />
            <path d="M577 240 C594 237 610 247 628 246 C644 245 658 254 668 258" />
            <path d="M580 252 C596 250 610 259 626 258 C640 257 652 266 662 268" />
            <path d="M584 264 C598 262 612 270 624 270 C636 269 646 276 654 278" />
            <path d="M588 276 C600 274 612 281 622 281 C632 281 640 286 646 288" />
            <path d="M580 128 C600 126 616 134 628 146" />
            <path d="M598 132 C614 138 624 150 628 164" />
            <path d="M612 150 C620 164 614 178 622 192" />
            <path d="M640 170 C650 184 644 198 652 212" />
            <path d="M626 200 C634 214 628 226 636 238" />
            <path d="M600 218 C606 230 600 242 606 252" />
            {/* left hemisphere — primary worms */}
            <path d="M562 133 C540 129 526 140 510 138 C490 136 476 150 460 150" />
            <path d="M562 144 C542 141 528 152 510 150 C490 148 474 160 458 162" />
            <path d="M561 156 C540 153 524 163 508 162 C488 160 474 172 460 176" />
            <path d="M561 168 C542 165 526 176 508 174 C488 172 472 184 458 188" />
            <path d="M560 180 C540 177 524 187 506 186 C486 184 470 196 456 200" />
            <path d="M559 192 C540 189 524 200 506 198 C486 197 470 208 454 212" />
            <path d="M558 204 C538 201 522 211 504 210 C484 208 468 220 454 224" />
            <path d="M557 216 C538 213 522 224 504 222 C484 221 468 232 456 236" />
            <path d="M555 228 C536 225 520 235 502 234 C484 233 470 244 458 248" />
            <path d="M553 240 C536 237 520 247 502 246 C486 245 472 254 462 258" />
            <path d="M550 252 C534 250 520 259 504 258 C490 257 478 266 468 268" />
            <path d="M546 264 C532 262 518 270 506 270 C494 269 484 276 476 278" />
            <path d="M542 276 C530 274 518 281 508 281 C498 281 490 286 484 288" />
            <path d="M550 128 C530 126 514 134 502 146" />
            <path d="M532 132 C516 138 506 150 502 164" />
            <path d="M518 150 C510 164 516 178 508 192" />
            <path d="M490 170 C480 184 486 198 478 212" />
            <path d="M504 200 C496 214 502 226 494 238" />
            <path d="M530 218 C524 230 530 242 524 252" />
          </g>

          {/* finer secondary worms woven between primaries */}
          <g stroke="#e7efed" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M569 138 C590 135 606 146 624 144 C644 143 660 154 674 156" />
            <path d="M570 162 C590 159 606 170 626 168 C646 167 662 178 676 180" />
            <path d="M572 186 C592 183 608 194 628 192 C648 191 664 202 678 206" />
            <path d="M574 210 C594 207 610 218 628 217 C648 216 662 226 674 230" />
            <path d="M578 234 C596 231 612 241 630 240 C646 239 660 248 670 252" />
            <path d="M584 258 C598 256 612 264 626 264 C638 263 648 270 656 272" />
            <path d="M561 138 C540 135 524 146 506 144 C486 143 470 154 456 156" />
            <path d="M560 162 C540 159 524 170 504 168 C484 167 468 178 454 180" />
            <path d="M558 186 C538 183 522 194 502 192 C482 191 466 202 452 206" />
            <path d="M556 210 C536 207 520 218 502 217 C482 216 468 226 456 230" />
            <path d="M552 234 C534 231 518 241 500 240 C484 239 470 248 460 252" />
            <path d="M546 258 C532 256 518 264 504 264 C492 263 482 270 474 272" />
          </g>

          {/* dark grooves carving the sulci */}
          <g fill="none" stroke="#a4afae" strokeWidth="1.2" strokeLinecap="round" opacity="0.42">
            <path d="M569 150 C590 147 606 158 626 156 C646 155 662 166 676 168" />
            <path d="M571 174 C590 171 606 182 626 180 C646 179 662 190 676 194" />
            <path d="M573 198 C592 195 608 206 628 204 C648 203 664 214 676 218" />
            <path d="M576 222 C594 219 610 230 628 228 C646 227 660 238 670 242" />
            <path d="M582 250 C598 248 612 256 626 256 C638 255 648 262 656 264" />
            <path d="M561 150 C540 147 524 158 504 156 C484 155 468 166 454 168" />
            <path d="M559 174 C540 171 524 182 504 180 C484 179 468 190 454 194" />
            <path d="M557 198 C538 195 522 206 502 204 C482 203 466 214 454 218" />
            <path d="M554 222 C536 219 520 230 502 228 C484 227 470 238 460 242" />
            <path d="M548 250 C534 248 520 256 504 256 C492 255 482 262 474 264" />
          </g>

          </g>

          {/* organic 3D bump shading (turbulence + diffuse lighting), multiplied
              so the noise carves real relief / shadow into the valleys */}
          <path
            d="M565 122 C588 112 620 116 644 134 C668 152 686 182 680 210 C690 230 684 256 666 270 C654 286 632 294 612 290 C606 304 590 312 576 306 C572 314 566 316 565 308 C564 316 558 314 554 306 C540 312 524 304 518 290 C498 294 476 286 464 270 C446 256 440 230 450 210 C444 182 462 152 486 134 C510 116 542 112 565 122 Z"
            fill="#000000"
            filter="url(#brainBump)"
            opacity="0.6"
            style={{ mixBlendMode: "multiply" }}
          />

          {/* glossy speckle highlights on the gyri tops */}
          <path
            d="M565 122 C588 112 620 116 644 134 C668 152 686 182 680 210 C690 230 684 256 666 270 C654 286 632 294 612 290 C606 304 590 312 576 306 C572 314 566 316 565 308 C564 316 558 314 554 306 C540 312 524 304 518 290 C498 294 476 286 464 270 C446 256 440 230 450 210 C444 182 462 152 486 134 C510 116 542 112 565 122 Z"
            fill="#000000"
            filter="url(#brainSpeck)"
            opacity="0.5"
            style={{ mixBlendMode: "screen" }}
          />

          {/* lit ridge highlights on the upper-left worms */}
          <g filter="url(#brainWobble)" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.45">
            <path d="M562 144 C542 141 528 152 510 150 C490 148 474 160 458 162" />
            <path d="M561 156 C540 153 524 163 508 162 C488 160 474 172 460 176" />
            <path d="M560 180 C540 177 524 187 506 186 C486 184 470 196 456 200" />
            <path d="M518 150 C510 164 516 178 508 192" />
            <path d="M568 144 C588 141 602 152 620 150 C640 148 656 160 672 162" opacity="0.6" />
          </g>

          {/* big soft top-left highlight */}
          <ellipse cx="514" cy="166" rx="62" ry="44" fill="#ffffff" opacity="0.42" filter="url(#blurSm)" />

          {/* lower-right volumetric shade */}
          <path
            d="M565 122 C588 112 620 116 644 134 C668 152 686 182 680 210 C690 230 684 256 666 270 C654 286 632 294 612 290 C606 304 590 312 576 306 C572 314 566 316 565 308 C564 316 558 314 554 306 C540 312 524 304 518 290 C498 294 476 286 464 270 C446 256 440 230 450 210 C444 182 462 152 486 134 C510 116 542 112 565 122 Z"
            fill="url(#brainShade)"
          />

          {/* cerebellum — distinct, finely folded mass (thinner worms) */}
          <g stroke="#e6edec" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M510 277 C526 280 540 280 552 277" />
            <path d="M509 285 C525 289 541 289 553 285" />
            <path d="M510 293 C526 296 542 296 552 293" />
            <path d="M513 300 C527 303 541 303 550 300" />
            <path d="M516 307 C528 309 540 309 548 307" />
            <path d="M568 277 C584 280 600 280 614 277" />
            <path d="M568 285 C584 289 602 289 615 285" />
            <path d="M569 293 C585 296 603 296 614 293" />
            <path d="M572 300 C586 303 601 303 611 300" />
            <path d="M575 307 C587 309 599 309 607 307" />
          </g>
          <g fill="none" stroke="#9aa5a4" strokeWidth="1.2" strokeLinecap="round" opacity="0.45">
            <path d="M509 281 C525 285 541 285 553 281" />
            <path d="M510 289 C526 293 542 293 552 289" />
            <path d="M568 281 C584 285 602 285 615 281" />
            <path d="M569 289 C585 293 603 293 614 289" />
          </g>

          {/* central longitudinal fissure — soft AO + crisp line */}
          <path
            d="M565 124 C560 150 569 178 564 206 C559 234 567 260 565 306"
            fill="none"
            stroke="#7f8d8c"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.22"
            filter="url(#blurSm)"
          />
          <path
            d="M565 124 C560 150 569 178 564 206 C559 234 567 260 565 306"
            fill="none"
            stroke="#7c8a89"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* mint-green region overlay (tints the right hemisphere) */}
          <path
            d="M565 122 C588 112 620 116 644 134 C668 152 686 182 680 210 C690 230 684 256 666 270 C654 286 632 294 612 290 C606 304 590 312 576 306 C572 314 566 316 565 308 Z"
            fill="url(#brainMint)"
          />
        </g>

        {/* crisp outer rim */}
        <path
          d="M565 122 C588 112 620 116 644 134 C668 152 686 182 680 210 C690 230 684 256 666 270 C654 286 632 294 612 290 C606 304 590 312 576 306 C572 314 566 316 565 308 C564 316 558 314 554 306 C540 312 524 304 518 290 C498 294 476 286 464 270 C446 256 440 230 450 210 C444 182 462 152 486 134 C510 116 542 112 565 122 Z"
          fill="none"
          stroke="#b4c0bf"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );
}

export default HeroIllustration;
