# POMO-092: Advanced Visual Polish

> Phase 3 - WebGL Shader, GPU-optimiertes Grain und Premium-Finishing

## User Story

**Als** Design-bewusster Benutzer,
**möchte ich** visuell perfekte, butterweiche Animationen und Effekte,
**damit** die App sich wie eine Premium-Native-Anwendung anfühlt.

## Kontext

Phase 3 hebt die visuellen Effekte auf das nächste Level:
- GPU-beschleunigte Noise-Shader statt Canvas/SVG
- Optional: 3D-Tiefe mit subtle Parallax
- ASCII-Art oder generative Muster als Alternative
- Performance-Polishing für alle Geräte

## Acceptance Criteria

- [ ] **WebGL Noise Shader**: GPU-basierte Grain-Textur mit 60fps
- [ ] **Shader Variations**: Mehrere Noise-Stile (Film Grain, Perlin, Simplex)
- [ ] **Parallax-Option**: Subtile 3D-Tiefe bei Mausbewegung
- [ ] **ASCII Mode**: Alternative visuelle Darstellung mit ASCII-Art-Ästhetik
- [ ] **Adaptive Quality**: Automatische Qualitätsreduzierung auf schwachen Geräten
- [ ] **Motion Blur**: Subtiler Blur bei Timer-Übergängen
- [ ] **Zero-Performance-Impact**: Kein merkbarer Unterschied zu Phase 1

## Technische Details

### 1. WebGL Noise Shader

```glsl
// Fragment Shader für animiertes Grain
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_intensity;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  float noise = random(st + u_time * 0.1);
  gl_FragColor = vec4(vec3(noise), u_intensity);
}
```

### 2. React Three Fiber Integration (Optional)

```tsx
// components/effects/ShaderBackground.tsx
import { Canvas } from '@react-three/fiber';
import { NoiseShader } from './shaders/NoiseShader';

export function ShaderBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <mesh>
          <planeGeometry args={[2, 2]} />
          <NoiseShader />
        </mesh>
      </Canvas>
    </div>
  );
}
```

### 3. ASCII Mode

```tsx
// Alternative: ASCII-Art-Ästhetik für Timer
// Inspiriert von Terminal/Hacker-Ästhetik

function ASCIITimer({ time }: { time: string }) {
  const asciiArt = `
  ╔══════════════════════════════╗
  ║                              ║
  ║       ██  ███   ██  ██       ║
  ║      █  █ █     █  ██  █     ║
  ║       ██   ██    ██ █ █      ║
  ║      █  █   █   █  ██  █     ║
  ║       ██  ███    ██ █ █      ║
  ║                              ║
  ║          F O C U S           ║
  ║                              ║
  ╚══════════════════════════════╝
  `;
  return <pre className="font-mono text-xs text-tertiary">{asciiArt}</pre>;
}
```

### 4. Parallax/3D Depth

```tsx
// Subtle Parallax bei Mausbewegung
function ParallaxContainer({ children }) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  return (
    <motion.div
      style={{
        transform: `
          perspective(1000px)
          rotateX(${(mousePos.y - 0.5) * 2}deg)
          rotateY(${(mousePos.x - 0.5) * 2}deg)
        `,
      }}
    >
      {children}
    </motion.div>
  );
}
```

### 5. Adaptive Quality System

```tsx
// Automatische Qualitätsanpassung
function useAdaptiveQuality() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    // Detect device capabilities
    const gpu = detectGPU();
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const hasLowEndGPU = gpu.tier < 2;

    if (isMobile || hasLowEndGPU) {
      setQuality('low');
    } else if (gpu.tier === 2) {
      setQuality('medium');
    }
  }, []);

  return quality;
}
```

### 6. Generative Patterns (Alternative zu Noise)

```tsx
// Generative lineare Muster
function GenerativeLines({ density = 50 }) {
  return (
    <svg className="fixed inset-0 -z-10 opacity-5">
      {Array.from({ length: density }).map((_, i) => (
        <motion.line
          key={i}
          x1={`${(i / density) * 100}%`}
          y1="0"
          x2={`${(i / density) * 100 + 10}%`}
          y2="100%"
          stroke="currentColor"
          strokeWidth="0.5"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </svg>
  );
}
```

## Visual Modes (User-Selectable)

| Mode | Beschreibung | Performance |
|------|-------------|-------------|
| **Minimal** | Nur Grain, keine Effekte | Beste |
| **Ambient** | Grain + Glow + Partikel | Mittel |
| **Immersive** | Alles + WebGL Shader | GPU-intensiv |
| **ASCII** | Terminal-Ästhetik, kein WebGL | Beste |
| **Auto** | Basierend auf Device-Capabilities | Adaptiv |

## Dateien zu ändern/erstellen

1. **Neu:** `src/components/effects/ShaderBackground.tsx`
2. **Neu:** `src/components/effects/shaders/NoiseShader.tsx`
3. **Neu:** `src/components/effects/ASCIITimer.tsx`
4. **Neu:** `src/components/effects/GenerativeLines.tsx`
5. **Neu:** `src/components/effects/ParallaxContainer.tsx`
6. **Neu:** `src/hooks/useAdaptiveQuality.ts`
7. **Neu:** `src/lib/detectGPU.ts`
8. `src/components/settings/TimerSettings.tsx` - Visual Mode Selector

## Neue Dependencies

```json
{
  "@react-three/fiber": "^8.x",  // Optional: nur für WebGL
  "@react-three/drei": "^9.x",   // Optional: Helper
  "detect-gpu": "^5.x"           // GPU-Detection
}
```

**Hinweis:** Dependencies sind optional. Fallback auf Canvas-basiertes Noise.

## Estimation

- **Größe:** XL (10-15 Stunden)
- **Risiko:** Hoch (WebGL-Komplexität, Cross-Browser-Support)

## Dependencies

- POMO-090 (Dark Foundation)
- POMO-091 (Ambient Effects)

## Testing

- [ ] WebGL-Fallback: Canvas-Noise wenn WebGL nicht verfügbar
- [ ] Cross-Browser: Chrome, Safari, Firefox
- [ ] GPU-Test: Keine Überhitzung bei längerem Gebrauch
- [ ] Adaptive Quality: Automatische Erkennung funktioniert
- [ ] Visual Modes: Alle Modi funktionieren korrekt
- [ ] Bundle Size: <20KB Zusatz für WebGL-Features

## Future Considerations

- Audio-Reactive Visuals (mit Ambient Sounds)
- Time-of-Day Anpassungen (morgens heller, abends dunkler)
- Seasonal Themes (subtile Variationen)
- Community Shader Gallery
