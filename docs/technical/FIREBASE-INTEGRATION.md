# 🔥 Firebase Integration Documentation

> Complete guide to Firebase services used in Upper Digital Signage

---

## Overview

Upper Digital Signage uses Firebase as its complete backend solution:

| Service             | Purpose                        |
| ------------------- | ------------------------------ |
| **Authentication**  | User login, session management |
| **Firestore**       | NoSQL database for all data    |
| **Storage**         | Media files (images, videos)   |
| **Cloud Functions** | Serverless backend logic       |

---

## Firebase Configuration

### Config File

**File**: `src/firebase/firebaseConfig.js`

```javascript
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

### Initialization

```javascript
// src/firebase/firestore.js
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
```

---

## Firestore Collections

### usuarios (Users)

```javascript
// Collection: usuarios
// Document ID: Firebase Auth UID
{
  // Identity
  email: "user@example.com",
  nombre: "John Doe",
  empresa: "COMPANY_ID",

  // Permissions
  permisos: 1,  // 1 = normal, 10 = SuperAdmin
  permisosSecciones: {
    tablero: true,
    altaEventos: true,
    consultaEventos: true,
    pantallasSalon: true,
    pantallasDirectorio: true,
    pantallasPromociones: true,
    pantallasvuelos: true,
    pantallasTarifario: true,
    publicidad: true,
    monitoreo: true,
    datosUsuario: true,
    guiaUsuario: true,
    contactoSoporte: true,
    androidTv: true,
    mensajesDinamicos: true,
    editInformacionTarifa: true
  },

  // Screen Assignments
  pantallaSalon: [1, 2, 3, 4, 5],
  pantallaDirectorio: [1, 2],
  pantallaTarifario: [1],
  pantallaVuelos: [1],
  pantallaPromociones: [1, 2],

  // Named Screens
  NombrePantallasSalon: {
    "1": "Lobby Principal",
    "2": "Sala de Conferencias"
  },
  NombrePantallasServicios: {
    "1": "Servicio Lobby"
  },

  // Metadata
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

### eventos (Events)

```javascript
// Collection: eventos
{
  empresa: "COMPANY_ID",
  userId: "user_uid",

  nombre: "Event Name",
  descripcion: "Event description",
  imagenes: ["url1", "url2"],

  startDate: "2026-01-01",
  endDate: "2026-01-31",

  dispositivos: ["salon_1", "salon_2"],
  tiempoDeVisualizacion: {
    hours: 0, minutes: 1, seconds: 30
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### devices (Android TV Devices)

```javascript
// Collection: devices
{
  code: "ABC123",
  status: "linked",  // waiting | linked

  ownerId: "user_uid",
  ownerEmail: "user@email.com",
  empresa: "COMPANY_ID",

  configuration: {
    type: "salon",
    screenId: "1",
    screenNumber: 1
  },

  userData: { /* synced user data */ },

  lastSeen: Timestamp,
  createdAt: Timestamp
}
```

### Template Collections

| Collection                  | Purpose                           |
| --------------------------- | --------------------------------- |
| `TemplateSalon`             | Salon screen configurations       |
| `TemplateDirectorio`        | Directory screen configurations   |
| `TemplateTarifario`         | Rate board configurations         |
| `TemplatePromociones`       | Promotional screen configurations |
| `TemplateServiciosAvanzado` | Service screen events             |

### Advertising Collections

| Collection             | Purpose              |
| ---------------------- | -------------------- |
| `publicidadDirectorio` | Directory screen ads |
| `publicidadSalon`      | Salon screen ads     |
| `publicidadTarifario`  | Rate board ads       |

### Flight Data Collections

| Collection            | Purpose                    |
| --------------------- | -------------------------- |
| `flightData`          | Cached flight information  |
| `flightErrors`        | API error logs             |
| `hotelDistanceConfig` | Hotel-to-airport distances |
| `cronJobStatus`       | Scheduled job monitoring   |

---

## Authentication

### Auth Setup

**File**: `src/firebase/auth.js`

```javascript
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export default auth;
```

### Login Flow

```javascript
import { signInWithEmailAndPassword } from "firebase/auth";
import auth from "@/firebase/auth";

const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    // Redirect to dashboard
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      // Handle user not found
    } else if (error.code === "auth/wrong-password") {
      // Handle wrong password
    }
  }
};
```

### Auth State Listener

```javascript
import { onAuthStateChanged } from "firebase/auth";

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
      fetchUserData(user.uid);
    } else {
      setUser(null);
      redirect("/login");
    }
  });

  return () => unsubscribe();
}, []);
```

---

## Real-Time Subscriptions

The platform uses `onSnapshot` extensively for real-time updates:

```javascript
import { onSnapshot, query, where, collection } from "firebase/firestore";

