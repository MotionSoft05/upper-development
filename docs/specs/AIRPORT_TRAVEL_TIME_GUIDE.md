# Guía de Implementación: Sistema de Tiempos de Viaje al Aeropuerto

Este documento detalla la arquitectura técnica y el flujo de implementación del sistema que calcula el tiempo de viaje desde una ubicación (Hotel) hacia aeropuertos, utilizando Google Maps y un microservicio externo.

## 1. Arquitectura General

El sistema funciona con un flujo de **Frontend ➔ Firestore ➔ Microservicio**:

1.  **Frontend**: El usuario selecciona una ubicación exacta en un mapa interactivo.
2.  **Persistencia**: La configuración se guarda en Firestore (`TemplateVuelos`).
3.  **Activación**: Al guardar, se notifica a un servicio Cloud Run que inicia/actualiza el monitoreo de tráfico para esa ubicación.

---

## 2. Componentes Frontend

### Selector de Mapa (`GoogleMapSelector.jsx`)
Es el componente clave. No solo muestra un mapa, sino que maneja la lógica de geolocalización inversa y autocompletado.

**Props Clave:**
- `location`: Objeto `{ lat, lng, address }` inicial.
- `onLocationChange`: Callback al mover el pin.
- `onConfirmAddress`: Callback para "fijar" la dirección (UX crítica para evitar cambios accidentales).

**Características Técnicas:**
- **Librerías**: Usa la API nativa de Google Maps Javascript (no librerías wrapper pesadas).
- **Places Autocomplete**: Vinculado al input de texto. Al seleccionar una predicción:
    1.  Obtiene `geometry.location`.
    2.  Hace `map.setCenter()` y `map.setZoom(16)`.
    3.  Actualiza el marcador visual.
- **Drag & Drop**: El marcador es `draggable`. Al soltar (`dragend`), hace **Reverse Geocoding** para traducir `lat/lng` a una dirección legible.

### Integración en Dashboard (`PantallasVuelos.jsx`)

El estado se maneja localmente antes de persistir:

```javascript
// Estado en el componente padre
const [distanceConfig, setDistanceConfig] = useState({
  enabled: false,
  hotelLocation: {
    lat: 19.42, 
    lng: -99.16,
    address: "..."
  }
});
```

---

## 3. Flujo de Guardado y Activación (Vital)

Aquí es donde suelen ocurrir los errores de integración. No basta con guardar en Firebase; hay que notificar al servicio calculador.

### Paso A: Guardado en Firestore
Se guarda en la colección de configuración (ej. `TemplateVuelos`):

```javascript
await updateDoc(docRef, {
  distanceConfig: {
    enabled: true,
    hotelLocation: { lat: ..., lng: ... } // Datos CONFIRMADOS del mapa
  }
});
```

### Paso B: Webhook al Microservicio (Cloud Run)
**Este paso es crítico.** Si se omite, el sistema nunca calculará los tiempos.

Se hace un `POST` al servicio `updatehotelairportusage`:

```javascript
if (distanceConfig.enabled && distanceConfig.hotelLocation.lat) {
  const response = await fetch("https://updatehotelairportusage-wsvcv36oca-uc.a.run.app", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      companyId: empresaId, // Identificador único del cliente
      hotelLocation: {
        lat: distanceConfig.hotelLocation.lat,
        lng: distanceConfig.hotelLocation.lng,
        address: distanceConfig.hotelLocation.address
      }
    })
  });
}
```

## 4. Checklist de Debugging (Para el otro proyecto)

Si están teniendo problemas al replicarlo, verifiquen estos puntos:

1.  **¿API Key de Google Maps?**: El proyecto destino debe tener habilitadas las APIs: *Maps JavaScript API*, *Places API* y *Geocoding API*.
2.  **¿CORS en el Webhook?**: Si la llamada al Cloud Run falla desde el navegador, verificar que el servicio Cloud Run tenga configurado CORS para aceptar peticiones desde el dominio del nuevo proyecto.
3.  **Estructura del Payload**: El microservicio espera estrictamente `companyId` y `hotelLocation` con `lat/lng`. Si cambian los nombres de las propiedades, el servicio ignorará la petición.
4.  **Costos**: Este sistema usa *Google Distance Matrix API* en el backend. Asegúrense de que el servicio externo no esté "quemando" cuota innecesariamente (debería tener caché o intervalos de actualización de 15-30 mins).
