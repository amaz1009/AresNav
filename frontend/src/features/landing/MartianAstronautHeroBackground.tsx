import React from 'react';

/**
 * MartianAstronautHeroBackground
 * 
 * Seamless atmospheric vector illustration of an astronaut in an advanced EVA suit
 * standing on a rocky outcrop overlooking the layered terrain of Gale Crater / Mount Sharp.
 * 
 * Designed to act as an integrated background graphic on the right side of the landing hero.
 * Contains no framed borders or card backgrounds, naturally fading into the page's #0D0E12 theme.
 */
export const MartianAstronautHeroBackground: React.FC = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      {/* Warm Ambient Martian Atmospheric Glow behind the figure */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-[#C85A32]/25 via-[#E27B54]/10 to-transparent blur-[90px] -z-10" />
      <div className="absolute top-1/4 right-10 w-[240px] h-[240px] rounded-full bg-[#D4A359]/15 blur-[75px] -z-10" />

      <svg
        viewBox="0 0 600 560"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_15px_35px_rgba(0,0,0,0.8)] overflow-visible"
      >
        <defs>
          {/* Radial mask to seamlessly fade the illustration boundaries into #0D0E12 */}
          <radialGradient id="fadeMask" cx="55%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="65%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Linear gradient for left-side seamless transition */}
          <linearGradient id="leftFadeMask" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          <mask id="seamlessCompositeMask">
            <rect width="600" height="560" fill="url(#fadeMask)" />
            <rect width="600" height="560" fill="url(#leftFadeMask)" />
          </mask>

          {/* Visor Mirror & Specular Gradients */}
          <linearGradient id="visorReflect" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E27B54" />
            <stop offset="35%" stopColor="#D4A359" />
            <stop offset="65%" stopColor="#8E3516" />
            <stop offset="100%" stopColor="#1C1014" />
          </linearGradient>

          <linearGradient id="visorRim" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#D4A359" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1E1314" stopOpacity="0.1" />
          </linearGradient>

          {/* EVA Suit Material Shading */}
          <linearGradient id="suitHighlights" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#E5E4E2" />
            <stop offset="45%" stopColor="#B3B6BD" />
            <stop offset="80%" stopColor="#6C727F" />
            <stop offset="100%" stopColor="#323640" />
          </linearGradient>

          <linearGradient id="suitShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2A2D35" />
            <stop offset="100%" stopColor="#121418" />
          </linearGradient>

          {/* Martian Terrain Gradients */}
          <linearGradient id="mountSharpFar" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4A1E17" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#1A0D0F" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="mountSharpMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#68271C" />
            <stop offset="100%" stopColor="#251112" />
          </linearGradient>

          <linearGradient id="outcropForeground" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#381815" />
            <stop offset="50%" stopColor="#251011" />
            <stop offset="100%" stopColor="#10080A" />
          </linearGradient>

          <linearGradient id="laserBeam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g mask="url(#seamlessCompositeMask)">
          {/* Distant Martian Sky: Deep Twinkling Stars & Martian Moons */}
          <g opacity="0.6">
            <circle cx="160" cy="85" r="1.2" fill="#FAF8F5" />
            <circle cx="210" cy="45" r="0.8" fill="#D4A359" />
            <circle cx="320" cy="70" r="1.5" fill="#FAF8F5" opacity="0.9" />
            <circle cx="380" cy="35" r="1.0" fill="#E27B54" />
            <circle cx="470" cy="95" r="1.2" fill="#FAF8F5" />
            <circle cx="530" cy="50" r="0.8" fill="#FAF8F5" />
            <circle cx="280" cy="110" r="0.7" fill="#C4C7C5" />
            <circle cx="420" cy="120" r="1.0" fill="#FAF8F5" />
          </g>

          {/* Phobos (Martian Moon) in Deep Dusk Sky */}
          <circle cx="430" cy="80" r="7" fill="#8E7767" opacity="0.55" />
          <path
            d="M428 74 C432 76, 434 82, 431 87 A7 7 0 0 1 428 74 Z"
            fill="#3F332C"
            opacity="0.7"
          />

          {/* Distant Gale Crater Rim & Mount Sharp Mountain Range Silhouette */}
          <path
            d="M50 340 Q150 280 250 310 T450 270 Q520 250 600 290 L600 560 L50 560 Z"
            fill="url(#mountSharpFar)"
          />
          <path
            d="M80 370 Q200 320 310 345 T520 310 Q560 305 600 330 L600 560 L80 560 Z"
            fill="url(#mountSharpMid)"
          />

          {/* Geological Stratification & Elevation Contour Lines */}
          <g stroke="#C85A32" strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="3 4">
            <path d="M120 380 Q250 360 400 385 T600 350" />
            <path d="M100 410 Q280 380 440 410 T600 380" />
            <path d="M80 445 Q260 415 480 435 T600 415" />
          </g>

          {/* Planetary Lidar Elevation Mesh (AresNav Technological Signature) */}
          <g stroke="#10B981" strokeWidth="0.6" strokeOpacity="0.25">
            <line x1="260" y1="360" x2="330" y2="400" />
            <line x1="330" y1="400" x2="400" y2="380" />
            <line x1="400" y1="380" x2="470" y2="415" />
            <line x1="330" y1="400" x2="350" y2="455" />
            <line x1="400" y1="380" x2="430" y2="445" />
          </g>

          {/* Foreground Stratified Rocky Outcrop Platform where Astronaut Stands */}
          <path
            d="M140 450 Q230 430 330 440 L450 435 Q530 450 600 480 L600 560 L140 560 Z"
            fill="url(#outcropForeground)"
          />
          {/* Outcrop Crag Fractures */}
          <path
            d="M210 470 L260 510 L300 560 M330 450 L370 500 M430 460 L460 520"
            stroke="#160809"
            strokeWidth="2.5"
            strokeOpacity="0.8"
          />

          {/* ======================================================== */}
          {/* THE PLANETARY ASTRONAUT (ARES SORTIE EXPLORER)           */}
          {/* ======================================================== */}
          <g transform="translate(40, -10)">
            {/* Soft Ground Contact Shadow */}
            <ellipse cx="320" cy="460" rx="55" ry="12" fill="#0A0506" opacity="0.9" />

            {/* Astronaut Life-Support Backpack (PLSS) */}
            <rect
              x="270"
              y="235"
              width="45"
              height="80"
              rx="8"
              fill="url(#suitShadow)"
              stroke="#4E5564"
              strokeWidth="1.5"
            />
            {/* O2 Cylinder Cap & Relief Valves */}
            <rect x="277" y="224" width="13" height="11" rx="3" fill="#6C727F" />
            <rect x="296" y="224" width="13" height="11" rx="3" fill="#6C727F" />

            {/* Telemetry Antenna with Pulsing Active Beacon */}
            <line x1="274" y1="235" x2="268" y2="190" stroke="#8B909A" strokeWidth="1.5" />
            <circle cx="268" cy="189" r="3" fill="#10B981" />
            <circle cx="268" cy="189" r="7" fill="#10B981" opacity="0.4" className="animate-ping" />

            {/* Legs & Mobility Joints */}
            {/* Left Leg (Rear / Supporting) */}
            <path
              d="M305 340 L295 400 L290 445 L310 448 L320 405 L325 340 Z"
              fill="url(#suitHighlights)"
            />
            {/* Left Knee Accordion Joint */}
            <rect x="290" y="395" width="28" height="10" rx="3" fill="#2D3139" />
            {/* Left Boot on Regolith */}
            <path
              d="M285 442 L312 444 L315 456 L278 456 L280 446 Z"
              fill="#1F2228"
              stroke="#3D2C26"
              strokeWidth="1.5"
            />

            {/* Right Leg (Forward / Planted on Higher Rock Ledge) */}
            <path
              d="M330 340 L345 390 L340 435 L365 438 L370 390 L350 340 Z"
              fill="url(#suitHighlights)"
            />
            {/* Right Knee Accordion Joint */}
            <rect x="338" y="385" width="30" height="10" rx="3" fill="#2D3139" />
            {/* Right Boot */}
            <path
              d="M335 434 L368 436 L372 448 L330 448 Z"
              fill="#1F2228"
              stroke="#3D2C26"
              strokeWidth="1.5"
            />

            {/* Torso & Suit Pressure Shell */}
            <path
              d="M290 238 C290 238 315 230 345 238 C358 242 365 255 365 275 L355 345 C355 350 340 355 325 355 C310 355 295 350 295 345 L290 275 Z"
              fill="url(#suitHighlights)"
              stroke="#3B414C"
              strokeWidth="1.5"
            />

            {/* Chest-Mounted Sortie Computer Module */}
            <rect
              x="312"
              y="255"
              width="36"
              height="42"
              rx="4"
              fill="#17191E"
              stroke="#4E5564"
              strokeWidth="1.2"
            />
            {/* Telemetry Display Screen & Telemetry LEDs */}
            <rect x="317" y="260" width="26" height="15" rx="2" fill="#0C1410" />
            <line x1="319" y1="267" x2="338" y2="267" stroke="#10B981" strokeWidth="1" />
            <circle cx="320" cy="285" r="2" fill="#10B981" />
            <circle cx="327" cy="285" r="2" fill="#F59E0B" />
            <circle cx="334" cy="285" r="2" fill="#EF4444" opacity="0.6" />

            {/* Suit Pressure Collar */}
            <ellipse cx="325" cy="235" rx="22" ry="7" fill="#2B303A" stroke="#4F5664" strokeWidth="1.5" />

            {/* Planetary EVA Helmet */}
            <circle
              cx="326"
              cy="205"
              r="24"
              fill="url(#suitHighlights)"
              stroke="#4A5260"
              strokeWidth="1.5"
            />

            {/* Gold / Copper Reflective Bubble Visor */}
            <path
              d="M320 188 C338 188 348 196 348 208 C348 220 338 226 320 226 C314 226 310 223 308 220 C308 200 312 188 320 188 Z"
              fill="url(#visorReflect)"
              stroke="url(#visorRim)"
              strokeWidth="2"
            />
            {/* Visor Glare / Horizon Highlight Specular Arc */}
            <path
              d="M324 192 C335 194 342 201 342 208"
              stroke="#FAF8F5"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.75"
            />

            {/* Left Arm (Relaxed at side, supporting waist tether) */}
            <path
              d="M292 250 L275 295 L285 335 L298 332 L290 298 L304 260 Z"
              fill="url(#suitHighlights)"
            />
            {/* Left Glove */}
            <ellipse cx="292" cy="340" rx="7" ry="9" fill="#1F232B" stroke="#3D2C26" strokeWidth="1" />

            {/* Right Arm (Raised forward, holding geological surveying handheld scanner) */}
            <path
              d="M350 252 L385 285 L415 280 L418 293 L382 300 L346 268 Z"
              fill="url(#suitHighlights)"
            />
            {/* Right Glove */}
            <ellipse cx="420" cy="286" rx="8" ry="7" fill="#1F232B" stroke="#3D2C26" strokeWidth="1" />

            {/* Geological Handheld Tool & Emerald Laser Ranging Line */}
            <rect
              x="424"
              y="278"
              width="14"
              height="8"
              rx="2"
              fill="#2A2F3A"
              stroke="#10B981"
              strokeWidth="0.8"
            />
            {/* Laser Rangefinder Beam sweeping out towards Mount Sharp */}
            <line
              x1="438"
              y1="282"
              x2="590"
              y2="276"
              stroke="url(#laserBeam)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <circle cx="438" cy="282" r="2" fill="#10B981" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default MartianAstronautHeroBackground;
