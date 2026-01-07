# 🎨 Template System Documentation

> How templates are designed, configured, and rendered in Upper Digital Signage

---

## Overview

Templates are pre-designed screen layouts that control how content is displayed on digital signage screens. Each screen type has its own template system with specific design patterns.

---

## Template Architecture

```
Templates Directory: src/components/templates/

├── Pantallas Salón (PS)
│   ├── PSTemplate1.jsx
│   ├── PSTemplate2.jsx
│   └── PSTemplateManager.jsx
│
├── Pantallas Directorio (PD)
│   ├── PDTemplate1Horizontal.jsx
│   ├── PDTemplate1Vertical.jsx
│   └── PDTemplateManager.jsx
│
└── Pantallas Tarifario (PT)
    ├── PTTemplate1Horizontal.jsx
    ├── PTTemplate1Vertical.jsx
    └── PTTemplateManager.jsx
```

---

## Template Managers

Template managers are wrapper components that select and render the appropriate template based on configuration.

### PSTemplateManager (Salon)

**File**: `src/components/templates/PSTemplateManager.jsx`

```javascript
function PSTemplateManager({ config, events, ...props }) {
  switch (config.template) {
    case "PSTemplate1":
      return <PSTemplate1 {...props} />;
    case "PSTemplate2":
      return <PSTemplate2 {...props} />;
    default:
      return <PSTemplate1 {...props} />;
  }
}
```

### PDTemplateManager (Directory)

**File**: `src/components/templates/PDTemplateManager.jsx`

Selects between horizontal and vertical templates based on orientation.

### PTTemplateManager (Tarifario)

**File**: `src/components/templates/PTTemplateManager.jsx`

Handles tariff/rate display templates.

---

## Template Design Patterns

### Common Props

All templates receive standard props:

```javascript
{
  // Branding
  logo: "https://storage.url/logo.png",
  templateColor: "#1E3A8A",
  fontColor: "#FFFFFF",
  fontStyle: "Inter",

  // Content
  events: [...],
  weather: { temp, condition, icon },
  time: "10:30",
  date: "Martes, 7 de Enero 2026",

  // Config
  idioma: "es",
  orientation: "horizontal",
  showHeader: true
}
```

### Template Structure

Each template follows this pattern:

```jsx
function PSTemplate1({
  logo,
  templateColor,
  fontColor,
  events,
  weather,
  time,
}) {
  return (
    <div
      className="template-container"
      style={{ backgroundColor: templateColor }}
    >
      {/* Header Section */}
      <header className="template-header">
        <img src={logo} alt="Logo" />
        <TimeDisplay time={time} />
        <WeatherWidget weather={weather} />
      </header>

      {/* Main Content */}
      <main className="template-content">
        <EventList events={events} fontColor={fontColor} />
      </main>

      {/* Footer */}
      <footer className="template-footer">
        <RSSSlider />
      </footer>
    </div>
  );
}
```

---

## Salon Templates (PS)

### PSTemplate1

**File**: `src/components/templates/PSTemplate1.jsx` (5,249 bytes)

Classic event display layout with:

- Logo in top-left
- Time in top-right
- Main event content in center
- Weather at bottom
- RSS news ticker

### PSTemplate2

**File**: `src/components/templates/PSTemplate2.jsx` (5,040 bytes)

Modern event layout with:

- Full-width header
- Larger event images
- Animated transitions
- Split weather/time display

### Customization Options

| Option                   | Type      | Description              |
| ------------------------ | --------- | ------------------------ |
| `templateColor`          | Hex color | Background color         |
| `fontColor`              | Hex color | Text color               |
| `fontStyle`              | String    | Google Font name         |
| `logo`                   | URL       | Company logo             |
| `showHeaderInFullscreen` | Boolean   | Toggle header visibility |

---

## Directory Templates (PD)

### PDTemplate1Horizontal

**File**: `src/components/templates/PDTemplate1Horizontal.jsx` (18,513 bytes)

Landscape layout for building directories:

- Event list on left (70%)
- Ad slider on right (30%)
- Header with logo, date, weather
- RSS ticker at bottom

### PDTemplate1Vertical

**File**: `src/components/templates/PDTemplate1Vertical.jsx` (21,876 bytes)

Portrait layout for:

- Vertical screens
- Lobby displays
- Elevator areas

### Layout Comparison