// Subscribe to events for a company
const subscribeToEvents = (empresa, callback) => {
  const q = query(collection(db, "eventos"), where("empresa", "==", empresa));

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(events);
  });
};
```

### Common Subscription Patterns

```javascript
// Template configuration subscription
onSnapshot(doc(db, "TemplateSalon", `${empresa}_${screenNumber}`), (doc) => {
  setConfig(doc.data());
});

// Device status subscription
onSnapshot(
  query(collection(db, "devices"), where("empresa", "==", empresa)),
  (snapshot) => setDevices(snapshot.docs.map((d) => d.data())),
);

// Advertising subscription
onSnapshot(
  query(
    collection(db, "publicidadDirectorio"),
    where("empresa", "==", empresa),
  ),
  (snapshot) => setAds(snapshot.docs.map((d) => d.data())),
);
```

---

## Cloud Storage

**File**: `src/firebase/storage.js`

```javascript
import { getStorage } from "firebase/storage";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebaseConfig";

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export default storage;
```

### Upload Files

```javascript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import storage from "@/firebase/storage";

const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// Usage
const url = await uploadImage(
  file,
  `logos/${empresa}/${Date.now()}_${file.name}`,
);
```

### Storage Structure

```
storage/
├── logos/
│   └── {empresa}/
│       └── {filename}
├── eventos/
│   └── {empresa}/
│       └── {filename}
├── publicidad/
│   └── {empresa}/
│       └── {filename}
└── videos/
    └── {empresa}/
        └── {filename}
```

---

## Cloud Functions

**File**: `functions/index.js` (1,665 lines)

### Scheduled Functions

```javascript
const { onSchedule } = require("firebase-functions/v2/scheduler");

// Update flights every 40 minutes
exports.updateFlights40Min = onSchedule(
  {
    schedule: "*/40 * * * *",
    timeZone: "America/Mexico_City",
    memory: "512MiB",
  },
  async (event) => {
    // Fetch flight data from AeroDataBox
    // Update flightData collection
  },
);
```

### HTTP Functions

```javascript
const { onRequest } = require("firebase-functions/v2/https");

// Manual flight data update
exports.testFlightUpdate = onRequest(
  {
    cors: true,
    memory: "512MiB",
  },
  async (req, res) => {
    const airport = req.query.airport || "MEX";
    const flightData = await flightService.getFlightData(airport);
    res.json({ success: true, data: flightData });
  },
);
```

### Document Triggers

```javascript
const { onDocumentWritten } = require("firebase-functions/v2/firestore");

// React to document changes
exports.onDeviceUpdate = onDocumentWritten(
  "devices/{deviceId}",
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Handle device status changes
  },
);
```

---

## Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read their own data
    match /usuarios/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Company-scoped data
    match /eventos/{eventId} {
      allow read: if request.auth != null &&
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresa == resource.data.empresa;
      allow write: if request.auth != null;
    }

    // Devices accessible by company
    match /devices/{deviceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 50 * 1024 * 1024;  // 50MB limit
    }
  }
}
```

---

## Error Handling

```javascript
try {
  await setDoc(doc(db, "collection", docId), data);
} catch (error) {
  if (error.code === "permission-denied") {
    Swal.fire("Error", "Permission denied", "error");
  } else if (error.code === "unavailable") {
    Swal.fire("Error", "Service unavailable", "error");
  } else {
    console.error("Firestore error:", error);
    Swal.fire("Error", "Operation failed", "error");
  }
}
```

---

## Batch Operations

```javascript
import { writeBatch, doc } from "firebase/firestore";

const syncDevices = async (empresa, userData) => {
  const batch = writeBatch(db);

  devices.forEach((device) => {
    const deviceRef = doc(db, "devices", device.id);
    batch.update(deviceRef, {
      userData: userData,
      lastSynced: serverTimestamp(),
    });
  });

  await batch.commit();
};
```

---

## Environment Variables

| Variable                                   | Purpose          |
| ------------------------------------------ | ---------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Auth domain      |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Project ID       |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Storage bucket   |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | App ID           |

---

_See [Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md) for system-wide integration._
