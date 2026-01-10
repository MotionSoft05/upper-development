# 📚 Upper Digital Signage - Documentation Index

> Complete documentation for the Upper Digital Signage platform

---

## 📁 All Documentation Files

### Architecture & Overview

| Document                                                         | Description                          |
| ---------------------------------------------------------------- | ------------------------------------ |
| [Architecture Overview](./architecture/ARCHITECTURE-OVERVIEW.md) | System design, tech stack, data flow |
| [Landing Page](./landing/LANDING-PAGE.md)                        | Marketing site structure             |

### Dashboard

| Document                                                | Description                    |
| ------------------------------------------------------- | ------------------------------ |
| [Dashboard Overview](./dashboard/DASHBOARD-OVERVIEW.md) | Admin panel structure          |
| [Sidebar Navigation](./dashboard/SIDEBAR-NAVIGATION.md) | Navigation, permissions, state |

### Dashboard Redesign (2026)

| Document                                                                   | Description               |
| -------------------------------------------------------------------------- | ------------------------- |
| [Redesign README](./dashboard/redesign/README.md)                          | Project overview & status |
| [Implementation Plan](./dashboard/redesign/IMPLEMENTATION-PLAN.md)         | Technical architecture    |
| [TODO List](./dashboard/redesign/TODO.md)                                  | Task checklist            |
| [Competitor Research](./dashboard/redesign/COMPETITOR-RESEARCH.md)         | Industry analysis         |
| [Firebase Schema Changes](./dashboard/redesign/FIREBASE-SCHEMA-CHANGES.md) | TV App compatibility log  |

### Screens & Templates

| Document                                          | Description                 |
| ------------------------------------------------- | --------------------------- |
| [Screen Types](./screens/SCREEN-TYPES.md)         | All 5 screen types          |
| [Template System](./templates/TEMPLATE-SYSTEM.md) | Template rendering pipeline |

### Features

| Document                                                  | Description                   |
| --------------------------------------------------------- | ----------------------------- |
| [Event System](./events/EVENT-SYSTEM.md)                  | Event creation and scheduling |
| [Advertising System](./advertising/ADVERTISING-SYSTEM.md) | Ad management                 |
| [Device Management](./devices/DEVICE-MANAGEMENT.md)       | Android TV linking            |

### Technical

| Document                                                         | Description                  |
| ---------------------------------------------------------------- | ---------------------------- |
| [Firebase Integration](./technical/FIREBASE-INTEGRATION.md)      | Firestore collections, Auth  |
| [Cloud Functions](./technical/CLOUD-FUNCTIONS.md)                | Backend serverless functions |
| [Permission System](./technical/PERMISSION-SYSTEM.md)            | Role-based access            |
| [i18n System](./technical/I18N-SYSTEM.md)                        | Multi-language (ES/EN)       |
| [Routing & Static Gen](./technical/ROUTING-STATIC-GENERATION.md) | 300+ route generation        |

### External Docs

| Document                                               | Description              |
| ------------------------------------------------------ | ------------------------ |
| [Flight System](./flights/FLIGHT-SYSTEM.md)            | Flight API integration   |
| [Secure Deployment](./deployment/SECURE-DEPLOYMENT.md) | Deployment security plan |

### Integration (Web ↔ App TV)

| Document                                            | Description                  |
| --------------------------------------------------- | ---------------------------- |
| [Integration README](./integration/README.md)       | Overview of integration docs |
| [APP-INTEGRATION](./integration/APP-INTEGRATION.md) | How web sends data to app    |
| [DASHBOARD-GUIDE](./integration/DASHBOARD-GUIDE.md) | How app consumes web data    |

---

## 🎯 Quick Start

**New to the project?** → [Architecture Overview](./architecture/ARCHITECTURE-OVERVIEW.md)

**Working on screens?** → [Screen Types](./screens/SCREEN-TYPES.md)

**Dashboard code?** → [Sidebar Navigation](./dashboard/SIDEBAR-NAVIGATION.md)

**Firebase?** → [Firebase Integration](./technical/FIREBASE-INTEGRATION.md)

---

## 📊 Project Stats

| Metric               | Value  |
| -------------------- | ------ |
| Screen Types         | 5      |
| Max Screens          | 300+   |
| Dashboard Components | 80+    |
| Firebase Collections | 10+    |
| Cloud Functions      | 15+    |
| Languages            | ES, EN |

---

## ⚠️ Known Issues

- **Landing Page**: Outdated content, needs review
- **Dashboard**: Large components (2000+ lines) need modularization
- **Mobile Friendly**: Some dashboard sections not responsive
- **Objectives System**: Deprecated, scheduled for removal

---

_Last Updated: 2026-01-07_
