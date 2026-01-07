# 🌩️ Cloud Functions Documentation

> Complete guide to Firebase Cloud Functions in Upper Digital Signage

---

## Overview

The Cloud Functions backend (`functions/index.js`) provides serverless backend logic for flight data updates, hotel distances, and system health monitoring.

| Property   | Value                |
| ---------- | -------------------- |
| **File**   | `functions/index.js` |
| **Lines**  | 1,665                |
| **Memory** | 256MiB - 512MiB      |
| **Region** | us-central1          |

---

## Architecture

```
Cloud Functions
├── Scheduled Functions
│   ├── updateFlights40Min      (every 40 minutes)
│   └── cleanupOldData          (daily, if implemented)
│
├── HTTP Functions
│   ├── testFlightUpdate        (manual testing)
│   ├── getFlightData           (data retrieval)
│   ├── getFlightStats          (system stats)
│   ├── systemHealth            (health check)
│   ├── initializeSystemSafety  (paused state init)
│   └── cronControl             (start/stop cron)
│
└── Services
    ├── flightService           (flight data fetching)
    └── hotelDistanceService    (hotel distances)
```

---

## Scheduled Functions

### updateFlights40Min

**Purpose**: Automatically update flight data for all active airports

```javascript
exports.updateFlights40Min = onSchedule(
  {
    schedule: "*/40 * * * *", // Every 40 minutes
    timeZone: "America/Mexico_City",
    memory: "512MiB",
  },
  async (event) => {
    // 1. Check if cron jobs are enabled
    const cronStatus = await db
      .collection("cronJobStatus")
      .doc("flightUpdates")
      .get();

    if (!cronStatus.data()?.enabled) {
      console.log("⏸️ Cron jobs are PAUSED");
      return;
    }

    // 2. Get active airports
    const airports = await getActiveAirports();

    // 3. Fetch and save flight data for each
    for (const airport of airports) {
      const flightData = await flightService.getFlightData(airport);
      await db.collection("flightData").doc(airport).set(flightData);
    }

    // 4. Update hotel distances
    await hotelDistanceService.updateAllHotelDistances();
  },
);
```

### Supported Airports

| Code | Airport                       | Status    |
| ---- | ----------------------------- | --------- |
| MEX  | Mexico City International     | ✅ Active |
| GDL  | Guadalajara International     | ✅ Active |
| CUN  | Cancún International          | ✅ Active |
| MTY  | Monterrey International       | ✅ Active |
| PVR  | Puerto Vallarta International | ✅ Active |

---

## HTTP Functions

### testFlightUpdate

**Purpose**: Manual testing and forced updates

```javascript
exports.testFlightUpdate = onRequest(
  {
    cors: true,
    memory: "512MiB",
  },
  async (req, res) => {
    const airport = req.query.airport || "MEX";
    const forceUpdate = req.query.force === "true";

    // Validate airport
    const validAirports = ["MEX", "GDL", "CUN", "MTY", "PVR"];
    if (!validAirports.includes(airport.toUpperCase())) {
      return res.status(400).json({ error: "Invalid airport" });
    }

    // Fetch data
    const flightData = await flightService.getFlightData(airport);

    // Save if forced
    if (forceUpdate) {
      await db.collection("flightData").doc(airport).set(flightData);
    }

    res.json({
      success: true,
      airport: airport.toUpperCase(),
      data: flightData,
      savedToFirestore: forceUpdate,
    });
  },
);
```

**Endpoints**:

```bash
# Test without saving
GET /testFlightUpdate?airport=MEX

# Test and save to Firestore
GET /testFlightUpdate?airport=MEX&force=true
```

### getFlightData

**Purpose**: Retrieve cached flight data for screens

```javascript
exports.getFlightData = onRequest(
  {
    cors: true,
    memory: "512MiB",
  },
  async (req, res) => {
    const airport = req.query.airport || "MEX";

    // Get from Firestore cache
    const doc = await db.collection("flightData").doc(airport).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "No data for airport" });
    }

    res.json(doc.data());
  },
);
```

### systemHealth

**Purpose**: Health check endpoint

```javascript
exports.systemHealth = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    const cronStatus = await db
      .collection("cronJobStatus")
      .doc("flightUpdates")
      .get();

    res.json({
      status: "healthy",
      cronEnabled: cronStatus.data()?.enabled || false,
      lastRun: cronStatus.data()?.lastRun || null,
      airports: ["MEX", "GDL", "CUN", "MTY", "PVR"],
    });
  },
);
```

### cronControl

