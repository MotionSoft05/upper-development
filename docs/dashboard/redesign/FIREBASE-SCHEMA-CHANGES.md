# Firebase Schema Changes Log

> Registro de cambios en la estructura de Firestore para compatibilidad con la TV App

⚠️ **IMPORTANTE**: Todo cambio en la estructura de datos DEBE ser documentado aquí para actualizar la aplicación Android TV.

---

## How to Document Changes

Para cada cambio, usar el siguiente formato:

```markdown
## [FECHA] - [Componente afectado]

### Cambios en Campos

- `collection/document/field`: old_type → new_type
- Descripción del cambio

### Impacto en TV App

- [ ] Requiere actualización de TV App
- [ ] Backward compatible

### Pasos de Migración

1. Paso 1
2. Paso 2

### Código Afectado en TV App

- archivo1.kt
- archivo2.kt
```

---

## Change History

### 2026-01-09 - Inicio del Proyecto de Rediseño

**Estado:** Planificación  
**Cambios:** Ninguno aún

> Este archivo se actualizará conforme se realicen cambios durante el rediseño.

---

## Current Schema Reference

### Collections principales consultadas por TV App:

| Collection            | Campos clave          | Uso en TV App            |
| --------------------- | --------------------- | ------------------------ |
| `TemplateSalon{ID}`   | eventos, config, logo | Pantallas de Salón       |
| `TemplateDirec{ID}`   | directorio, config    | Pantallas Directorio     |
| `TemplateTarifas{ID}` | tarifas, config       | Pantallas Tarifario      |
| `flightData`          | flights, lastUpdate   | Pantallas Vuelos         |
| `devices`             | linkedUser, config    | Vinculación dispositivos |

---

## Breaking Changes Summary

| Fecha | Cambio | Breaking | TV App Updated |
| ----- | ------ | -------- | -------------- |
| -     | -      | -        | -              |

---

## Notes

- La TV App es "display-only" (solo muestra, no interactúa)
- Cualquier cambio de campo puede romper la visualización
- Preferir agregar campos nuevos vs modificar existentes
- Mantener backward compatibility siempre que sea posible
