# Dashboard Redesign - TODO List

> Checklist de tareas para el rediseño del dashboard

---

## Phase 1: Research & Planning ✅

- [x] Leer TECHNICAL-DEBT.md
- [x] Leer ARCHITECTURE-OVERVIEW.md
- [x] Research competidores (Yodeck, ScreenCloud, NoviSign)
- [x] Research best practices dashboards React
- [x] Research optimización imágenes/videos
- [x] Research implementación dark mode
- [x] Crear plan de implementación
- [x] Aprobación del usuario

---

## Phase 2: Foundation ✅

- [x] Instalar dependencias:
  ```bash
  npm install zustand browser-image-compression
  ```
- [x] Crear `src/stores/useDashboardStore.ts`
- [x] Crear `src/stores/useThemeStore.ts`
- [x] Crear carpeta `src/components/dashboard/layout/`
- [x] Crear carpeta `src/components/dashboard/shared/`
- [x] Configurar Tailwind `darkMode: 'class'`

---

## Phase 3: Sidebar (PRIORIDAD) ✅

- [x] Crear `DashboardSidebar.tsx`
- [x] Implementar estado colapsable (íconos ↔ full)
- [x] Implementar drawer mobile
- [x] Agregar animaciones framer-motion
- [x] Integrar `tienePermiso()`
- [x] Agregar estilos dark mode
- [x] Testear comportamiento responsive
- [x] Integrar con DashboardClient

---

## Phase 4: Layout Shell ✅

- [x] Crear `DashboardLayout.tsx`
- [x] Crear `DashboardHeader.tsx`
- [x] Crear `DashboardFooter.tsx`
- [x] Crear `DashboardClientNew.tsx`
- [x] Agregar BackgroundDecor (gradientes sutiles)
- [x] Integrar con dashboard page

---

## Phase 5: Main Services (Prioridad)

- [ ] Refactorizar `PantallasPromociones.jsx` (102KB)
  - [ ] Dividir en sub-componentes
  - [ ] Agregar dark mode
  - [ ] Agregar optimización de imágenes
  - [ ] Documentar cambios Firebase
- [ ] Refactorizar `PantallasVuelos.jsx` (70KB)
  - [ ] Dividir en sub-componentes
  - [ ] Agregar dark mode
  - [ ] Documentar cambios Firebase

---

## Phase 6: Secondary Screens

- [ ] pantallasTarifario (96KB)
- [ ] consultaModEventos (78KB)
- [ ] PantallasDirectorio (75KB)
- [ ] MonitorScreen (60KB)
- [ ] pantallasSalon (57KB)
- [ ] publicidadDirec (48KB)
- [ ] publicidadSalon (42KB)

---

## Phase 7: Shared Components

- [ ] Crear `OptimizedImage.tsx`
- [ ] Crear `OptimizedVideo.tsx`
- [ ] Crear `FormField.tsx`
- [ ] Crear `ResponsiveTable.tsx`
- [ ] Extraer hooks reutilizables

---

## Phase 8: Verification

- [ ] `npm run build` pasa
- [ ] `npm run lint` pasa
- [ ] Dark mode funciona
- [ ] Responsive en todos los breakpoints
- [ ] Cambios Firebase documentados
- [ ] Optimización de media funcionando

---

## Phase 9: Admin (ÚLTIMO)

- [ ] Planificar rediseño sección admin
- [ ] (Por definir)

---

## Timeline

| Fase          | Días | Estado       |
| ------------- | ---- | ------------ |
| Foundation    | 2    | ⏳ Pendiente |
| Sidebar       | 3    | ⏳ Pendiente |
| Main Services | 5-7  | ⏳ Pendiente |
| Secondary     | 3-5  | ⏳ Pendiente |
| Polish        | 2    | ⏳ Pendiente |

**Total estimado: 15-19 días**
