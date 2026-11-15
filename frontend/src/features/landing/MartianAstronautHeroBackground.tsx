import React from 'react';

/**
 * MartianAstronautHeroBackground
 * 
 * High-fidelity atmospheric vector artwork of an astronaut in an advanced EVA sortie suit
 * standing on the stratified rocky outcrop of Gale Crater, overlooking Mount Sharp.
 * 
 * Features:
 * - High-contrast EVA space suit with titanium/platinum specular highlights
 * - Gold/copper reflective pressurized visor with planetary horizon reflections
 * - Active life-support telemetry HUD and chest unit with status indicators
 * - Gale Crater elevation contours and green lidar scan grid
 * - Distant Mount Sharp mountain ridges under Martian dusk with Phobos and stars
 * - Clean CSS vignette blending seamlessly into the deep obsidian #050507 theme
 */
export const MartianAstronautHeroBackground: React.FC = () => {
  return (
    <div className="relative w-full max-w-[560px] aspect-[6/5] flex items-center justify-center pointer-events-none select-none">
      {/* Planetary Atmosphere Radial Glows */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#C85A32]/20 via-[#E27B54]/8 to-transparent rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[280px] h-[280px] bg-[#10B981]/8 rounded-full blur-[90px] -z-10" />

      <svg
        viewBox="0 0 600 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] overflow-visible"
      >
        <defs>
          {/* Visor Mirror & Specular Gradient */}
          <linearGradient id="visorGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="30%" stopColor="#E27B54" />
            <stop offset="60%" stopColor="#9A3412" />
            <stop offset="100%" stopColor="#2E120D" />
          </linearGradient>

          <linearGradient id="visorGlint" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1E1314" stopOpacity="0" />
          </linearGradient>

          {/* EVA Suit Material Shading - Titanium Platinum */}
          <linearGradient id="suitHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FAF8F5" />
            <stop offset="35%" stopColor="#D4D4D8" />
            <stop offset="70%" stopColor="#71717A" />
            <stop offset="100%" stopColor="#27272A" />
          </linearGradient>

          <linearGradient id="suitDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3F3F46" />
            <stop offset="60%" stopColor="#18181B" />
            <stop offset="100%" stopColor="#09090B" />
          </linearGradient>

          {/* Mount Sharp Silhouettes */}
          <linearGradient id="mountDistant" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7C2D12" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1C0A06" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="mountMid" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9A3412" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#240C07" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="rockForeground" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#431407" />
            <stop offset="45%" stopColor="#1C0704" />
            <stop offset="100%" stopColor="#070202" />
          </linearGradient>

          <linearGradient id="laserScan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
          </linearGradient>

          {/* Left edge seamless fade mask */}
          <linearGradient id="leftFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#050507" stopOpacity="1" />
            <stop offset="15%" stopColor="#050507" stopOpacity="0.5" />
            <stop offset="35%" stopColor="#050507" stopOpacity="0" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ======================================================== */}
        {/* MARTIAN SKY, STARS & PHOBOS                             */}
        {/* ======================================================== */}
        <g opacity="0.85">
          <circle cx="140" cy="70" r="1.4" fill="#FAF8F5" />
          <circle cx="190" cy="35" r="1.0" fill="#D4A359" />
          <circle cx="280" cy="55" r="1.6" fill="#FAF8F5" />
          <circle cx="340" cy="25" r="1.2" fill="#E27B54" />
          <circle cx="430" cy="75" r="1.5" fill="#FAF8F5" />
          <circle cx="500" cy="40" r="1.1" fill="#FAF8F5" />
          <circle cx="560" cy="90" r="1.3" fill="#D4A359" />
          <circle cx="230" cy="90" r="0.9" fill="#C4C7C5" />
          <circle cx="380" cy="95" r="1.1" fill="#FAF8F5" />
        </g>

        {/* Phobos Martian Moon */}
        <g opacity="0.8">
          <circle cx="410" cy="65" r="9" fill="#A89284" />
          <path
            d="M407 57 C413 59, 415 67, 411 73 A9 9 0 0 1 407 57 Z"
            fill="#3B2A20"
          />
        </g>

        {/* ======================================================== */}
        {/* DISTANT GALE CRATER RIM & MOUNT SHARP MOUNTAIN RIDGES    */}
        {/* ======================================================== */}
        {/* Far Mountain Horizon */}
        <path
          d="M30 310 Q140 240 250 275 T440 235 Q510 215 600 255 L600 520 L30 520 Z"
          fill="url(#mountDistant)"
        />
        {/* Mid-range Ridge */}
        <path
          d="M60 340 Q180 285 290 315 T500 275 Q550 270 600 295 L600 520 L60 520 Z"
          fill="url(#mountMid)"
        />

        {/* Elevation Contour Lines */}
        <g stroke="#E27B54" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="4 4">
          <path d="M90 355 Q230 325 390 350 T600 315" />
          <path d="M70 385 Q250 350 420 380 T600 345" />
          <path d="M50 420 Q240 385 450 410 T600 380" />
        </g>

        {/* AresNav Technological Elevation Lidar Scan Grid */}
        <g stroke="#10B981" strokeWidth="0.8" strokeOpacity="0.35">
          <line x1="220" y1="330" x2="290" y2="370" />
          <line x1="290" y1="370" x2="370" y2="350" />
          <line x1="370" y1="350" x2="440" y2="385" />
          <line x1="290" y1="370" x2="310" y2="425" />
          <line x1="370" y1="350" x2="400" y2="415" />
          <circle cx="290" cy="370" r="2" fill="#10B981" />
          <circle cx="370" cy="350" r="2" fill="#10B981" />
          <circle cx="440" cy="385" r="2" fill="#10B981" />
        </g>

        {/* Foreground Stratified Rocky Outcrop Platform */}
        <path
          d="M100 420 Q200 395 300 405 L420 400 Q510 415 600 445 L600 520 L100 520 Z"
          fill="url(#rockForeground)"
        />
        {/* Rock Fractures & Sedimentary Layers */}
        <g stroke="#260C07" strokeWidth="2.5" strokeOpacity="0.9">
          <path d="M170 435 L220 475 L260 520" />
          <path d="M300 415 L340 465" />
          <path d="M400 425 L430 485" />
          <path d="M490 440 L530 500" />
        </g>
        <path
          d="M100 420 Q200 395 300 405 L420 400 Q510 415 600 445"
          stroke="#C85A32"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />

        {/* ======================================================== */}
        {/* THE PLANETARY ASTRONAUT (ARES SORTIE EXPLORER)           */}
        {/* ======================================================== */}
        <g transform="translate(15, -20)">
          {/* Ground Contact Shadow */}
          <ellipse cx="320" cy="425" rx="60" ry="14" fill="#030102" opacity="0.95" />

          {/* Life-Support Backpack (PLSS) */}
          <rect
            x="264"
            y="195"
            width="48"
            height="86"
            rx="8"
            fill="url(#suitDark)"
            stroke="#52525B"
            strokeWidth="1.8"
          />
          {/* O2 Tanks on Top of PLSS */}
          <rect x="272" y="183" width="14" height="13" rx="3" fill="#A1A1AA" />
          <rect x="292" y="183" width="14" height="13" rx="3" fill="#A1A1AA" />

          {/* Comms Antenna with Pulsing Emerald Status Beacon */}
          <line x1="268" y1="195" x2="260" y2="145" stroke="#D4D4D8" strokeWidth="2" />
          <circle cx="260" cy="144" r="3.5" fill="#10B981" />
          <circle cx="260" cy="144" r="8" fill="#10B981" opacity="0.45" />

          {/* Left Leg (Rear / Supporting) */}
          <path
            d="M302 305 L292 368 L286 412 L308 415 L318 372 L324 305 Z"
            fill="url(#suitHighlight)"
            stroke="#3F3F46"
            strokeWidth="1.2"
          />
          {/* Left Knee Accordion Joint */}
          <rect x="287" y="362" width="28" height="11" rx="3" fill="#27272A" stroke="#52525B" strokeWidth="1" />
          {/* Left Boot */}
          <path
            d="M280 409 L310 411 L314 423 L274 423 L276 413 Z"
            fill="#18181B"
            stroke="#71717A"
            strokeWidth="1.5"
          />

          {/* Right Leg (Forward / Planted on Higher Rock Ledge) */}
          <path
            d="M328 305 L344 358 L338 402 L364 405 L370 358 L348 305 Z"
            fill="url(#suitHighlight)"
            stroke="#3F3F46"
            strokeWidth="1.2"
          />
          {/* Right Knee Accordion Joint */}
          <rect x="336" y="352" width="30" height="11" rx="3" fill="#27272A" stroke="#52525B" strokeWidth="1" />
          {/* Right Boot */}
          <path
            d="M332 401 L366 403 L370 415 L328 415 Z"
            fill="#18181B"
            stroke="#71717A"
            strokeWidth="1.5"
          />

          {/* Torso & Suit Pressure Shell */}
          <path
            d="M286 200 C286 200 312 192 344 200 C358 204 366 218 366 238 L354 310 C354 316 338 322 322 322 C306 322 292 316 292 310 L286 238 Z"
            fill="url(#suitHighlight)"
            stroke="#52525B"
            strokeWidth="1.5"
          />

          {/* Chest-Mounted Sortie Computer Module */}
          <rect
            x="308"
            y="218"
            width="38"
            height="44"
            rx="4"
            fill="#09090B"
            stroke="#71717A"
            strokeWidth="1.5"
          />
          {/* Telemetry Display Screen */}
          <rect x="313" y="223" width="28" height="16" rx="2" fill="#052E16" stroke="#10B981" strokeWidth="0.8" />
          <line x1="316" y1="230" x2="336" y2="230" stroke="#10B981" strokeWidth="1.2" />
          <line x1="316" y1="234" x2="330" y2="234" stroke="#34D399" strokeWidth="1" />
          {/* Telemetry Status LEDs */}
          <circle cx="316" cy="250" r="2.2" fill="#10B981" />
          <circle cx="324" cy="250" r="2.2" fill="#F59E0B" />
          <circle cx="332" cy="250" r="2.2" fill="#EF4444" opacity="0.6" />

          {/* Suit Pressure Collar */}
          <ellipse cx="322" cy="196" rx="23" ry="7" fill="#27272A" stroke="#71717A" strokeWidth="1.5" />

          {/* Planetary EVA Helmet */}
          <circle
            cx="322"
            cy="166"
            r="26"
            fill="url(#suitHighlight)"
            stroke="#71717A"
            strokeWidth="1.8"
          />

          {/* Gold / Copper Reflective Bubble Visor */}
          <path
            d="M315 148 C335 148 346 157 346 169 C346 182 335 189 315 189 C308 189 304 186 302 182 C302 161 306 148 315 148 Z"
            fill="url(#visorGold)"
            stroke="url(#visorGlint)"
            strokeWidth="2.5"
          />
          {/* Visor Glare Horizon Arc Highlight */}
          <path
            d="M319 152 C332 155 339 162 339 170"
            stroke="#FAF8F5"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Left Arm */}
          <path
            d="M288 212 L270 258 L280 298 L293 295 L285 261 L300 222 Z"
            fill="url(#suitHighlight)"
            stroke="#3F3F46"
            strokeWidth="1.2"
          />
          {/* Left Glove */}
          <ellipse cx="286" cy="303" rx="7.5" ry="9" fill="#18181B" stroke="#71717A" strokeWidth="1.2" />

          {/* Right Arm (Raised forward, holding geological rangefinder scanner) */}
          <path
            d="M348 214 L384 248 L416 242 L418 255 L382 262 L344 230 Z"
            fill="url(#suitHighlight)"
            stroke="#3F3F46"
            strokeWidth="1.2"
          />
          {/* Right Glove */}
          <ellipse cx="421" cy="248" rx="8.5" ry="7.5" fill="#18181B" stroke="#71717A" strokeWidth="1.2" />

          {/* Geological Handheld Ranging Tool */}
          <rect
            x="425"
            y="240"
            width="16"
            height="9"
            rx="2"
            fill="#27272A"
            stroke="#10B981"
            strokeWidth="1"
          />
          {/* Laser Rangefinder Beam sweeping out toward Mount Sharp */}
          <line
            x1="441"
            y1="244"
            x2="590"
            y2="238"
            stroke="url(#laserScan)"
            strokeWidth="2"
            strokeDasharray="5 3"
          />
          <circle cx="441" cy="244" r="2.5" fill="#10B981" />
        </g>

        {/* Soft edge fade overlay on left to blend seamlessly with hero text */}
        <rect x="0" y="0" width="600" height="520" fill="url(#leftFade)" pointerEvents="none" />
      </svg>
    </div>
  );
};

export default MartianAstronautHeroBackground;
