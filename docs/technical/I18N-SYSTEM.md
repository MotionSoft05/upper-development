# 🌐 Internationalization (i18n) Documentation

> Multi-language support in Upper Digital Signage

---

## Overview

Upper Digital Signage supports Spanish (ES) and English (EN) across the entire platform using `react-i18next`.

---

## Configuration

### i18n Setup

**File**: `src/utils/i18n.js`

```javascript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationES from "@/lang/translationES.json";
import translationEN from "@/lang/translationEN.json";

const resources = {
  es: { translation: translationES },
  en: { translation: translationEN },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es", // Default language
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

---

## Translation Files

### Spanish (ES)

**File**: `src/lang/translationES.json` (~75KB)

### English (EN)

**File**: `src/lang/translationEN.json` (~68KB)

---

## Translation Structure

```json
{
  "home": {
    "title": "Nuestras Soluciones",
    "btnRegister": "Registrarse",
    "startToday": {
      "title": "¡Empieza Hoy!",
      "description1": "Gestiona tu contenido de manera eficiente"
    },
    "restaurantAndBars": {
      "title": "Restaurantes y Bares",
      "description1": "Pantallas digitales para menús y promociones"
    }
  },

  "sidebar": {
    "admin": "Administrador",
    "dashboard": "Tablero",
    "eventRegistration": "Alta de Eventos",
    "roomScreens": "Pantallas Salón",
    "directoryScreens": "Pantallas Directorio"
  },

  "pantallaDirec": {
    "loadingWeatherData": "Cargando datos del clima...",
    "welcomeTitle": "Bienvenido",
    "noDataFound": "No se encontraron datos"
  },

  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito"
  }
}
```

---

## Usage

### In Components

```javascript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("home.title")}</h1>
      <p>{t("home.startToday.description1")}</p>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

### With Variables

```javascript
// Translation with interpolation
// In JSON: "greeting": "Hola, {{name}}!"
{
  t("greeting", { name: userName });
}
```

---

## Language Switcher

**File**: `src/components/LanguageSwitcher.jsx`

```javascript
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button
        className={i18n.language === "es" ? "active" : ""}
        onClick={() => changeLanguage("es")}
      >
        ES
      </button>
      <button
        className={i18n.language === "en" ? "active" : ""}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
```

---

## Screen Language Configuration

Each screen can have its own language setting:

```javascript
// In screen configuration
{
  idioma: "es",  // or "en"
  // ... other config
}

// In screen component
const handleLanguageChange = (e) => {
  setIdioma(e.target.value);
};

<select value={idioma} onChange={handleLanguageChange}>
  <option value="es">Español</option>
  <option value="en">English</option>
</select>
```

---

## Key Translation Namespaces

| Namespace         | Purpose                |
| ----------------- | ---------------------- |
| `home.*`          | Landing page content   |
| `sidebar.*`       | Dashboard navigation   |
| `pantallaDirec.*` | Directory screen UI    |
| `pantallaSalon.*` | Salon screen UI        |
| `common.*`        | Shared buttons, labels |
| `errors.*`        | Error messages         |
| `validation.*`    | Form validation        |

---

## Date Localization

**File**: `src/components/getLanguageDate.jsx`

```javascript
const getLocalizedDate = (date, language) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return new Date(date).toLocaleDateString(
    language === "es" ? "es-ES" : "en-US",
    options,
  );
};

// Output:
// ES: "Martes, 7 de enero de 2026"
// EN: "Tuesday, January 7, 2026"
```

---

## Adding New Translations

1. Add key to both `translationES.json` and `translationEN.json`
2. Use the key in components with `t('newKey')`

```json
// translationES.json
{
  "newFeature": {
    "title": "Nueva Característica",
    "description": "Descripción de la nueva característica"
  }
}

// translationEN.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description of the new feature"
  }
}
```

---

_See [Dashboard Overview](../dashboard/DASHBOARD-OVERVIEW.md) for i18n in dashboard components._
