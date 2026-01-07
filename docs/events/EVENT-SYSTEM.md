# 📅 Event System Documentation

> Event creation, scheduling, and display in Upper Digital Signage

---

## Overview

The event system allows users to create, schedule, and display events on their digital signage screens. Events can include images, descriptions, date ranges, and visualization timers.

---

## Event Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CREATE     │────►│   SCHEDULE   │────►│   DISPLAY    │
│  (Dashboard) │     │ (Date Range) │     │  (Screens)   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │   EXPIRE     │
                                          │ (End Date)   │
                                          └──────────────┘
```

---

## Components

### AltaEventos (Event Creation)

**File**: `src/components/dashboard/altaEventos.jsx` (1,125 lines)

Creates new events with:

- Event name and description
- Date range (start/end dates)
- Images (multiple upload)
- Screen assignment
- Section targeting
- Visualization time

#### Key Functions

| Function                  | Purpose                    |
| ------------------------- | -------------------------- |
| `handleUserSelect`        | Select target user/company |
| `handleDescriptionChange` | Update event description   |
| `handleImageUpload`       | Upload event images        |
| `handleValueChange`       | Update date range          |
| `enviarDatosAFirebase`    | Save event to Firestore    |

#### Event Form Fields

```javascript
{
  nombre: "Event Name",
  descripcion: "Event description text",
  imagenes: ["url1", "url2"],
  fecha: {
    startDate: "2026-01-01",
    endDate: "2026-01-31"
  },
  dispositivos: ["pantalla1", "pantalla2"],
  selectedSection: "Sección 1",
  tiempoDeVisualizacion: {
    hours: 0,
    minutes: 1,
    seconds: 30
  }
}
```

### ConsultaModEvento (Event Query/Edit)

**File**: `src/components/dashboard/consultaModEventos.jsx` (1,756 lines)

Query, edit, and delete existing events.

#### Key Functions

| Function                | Purpose                   |
| ----------------------- | ------------------------- |
| `consultarEventos`      | Search events by criteria |
| `abrirModalEdicion`     | Open edit modal           |
| `guardarCambios`        | Save event modifications  |
| `eliminarEvento`        | Delete event              |
| `handleDateRangeChange` | Filter by date range      |

#### Features

- Date range filtering
- Company filter (SuperAdmin)
- Pagination
- Search by name
- Sorting by columns
- Bulk operations

---

## Data Model

### eventos Collection

```javascript
// Firebase Collection: eventos
{
  // Identity
  id: "auto-generated",
  nombre: "Annual Conference",
  descripcion: "Company annual conference and meeting",

  // Ownership
  empresa: "COMPANY_ID",
  userId: "user_uid",
  userEmail: "user@email.com",

  // Scheduling
  startDate: "2026-01-15",
  endDate: "2026-01-17",

  // Content
  imagenes: [
    "https://storage.url/image1.jpg",
    "https://storage.url/image2.jpg"
  ],

  // Display Configuration
  dispositivos: ["salon_1", "salon_2"],
  selectedScreenName: "Pantalla Salón 1",
  selectedSection: "Sección 1",  // For service screens
  lugar: "A",                     // Location A, B, C

  // Timing
  tiempoDeVisualizacion: {
    hours: 0,
    minutes: 1,
    seconds: 30
  },

  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### TemplateServiciosAvanzado Collection

For advanced service screen events:

```javascript
{
  empresa: "COMPANY_ID",
  selectedScreenName: "Servicio 1",
  selectedSection: "Sección 1",
  image: "https://storage.url/image.jpg",
  lugar: "A",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  visualizationTime: {
    hours: 0,
    minutes: 0,
    seconds: 30
  }
}
```

---

## Event Display Logic

### Filtering Active Events

Events are filtered by current date:

```javascript
const filtrarEventosPorFecha = (eventos) => {
  const fechaActual = new Date();
  return eventos.filter((evento) => {
    const inicio = new Date(evento.startDate);
    const fin = new Date(evento.endDate);
    return fechaActual >= inicio && fechaActual <= fin;
  });
};
```

### Event Rotation

Events rotate based on visualization time:

```javascript
// Set timer for event rotation
const timer = setTimeout(() => {
  setCurrentIndex((prev) => (prev + 1) % eventos.length);
}, evento.tiempoDeVisualizacion.seconds * 1000);
```

### Section-Based Display

Service screens organize events by sections:

```javascript
// Divide events by sections
const eventosSeccion1 = filtrarEventosPorFecha(
  eventosData.filter((e) => e.selectedSection === "Sección 1"),
);
const eventosSeccion2 = filtrarEventosPorFecha(
  eventosData.filter((e) => e.selectedSection === "Sección 2"),
);
const eventosSeccion3 = filtrarEventosPorFecha(
  eventosData.filter((e) => e.selectedSection === "Sección 3"),
);
```

---

## Real-Time Updates

Events use Firebase `onSnapshot` for real-time display:

```javascript
// Subscribe to events for company
const eventosRef = collection(db, "eventos");
const eventosQuery = query(eventosRef, where("empresa", "==", empresa));

onSnapshot(eventosQuery, (snapshot) => {
  const eventosData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Filter and display active events
  const activeEvents = filtrarEventosPorFecha(eventosData);
  setEventos(activeEvents);
});
```

---

## Screen Assignment

### Device Selection

Events can target specific screens:

```javascript
// User's available screens
const pantallasDisponibles = [
  { value: "salon_1", label: "Pantalla Salón 1" },
  { value: "salon_2", label: "Pantalla Salón 2" },
  { value: "direc_1", label: "Pantalla Directorio 1" },
];

// Multi-select for device assignment
<Select
  isMulti
  options={pantallasDisponibles}
  onChange={(selected) => setDispositivos(selected)}
/>;
```

### Screen Filtering

Screens filter events assigned to them:

```javascript
// Screen checks if event is assigned to it
const eventosParaPantalla = eventos.filter((evento) =>
  evento.dispositivos.includes(screenId),
);
```

---

## Image Management

### Upload Process

```javascript
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Image too large (max 5MB)", "error");
      continue;
    }

    // Upload to Firebase Storage
    const storageRef = ref(
      storage,
      `eventos/${empresa}/${Date.now()}_${file.name}`,
    );
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setImagenes((prev) => [...prev, url]);
  }
};
```

### Image Display

Events can have multiple images that rotate:

```javascript
// Rotate through event images
useEffect(() => {
  if (evento.imagenes.length > 1) {
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % evento.imagenes.length);
    }, 5000); // 5 second rotation

    return () => clearInterval(interval);
  }
}, [evento.imagenes]);
```

---

## Date Picker Integration

Uses `react-tailwindcss-datepicker`:

```javascript
import Datepicker from "react-tailwindcss-datepicker";

<Datepicker
  value={dateRange}
  onChange={handleValueChange}
  showShortcuts={true}
  configs={{
    shortcuts: {
      today: "Hoy",
      yesterday: "Ayer",
      past: (period) => `Últimos ${period} días`,
      currentMonth: "Este mes",
      pastMonth: "Mes pasado",
    },
  }}
/>;
```

---

## Mobile Event Cards

For mobile dashboard view:

```javascript
function MobileEventCard({ evento, handleDeleteClick, abrirModalEdicion }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <img src={evento.imagenes[0]} className="w-full h-32 object-cover" />
      <h3 className="font-bold">{evento.nombre}</h3>
      <p className="text-sm text-gray-500">
        {evento.startDate} - {evento.endDate}
      </p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => abrirModalEdicion(evento)}>Editar</button>
        <button onClick={() => handleDeleteClick(evento.id)}>Eliminar</button>
      </div>
    </div>
  );
}
```

---

## Pagination

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

// Calculate pagination
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = eventos.slice(indexOfFirstItem, indexOfLastItem);

// Page navigation
const paginate = (pageNumber) => setCurrentPage(pageNumber);
```

---

## Error Handling

```javascript
const enviarDatosAFirebase = async () => {
  try {
    // Validation
    if (!nombre.trim()) {
      Swal.fire("Error", "Event name required", "error");
      return;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      Swal.fire("Error", "Date range required", "error");
      return;
    }

    // Save to Firebase
    await addDoc(collection(db, "eventos"), eventData);

    Swal.fire("Success", "Event created", "success");
    resetForm();
  } catch (error) {
    console.error("Error creating event:", error);
    Swal.fire("Error", "Failed to create event", "error");
  }
};
```

---

## Related Files

| File                          | Lines | Purpose                   |
| ----------------------------- | ----- | ------------------------- |
| `altaEventos.jsx`             | 1,125 | Event creation form       |
| `consultaModEventos.jsx`      | 1,756 | Event query/edit          |
| `PantallaBaseSalon.jsx`       | 726   | Event display (Salon)     |
| `PantallaBaseDirectorio.jsx`  | 923   | Event display (Directory) |
| `pantallaDeServicio/page.jsx` | 448   | Service screen events     |

---

_See [Screen Types](../screens/SCREEN-TYPES.md) for event display on different screens._
