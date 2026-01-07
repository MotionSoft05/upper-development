# Registro de Progreso - Sesión 07/01/2026

**Objetivo Principal**: Rediseño completo de la Landing Page, Modal de Autenticación y resolución de errores de compilación.

---

## 🛑 1. El Conflicto de Build (Undici / Next.js / Firebase)

Este fue el obstáculo más grande de la sesión inicial. El servidor de desarrollo fallaba con errores relacionados a `undici`.

### El Problema

Firebase Admin y Firebase Client comparten dependencias. Al ejecutar `npm run dev`, Next.js intentaba empaquetar código destinado exclusivamente para Node.js dentro del bundle del Cliente.

- **Error Específico**: `Module parse failed: Unexpected token` en `undici/lib/web/fetch/util.js`

### ✅ La Solución Definitiva

1. **Mock Local**: `src/mocks/undici.js` que exporta un objeto vacío
2. **Mock Alias en `next.config.js`**: Redirige importaciones de `undici` al mock
3. **Forzar Build ESM de Firebase Auth**

---

## 🎨 2. Rediseño Visual - Landing Page

### Navbar (Completamente Rediseñado)

- **Logo Extra Grande**: `h-32 md:h-36 lg:h-40` con margen negativo `-my-10`
- **Navegación Centrada Absolutamente**: Cápsula oscura `bg-gray-900/90` centrada en viewport
- **Animación Sliding Highlight**: `framer-motion` con `layoutId` para efecto de deslizamiento entre links
- **Links de Navegación**: Nosotros, Soluciones, Aplicación, Precios, Preguntas
- **Smooth Scroll**: Implementado con `scrollIntoView({ behavior: "smooth" })`
- **Selector de Idioma Animado**: Toggle ES/EN con bandera animada y icono Globe
- **Botón Logout**: Para usuarios autenticados con icono y hover rojo

### Hero Section

- Fondo de video limpio con propuesta de valor clara
- Background transparente para continuidad visual

### Services Grid (`#servicios`)

- Diseño Bento Grid asimétrico
- Tarjetas interactivas con CSS puro

### Hardware Section (`#hardware`)

- Descripción del software de Upper
- Consulta de hardware

### Pricing Section (`#precios`) - NUEVO

- 3 planes: Gratuito, Estándar, Empresarial
- Diseño de cards con badges destacados

### FAQ Section (`#faq`) - NUEVO

- Acordeón expandible con 6 preguntas frecuentes
- Animaciones de apertura/cierre

### Contact Section (`#contacto`)

- Diseño híbrido con formulario
- Información de contacto directa

### Footer (Rediseñado)

- **Layout compacto en una fila**: Logo | Links | Contacto
- **Logo grande con overflow negativo**: `h-20 md:h-24`
- Email actualizado: `contacto@upperds.mx`
- Solo LinkedIn (Twitter eliminado)
- Año dinámico en copyright

### BackgroundDecor Global

- Aurora animada con `framer-motion`
- Blobs de color cyan/blue con parallax
- Aplicado globalmente en `page.js`

---

## 🔐 3. Modal de Autenticación (NUEVO)

### `AuthModal.jsx` - Componente Completo

**4 Vistas con Transiciones Animadas:**

1. **Login**
   - Google Login (reutiliza `GoogleLoginButton`)
   - Email/Password con iconos
   - Link a "Olvidé mi contraseña"
   - Validación de formulario
   - **Badges de seguridad** con hover animado

2. **Registro**
   - Campos: Nombre, Apellido, Email, Teléfono, Password, Confirmar Password
   - Indicador de fuerza de contraseña (8+ chars, mayúscula, número)
   - Checkbox de términos y condiciones (link a PDF)
   - Validación completa

3. **Verificación de Email**
   - Icono de éxito animado
   - Muestra el email registrado
   - Botón "Entendido"

4. **Recuperar Contraseña**
   - Campo de email
   - Envío de link de recuperación
   - Confirmación animada

**Animaciones Implementadas:**

- Modal: `spring` animation con scale y opacity
- Backdrop: Blur con fade
- Slides: Transición lateral entre vistas
- Iconos de éxito: Animación de scale bounce

**Integración en Navbar:**

