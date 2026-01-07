# 📱 Device Management Documentation

> Managing Android TV devices in Upper Digital Signage

---

## Overview

The device management system allows linking Android TV devices to the platform, configuring what content they display, and monitoring their status in real-time.

---

## Device Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   WAITING    │────►│   LINKING    │────►│   LINKED     │
│  (new device)│     │ (code entry) │     │  (active)    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ CONFIGURED   │
                                          │(screen set)  │
                                          └──────────────┘
```

### Device States

| State        | Description                               |
| ------------ | ----------------------------------------- |
| `waiting`    | Device generated code, waiting for link   |
| `linked`     | Device connected to user/company          |
| `configured` | Device has screen assignment              |
| `offline`    | Device not responding (heartbeat timeout) |

---

## Core Components

### DevicesList

**File**: `src/components/DevicesList.jsx` (702 lines)

Main device management interface showing all linked devices.

#### Key Functions

| Function                | Purpose                               |
| ----------------------- | ------------------------------------- |
| `fetchEmpresas`         | Load available companies (SuperAdmin) |
| `getStatusColor`        | Determine status indicator color      |
| `getStatusText`         | Get translated status label           |
| `handleDeleteDevice`    | Remove device from system             |
| `handleConfigureDevice` | Open configuration modal              |
| `getScreenName`         | Get human-readable screen name        |

#### Device Card Layout

```
┌─────────────────────────────────────────────────────────┐
│  DEVICE CODE: ABC123                    ● Online        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Assigned: Pantallas Salón - Pantalla 1                │
│  Last Seen: 5 minutes ago                              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Configure│  │   View   │  │  Delete  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### DeviceConfiguration

**File**: `src/components/DeviceConfiguration.jsx` (668 lines)

Modal for assigning screens to devices.

#### Available Screen Types

```javascript
const screenTypes = [
  { value: "salon", label: "Pantallas Salón" },
  { value: "directorio", label: "Pantallas Directorio" },
  { value: "tarifario", label: "Pantallas Tarifario" },
  { value: "vuelos", label: "Pantallas Vuelos" },
  { value: "promociones", label: "Pantallas Promociones" },
];
```

#### Screen Selection Logic

```javascript
// Get available screens based on user's configuration
const getAvailableScreenTypes = () => {
  const types = [];

  if (userData.pantallaSalon?.length > 0) {
    types.push({ type: "salon", screens: userData.pantallaSalon });
  }
  // ... check other types

  return types;
};
```

### DeviceLinker

**File**: `src/components/DeviceLinker.jsx` (~500 lines)

Interface for linking new devices using codes.

#### Linking Flow

1. User enters 6-character device code
2. System searches for device with matching code
3. If found and `status === 'waiting'`, link is established
4. Device receives user data and company assignment

---

## Device Manager Utility

**File**: `src/utils/deviceManager.js` (549 lines)

Central utility for all device operations.

### Key Functions

#### `linkDevice(deviceCode, userId, userData)`

Links a device to a user and company:

```javascript
const updateData = {
  status: "linked",
  ownerId: userId,
  ownerEmail: userData.email,
  empresa: userData.empresa, // Company assignment
  linkedAt: serverTimestamp(),
  userData: userData,
};
```

#### `unlinkDevice(deviceCode, userId, isAdmin)`

Resets device to waiting state:

```javascript
const resetData = {
  status: "waiting",
  ownerId: null,
  ownerEmail: null,
  empresa: null,
  linkedAt: null,
  userData: null,
  configuration: null,
};
```

#### `subscribeToCompanyDevices(empresa, callback)`

Real-time subscription to company devices:

```javascript
const q = query(collection(db, "devices"), where("empresa", "==", empresa));
return onSnapshot(q, (snapshot) => {
  callback(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});
```

#### `updateDeviceConfiguration(deviceId, config)`

Assigns screen to device:

```javascript
await updateDoc(deviceRef, {
  configuration: {
    type: screenType,
    screenId: screenId,
    screenNumber: parseInt(screenId),
    autoStart: true,
    configuredAt: serverTimestamp(),
  },
});
```

---

## Firebase Data Model

### devices Collection

