'use client';

import { useState } from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Icon 1: Minimal Tomato
function IconTomato({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="36" r="24" fill="#FF6B6B" />
      <path d="M32 12C32 12 28 8 32 4C36 8 32 12 32 12Z" fill="#4ADE80" />
      <ellipse cx="32" cy="12" rx="8" ry="3" fill="#4ADE80" />
    </svg>
  );
}

// Icon 2: Focus Circle Gradient
function IconFocusCircle({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <radialGradient id="focusGrad" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FFAB91" />
          <stop offset="100%" stopColor="#E85A4F" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#focusGrad)" />
    </svg>
  );
}

// Icon 3: Timer Arc
function IconTimerArc({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M32 8A24 24 0 1 1 8 32"
        stroke="#FF6B6B"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Icon 4: Zen Dot
function IconZenDot({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="32" cy="32" r="16" fill="#FF6B6B" filter="url(#glow)" />
    </svg>
  );
}

// Icon 5: Pomodoro Leaf
function IconLeaf({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="36" r="22" fill="#E85A4F" />
      <path
        d="M32 6C32 6 24 10 24 18C24 22 28 26 32 26C36 26 40 22 40 18C40 10 32 6 32 6Z"
        fill="#4ADE80"
      />
    </svg>
  );
}

// Icon 6: Sunrise Gradient Square
function IconSunrise({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="sunriseGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFAB91" />
          <stop offset="50%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#E85A4F" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#sunriseGrad)" />
    </svg>
  );
}

// Icon 7: Hollow Circle
function IconHollowCircle({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="24" stroke="#E85A4F" strokeWidth="6" fill="none" />
    </svg>
  );
}

// Icon 8: Soft P
function IconSoftP({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#FF6B6B" />
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fill="white"
        fontSize="36"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        P
      </text>
    </svg>
  );
}

// Icon 9: Breathing Square (Squircle)
function IconSquircle({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="squircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="100%" stopColor="#C94C4C" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="20" fill="url(#squircleGrad)" />
    </svg>
  );
}

// Icon 10: Double Arc
function IconDoubleArc({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M12 32A20 20 0 0 1 32 12"
        stroke="#FF6B6B"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M52 32A20 20 0 0 1 32 52"
        stroke="#E85A4F"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Icon 11: Concentric Rings
function IconConcentricRings({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="#FFAB91" strokeWidth="3" fill="none" />
      <circle cx="32" cy="32" r="18" stroke="#FF6B6B" strokeWidth="3" fill="none" />
      <circle cx="32" cy="32" r="10" stroke="#E85A4F" strokeWidth="3" fill="none" />
    </svg>
  );
}

// Icon 12: Abstract Tomato
function IconAbstractTomato({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="36" rx="26" ry="24" fill="#FF6B6B" />
      <path d="M26 14L32 6L38 14" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Icon 13: Timer Progress
function IconTimerProgress({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="#FED7D7" strokeWidth="4" fill="none" />
      <path
        d="M32 6A26 26 0 0 1 58 32A26 26 0 0 1 32 58"
        stroke="#FF6B6B"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="32" r="8" fill="#E85A4F" />
    </svg>
  );
}

// Icon 14: Teal Focus (App Colors)
function IconTealFocus({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#tealGrad)" />
    </svg>
  );
}

// Icon 15: Teal Timer Arc
function IconTealArc({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M32 8A24 24 0 1 1 8 32"
        stroke="#0D9488"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Icon 16: Minimal Clock
function IconMinimalClock({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="#FF6B6B" strokeWidth="4" fill="none" />
      <line x1="32" y1="32" x2="32" y2="18" stroke="#E85A4F" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="32" x2="44" y2="32" stroke="#E85A4F" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// Icon 17: Pomo Text
function IconPomoText({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#C94C4C" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#textGrad)" />
      <text
        x="32"
        y="42"
        textAnchor="middle"
        fill="white"
        fontSize="20"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="-1"
      >
        pomo
      </text>
    </svg>
  );
}

// Icon 18: Hourglass
function IconHourglass({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M20 8H44M20 56H44M22 8V20L32 32L22 44V56M42 8V20L32 32L42 44V56"
        stroke="#FF6B6B"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Icon 19: Flower/Bloom
function IconBloom({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="10" fill="#E85A4F" />
      <circle cx="32" cy="14" r="8" fill="#FF6B6B" opacity="0.8" />
      <circle cx="32" cy="50" r="8" fill="#FF6B6B" opacity="0.8" />
      <circle cx="14" cy="32" r="8" fill="#FF6B6B" opacity="0.8" />
      <circle cx="50" cy="32" r="8" fill="#FF6B6B" opacity="0.8" />
    </svg>
  );
}

// Icon 20: Gradient Ring
function IconGradientRing({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFAB91" />
          <stop offset="50%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#C94C4C" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="24" stroke="url(#ringGrad)" strokeWidth="8" fill="none" />
    </svg>
  );
}

// Icon 21: Teal Squircle
function IconTealSquircle({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="tealSquircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" rx="18" fill="url(#tealSquircleGrad)" />
    </svg>
  );
}

// Icon 22: Teal P
function IconTealP({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#0D9488" />
      <text
        x="32"
        y="46"
        textAnchor="middle"
        fill="white"
        fontSize="36"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        P
      </text>
    </svg>
  );
}

// Icon 23: Spiral
function IconSpiral({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M32 32C32 28 35 25 39 25C45 25 49 30 49 36C49 44 43 50 35 50C25 50 18 42 18 32C18 20 27 12 39 12"
        stroke="#FF6B6B"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Icon 24: Half Circle
function IconHalfCircle({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path
        d="M8 32A24 24 0 0 1 56 32"
        fill="#FF6B6B"
      />
      <path
        d="M8 32A24 24 0 0 0 56 32"
        fill="#FFAB91"
      />
    </svg>
  );
}

// Icon 25: Dot Grid
function IconDotGrid({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="16" cy="16" r="6" fill="#FFAB91" />
      <circle cx="32" cy="16" r="6" fill="#FF8A80" />
      <circle cx="48" cy="16" r="6" fill="#FF6B6B" />
      <circle cx="16" cy="32" r="6" fill="#FF8A80" />
      <circle cx="32" cy="32" r="6" fill="#E85A4F" />
      <circle cx="48" cy="32" r="6" fill="#FF8A80" />
      <circle cx="16" cy="48" r="6" fill="#FF6B6B" />
      <circle cx="32" cy="48" r="6" fill="#FF8A80" />
      <circle cx="48" cy="48" r="6" fill="#FFAB91" />
    </svg>
  );
}

// Icon 26: Focus Ring with Dot
function IconFocusRingDot({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="#FFAB91" strokeWidth="4" fill="none" />
      <circle cx="32" cy="32" r="10" fill="#E85A4F" />
    </svg>
  );
}

// Icon 27: Teal Ring with Dot
function IconTealRingDot({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="#5EEAD4" strokeWidth="4" fill="none" />
      <circle cx="32" cy="32" r="10" fill="#0D9488" />
    </svg>
  );
}

// Icon 28: Abstract Focus
function IconAbstractFocus({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect x="8" y="8" width="48" height="48" rx="24" fill="#FF6B6B" />
      <rect x="18" y="18" width="28" height="28" rx="14" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

// Icon 29: Stacked Circles
function IconStackedCircles({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="24" cy="36" r="18" fill="#FFAB91" />
      <circle cx="40" cy="28" r="18" fill="#FF6B6B" />
    </svg>
  );
}

// Icon 30: Minimal Arc Timer
function IconMinimalArcTimer({ size = 64 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="26" stroke="#FED7D7" strokeWidth="3" fill="none" />
      <path
        d="M32 6A26 26 0 0 1 32 58"
        stroke="#FF6B6B"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const icons = [
  { component: IconTimerArc, name: 'Timer Arc', description: 'Minimaler Timer-Bogen' },
  { component: IconFocusCircle, name: 'Focus Circle', description: 'Gradient Fokus-Kreis' },
  { component: IconHollowCircle, name: 'Hollow Circle', description: 'Schlichter Ring' },
  { component: IconZenDot, name: 'Zen Dot', description: 'Sanfter Punkt mit Glow' },
  { component: IconGradientRing, name: 'Gradient Ring', description: 'Ring mit Farbverlauf' },
  { component: IconFocusRingDot, name: 'Focus Ring + Dot', description: 'Ring mit Zentrum' },
  { component: IconDoubleArc, name: 'Double Arc', description: 'Zwei Bögen' },
  { component: IconConcentricRings, name: 'Concentric', description: 'Konzentrische Ringe' },
  { component: IconTimerProgress, name: 'Timer Progress', description: 'Timer mit Fortschritt' },
  { component: IconMinimalArcTimer, name: 'Half Timer', description: 'Halb gefüllter Timer' },
  { component: IconMinimalClock, name: 'Minimal Clock', description: 'Schlichte Uhr' },
  { component: IconSpiral, name: 'Spiral', description: 'Elegante Spirale' },
  { component: IconTomato, name: 'Tomato', description: 'Klassische Tomate' },
  { component: IconLeaf, name: 'Pomodoro Leaf', description: 'Tomate mit Blatt' },
  { component: IconAbstractTomato, name: 'Abstract Tomato', description: 'Abstrakte Tomate' },
  { component: IconSunrise, name: 'Sunrise', description: 'Warmer Gradient' },
  { component: IconSquircle, name: 'Squircle', description: 'Abgerundetes Quadrat' },
  { component: IconAbstractFocus, name: 'Abstract Focus', description: 'Fokus-Form' },
  { component: IconHalfCircle, name: 'Half Circle', description: 'Yin-Yang Style' },
  { component: IconStackedCircles, name: 'Stacked', description: 'Überlappende Kreise' },
  { component: IconBloom, name: 'Bloom', description: 'Blüten-Form' },
  { component: IconDotGrid, name: 'Dot Grid', description: '9-Punkt Raster' },
  { component: IconHourglass, name: 'Hourglass', description: 'Sanduhr' },
  { component: IconSoftP, name: 'Soft P', description: 'P auf Korall' },
  { component: IconPomoText, name: 'Pomo Text', description: 'pomo Schriftzug' },
  { component: IconTealFocus, name: 'Teal Focus', description: 'App-Farbe Teal' },
  { component: IconTealArc, name: 'Teal Arc', description: 'Teal Timer-Bogen' },
  { component: IconTealSquircle, name: 'Teal Squircle', description: 'Teal Squircle' },
  { component: IconTealP, name: 'Teal P', description: 'P auf Teal' },
  { component: IconTealRingDot, name: 'Teal Ring + Dot', description: 'Teal Ring mit Dot' },
];

export default function IconGalleryPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md border-b ${darkMode ? 'bg-stone-900/80 border-stone-700' : 'bg-stone-50/80 border-stone-200'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-semibold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              Pomo Icon Galerie
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              {icons.length} Vorschläge – Klicke um auszuwählen
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Selected Icon Preview */}
      {selectedIcon && (
        <div className={`border-b ${darkMode ? 'bg-stone-800/50 border-stone-700' : 'bg-white border-stone-200'}`}>
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-8">
              <div className={`p-6 rounded-2xl ${darkMode ? 'bg-stone-700' : 'bg-stone-100'}`}>
                {(() => {
                  const icon = icons.find(i => i.name === selectedIcon);
                  if (icon) {
                    const IconComponent = icon.component;
                    return <IconComponent size={96} />;
                  }
                  return null;
                })()}
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                  Ausgewählt: {selectedIcon}
                </h2>
                <p className={`mt-1 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                  {icons.find(i => i.name === selectedIcon)?.description}
                </p>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-stone-600' : 'bg-stone-200'}`}>
                      {(() => {
                        const icon = icons.find(i => i.name === selectedIcon);
                        if (icon) {
                          const IconComponent = icon.component;
                          return <IconComponent size={20} />;
                        }
                        return null;
                      })()}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>20px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-stone-600' : 'bg-stone-200'}`}>
                      {(() => {
                        const icon = icons.find(i => i.name === selectedIcon);
                        if (icon) {
                          const IconComponent = icon.component;
                          return <IconComponent size={28} />;
                        }
                        return null;
                      })()}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>28px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${darkMode ? 'bg-stone-600' : 'bg-stone-200'}`}>
                      {(() => {
                        const icon = icons.find(i => i.name === selectedIcon);
                        if (icon) {
                          const IconComponent = icon.component;
                          return <IconComponent size={48} />;
                        }
                        return null;
                      })()}
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>48px</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Icon Grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Coral/Red Section */}
        <section className="mb-12">
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            Warm Coral / Rot
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {icons.slice(0, 25).map((icon) => {
              const IconComponent = icon.component;
              const isSelected = selectedIcon === icon.name;
              return (
                <button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`group p-6 rounded-2xl transition-all duration-200 ${
                    isSelected
                      ? darkMode
                        ? 'bg-teal-900/50 ring-2 ring-teal-500'
                        : 'bg-teal-50 ring-2 ring-teal-500'
                      : darkMode
                        ? 'bg-stone-800 hover:bg-stone-700'
                        : 'bg-white hover:bg-stone-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform group-hover:scale-110 transition-transform duration-200">
                      <IconComponent size={56} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                        {icon.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        {icon.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Teal Section */}
        <section>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
            Teal (App-Farbe)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {icons.slice(25).map((icon) => {
              const IconComponent = icon.component;
              const isSelected = selectedIcon === icon.name;
              return (
                <button
                  key={icon.name}
                  onClick={() => setSelectedIcon(icon.name)}
                  className={`group p-6 rounded-2xl transition-all duration-200 ${
                    isSelected
                      ? darkMode
                        ? 'bg-teal-900/50 ring-2 ring-teal-500'
                        : 'bg-teal-50 ring-2 ring-teal-500'
                      : darkMode
                        ? 'bg-stone-800 hover:bg-stone-700'
                        : 'bg-white hover:bg-stone-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="transform group-hover:scale-110 transition-transform duration-200">
                      <IconComponent size={56} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${darkMode ? 'text-stone-200' : 'text-stone-800'}`}>
                        {icon.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        {icon.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-12 ${darkMode ? 'border-stone-700' : 'border-stone-200'}`}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <p className={`text-sm text-center ${darkMode ? 'text-stone-500' : 'text-stone-400'}`}>
            Wähle ein Icon aus und sag mir die Nummer oder den Namen – ich erstelle dann das Favicon + Repo-Icon.
          </p>
        </div>
      </footer>
    </div>
  );
}
