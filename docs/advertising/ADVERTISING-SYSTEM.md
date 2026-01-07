# 📢 Advertising System Documentation

> Managing advertisements across digital signage screens

---

## Overview

The advertising system allows users to create, schedule, and display promotional content (images and videos) on their digital signage screens. Ads can be targeted to specific screen types and orientations.

---

## Components

### PublicidadDirec (Directory Ads)

**File**: `src/components/dashboard/publicidadDirec.jsx` (1,261 lines)

Manages advertisements for directory screens.

#### Key Functions

| Function                   | Purpose                     |
| -------------------------- | --------------------------- |
| `obtenerEmpresas`          | Load companies (SuperAdmin) |
| `obtenerPublicidades`      | Fetch existing ads          |
| `handleAgregarPublicidad`  | Add new advertisement       |
| `handleGuardarCambios`     | Save ad modifications       |
| `handleEliminarPublicidad` | Remove advertisement        |
| `handleImagenSelect`       | Handle image upload         |
| `handleVideoUploaded`      | Handle video upload         |

### PublicidadSalon (Salon Ads)

**File**: `src/components/dashboard/publicidadSalon.jsx` (~1,000 lines)

Manages advertisements for salon/event screens.

---

## Ad Types

| Type  | Supported Formats | Max Size |
| ----- | ----------------- | -------- |
| Image | JPG, PNG, WebP    | 5MB      |
| Video | MP4, WebM         | 50MB     |

---

## Data Model

### publicidadDirectorio Collection

```javascript
// Firebase Collection: publicidadDirectorio
{
  // Identity
  id: "auto-generated",
  empresa: "COMPANY_ID",

  // Content
  tipo: "imagen",  // or "video"
  url: "https://storage.url/ad.jpg",

  // Targeting
  tipoPantalla: ["horizontal", "vertical"],  // Screen orientations
  pantallas: ["direc_1", "direc_2"],         // Specific screens

  // Timing
  tiempo: 10,  // Display duration in seconds

  // Scheduling
  activo: true,
  startDate: "2026-01-01",
  endDate: "2026-12-31",

  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### publicidadSalon Collection

```javascript
{
  empresa: "COMPANY_ID",
  tipo: "imagen",
  url: "https://storage.url/ad.jpg",
  tiempo: 15,
  pantallas: ["salon_1", "salon_2"],
  activo: true
}
```

---

## Ad Display Flow

```
┌─────────────────────────────────────────────────────────┐
│                    ADVERTISEMENT SLIDER                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Load ads for current screen                         │
│           ↓                                             │
│  2. Filter by screen type/orientation                   │
│           ↓                                             │
│  3. Filter by date range (active)                       │
│           ↓                                             │
│  4. Start rotation with configured timing               │
│           ↓                                             │
│  5. Display current ad (image/video)                    │
│           ↓                                             │
│  6. Wait for duration (tiempo)                          │
│           ↓                                             │
│  7. Move to next ad                                     │
│           ↓                                             │
│  8. Loop back to step 4                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Slider Components

### SliderPublicidadPD

**File**: `src/components/sliderPublicidadPD.jsx` (13,987 bytes)

Advertisement slider for directory screens.

```javascript
function SliderPublicidadPD({ empresa, orientation }) {
  const [publicidades, setPublicidades] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Subscribe to ads for this company and orientation
    const q = query(
      collection(db, "publicidadDirectorio"),
      where("empresa", "==", empresa),
      where("tipoPantalla", "array-contains", orientation),
    );

    return onSnapshot(q, (snapshot) => {
      setPublicidades(snapshot.docs.map((d) => d.data()));
    });
  }, [empresa, orientation]);

  // Rotation logic
  useEffect(() => {
    if (publicidades.length === 0) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % publicidades.length);
    }, publicidades[currentIndex].tiempo * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, publicidades]);

  return (
    <div className="ad-slider">
      {publicidades[currentIndex]?.tipo === "video" ? (
        <VideoPlayer src={publicidades[currentIndex].url} />
      ) : (
        <img src={publicidades[currentIndex]?.url} />
      )}
    </div>
  );
}
```

### SliderPublicidadPS

**File**: `src/components/sliderPublicidadPS.jsx` (7,363 bytes)

Advertisement slider for salon screens.

---

## Video Handling

### VideoUploader Component

**File**: `src/components/VideoUploader.jsx` (7,363 bytes)

Handles video uploads with:

- File validation
- Size checking
- Progress indicator
- Firebase Storage upload

### VideoPlayer Component

**File**: `src/components/VideoPlayer.jsx` (5,411 bytes)

Plays video ads with:

- Auto-play
- Loop support
- Muted by default
- End event handling

```javascript
function VideoPlayer({ src, onEnded }) {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play();
  }, [src]);

  return <video ref={videoRef} src={src} autoPlay muted onEnded={onEnded} />;
}
```

### Video Caching

