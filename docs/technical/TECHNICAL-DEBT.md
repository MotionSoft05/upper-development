# ⚠️ Technical Debt & Known Issues

> Problems to address in the Upper Digital Signage codebase

---

## 🔴 High Priority

### 1. Giant Dashboard Components

Several dashboard components have 2000+ lines and need modularization:

| Component                  | Lines | Issue                     |
| -------------------------- | ----- | ------------------------- |
| `pantallasTarifario.jsx`   | 2,270 | Too many responsibilities |
| `PantallasPromociones.jsx` | 2,391 | Needs splitting           |
| `consultaModEventos.jsx`   | 1,756 | Complex state management  |
| `PantallasDirectorio.jsx`  | 1,749 | Mix of UI and logic       |
| `PantallasVuelos.jsx`      | 1,655 | Can be modularized        |

**Recommendation**: Split into smaller components:

- Separate form logic from UI
- Extract reusable hooks
- Create shared components for color pickers, image uploaders, etc.

### 2. Sidebar State Management

**File**: `src/components/dashboard/SideBar.jsx` (790 lines)

**Problem**: All panels require manual `setShow` calls in `changePanel()`:

```javascript
// ❌ Current: 20+ manual state resets
props.setShowPantallaSalon(false);
props.setShowPantallaDirectorio(false);
// ... 20 more
```

**Solution**: Use single state with panel registry:

```javascript
// ✅ Better: Single active panel state
const [activePanel, setActivePanel] = useState("dashboard");
```

### 3. Mobile Responsiveness

Many dashboard sections don't display well on mobile:

- Tables overflow on small screens
- Some modals can't be scrolled
- Touch targets too small

---

## 🟡 Medium Priority

### 4. Prop Drilling

Dashboard passes 40+ props through multiple component layers.

**Solution**: Implement React Context for:

- User data
- Active panel state
- Company selection
- Permissions

### 5. No TypeScript

The codebase uses JavaScript without type safety.

**Risk**: Runtime errors from incorrect prop types, missing permission keys.

### 6. Landing Page Outdated

The landing page content may not reflect current features and pricing.

**Files to review**:

- `src/app/page.js`
- `src/lang/translationES.json`
- `src/lang/translationEN.json`

---

## 🟢 Low Priority

### 7. Deprecated Objectives System

The "objectives" functionality in the dashboard is no longer used but code remains.

**Action**: Identify and remove related code.

### 8. Console Warnings

Some React warnings appear in development:

- Uncontrolled to controlled input warnings
- Missing key props in lists
- Deprecated lifecycle methods

### 9. Inconsistent Naming

Mixed naming conventions:

- `pantallasSalon` vs `PantallasDirectorio` (casing)
- `permisosvuelos` vs `pantallasSalon` (inconsistent keys)

---

## 📋 Refactoring Roadmap

### Phase 1: Dashboard Cleanup

1. Create shared form components
2. Extract custom hooks
3. Split large components

### Phase 2: State Management

1. Implement Context API for dashboard
2. Consolidate panel state
3. Remove prop drilling

### Phase 3: Mobile Optimization

1. Responsive table components
2. Mobile-friendly modals
3. Touch-optimized controls

### Phase 4: TypeScript Migration

1. Add TypeScript config
2. Create type definitions
3. Migrate components gradually

---

_This document should be updated as issues are resolved._
