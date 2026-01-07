# 🛤️ Routing & Static Generation Documentation

> How Upper Digital Signage generates 300+ screen routes

---

## Overview

Upper Digital Signage uses Next.js Static Site Generation (SSG) to pre-render hundreds of screen pages at build time, ensuring instant load times for displays.

---

## Route Structure

```
App Router Routes:
/                          → Landing page
/login                     → Login page
/register                  → Registration page
/dashboard                 → Admin dashboard
/pantalla/[id]             → Salon screens (1-300)
/pantallaDirec/[id]        → Directory screens
/pantallaTarifario/[id]    → Rate screens
/pantallaVuelos            → Flight screens
/pantallaDeServicio        → Service screens
```

---

## Static Generation Pattern

### generateStaticParams

Each screen type uses `generateStaticParams` to pre-generate routes:

```javascript
// src/app/pantalla/[id]/page.jsx
import BaseScreenClient from "@/components/BaseScreenClient";

export default function PantallaDinamica({ params }) {
  return <BaseScreenClient id={params.id} />;
}

export function generateStaticParams() {
  // Generate 300 routes: /pantalla/1, /pantalla/2, ... /pantalla/300
  return Array.from({ length: 300 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
```

### How It Works

1. **Build Time**: Next.js calls `generateStaticParams()`
2. **Route Generation**: Creates static HTML for each ID
3. **Deploy**: Static pages served from CDN
4. **Runtime**: Client-side hydration with React

---

## Screen Count by Type

| Screen Type | Route Pattern             | Generated Routes |
| ----------- | ------------------------- | ---------------- |
| Salon       | `/pantalla/[id]`          | 300              |
| Directory   | `/pantallaDirec/[id]`     | ~100             |
| Tarifario   | `/pantallaTarifario/[id]` | ~100             |
| Vuelos      | `/pantallaVuelos`         | Single route     |
| Servicio    | `/pantallaDeServicio`     | Single route     |

### Total: ~500+ Static Routes

---

## Route Files

### Salon Screens

```
src/app/pantalla/[id]/
├── page.jsx                 # Screen component
└── generateStaticParams.js  # Route generation
```

**page.jsx**:

```javascript
import BaseScreenClient from "@/components/BaseScreenClient";

export default function PantallaDinamica({ params }) {
  return <BaseScreenClient id={params.id} />;
}

export function generateStaticParams() {
  return Array.from({ length: 300 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
```

### Directory Screens

```
src/app/pantallaDirec/[id]/
└── page.jsx
```

### Tarifario Screens

```
src/app/pantallaTarifario/[id]/
└── page.jsx
```

---

## Static vs Dynamic Content

### Static (Build Time)

- Route structure
- Component code
- Styles
- Initial HTML shell

### Dynamic (Runtime)

- Event data (Firebase `onSnapshot`)
- Weather information
- Device configuration
- User permissions

---

## Next.js Configuration

**File**: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export
  output: "export",

  // Trailing slashes for static hosting
  trailingSlash: true,

  // Image optimization settings
  images: {
    unoptimized: true, // For static export
  },
};

module.exports = nextConfig;
```

---

## Build Output

```
out/
├── index.html              # Landing page
├── login/
│   └── index.html
├── register/
│   └── index.html
├── dashboard/
│   └── index.html
├── pantalla/
│   ├── 1/
│   │   └── index.html
│   ├── 2/
│   │   └── index.html
│   ├── 3/
│   │   └── index.html
│   └── ... (1-300)
├── pantallaDirec/
│   ├── 1/
│   │   └── index.html
│   └── ...
└── pantallaTarifario/
    ├── 1/
    │   └── index.html
    └── ...
```

---

## Client-Side Navigation

Within the dashboard, navigation is client-side:

```javascript
import Link from "next/link";

// Dashboard navigation
<Link href="/pantalla/1">View Screen 1</Link>;

// Programmatic navigation
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/pantalla/5");
```

---

## Screen Base Components

All screen routes delegate to base components that handle:

- Firebase subscriptions
- Real-time data
- Template rendering

```javascript
// Route: /pantalla/[id]
export default function PantallaDinamica({ params }) {
  return <BaseScreenClient id={params.id} />;
}

// BaseScreenClient handles:
// - Auth state
// - Firebase subscription
// - Template selection
// - Content rendering
```

---

## URL Parameters

Screens extract configuration from URL:

```javascript
// /pantalla/5 → id = "5"
function BaseScreenClient({ id }) {
  const screenNumber = parseInt(id);

  // Use screen number to query correct configuration
  const configRef = doc(db, "TemplateSalon", `${empresa}_${screenNumber}`);
}
```

---

## Why 300 Screens?

| Reason                    | Explanation                        |
| ------------------------- | ---------------------------------- |
| **Scalability**           | Large venues may need 100+ screens |
| **No Runtime Generation** | All routes pre-built               |
| **CDN Performance**       | Static files = instant loads       |
| **Enterprise Ready**      | Supports hotel chains, airports    |

---

## Extending Screen Count

To add more screens, modify `generateStaticParams`:

```javascript
// Increase to 500 screens
export function generateStaticParams() {
  return Array.from({ length: 500 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}
```

---

## Build Commands

```bash
# Development server
npm run dev

# Production build (generates static files)
npm run build

# Output in 'out/' directory
npm run export
```

---

_See [Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md) for deployment details._
