# Plan de Implementación Futura: Limpieza Automática de Storage

**Fecha de Creación:** 06 de Enero de 2026
**Estado:** Pendiente de Implementación
**Objetivo:** Eliminar automáticamente archivos huérfanos (imágenes/videos) en Firebase Storage cuando se eliminan o actualizan registros en Firestore.

---

## 1. Contexto del Problema

Actualmente, las aplicaciones "Publicidad Salones", "Tarifario" y "Promociones" permiten subir imágenes y videos. Cuando un usuario elimina una publicidad o actualiza un logo/video, **el archivo original permanece en Firebase Storage**, consumiendo espacio innecesariamente y generando costos a largo plazo.

## 2. Solución Técnica Propuesta: Cloud Functions

Se recomienda implementar la lógica de "Recolección de Basura" (Garbage Collection) en el Backend (Cloud Functions) para garantizar integridad y seguridad, independientemente de la interfaz de usuario.

### Estrategia de Triggers

Se requieren 3 triggers distintos debido a que cada módulo maneja los datos de forma diferente.

#### A. Módulo: Publicidad Salones

- **Colección:** `Publicidad`
- **Evento:** `onDelete`
- **Lógica:**
  - Al borrar un documento completo, leer los campos `imageUrl` y `videoUrl`.
  - Borrar los archivos correspondientes en Storage.

#### B. Módulo: Tarifario

- **Colección:** `pantallasTarifario`
- **Evento:** `onUpdate`
- **Lógica:**
  - El documento NO se borra, se edita.
  - **Logo:** Comparar `before.data().logo` vs `after.data().logo`. Si cambió, borrar el logo `before`.
  - **Lista de Publicidad:** Comparar el array `before.publicidad` vs `after.publicidad`. Identificar qué URLs de imágenes desaparecieron en la nueva versión y borrarlas.

#### C. Módulo: Promociones

- **Colección:** `TemplatePromociones`
- **Evento:** `onUpdate`
- **Lógica:**
  - Es la estructura más compleja (`pantallasConfig` -> `secciones` -> `content[]`).
  - Se requiere una función recursiva para extraer TODAS las URLs de contenido del objeto `before` y del objeto `after`.
  - Obtener la diferencia (URLs que estaban en `before` pero ya no en `after`).
  - Borrar esos archivos huérfanos.

## 3. Especificación de Implementación

### Estructura de Archivos Recomendada

```text
functions/
├── index.js                  # Exporta los nuevos triggers
├── triggers/
│   ├── onPublicidadDelete.js # Trigger para Publicidad
│   ├── onTarifarioUpdate.js  # Trigger para Tarifario
│   └── onPromocionesUpdate.js# Trigger para Promociones
└── utils/
    └── storageCleaner.js     # Helper reutilizable para borrar archivos
```

### Detalle del Helper `storageCleaner.js`

Este helper debe encargarse de:

1.  Recibir una URL pública de Firebase Storage.
2.  Parsear la URL para obtener la referencia interna del archivo.
3.  Ejecutar `bucket.file(path).delete()`.
4.  Manejar errores silenciosamente (ej. si el archivo ya no existe, no romper el flujo).

## 4. Plan de Verificación (QA)

Cuando se implemente esta solución, se deben ejecutar las siguientes pruebas:

1.  **Prueba de Borrado Simple:** Subir una imagen a "Publicidad Salones", borrar la publicidad y confirmar que la imagen desaparece del Storage.
2.  **Prueba de Actualización de Logo:** En "Tarifario", cambiar el logo y verificar que el anterior se borra.
3.  **Prueba de Lista:** En "Tarifario", borrar una imagen de la lista de publicidad y confirmar su eliminación en Storage.
4.  **Prueba Compleja:** En "Promociones", eliminar un video de una sección dentro de un template y verificar su eliminación del Storage.
