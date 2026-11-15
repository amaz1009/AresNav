import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  ArrowRight,
  Route,
  Activity,
  MapPin,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface LandingPageProps {
  onEnterWorkstation: () => void;
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const current = ref.current;
    if (current) observer.observe(current);

    // Auto-reveal fallback ensures test suites and headless browsers always render
    const timer = setTimeout(() => setIsVisible(true), 120);

    return () => {
      clearTimeout(timer);
      if (current) observer.unobserve(current);
    };
  }, []);

  const getDirectionClass = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100';
    switch (direction) {
      case 'up':
        return 'opacity-0 translate-y-8 scale-[0.98]';
      case 'down':
        return 'opacity-0 -translate-y-8 scale-[0.98]';
      case 'left':
        return 'opacity-0 translate-x-8 scale-[0.98]';
      case 'right':
        return 'opacity-0 -translate-x-8 scale-[0.98]';
      case 'none':
        return 'opacity-0 scale-95';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${getDirectionClass()} ${className}`}
    >
      {children}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterWorkstation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(progress);
  };

  const handleScrollDown = () => {
    const target = document.getElementById('mission-architecture');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen w-full bg-[#0D0E12] text-[#FAF8F5] font-sans select-text relative overflow-y-auto overflow-x-hidden scroll-smooth"
    >
      {/* Top Laser Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-[#161214]/60 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#C85A32] via-[#E27B54] to-[#D4A359] shadow-[0_0_12px_#E27B54] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Atmospheric Background Gradients & Floating Nebulae */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Breathing Rusty Atmospheric Radial Gradients */}
        <div className="absolute top-0 right-0 w-[650px] h-[650px] bg-gradient-to-b from-[#C85A32]/15 via-[#8E3516]/5 to-transparent rounded-full blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/4 w-[850px] h-[450px] bg-gradient-to-t from-[#B24520]/20 via-[#4A1D11]/10 to-transparent blur-[150px] animate-pulse-slow" />
        
        {/* Subtle Floating Orbit Glow */}
        <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-[#C85A32]/5 rounded-full blur-[90px] animate-float-subtle" />

        {/* Technical Planetary Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#C85A32_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-[0.07]" />
      </div>

      {/* Top Technical Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#2D221E]/90 bg-[#121115]/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5 group cursor-default">
            <div className="h-8 w-8 rounded-[2px] bg-[#1D1716] border border-[#C85A32]/50 flex items-center justify-center text-[#C85A32] shadow-[0_0_12px_rgba(200,90,50,0.2)] group-hover:border-[#E27B54] group-hover:shadow-[0_0_16px_rgba(200,90,50,0.4)] transition-all duration-300">
              <Compass className="h-4.5 w-4.5 group-hover:rotate-45 transition-transform duration-500" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-base font-semibold tracking-[0.2em] text-[#FAF8F5] font-editorial">
                AresNav
              </span>
              <span className="block text-[8.5px] font-mono text-[#C85A32] tracking-[0.24em] uppercase">
                PLANETARY SURFACE INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Metadata & Direct Entry Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-[10px] font-mono text-[#9E958F]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4E9A68] animate-pulse" />
              <span>NASA SPACE APPS 2026</span>
              <span className="text-[#3D2C26]">|</span>
              <span className="text-[#C85A32]">IAU2000:49900</span>
            </div>

            <button
              onClick={onEnterWorkstation}
              className="relative px-4 py-2 rounded-[2px] bg-[#1F1716] hover:bg-[#C85A32] text-[#E27B54] hover:text-[#FAF8F5] border border-[#C85A32]/40 hover:border-[#C85A32] font-mono text-xs uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 cursor-pointer shadow-sm hover:shadow-[0_0_18px_rgba(200,90,50,0.35)] overflow-hidden group"
            >
              <span>ENTER WORKSTATION</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-16 pb-20 space-y-24">
        {/* Top Hero Section: Mission Statement & Direct Call to Action */}
        <div className="max-w-4xl space-y-6">
          <Reveal direction="down" delay={0}>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-[2px] bg-[#231714] border border-[#4C281E] text-[#D4A359] text-[10px] font-mono uppercase tracking-[0.18em] shadow-[0_0_15px_rgba(200,90,50,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C85A32] animate-ping" />
              <span>Human Planetary Mission Architecture</span>
            </div>
          </Reveal>

          <Reveal direction="up" delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#FAF8F5] font-editorial leading-[1.08]">
              Surface Intelligence &amp; Mission Planning for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D96B43] via-[#C85A32] to-[#E07A5F] italic font-editorial">
                Human Exploration of Mars
              </span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <p className="text-sm md:text-base text-[#C4C7C5] leading-relaxed font-sans max-w-3xl font-light">
              <strong className="text-[#FAF8F5] font-medium">AresNav</strong> is an operational planetary decision-support platform designed for mission controllers, planetary geologists, and astronaut sortie planners. Bridging orbital remote sensing with astronaut physiological safety limits, the system evaluates exploration site suitability, maps hazardous slopes, charts traversable routes, and models real-time life-support consumables.
            </p>
          </Reveal>

          {/* Main Primary Action Button with Dynamic Shimmer */}
          <Reveal direction="up" delay={300}>
            <div className="pt-2 space-y-4">
              <button
                onClick={onEnterWorkstation}
                className="group relative px-8 py-4.5 rounded-[2px] bg-gradient-to-r from-[#C85A32] via-[#E27B54] to-[#B24520] hover:from-[#D96B43] hover:to-[#C85A32] text-[#FAF8F5] font-semibold text-xs md:text-sm tracking-[0.18em] uppercase flex items-center space-x-3.5 shadow-[0_4px_30px_rgba(200,90,50,0.45)] hover:shadow-[0_8px_40px_rgba(200,90,50,0.65)] hover:-translate-y-0.5 transition-all duration-300 border border-[#E27B54]/60 cursor-pointer overflow-hidden"
              >
                {/* Subtle Light Beam Reflection */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                <span className="relative z-10">ENTER MISSION WORKSTATION</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform relative z-10" />
              </button>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono text-[#9E958F] pt-1">
                <span className="flex items-center space-x-1.5 text-[#C4C7C5] hover:text-[#FAF8F5] transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4E9A68]" />
                  <span>Interactive 2D Surface Map</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#C4C7C5] hover:text-[#FAF8F5] transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4E9A68]" />
                  <span>Multi-Mission Scientific Layers</span>
                </span>
                <span className="flex items-center space-x-1.5 text-[#C4C7C5] hover:text-[#FAF8F5] transition-colors">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#4E9A68]" />
                  <span>A* Terrain Traverse Planner</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Interactive Mouse Scroll Wheel Prompt with Pulse Ripple */}
        <div className="flex flex-col items-center justify-center pt-2 pb-2">
          <button
            type="button"
            data-testid="scroll-wheel"
            onClick={handleScrollDown}
            className="group flex flex-col items-center space-y-2 cursor-pointer focus:outline-none transition-all duration-300"
            aria-label="Scroll down to explore project architecture"
            title="Scroll to explore mission architecture"
          >
            {/* Mouse Silhouette with Animated Scroll Wheel & Pulse Ring */}
            <div className="relative w-6 h-10 rounded-full border-2 border-[#C85A32]/70 group-hover:border-[#E27B54] bg-[#161214]/90 flex items-start justify-center p-1.5 shadow-[0_0_18px_rgba(200,90,50,0.3)] transition-all group-hover:scale-105">
              {/* Animated Wheel Roller */}
              <div className="w-1.5 h-2.5 rounded-full bg-gradient-to-b from-[#FAF8F5] via-[#E27B54] to-[#C85A32] shadow-[0_0_8px_#E27B54] animate-scroll-wheel" />
            </div>
            <div className="flex items-center space-x-1.5 text-[9px] font-mono uppercase tracking-[0.22em] text-[#9E958F] group-hover:text-[#E27B54] transition-colors">
              <span>SCROLL TO EXPLORE</span>
              <ChevronDown className="h-3 w-3 text-[#C85A32] group-hover:translate-y-1 transition-transform duration-300" />
            </div>
          </button>
        </div>

        {/* Section 2: The Three Non-Conflated Analytical Pillars */}
        <div id="mission-architecture" className="space-y-8 pt-8 border-t border-[#2D221E] scroll-mt-20">
          <Reveal direction="up" delay={0}>
            <div className="space-y-2 max-w-3xl">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C85A32] font-semibold flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                <span>CORE SCIENTIFIC ARCHITECTURE</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-normal text-[#FAF8F5] tracking-tight font-editorial">
                Three Distinct Pillars of Mission Assurance
              </h2>
              <p className="text-xs md:text-sm text-[#C4C7C5] leading-relaxed font-light">
                In accordance with NASA planetary mission principles, AresNav strictly separates site ranking from traversability and crew physiological limits to ensure deterministic safety:
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Site Suitability */}
            <Reveal direction="up" delay={100}>
              <div className="h-full p-6 rounded-[2px] bg-[#161214] border border-[#2D221E] hover:border-[#C85A32] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(200,90,50,0.18)] transition-all duration-300 space-y-4 relative group">
                <div className="h-10 w-10 rounded-[2px] bg-[#221816] border border-[#C85A32]/40 group-hover:border-[#E27B54] flex items-center justify-center text-[#C85A32] group-hover:text-[#E27B54] group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,90,50,0.5)] transition-all duration-300">
                  <MapPin className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <span className="text-[9.5px] font-mono text-[#C85A32] uppercase tracking-[0.16em] font-semibold block">
                    PILLAR 01 • SELECTION
                  </span>
                  <h3 className="text-lg font-semibold text-[#FAF8F5] font-editorial tracking-wide group-hover:text-[#E27B54] transition-colors">
                    Site Suitability &amp; Intelligence
                  </h3>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed font-light">
                    Evaluates landing zones with transparent weighted scoring across 5 criteria: terrain safety, human hazard avoidance, mineral science value, subsurface water-ice indicators, and landing accessibility.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#2D221E] text-[10px] font-mono text-[#9E958F] space-y-1">
                  <div>• Hard constraint: Slope ≤ 15.0°</div>
                  <div>• SWIM water-ice presence verification</div>
                  <div>• Transparent equation: S = Σ (wᵢ × sᵢ)</div>
                </div>
              </div>
            </Reveal>

            {/* Pillar 2: Traverse Suitability */}
            <Reveal direction="up" delay={250}>
              <div className="h-full p-6 rounded-[2px] bg-[#161214] border border-[#2D221E] hover:border-[#C85A32] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(200,90,50,0.18)] transition-all duration-300 space-y-4 relative group">
                <div className="h-10 w-10 rounded-[2px] bg-[#221816] border border-[#C85A32]/40 group-hover:border-[#E27B54] flex items-center justify-center text-[#C85A32] group-hover:text-[#E27B54] group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,90,50,0.5)] transition-all duration-300">
                  <Route className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <span className="text-[9.5px] font-mono text-[#C85A32] uppercase tracking-[0.16em] font-semibold block">
                    PILLAR 02 • MOBILITY
                  </span>
                  <h3 className="text-lg font-semibold text-[#FAF8F5] font-editorial tracking-wide group-hover:text-[#E27B54] transition-colors">
                    Terrain-Aware Traverse Routing
                  </h3>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed font-light">
                    Calculates optimal surface paths between habitat base, intermediate science investigation stations, and return corridors using slope-penalized A* pathfinding.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#2D221E] text-[10px] font-mono text-[#9E958F] space-y-1">
                  <div>• 3 Route alternatives: Low-Risk, Balanced, Science</div>
                  <div>• HiRISE &amp; MOLA elevation cross-sections</div>
                  <div>• Hazard exclusion and slope penalty weights</div>
                </div>
              </div>
            </Reveal>

            {/* Pillar 3: Mission Feasibility */}
            <Reveal direction="up" delay={400}>
              <div className="h-full p-6 rounded-[2px] bg-[#161214] border border-[#2D221E] hover:border-[#C85A32] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(200,90,50,0.18)] transition-all duration-300 space-y-4 relative group">
                <div className="h-10 w-10 rounded-[2px] bg-[#221816] border border-[#C85A32]/40 group-hover:border-[#E27B54] flex items-center justify-center text-[#C85A32] group-hover:text-[#E27B54] group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,90,50,0.5)] transition-all duration-300">
                  <Activity className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="space-y-2">
                  <span className="text-[9.5px] font-mono text-[#C85A32] uppercase tracking-[0.16em] font-semibold block">
                    PILLAR 03 • PHYSIOLOGY
                  </span>
                  <h3 className="text-lg font-semibold text-[#FAF8F5] font-editorial tracking-wide group-hover:text-[#E27B54] transition-colors">
                    Deterministic Consumables Modeling
                  </h3>
                  <p className="text-xs text-[#C4C7C5] leading-relaxed font-light">
                    Simulates astronaut metabolic expenditure and life-support depletion (O₂, battery power, suit cooling water) across the entire traverse timeline.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#2D221E] text-[10px] font-mono text-[#9E958F] space-y-1">
                  <div>• Non-negotiable 25% emergency return reserve</div>
                  <div>• Strict walk-back contingency radius check</div>
                  <div>• Point-of-no-return timeline alerts</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Section 3: Scientific Ingestion Archives with Staggered Fade-in */}
        <Reveal direction="up" delay={150}>
          <div className="border border-[#2D221E] bg-[#141012] p-8 rounded-[2px] space-y-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#C85A32]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#D4A359] font-semibold flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4A359] animate-pulse" />
                  <span>PLANETARY DATA SYSTEM (PDS) INGESTION</span>
                </span>
                <h3 className="text-xl font-normal text-[#FAF8F5] font-editorial">
                  Georeferenced Multi-Mission Instruments
                </h3>
              </div>
              <div className="text-[10px] font-mono text-[#9E958F] bg-[#1B1516] px-3 py-1.5 rounded-[1px] border border-[#2D221E] shrink-0">
                DATUM: IAU2000:49900 • EAST-POSITIVE
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
              {[
                { id: 'HiRISE', mission: 'MRO', desc: '0.25 m/px Sub-meter Altimetry' },
                { id: 'CTX', mission: 'MRO', desc: '6 m/px Surface Context' },
                { id: 'MOLA', mission: 'MGS', desc: '128 px/deg Precision Elevation' },
                { id: 'CRISM', mission: 'MRO', desc: 'Hydrated Mineral Signatures' },
                { id: 'THEMIS', mission: 'Odyssey', desc: 'Thermal Inertia & Rock Fraction' },
                { id: 'SWIM', mission: 'Multi-Sensor', desc: 'Subsurface Water-Ice Mapping' },
              ].map((inst, idx) => (
                <div
                  key={inst.id}
                  style={{ animationDelay: `${idx * 80}ms` }}
                  className="p-3 rounded-[2px] bg-[#1B1516] border border-[#2D221E] hover:border-[#E27B54]/70 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(200,90,50,0.2)] transition-all duration-300 space-y-1 cursor-default group/inst"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#FAF8F5] group-hover/inst:text-[#E27B54] transition-colors">
                      {inst.id}
                    </span>
                    <span className="text-[9px] font-mono text-[#C85A32]">{inst.mission}</span>
                  </div>
                  <span className="text-[10px] text-[#9E958F] leading-tight block">
                    {inst.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Section 4: Final Launch Call-to-Action with Atmospheric Glow */}
        <Reveal direction="up" delay={200}>
          <div className="rounded-[2px] border border-[#3D2C26] hover:border-[#C85A32]/60 bg-gradient-to-r from-[#1B1416] via-[#241718] to-[#1B1416] p-8 md:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl transition-all duration-500">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C85A32]/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />

            <div className="max-w-2xl mx-auto space-y-3 relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C85A32] font-semibold flex items-center justify-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4E9A68] animate-ping" />
                <span>OPERATIONAL WORKSTATION READY</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-normal text-[#FAF8F5] font-editorial">
                Ready to Explore and Plan Martian Traverses?
              </h2>
              <p className="text-xs md:text-sm text-[#C4C7C5] leading-relaxed font-light">
                Launch into the mission workspace to toggle scientific layers, query terrain coordinates, analyze site intelligence dossiers, and run live EVA simulations.
              </p>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onEnterWorkstation}
                className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-[2px] bg-gradient-to-r from-[#C85A32] via-[#E27B54] to-[#B24520] hover:from-[#D96B43] hover:to-[#C85A32] text-[#FAF8F5] font-semibold text-xs md:text-sm tracking-[0.18em] uppercase shadow-[0_4px_30px_rgba(200,90,50,0.45)] hover:shadow-[0_8px_45px_rgba(200,90,50,0.7)] hover:-translate-y-0.5 transition-all duration-300 border border-[#E27B54]/50 cursor-pointer overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                <span className="relative z-10">LAUNCH AresNav WORKSTATION</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform relative z-10" />
              </button>
            </div>
          </div>
        </Reveal>
      </main>

      {/* Clean Minimal Technical Bottom Bar */}
      <footer className="relative z-10 border-t border-[#2D221E] bg-[#0E0D10] py-4 text-center text-[10px] font-mono text-[#8B837E]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AresNav • HUMAN MISSION DECISION SUPPORT SYSTEM</span>
          <span className="text-[#C85A32]">NASA SPACE APPS CHALLENGE 2026</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