```javascript
// Document ID: Auto-generated
{
  // Identity
  code: "ABC123",               // 6-char linking code

  // Ownership
  ownerId: "user_uid",
  ownerEmail: "user@email.com",
  empresa: "COMPANY_ID",

  // Status
  status: "linked",             // waiting | linked
  linkedAt: Timestamp,

  // Configuration
  configuration: {
    type: "salon",
    screenId: "1",
    screenNumber: 1,
    screenName: "Pantallas Salón 1",
    autoStart: true,
    configuredAt: Timestamp
  },

  // User Data (synced)
  userData: {
    email: "user@email.com",
    empresa: "COMPANY_ID",
    permisos: 1,
    // ... other user fields
  },

  // Monitoring
  lastSeen: Timestamp,
  lastSynced: Timestamp,

  // Device Info
  deviceInfo: {
    platform: "android",
    appVersion: "1.0.0"
  },

  // Timestamps
  createdAt: Timestamp,
  lastUpdated: Timestamp
}
```

---

## Company-Level Device Management

Devices are linked to companies (`empresa`) for multi-tenancy:

```javascript
// All company users can see company devices
const q = query(
  collection(db, "devices"),
  where("empresa", "==", userData.empresa),
);
```

### Sync to All Company Devices

```javascript
// When user data changes, sync to all company devices
export const syncUserDataToCompanyDevices = async (empresa, userData) => {
  const q = query(
    collection(db, "devices"),
    where("empresa", "==", empresa),
    where("status", "==", "linked"),
  );

  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { userData, lastSynced: serverTimestamp() });
  });
  await batch.commit();
};
```

---

## Heartbeat System

**File**: `src/hook/useHeartbeat.js` (186 lines)

Monitors device connectivity.

### How It Works

1. Android TV app sends heartbeat every 30 seconds
2. Dashboard checks `lastSeen` timestamp
3. If >5 minutes without heartbeat, shows "offline"

### Status Indicators

| Status  | Color  | Condition            |
| ------- | ------ | -------------------- |
| Online  | Green  | lastSeen < 2 minutes |
| Idle    | Yellow | lastSeen 2-5 minutes |
| Offline | Red    | lastSeen > 5 minutes |

```javascript
const getStatusColor = (status, lastSeen) => {
  if (status !== "linked") return "gray";

  const minutesAgo = (Date.now() - lastSeen) / 60000;
  if (minutesAgo < 2) return "green";
  if (minutesAgo < 5) return "yellow";
  return "red";
};
```

---

## Device Code Generation

```javascript
export const generateDeviceCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Ensure uniqueness
export const generateUniqueDeviceCode = async () => {
  let code;
  let attempts = 0;

  while (attempts < 10) {
    code = generateDeviceCode();
    const exists = await isCodeExists(code);
    if (!exists) return code;
    attempts++;
  }
  throw new Error("Could not generate unique code");
};
```

---

## Permission Checks

```javascript
export const checkDevicePermissions = async (deviceCode, userId, isAdmin) => {
  const device = await getDevice(deviceCode);

  // Can manage if:
  // 1. Is SuperAdmin
  // 2. Is device owner
  // 3. Device is in 'waiting' state
  const hasPermission =
    isAdmin || device.ownerId === userId || device.status === "waiting";

  return { hasPermission, deviceData: device };
};
```

---

## Remote Commands

Send commands to devices from dashboard:

```javascript
export const sendRemoteCommand = async (deviceId, screenType, screenId) => {
  await updateDoc(deviceRef, {
    configuration: {
      type: screenType,
      screenId: screenId,
      assignedAt: serverTimestamp(),
    },
  });
};
```

The Android TV app listens for configuration changes and updates immediately.

---

## Error Handling

```javascript
try {
  await linkDevice(code, userId, userData);
} catch (error) {
  if (error.message === "Dispositivo no encontrado") {
    Swal.fire("Error", "Device not found", "error");
  } else if (error.message.includes("ya está vinculado")) {
    Swal.fire("Error", "Device already linked", "error");
  }
}
```

---

## Related Files

| File                      | Lines | Purpose                  |
| ------------------------- | ----- | ------------------------ |
| `DevicesList.jsx`         | 702   | List and manage devices  |
| `DeviceConfiguration.jsx` | 668   | Configure device screens |
| `DeviceLinker.jsx`        | ~500  | Link new devices         |
| `DeviceLinkingModal.jsx`  | ~500  | Linking modal UI         |
| `DeviceCard.jsx`          | ~400  | Device display card      |
| `deviceManager.js`        | 549   | Core device utilities    |
| `useDeviceSync.js`        | ~300  | Real-time sync hook      |
| `useHeartbeat.js`         | 186   | Connectivity monitoring  |

---

_See [Firebase Integration](../technical/FIREBASE-INTEGRATION.md) for database details._
