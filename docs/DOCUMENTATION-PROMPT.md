# 🤖 Prompt para Documentación Completa de Proyecto

> Copia y pega este prompt al iniciar una conversación en el proyecto de la app

---

## El Prompt:

```
Necesito que hagas una documentación completa y extensiva de este proyecto. Quiero que:

1. **Explores todo el código** - Analiza la estructura de carpetas, archivos principales, componentes, servicios, utilidades, configuraciones.

2. **Crees una estructura de documentación** en una carpeta `docs/` con los siguientes documentos:

### Documentos requeridos:

- `docs/DOCUMENTATION-INDEX.md` - Índice principal con links a todos los docs
- `docs/QUICK-START-GUIDE.md` - Resumen ejecutivo para humanos (5 min de lectura)
- `docs/architecture/ARCHITECTURE-OVERVIEW.md` - Stack tecnológico, diagramas, flujo de datos
- `docs/technical/TECHNICAL-DEBT.md` - Problemas conocidos y cosas a mejorar

### Documentos por área (crea los que apliquen):

- Componentes principales
- Servicios y APIs
- Navegación y rutas
- Estado y data management
- Conexión a Firebase/backend
- Autenticación
- Configuraciones

3. **Para cada documento incluye**:
- Diagramas ASCII cuando ayude a visualizar
- Tablas para datos estructurados
- Código de ejemplo cuando sea relevante
- Links entre documentos relacionados

4. **Al final del análisis**:
- Actualiza el README.md con links a la documentación
- Créame un resumen de lo que documentaste

5. **Formato**:
- Markdown con emojis para headers
- Tablas para información estructurada
- Código con syntax highlighting
- Links relativos entre documentos

Empieza explorando la estructura del proyecto y luego ve creando los documentos uno por uno. Dame un resumen al terminar.
```

---

## Tips de uso:

1. **Si la IA no explora suficiente**, decile:

   > "Explora más a fondo los archivos de [carpeta específica]"

2. **Si querés más detalle en algo**, decile:

   > "Profundiza más en la documentación de [componente/servicio]"

3. **Si hay documentación existente**, decile:

   > "Integra estos documentos existentes: @[archivo1] @[archivo2]"

4. **Al terminar**, pedile:
   > "Haceme un resumen de toda la documentación para humanos"

---

## Variante corta (si querés algo más rápido):

```
Analiza todo este proyecto y créame documentación completa en `docs/`. Incluye:
1. Índice principal
2. Guía rápida (resumen ejecutivo)
3. Arquitectura
4. Documentación por módulo/componente
5. Problemas técnicos conocidos

Usa markdown con diagramas, tablas y ejemplos de código. Actualiza el README al terminar.
```

---

_Creado: 2026-01-07_
