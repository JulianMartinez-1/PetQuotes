# 🎬 Animaciones Profesionales con GSAP - PET QUOTES

## 📦 Librerías Implementadas

### **GSAP 3.15.0**
Biblioteca de animación profesional con soporte para:
- ✅ **ScrollTrigger** - Animaciones basadas en scroll
- ✅ **Timeline** - Secuencias de animaciones coordinadas
- ✅ **Easing avanzado** - Curvas de animación personalizadas
- ✅ **Performance optimizado** - GPU acceleration

## 🎨 Componentes Animados Implementados

### 1. **HeroSection** - Sección Principal
```
📍 Ubicación: components/sections/hero-animations.tsx

Características:
✓ Fade-in de título y subtítulo con delay escalonado
✓ Parallax effect en el hero al hacer scroll
✓ Animación de botón CTA con bounce
✓ Scroll indicator animado
✓ Gradientes de fondo con animación
```

**Uso:**
```tsx
<HeroSection
  title="Tu título aquí"
  subtitle="Tu subtítulo aquí"
  cta={{ text: "Botón", href: "/link" }}
/>
```

---

### 2. **ProofStatsSection** - Estadísticas
```
📍 Ubicación: components/sections/animated-components.tsx

Características:
✓ Contador animado que sube hasta el valor final
✓ Stagger animation en las tarjetas (escalonado)
✓ Scale y fade-in al aparecer en viewport
✓ Trigger automático al scroll del usuario
```

**Uso:**
```tsx
<ProofStatsSection stats={[
  { value: "+230", label: "Clínicas" },
  { value: "98%", label: "Confirmadas" }
]} />
```

---

### 3. **AnimatedFeatureCard** - Tarjetas de Características
```
📍 Ubicación: components/sections/animated-components.tsx

Características:
✓ Fade-in con rotación 3D en el scroll
✓ Hover effect con scale en el icono
✓ Animación suave al pasar el mouse
✓ Shadow dinamático
```

**Uso:**
```tsx
<AnimatedFeatureCard feature={{
  title: "Título",
  icon: IconComponent,
  text: "Descripción"
}} />
```

---

### 4. **TestimonialCard** - Testimonios
```
📍 Ubicación: components/sections/animated-components.tsx

Características:
✓ Parallax effect en 3D (rotationX)
✓ Fade-in y lift effect al scroll
✓ Scrub suave para seguimiento del mouse
✓ Star rating animado
```

---

### 5. **SectionDivider** - Divisor Animado
```
📍 Ubicación: components/sections/hero-animations.tsx

Características:
✓ Barra que crece conforme haces scroll
✓ Gradiente de color animado
✓ Fluido y orgánico
```

---

### 6. **RevealText** - Texto que Aparece
```
📍 Ubicación: components/sections/hero-animations.tsx

Características:
✓ Fade-in suave del texto
✓ Lift effect (sube mientras aparece)
✓ Trigger al pasar por viewport
```

**Uso:**
```tsx
<RevealText>Tu párrafo con contenido importante</RevealText>
```

---

## 🌊 Efectos de Scroll Global

### **ScrollIndicator** - Barra de Progreso
```
📍 Ubicación: components/sections/scroll-effects.tsx
📍 Integrado en: app/layout.tsx

Visualiza el progreso de scroll en la página
- Barra en la parte superior (fixed)
- Gradiente azul a indigo
- Responsive y fluida
```

---

### **SmoothScroller** - Optimización de Scroll
```
📍 Ubicación: components/sections/scroll-effects.tsx
📍 Integrado en: app/layout.tsx

Mejora la experiencia de scroll:
- Recalcula triggers en viewport changes
- Optimización de performance
- Compatible con responsive
```

---

## 🎯 Hook Personalizado: useScrollAnimation

```
📍 Ubicación: lib/hooks/useScrollAnimation.ts

Métodos disponibles:
```

### `animateOnScroll(element, animation, options)`
Anima un elemento cuando entra en el viewport
```tsx
animateOnScroll(ref.current, { opacity: 1, y: 0 }, {
  start: "top 80%",
  end: "center center"
})
```

### `parallaxEffect(element, speed)`
Crea efecto parallax (fondo se mueve diferente)
```tsx
parallaxEffect(ref.current, 0.5)
```

### `fadeInOnScroll(element, delay)`
Fade in suave al aparecer
```tsx
fadeInOnScroll(ref.current, 0.1)
```

### `staggerAnimation(elements, animation, staggerDelay)`
Anima múltiples elementos con delay entre ellos
```tsx
staggerAnimation(refs, { opacity: 1 }, 0.1)
```

### `counterAnimation(element, endValue, duration)`
Anima un contador (números que suben)
```tsx
counterAnimation(ref.current, 230, 2)
```

### `pinElement(element, duration)`
Fija un elemento mientras scrolleas
```tsx
pinElement(ref.current, 3)
```

---

## 🎬 Ejemplos de Uso en tu Código

### Página Principal
```tsx
import { HeroSection, SectionDivider } from "@/components/sections/hero-animations";
import { ProofStatsSection, AnimatedFeatureCard } from "@/components/sections/animated-components";

export default function LandingPage() {
  return (
    <>
      <HeroSection 
        title="Mi título"
        subtitle="Mi subtítulo"
        cta={{ text: "Botón", href: "/link" }}
      />
      <SectionDivider />
      <ProofStatsSection stats={stats} />
      {/* más componentes... */}
    </>
  );
}
```

---

## 🚀 Performance Tips

1. **ScrollTrigger.refresh()** - Llama después de cambios en el DOM
2. **Scrub valores** - Usa `scrub: 0.5` para animaciones suaves
3. **markers: false** - Desactiva debug markers en producción
4. **once: true** - En Motion, anima solo 1 vez al scroll

---

## 📱 Responsive Design

Todos los componentes son **100% responsive** usando Tailwind CSS:
- Mobile first approach
- Breakpoints: sm, md, lg, xl
- Animations ajustadas por viewport

---

## ⚙️ Configuración Actual

```json
{
  "gsap": "^3.15.0",
  "framer-motion": "^11.3.22",
  "tailwindcss": "^3.4.10"
}
```

---

## 🔧 Próximas Mejoras Sugeridas

- [ ] Agregar SplitText para animaciones de texto
- [ ] Implementar DrawSVG para animaciones de líneas
- [ ] Agregar MorphSVG para transiciones suaves
- [ ] Text scramble animation
- [ ] Advanced pinning sequences
- [ ] Custom easing curves por sección

---

**Creado con ❤️ usando GSAP y Next.js**
