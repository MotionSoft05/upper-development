# 🎨 Dashboard Redesign Project

> Rediseño completo del Dashboard de Upper Digital Signage (arquitectura + visual)

**Fecha de inicio:** 2026-01-09  
**Estado:** 📝 Planificación completa, pendiente implementación

---

## 📚 Documentación

| Documento                                                  | Descripción                    |
| ---------------------------------------------------------- | ------------------------------ |
| [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)         | Plan técnico detallado         |
| [TODO.md](./TODO.md)                                       | Checklist de tareas            |
| [COMPETITOR-RESEARCH.md](./COMPETITOR-RESEARCH.md)         | Análisis de competidores       |
| [FIREBASE-SCHEMA-CHANGES.md](./FIREBASE-SCHEMA-CHANGES.md) | Cambios de esquema para TV app |

---

## 🎯 Objetivos

1. **Arquitectura moderna** - Zustand para state management
2. **Sidebar colapsable** - Íconos ↔ expandido
3. **Dark mode** - Obligatorio desde día 1
4. **Responsive** - Mobile-first
5. **Optimización de media** - Compresión de imágenes/videos
6. **B2B + B2C** - Mejorar plan gratuito

---

## 📊 Prioridad de Componentes

| #   | Componente           | Tamaño     | Prioridad  |
| --- | -------------------- | ---------- | ---------- |
| 1   | SideBar              | 790 líneas | 🔴 PRIMERO |
| 2   | PantallasPromociones | 102KB      | 🔴 ALTO    |
| 3   | PantallasVuelos      | 70KB       | 🔴 ALTO    |
| 4   | pantallasTarifario   | 96KB       | 🟡 MEDIO   |
| 5   | PantallasDirectorio  | 75KB       | 🟡 MEDIO   |

---

## ⏱️ Timeline Estimado

| Fase          | Duración | Entregable               |
| ------------- | -------- | ------------------------ |
| Foundation    | 2 días   | Zustand + Theme + Layout |
| Sidebar       | 3 días   | Sidebar colapsable       |
| Main Services | 5-7 días | Promociones + Vuelos     |
| Secondary     | 3-5 días | Otros screens            |
| Polish        | 2 días   | Testing + fixes          |

**Total: 15-19 días**

---

## 🔗 Links Relacionados

- [TECHNICAL-DEBT.md](../technical/TECHNICAL-DEBT.md)
- [ARCHITECTURE-OVERVIEW.md](../architecture/ARCHITECTURE-OVERVIEW.md)
- [Landing Redesign Log](../progress/2024-01-07_Landing_Redesign_Log.md)