```
HORIZONTAL (1920x1080)              VERTICAL (1080x1920)
┌────────────────┬─────┐            ┌───────────────┐
│                │     │            │    HEADER     │
│    EVENTS      │ ADS │            ├───────────────┤
│                │     │            │               │
│                │     │            │    EVENTS     │
├────────────────┴─────┤            │               │
│       TICKER         │            │               │
└──────────────────────┘            ├───────────────┤
                                    │      ADS      │
                                    ├───────────────┤
                                    │    TICKER     │
                                    └───────────────┘
```

---

## Tarifario Templates (PT)

### PTTemplate1Horizontal

**File**: `src/components/templates/PTTemplate1Horizontal.jsx` (17,243 bytes)

Rate board for:

- Transportation prices
- Hotel room rates
- Service pricing

### PTTemplate1Vertical

**File**: `src/components/templates/PTTemplate1Vertical.jsx` (21,821 bytes)

Vertical rate display with:

- More visible pricing
- QR code support
- Contact information area

---

## Template Rendering Pipeline

### 1. Configuration Loading

```javascript
// Dashboard saves configuration to Firebase
await setDoc(doc(db, "TemplateSalon", `${empresa}_${screenNumber}`), {
  template: "PSTemplate1",
  templateColor: "#1E3A8A",
  fontColor: "#FFFFFF",
  // ... other config
});
```

### 2. Screen Component Subscription

```javascript
// Screen component subscribes to config
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "TemplateSalon", configId), (doc) => {
    setConfig(doc.data());
  });
  return () => unsubscribe();
}, [configId]);
```

### 3. Template Selection

```javascript
// Template manager selects correct template
<PSTemplateManager config={config} events={events} weather={weather} />
```

### 4. Real-Time Updates

Any configuration change in Firebase immediately reflects on the screen:

- Color changes
- Logo updates
- Template switches
- Content modifications

---

## Styling System

### CSS Variables

Templates use CSS custom properties for theming:

```css
.template-container {
  --template-bg: var(--templateColor);
  --text-color: var(--fontColor);
  --font-family: var(--fontStyle);

  background-color: var(--template-bg);
  color: var(--text-color);
  font-family: var(--font-family);
}
```

### Responsive Design

Templates are designed for fixed screen resolutions:

| Resolution | Use Case              |
| ---------- | --------------------- |
| 1920x1080  | Standard landscape TV |
| 1080x1920  | Portrait displays     |
| 3840x2160  | 4K displays           |

### Font Loading

Google Fonts are loaded dynamically:

```javascript
// Load font based on configuration
useEffect(() => {
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontStyle}`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
}, [fontStyle]);
```

---

## Content Slots

Templates define content slots that can be filled with different types of content:

### Slot Types

| Slot    | Content Types          |
| ------- | ---------------------- |
| Header  | Logo, Time, Weather    |
| Main    | Events, Images, Videos |
| Sidebar | Ads, QR Codes, Info    |
| Footer  | RSS, Messages          |

### Slot Configuration

```javascript
// Example slot configuration
{
  slots: {
    header: { showLogo: true, showTime: true, showWeather: true },
    main: { type: "events", maxItems: 10 },
    sidebar: { type: "ads", rotation: 10 },
    footer: { type: "rss", speed: "normal" }
  }
}
```

---

## Adding New Templates

### Step 1: Create Template Component

```jsx
// src/components/templates/PSTemplate3.jsx
export function PSTemplate3({ logo, events, weather, ...props }) {
  return <div className="ps-template-3">{/* Your custom layout */}</div>;
}
```

### Step 2: Register in Manager

```javascript
// PSTemplateManager.jsx
case 'PSTemplate3':
  return <PSTemplate3 {...props} />;
```

### Step 3: Add to Dashboard Selector

Add the new template option to the dashboard configuration component.

---

## Template File Sizes

| Template              | Size    | Complexity |
| --------------------- | ------- | ---------- |
| PSTemplate1           | 5.2 KB  | Medium     |
| PSTemplate2           | 5.0 KB  | Medium     |
| PDTemplate1Horizontal | 18.5 KB | High       |
| PDTemplate1Vertical   | 21.9 KB | High       |
| PTTemplate1Horizontal | 17.2 KB | High       |
| PTTemplate1Vertical   | 21.8 KB | High       |

---

_See [Screen Types](../screens/SCREEN-TYPES.md) for screen-specific details._