**Purpose**: Enable/disable scheduled updates

```javascript
exports.cronControl = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    const action = req.body.action; // "enable" | "disable" | "restart"

    if (action === "enable") {
      await db
        .collection("cronJobStatus")
        .doc("flightUpdates")
        .set({ enabled: true }, { merge: true });
    } else if (action === "disable") {
      await db
        .collection("cronJobStatus")
        .doc("flightUpdates")
        .set({ enabled: false }, { merge: true });
    } else if (action === "restart") {
      // Force immediate update
      await exports.updateFlights40Min();
    }

    res.json({ success: true, action });
  },
);
```

---

## External API Services

### Flight Service

Fetches flight data from external APIs:

```javascript
// services/flightService.js
const flightService = {
  async getFlightData(airport) {
    // Try AeroDataBox API first
    try {
      return await this.fetchFromAeroDataBox(airport);
    } catch (error) {
      console.log("AeroDataBox failed, trying fallback...");
    }

    // Fallback to OpenSky
    try {
      return await this.fetchFromOpenSky(airport);
    } catch (error) {
      console.log("OpenSky failed");
    }

    // Return cached data if all APIs fail
    return this.getCachedData(airport);
  },
};
```

### Hotel Distance Service

Calculates hotel-to-airport distances:

```javascript
// services/hotelDistanceService.js
const hotelDistanceService = {
  async updateAllHotelDistances() {
    const hotels = await db.collection("hotelDistanceConfig").get();

    for (const hotel of hotels.docs) {
      const distance = await this.calculateDistance(
        hotel.data().coordinates,
        hotel.data().airport,
      );

      await hotel.ref.update({
        distance,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  },
};
```

---

## Firestore Collections (Functions)

### cronJobStatus

Control scheduled function execution:

```javascript
// cronJobStatus/flightUpdates
{
  enabled: true,
  lastRun: Timestamp,
  errors: [],
  totalRuns: 1234
}
```

### flightData

Cached flight information:

```javascript
// flightData/MEX
{
  airport: "MEX",
  arrivals: [...],
  departures: [...],
  lastUpdated: Timestamp,
  source: "aerodatabox"
}
```

### flightErrors

Error logging for debugging:

```javascript
// flightErrors/{auto-id}
{
  airport: "MEX",
  error: "API timeout",
  timestamp: Timestamp,
  context: "scheduled_update"
}
```

---

## Safety Features

### Paused by Default

System deploys in paused state:

```javascript
// On deploy, cron is disabled
exports.initializeSystemSafety = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    await db.collection("cronJobStatus").doc("flightUpdates").set({
      enabled: false, // PAUSED
      lastRun: null,
      deployedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ status: "System initialized in PAUSED state" });
  },
);
```

### Check Before Execution

Every scheduled run checks if enabled:

```javascript
// At start of scheduled function
const cronStatus = await db
  .collection("cronJobStatus")
  .doc("flightUpdates")
  .get();

if (!cronStatus.data()?.enabled) {
  console.log("⏸️ Cron jobs are PAUSED - skipping execution");
  return;
}
```

---

## Deployment

### Deploy Commands

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Deploy functions only
firebase deploy --only functions

# View logs
firebase functions:log --only updateFlights40Min
```

### Environment Variables

Set in Firebase Console or via CLI:

```bash
# AeroDataBox API
firebase functions:config:set aerodatabox.key="YOUR_API_KEY"

# OpenSky OAuth2
firebase functions:config:set opensky.client_id="YOUR_ID"
firebase functions:config:set opensky.client_secret="YOUR_SECRET"

# Redeploy after config changes
firebase deploy --only functions
```

---

## Testing

### Local Testing

```bash
# Start Firebase emulator
cd functions
npm run serve

# Test endpoints locally
curl "http://localhost:5001/PROJECT_ID/us-central1/testFlightUpdate?airport=MEX"
```

### Production Testing

```bash
# Test production endpoint
curl "https://us-central1-PROJECT_ID.cloudfunctions.net/testFlightUpdate?airport=MEX"

# Check system health
curl "https://us-central1-PROJECT_ID.cloudfunctions.net/systemHealth"
```

---

## Related Documentation

- [FLIGHT_SYSTEM_README.md](../../FLIGHT_SYSTEM_README.md) - Original flight system docs
- [SECURE_DEPLOYMENT_PLAN.md](../../SECURE_DEPLOYMENT_PLAN.md) - Deployment security

---

_See [Firebase Integration](./FIREBASE-INTEGRATION.md) for Firestore collections and rules._