**File**: `src/utils/videoCache.js` (7,340 bytes)

Caches videos locally for better performance:

```javascript
// Cache video in IndexedDB
const cacheVideo = async (url) => {
  const cached = await getFromCache(url);
  if (cached) return cached;

  const response = await fetch(url);
  const blob = await response.blob();
  await saveToCache(url, blob);

  return URL.createObjectURL(blob);
};
```

---

## Image Handling

### Image Upload

```javascript
const handleImagenSelect = async (event, index) => {
  const file = event.target.files[0];

  // Validate
  if (file.size > 5 * 1024 * 1024) {
    Swal.fire("Error", "Image too large (max 5MB)", "error");
    return;
  }

  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    setPreviewUrl(e.target.result);
  };
  reader.readAsDataURL(file);

  // Store file for upload
  setSelectedFile(file);
};
```

### Image Upload to Storage

```javascript
const uploadImage = async (file, empresa) => {
  const filename = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `publicidad/${empresa}/${filename}`);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
```

---

## Screen Orientation Filtering

```javascript
// Filter ads by screen orientation
const handlePublicidadLandscapeChange = (event) => {
  const publicidadesFiltradas = publicidades.filter((p) =>
    p.tipoPantalla.includes("horizontal"),
  );
  setPublicidadesLandscape(publicidadesFiltradas);
};

const handlePublicidadPortraitChange = (event) => {
  const publicidadesFiltradas = publicidades.filter((p) =>
    p.tipoPantalla.includes("vertical"),
  );
  setPublicidadesPortrait(publicidadesFiltradas);
};
```

---

## CRUD Operations

### Create Ad

```javascript
const handleAgregarPublicidad = async () => {
  // Upload media
  const url = selectedFile.type.startsWith("video")
    ? await uploadVideo(selectedFile, empresa)
    : await uploadImage(selectedFile, empresa);

  // Create document
  await addDoc(collection(db, "publicidadDirectorio"), {
    empresa,
    tipo: selectedFile.type.startsWith("video") ? "video" : "imagen",
    url,
    tiempo: parseInt(tiempo),
    tipoPantalla: selectedOrientations,
    activo: true,
    createdAt: serverTimestamp(),
  });

  Swal.fire("Success", "Ad created", "success");
};
```

### Update Ad

```javascript
const handleGuardarCambios = async (index) => {
  const publicidad = publicidades[index];

  let url = publicidad.url;
  if (newFile) {
    url = await uploadMedia(newFile, empresa);
  }

  await updateDoc(doc(db, "publicidadDirectorio", publicidad.id), {
    url,
    tiempo: parseInt(tiempo),
    tipoPantalla: selectedOrientations,
    updatedAt: serverTimestamp(),
  });
};
```

### Delete Ad

```javascript
const handleEliminarPublicidad = async (publicidadId) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
  });

  if (result.isConfirmed) {
    await deleteDoc(doc(db, "publicidadDirectorio", publicidadId));
    Swal.fire("Deleted", "Ad removed successfully", "success");
  }
};
```

---

## Ad Validation

```javascript
const isValidData = (index) => {
  const pub = publicidades[index];

  // Must have media
  if (!pub.url && !pub.newFile) return false;

  // Must have duration
  if (!pub.tiempo || pub.tiempo < 1) return false;

  // Must target at least one orientation
  if (!pub.tipoPantalla || pub.tipoPantalla.length === 0) return false;

  return true;
};
```

---

## Company Filter (SuperAdmin)

```javascript
// SuperAdmin can manage ads for any company
const handleEmpresaChange = async (event) => {
  const selectedEmpresa = event.target.value;
  setEmpresa(selectedEmpresa);

  // Reload ads for selected company
  await obtenerPublicidades(selectedEmpresa, currentType);
};
```

---

## Real-Time Sync

Ads update on screens in real-time:

```javascript
// Screen subscribes to ad changes
useEffect(() => {
  const q = query(
    collection(db, "publicidadDirectorio"),
    where("empresa", "==", empresa),
    where("activo", "==", true),
  );

  return onSnapshot(q, (snapshot) => {
    const ads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPublicidades(ads);
  });
}, [empresa]);
```

---

## Related Files

| File                     | Size | Purpose                  |
| ------------------------ | ---- | ------------------------ |
| `publicidadDirec.jsx`    | 48KB | Directory ads management |
| `publicidadSalon.jsx`    | 42KB | Salon ads management     |
| `sliderPublicidadPD.jsx` | 14KB | Directory ad slider      |
| `sliderPublicidadPS.jsx` | 7KB  | Salon ad slider          |
| `VideoUploader.jsx`      | 7KB  | Video upload component   |
| `VideoPlayer.jsx`        | 5KB  | Video playback           |
| `videoCache.js`          | 7KB  | Video caching utility    |

---

_See [Template System](../templates/TEMPLATE-SYSTEM.md) for ad placement in templates._
