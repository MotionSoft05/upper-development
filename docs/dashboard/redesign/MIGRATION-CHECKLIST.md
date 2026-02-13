# Checklist de Migración (V1 -> V2 Greenfield)

Esta lista detalla exactamente qué elementos del proyecto actual (`upper-development`) se deben migrar al nuevo proyecto `upper-platform-v2` (Next.js 16).

---

## 1. 📂 Assets Estáticos (Copiar Directamente)

_Mueve estos archivos tal cual a la carpeta `public/` del nuevo proyecto._

- [ ] `public/images/` (Todas las imágenes: logos, banners, placeholders).
- [ ] `public/videos/` (Si existen videos de demo o background).
- [ ] `public/fonts/` (Si hay fuentes locales, aunque preferiremos `next/font`).

## 2. 🧱 Dashboard Shell (Lo Nuevo)

_Estos componentes son recientes y de alta calidad. Se pueden migrar con mínimos ajustes para Next.js 15._

- [ ] `src/components/dashboard/layout/`
  - [ ] `DashboardSidebar.tsx` (Sidebar colapsable moderno).
  - [ ] `DashboardLayout.tsx` (Estructura base).
  - [ ] `DashboardHeader.tsx` (Header con toggle de tema).
  - [ ] `DashboardFooter.tsx`.
- [ ] `src/components/dashboard/shared/`
  - [ ] `ThemeToggle.tsx`.
  - [ ] `BackgroundDecor.tsx`.
- [ ] `src/stores/` (Zustand)
  - [ ] `useDashboardStore.ts` (Estado del sidebar).
  - [ ] `useThemeStore.ts` (Manejo de tema oscuro).

## 3. 🌐 Landing Page (Copiar y Adaptar)

_La landing page es mayormente visual. Copiaremos los componentes y adaptaremos las rutas._

- [ ] `src/components/landing/` (Todos los componentes: Hero, Features, Pricing).
- [ ] `src/components/homeComponents/` (Si hay componentes extra aquí).
- [ ] `src/components/Footer.jsx` (Footer público).
- [ ] `src/components/Navigation.jsx` (Navbar público).

## 4. 🧠 Lógica Core (Backend/Servicios)

_La "Joyas de la Corona". Copiaremos la lógica pero la implementaremos como Server Actions._

- [ ] `functions/services/flightService.js` (Lógica de APIs de vuelos).
  - _Acción V2:_ Convertir en `src/actions/flight-actions.ts`.
- [ ] `src/lib/firebase.js` (Configuración base).
  - _Acción V2:_ Reconfigurar usando el SDK moderno de Firebase para Next.js.

## 5. 🚫 NO MIGRAR (Rehacer desde Cero)

_No copies estos archivos. Contienen la "deuda técnica" y la lógica fragmentada que queremos eliminar._

- [x] `PantallasPromociones.jsx` -> Se reemplaza por **Screen Editor**.
- [x] `PantallasVuelos.jsx` -> Se reemplaza por **Widget de Vuelos**.
- [x] `PantallasDirectorio.jsx` -> Se reemplaza por **Widget de Directorio**.
- [x] `MonitorScreen.jsx` -> Se reemplaza por **Smart Monitor**.
- [x] `publicidad*.jsx` -> Se reemplaza por **Playlists**.

---

## 🏗️ Pasos para Iniciar V2

1.  **Crear Proyecto:**
    ```bash
    npx create-next-app@latest upper-platform-v2
    # Seleccionar: TypeScript, Tailwind, ESLint, App Router, src directory, Turbopack.
    ```
2.  **Instalar Dependencias Core:**
    ```bash
    npm install zustand framer-motion lucide-react clsx tailwind-merge date-fns firebase
    ```
3.  **Copiar Assets:** Mover carpetas de `public`.
4.  **Migrar Shell:** Copiar los componentes del Dashboard Shell.

¡Estamos listos para el despegue! 🚀
