# Prompt para Auditoría Externa (IA)

Copia y pega el siguiente prompt en una nueva sesión de IA que tenga acceso a tu código:

---

### **Prompt de Auditoría Integral: UpperDS Dashboard Redesign**

**Contexto del Proyecto:**
Soy el dueño/desarrollador único de "UpperDS", una plataforma de Digital Signage (cartelería digital) construida con Next.js, Firebase y Tailwind. La aplicación permite a hoteles y empresas gestionar pantallas de Vuelos, Directorios, Eventos y Promociones.
Actualmente, el proyecto sufre de "fragmentación extrema" (cada tipo de pantalla tiene su propia lógica aislada) y deuda técnica.
He desarrollado una propuesta de rediseño para migrar a una arquitectura unificada de "Screen Editor" (basada en Playlists, Widgets y Layouts).

**Tu Misión:**
Quiero que actúes como dos consultores de alto nivel para realizar una **investigación profunda y auditoría completa**. Debes analizar exhaustivamente cómo funciona el sistema actual (leyendo el código línea por línea si es necesario) y compararlo contra la documentación de rediseño que he creado.

**Instrucción Cero: Carga de Contexto**
Antes de opinar, debes leer y entender CADA UNO de los siguientes archivos para tener la imagen completa:

1.  **Código del Sistema Actual (Legacy):**
    - _Promociones:_ `src/components/dashboard/PantallasPromociones.jsx`
    - _Vuelos (Frontend):_ `src/components/dashboard/PantallasVuelos.jsx`
    - _Vuelos (Backend):_ `functions/services/flightService.js`
    - _Directorios:_ `src/components/dashboard/PantallasDirectorio.jsx`
    - _Eventos/Salones:_ `src/components/dashboard/consultaModEventos.jsx` y `src/components/dashboard/pantallasSalon.jsx`
    - _Monitor/Admin:_ `src/components/dashboard/MonitorScreen.jsx` y `src/components/dashboard/admin/AdminAPIMonitor.jsx`
    - _Estado Global:_ `src/stores/useDashboardStore.ts`

2.  **Documentación del Rediseño (Propuesta):**
    - `docs/dashboard/redesign/DATA-UX-ANALYSIS.md` (Mi análisis diagnóstico).
    - `docs/dashboard/redesign/PROPOSAL-FOR-STAKEHOLDERS.md` (La propuesta comercial/técnica).
    - `docs/dashboard/redesign/SCHEDULER-FEATURE-SPECS.md` (La nueva killer-feature: Advanced Scheduler).

---

#### **FASE 1: El Desarrollador Senior Estricto (The Tech Lead from Hell)**

_Rol:_ Eres un Arquitecto de Software Senior con 20 años de experiencia, brutalmente honesto y obsesionado con la escalabilidad.

_Instrucciones de Auditoría:_

1.  **Análisis Forense:** Analiza el código actual (`PantallasX.jsx`). ¿Detectas patrones repetidos, manejo de estado ineficiente o riesgos de seguridad? Cita líneas específicas.
2.  **Validación del Rediseño:** Critica mi propuesta de arquitectura unificada (Widgets + Playlists). ¿Es ingeniería excesiva o es la solución correcta? ¿Resolverá realmente los problemas que ves en el código actual?
3.  **Evaluación de Scheduler:** Revisa `SCHEDULER-FEATURE-SPECS.md`. ¿Es técnicamente viable implementar ese sistema de prioridades sobre Firebase? ¿Qué desafíos de latencia prevés?
4.  **Veredicto Técnico:** Dame una lista de tareas de refactorización OBLIGATORIAS y califica la calidad del código actual vs. la calidad de la propuesta.

---

#### **FASE 2: El Empresario Exitoso (The Shark Tech Mogul)**

_Rol:_ Eres un Inversor de Venture Capital y CEO de una empresa SaaS exitosa. Te importa el dinero, la escalabilidad y ganar al mercado.

_Instrucciones de Negocio:_

1.  **Auditoría de Producto:** Compara lo que hace el código actual (lo que leíste en los archivos) contra lo que propongo en `PROPOSAL-FOR-STAKEHOLDERS.md`. ¿Hay un salto de valor real?
2.  **Análisis Competitivo:** ¿Esta nueva arquitectura me permite competir contra gigantes como Yodeck o Samsung MagicInfo? ¿O sigo siendo un "juguete"?
3.  **Evaluación de la Funcionalidad "Scheduler":** ¿Crees que la funcionalidad de "Playlist Override" (interrupciones programadas) justifica por sí sola la inversión del rediseño? ¿Es una característica "vendible"?
4.  **Veredicto de Inversión:** ¿Pondrías tu dinero para financiar este refactor?

---

**Nota Final:**
Espero un informe detallado, que demuestre que has leído el código y entendido la complejidad del negocio. No me des respuestas genéricas. Quiero la verdad dura y pura.