- Botón "Acceder" abre modal (ya no redirige a `/login`)
- Modal renderizado fuera del `<nav>` para cubrir todo el viewport

---

## 📱 4. Mobile Navbar (Rediseñado)

### Hamburguesa Animada

- **3 líneas → X** con animación `framer-motion`
- Línea superior rota 45°, línea del medio desaparece, línea inferior rota -45°
- Transición suave de 0.3s

### Menú Mobile Simplificado

- **Sin links de navegación** (siguiendo tendencias de UX minimalista)
- Solo acciones principales:
  - � Cambiar idioma (Español/English)
  - 👤 Iniciar Sesión (abre AuthModal)
  - 📊 Dashboard + Cerrar Sesión (si está logueado)
- Fondo glassmorphism (`bg-white/95 backdrop-blur-lg`)
- Dropdown desde el header (no fullscreen)
- `AnimatePresence` para entrada/salida suave

---

## 🔒 5. Trust Badges de Seguridad

### Footer

Badges con iconos SVG y **hover animado con colores de marca**:

| Badge            | Color Normal | Color Hover                    |
| ---------------- | ------------ | ------------------------------ |
| **Google Cloud** | Gris         | 🔵🟢🟡🔴 (4 colores oficiales) |
| **Firebase**     | Gris         | 🟠 Naranja/Amarillo fuego      |
| **SSL Secure**   | Gris         | 🟢 Verde                       |

### AuthModal

Mismos badges al pie del formulario de login con mensaje:

> "Tu información está protegida"

---

## �🎨 6. Tailwind Config - Paleta de Colores Upper

```javascript
colors: {
  upper: {
    blue: "#0080FF",        // Primary - botones, links
    "blue-dark": "#0066CC", // Hover states
    "blue-light": "#3399FF",
    cyan: "#06B6D4",        // Gradients
    "cyan-dark": "#0891B2",
    "gray-900": "#111827",  // Texto principal
    "gray-700": "#374151",  // Texto secundario
    "gray-500": "#6B7280",  // Texto muted
    "gray-200": "#E5E7EB",  // Bordes
    "gray-100": "#F3F4F6",  // Fondos claros
    "gray-50": "#F9FAFB",   // Fondos muy claros
  }
}
```

**Gradientes:**

- `bg-upper-gradient`: cyan → blue
- `bg-upper-gradient-hover`: cyan-dark → blue-dark

**Sombras:**

- `shadow-upper-sm/md/lg`: Sombras azules para CTAs

---

## 📂 Archivos Modificados/Creados

### Nuevos Componentes

- `src/components/landing/AuthModal.jsx` - Modal unificado de autenticación
- `src/components/landing/PricingSection.jsx` - Sección de precios
- `src/components/landing/FAQSection.jsx` - Preguntas frecuentes
- `src/components/landing/BackgroundDecor.jsx` - Fondo animado global

### Componentes Modificados

- `src/components/landing/Navbar.jsx` - Rediseño completo + integración AuthModal + mobile animado
- `src/components/landing/Footer.jsx` - Layout compacto + Trust Badges con hover
- `src/components/landing/Hero.jsx` - ID agregado, fondo transparente
- `src/components/landing/ServicesGrid.jsx` - ID cambiado a `#servicios`
- `src/components/landing/HardwareSection.jsx` - Texto actualizado
- `src/components/landing/ContactSection.jsx` - Email actualizado

### Configuración

- `tailwind.config.js` - Paleta de colores Upper + gradientes + sombras
- `next.config.js` - Fix Undici/Firebase
- `src/mocks/undici.js` - Mock para build

### Página Principal

- `src/app/page.js` - Estructura completa con BackgroundDecor global

---

## ✅ Estado Final

- ✅ Landing page completamente rediseñada
- ✅ Navegación con smooth scroll funcionando
- ✅ Animaciones fluidas en navbar (desktop y mobile)
- ✅ Hamburguesa animada con transición a X
- ✅ Modal de auth reemplaza páginas separadas de login/register
- ✅ Trust Badges con colores animados (Google, Firebase, SSL)
- ✅ Colores de marca documentados en Tailwind
- ✅ Build de desarrollo funcionando (`npm run dev`)
