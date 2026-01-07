# 🏠 Landing Page Documentation

> Marketing website structure and components for Upper Digital Signage

---

## Overview

The landing page (`src/app/page.js`) serves as the public-facing marketing site for Upper Digital Signage. It showcases the product's features, pricing, and provides entry points for registration and login.

---

## Page Structure

```
┌──────────────────────────────────────────────────────────────────┐
│                         HEADER                                   │
│  - Navigation (fixed on scroll)                                  │
│  - Language Switcher (ES/EN)                                     │
│  - Login/Register buttons                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         HERO SLIDER                              │
│  Component: HomeSlider                                           │
│  - Full-width image carousel                                     │
│  - Call-to-action buttons                                        │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    SOLUTIONS SECTION                             │
│  id="soluciones"                                                 │
│  - 6 industry cards in grid                                      │
│  - Hover effects with image zoom                                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                  REGISTRATION CTA                                │
│  - Gradient background                                           │
│  - "Start Today" messaging                                       │
│  - Register button → /register                                   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                   RESOURCES SECTION                              │
│  id="recursos"                                                   │
│  - 4 feature cards with icons                                    │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      FAQ SECTION                                 │
│  Component: Preguntas                                            │
│  - Accordion-style Q&A                                           │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                   PRICING SECTION                                │
│  Component: Precios                                              │
│  - Pricing cards                                                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                  CONTACT SECTION                                 │
│  Component: Contacto                                             │
│  - Contact form                                                  │
│  - Company information                                           │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                         FOOTER                                   │
│  Component: Footer                                               │
│  - Links, social media, legal                                    │
└──────────────────────────────────────────────────────────────────┘

        ┌─────────────────┐
        │ Back to Top Btn │  (appears after 500px scroll)
        └─────────────────┘
```

---

## Components

### HomeSlider

**File**: `src/components/homeComponents/sliderHome.jsx`

Full-width carousel showcasing the product with engaging visuals.

### Solutions Cards

Grid of 6 industry solutions, each representing a target market:

| Industry           | Translation Key                   | Image               |
| ------------------ | --------------------------------- | ------------------- |
| Restaurants & Bars | `home.restaurantAndBars`          | `/img/centro1.jpeg` |
| Transport          | `home.transport`                  | `/img/centro2.jpeg` |
| Offices            | `home.offices`                    | `/img/centro3.jpeg` |
| Event Venues       | `home.eventVenues`                | `/img/centro4.jpeg` |
| Hotels             | `home.hotels`                     | `/img/centro5.jpeg` |
| Retail & Medical   | `home.retailersAndMedicalCenters` | `/img/centro6.jpeg` |

### Resources Section

4 feature highlight cards with icons:

| Feature                 | Icon                  | Translation Key                           |
| ----------------------- | --------------------- | ----------------------------------------- |
| High-Impact Content     | `/img/screens.svg`    | `home.publishHighImpactContent`           |
| Easy Scheduling         | `/img/keyboard.svg`   | `home.easyContentScheduling`              |
| Versatile Content       | `/img/Posibility.svg` | `home.generateImpactWithVersatileContent` |
| Security & Availability | `/img/security2.svg`  | `home.toolSecurityAndHighAvailability`    |

### Preguntas (FAQ)

**File**: `src/components/homeComponents/preguntas.jsx`

Expandable FAQ accordion with common questions.

### Precios (Pricing)

**File**: `src/components/homeComponents/precios.jsx`

Pricing tiers with feature comparison.

### Contacto (Contact)

**File**: `src/components/homeComponents/contacto.jsx`

Contact form with validation and company information.

---

## Styling

### Color Palette

```css
/* Primary */
Blue-600: #2563EB  /* Buttons, accents */
Blue-900: #1E3A8A  /* Dark backgrounds */

/* Neutral */
Gray-900: #111827  /* Text */
Gray-600: #4B5563  /* Secondary text */
White: #FFFFFF     /* Backgrounds */
```

### Key CSS Classes

- **gradient-bg**: `bg-gradient-to-r from-gray-900 to-blue-900`
- **container**: `container mx-auto px-4 max-w-screen-xl`
- **section-spacing**: `py-16 sm:py-24`

---

## Internationalization

All text uses translation keys via `react-i18next`:

```javascript
const { t } = useTranslation();
// Usage: {t("home.title")}
```

### Key Translation Keys

| Key                     | ES                  | EN            |
| ----------------------- | ------------------- | ------------- |
| `home.title`            | Nuestras Soluciones | Our Solutions |
| `home.startToday.title` | ¡Empieza Hoy!       | Start Today!  |
| `home.btnRegister`      | Registrarse         | Register      |

---

## Navigation

### Internal Links

| Link      | Destination            |
| --------- | ---------------------- |
| Register  | `/register`            |
| Login     | `/login`               |
| Solutions | `#soluciones` (scroll) |
| Resources | `#recursos` (scroll)   |

### Language Switcher

Component: `LanguageSwitcher`

Toggles between Spanish (ES) and English (EN).

---

## Responsive Behavior

| Breakpoint          | Behavior                        |
| ------------------- | ------------------------------- |
| Mobile (<768px)     | Single column, stacked sections |
| Tablet (768-1024px) | 2-column grids                  |
| Desktop (>1024px)   | 3-column grids, full layouts    |

---

## Back to Top Button

Appears when user scrolls past 500px:

```javascript
useEffect(() => {
  const handleScroll = () => {
    setShowButton(window.scrollY > 500);
  };
  window.addEventListener("scroll", handleScroll);
}, []);
```

---

## SEO Considerations

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Alt text on images
- Meta description (in layout.js)

---

## Files

| File                                           | Size   | Purpose           |
| ---------------------------------------------- | ------ | ----------------- |
| `src/app/page.js`                              | 7.4KB  | Main landing page |
| `src/components/homeComponents/sliderHome.jsx` | 1.4KB  | Hero slider       |
| `src/components/homeComponents/precios.jsx`    | 4.2KB  | Pricing section   |
| `src/components/homeComponents/preguntas.jsx`  | 4.5KB  | FAQ section       |
| `src/components/homeComponents/contacto.jsx`   | 18.2KB | Contact form      |
| `src/components/Footer.jsx`                    | 4.7KB  | Site footer       |

---

_See [Dashboard Overview](../dashboard/DASHBOARD-OVERVIEW.md) for the admin interface._
