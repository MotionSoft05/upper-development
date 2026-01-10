# Implementation Plan - Dashboard Redesign

## User Requirements

| Requirement           | Implementation                                |
| --------------------- | --------------------------------------------- |
| TypeScript            | Migración gradual (archivos nuevos en `.tsx`) |
| Sidebar               | **Colapsable** (íconos ↔ expandido)           |
| Dark Mode             | **Obligatorio** desde día 1                   |
| Responsive            | **Mobile-first** design                       |
| Servicios principales | PantallasPromociones + PantallasVuelos        |
| B2B + B2C             | Automatización plan gratuito, self-service    |
| Optimización media    | Prioridad crítica                             |
| Cambios Firebase      | Documentar TODO para TV app                   |

---

## Competitor Research Summary

| Competidor      | Features clave                             |
| --------------- | ------------------------------------------ |
| **Yodeck**      | Drag-drop, multi-zone layouts, stock media |
| **ScreenCloud** | Dashboard widgets, BI integration, SSO     |
| **NoviSign**    | Monitoreo real-time, Power BI widgets      |
| **OptiSigns**   | Permisos granulares, social feeds          |

**Patrones a adoptar:**

- ✅ Sidebar colapsable con modo solo-íconos
- ✅ UI basada en cards
- ✅ Indicadores de estado en tiempo real
- ✅ Drag-drop para media/playlists
- ✅ Thumbnails de preview

---

## Technical Architecture

### State Management (Zustand)

```typescript
// src/stores/useDashboardStore.ts
interface DashboardState {
  // Navigation
  activePanel: string;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean; // mobile drawer

  // Theme
  theme: "light" | "dark" | "system";

  // User
  user: User | null;
  userData: UserData | null;

  // Actions
  setActivePanel: (panel: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: ThemeType) => void;
}
```

### Dark Mode

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class",
  // ...
};
```

### Media Optimization

| Estrategia         | Implementación                              |
| ------------------ | ------------------------------------------- |
| Compresión cliente | `browser-image-compression` antes de upload |
| Firebase Resize    | Auto-generar thumbnails                     |
| Lazy loading       | `loading="lazy"` + Intersection Observer    |
| Formato WebP       | Convertir cuando sea posible                |

---

## Responsive Breakpoints

| Viewport              | Sidebar Behavior        |
| --------------------- | ----------------------- |
| Mobile (`<768px`)     | Hidden, drawer overlay  |
| Tablet (`768-1024px`) | Collapsed (solo íconos) |
| Desktop (`>1024px`)   | Preferencia usuario     |

---

## Color System

```css
/* Light Mode */
--bg-primary: white --bg-secondary: gray-50 --text-primary: gray-900
  /* Dark Mode */ --bg-primary: gray-900 --bg-secondary: gray-800
  --text-primary: gray-100 /* Accent (ambos modos) */ --accent: #0080ff
  --accent-gradient: cyan-500 → blue-500;
```

---

## New File Structure

```
src/
├── stores/
│   ├── useDashboardStore.ts
│   └── useThemeStore.ts
├── components/
│   └── dashboard/
│       ├── layout/
│       │   ├── DashboardLayout.tsx
│       │   ├── DashboardHeader.tsx
│       │   ├── DashboardSidebar.tsx
│       │   ├── DashboardFooter.tsx
│       │   └── ThemeToggle.tsx
│       └── shared/
│           ├── OptimizedImage.tsx
│           └── OptimizedVideo.tsx
└── utils/
    ├── imageOptimizer.ts
    └── videoOptimizer.ts
```

---

## Dependencies

```bash
npm install zustand browser-image-compression
```

---

## Verification

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] Dark mode funciona
- [ ] Sidebar collapse/expand funciona
- [ ] Responsive en todos los breakpoints
- [ ] Cambios Firebase documentados
