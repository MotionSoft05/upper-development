# 🔗 Integración Web ↔ App TV

> Documentación de cómo se comunican la plataforma web y la app Android TV

---

## 📄 Documentos en esta carpeta

| Documento                                  | Perspectiva   | Descripción                               |
| ------------------------------------------ | ------------- | ----------------------------------------- |
| [APP-INTEGRATION.md](./APP-INTEGRATION.md) | **Web → App** | Qué datos enviar para que la app funcione |
| [DASHBOARD-GUIDE.md](./DASHBOARD-GUIDE.md) | **App → Web** | Cómo la app consume y procesa los datos   |

---

## 🎯 Cuándo usar cada documento

### Estás trabajando en el **Dashboard Web**?

→ Lee **APP-INTEGRATION.md** para saber qué estructura de datos espera la app

### Estás trabajando en la **App TV**?

→ Lee **DASHBOARD-GUIDE.md** para entender qué datos recibirás del dashboard

### Estás debuggeando problemas de conexión?

→ Lee ambos y compara las estructuras esperadas

---

## 🔄 Flujo de Datos

```
┌──────────────────┐         ┌──────────────┐         ┌──────────────┐
│   DASHBOARD WEB  │ ──────► │   FIREBASE   │ ◄────── │   APP TV     │
│                  │  write  │  (Firestore) │  read   │              │
│  - Configura     │         │              │         │  - onSnapshot│
│  - Guarda        │         │  Collections │         │  - Renderiza │
│  - Actualiza     │         │              │         │  - Cachea    │
└──────────────────┘         └──────────────┘         └──────────────┘
```

**No hay comunicación directa** entre web y app. Todo pasa por Firebase.

---

## 📋 Resumen de Colecciones

| Colección             | Quién escribe   | Quién lee |
| --------------------- | --------------- | --------- |
| `devices`             | Dashboard       | App       |
| `TemplateSalon`       | Dashboard       | App       |
| `TemplateDirectorio`  | Dashboard       | App       |
| `TemplateTarifario`   | Dashboard       | App       |
| `TemplatePromociones` | Dashboard       | App       |
| `eventos`             | Dashboard       | App       |
| `publicidad*`         | Dashboard       | App       |
| `flightData`          | Cloud Functions | App       |

---

_Última actualización: 2026-01-07_
