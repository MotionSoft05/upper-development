"use client";

import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../../utils/googleMapsLoader';

const GoogleMapSelector = ({ 
  location, 
  onLocationChange, 
  onAddressChange,
  onConfirmAddress,
  height = '320px',
  zoom = 15,
  placeholder = "Buscar hotel o dirección..."
}) => {
  
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pendingLocation, setPendingLocation] = useState(null);

  // Coordenadas por defecto (Centro de Ciudad de México)
  const defaultCenter = { lat: 19.4326, lng: -99.1332 };

  useEffect(() => {
    // Delay para asegurar que el mapRef esté disponible
    const timer = setTimeout(() => {
      initializeMap();
    }, 100);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // UseEffect para aplicar ubicaciones pendientes cuando el mapa esté listo
  useEffect(() => {
    if (map && marker && pendingLocation) {
      // console.log('🔄 Aplicando ubicación pendiente:', pendingLocation);
      const { lat, lng, shouldZoom } = pendingLocation;
      
      const position = { lat, lng };
      marker.setPosition(position);
      marker.setVisible(true);
      map.setCenter(position);
      
      if (shouldZoom) {
        map.setZoom(16);
      }
      
      // Limpiar ubicación pendiente
      setPendingLocation(null);
      // console.log('✅ Ubicación pendiente aplicada y limpiada');
    }
  }, [map, marker, pendingLocation]);

  // UseEffect para cargar la dirección guardada en el input cuando se carga desde props
  useEffect(() => {
    if (location.address && searchInputRef.current) {
      searchInputRef.current.value = location.address;
    }
  }, [location.address]);

  // UseEffect adicional para asegurar que la dirección se cargue después de que autocomplete esté listo
  useEffect(() => {
    if (location.address && searchInputRef.current && autocomplete && !isLoading) {
      searchInputRef.current.value = location.address;
    }
  }, [location.address, autocomplete, isLoading]);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // console.log('🗺️ Iniciando carga de Google Maps...');
      // console.log('📍 mapRef.current:', mapRef.current);
      
      // Verificar que mapRef esté disponible antes de cargar Google Maps
      if (!mapRef.current) {
        if (retryCount < 10) {
          // console.log(`❌ mapRef no está disponible, reintentando ${retryCount + 1}/10 en 500ms...`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => initializeMap(), 500);
          return;
        } else {
          // console.log('❌ Máximo de reintentos alcanzado - mapRef nunca estuvo disponible');
          setError('Error: No se pudo cargar el mapa. El elemento DOM no está disponible.');
          setIsLoading(false);
          return;
        }
      }

      // Reset retry count si mapRef está disponible
      setRetryCount(0);

      const google = await loadGoogleMaps();
      // console.log('✅ Google Maps cargado exitosamente:', google);
      
      // Verificar nuevamente después de cargar Google Maps
      if (!mapRef.current) {
        // console.log('❌ mapRef se perdió después de cargar Google Maps');
        setError('Error: Elemento del mapa no disponible');
        setIsLoading(false);
        return;
      }

      // Crear el mapa
      // console.log('🏗️ Creando instancia del mapa...');
      const mapInstance = new google.Map(mapRef.current, {
        center: location.lat && location.lng ? 
          { lat: location.lat, lng: location.lng } : 
          defaultCenter,
        zoom: zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // console.log('✅ Mapa creado exitosamente:', mapInstance);
      setMap(mapInstance);

      // Crear marcador con o sin posición inicial
      let markerInstance;
      
      if (location.lat && location.lng) {
        // Si hay coordenadas iniciales, crear marcador en esa posición
        const initialPosition = { lat: location.lat, lng: location.lng };
        markerInstance = new google.Marker({
          position: initialPosition,
          map: mapInstance,
          draggable: true,
          title: "Ubicación del Hotel"
        });
      } else {
        // Si no hay coordenadas, crear marcador sin posición (se ocultará)
        markerInstance = new google.Marker({
          map: mapInstance,
          draggable: true,
          title: "Ubicación del Hotel",
          visible: false
        });
      }

      setMarker(markerInstance);

      // Evento click en el mapa
      mapInstance.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        updateMapLocation(lat, lng);
        reverseGeocode(lat, lng);
      });

      // Evento drag del marcador
      markerInstance.addListener('dragend', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        updateMapLocation(lat, lng);
        reverseGeocode(lat, lng);
      });

      // Configurar autocompletado del buscador
      if (searchInputRef.current) {
        const autocompleteInstance = new google.places.Autocomplete(
          searchInputRef.current,
          {
            types: ['establishment', 'geocode'],
            componentRestrictions: { country: 'mx' },
            fields: ['place_id', 'geometry', 'name', 'formatted_address']
          }
        );

        setAutocomplete(autocompleteInstance);

        autocompleteInstance.addListener('place_changed', () => {
          const place = autocompleteInstance.getPlace();
          
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // console.log('📍 Moviendo mapa a:', { lat, lng });
            
            // Usar shouldZoom=true para centrar y hacer zoom al lugar seleccionado
            // Pequeño delay para asegurar que el mapa esté listo
            setTimeout(() => {
              updateMapLocation(lat, lng, true);
            }, 100);
            
            onAddressChange(place.formatted_address || place.name);
          } else {
            // console.log('❌ Lugar sin geometría válida');
          }
        });
      }

      setIsLoading(false);

    } catch (err) {
      console.error('Error inicializando Google Maps:', err);
      setError('Error cargando el mapa. Verifique su conexión.');
      setIsLoading(false);
    }
  }; // eslint-disable-line react-hooks/exhaustive-deps

  const updateMapLocation = (lat, lng, shouldZoom = false) => {
    // console.log('🎯 updateMapLocation llamado con:', { lat, lng, shouldZoom });
    // console.log('🗺️ Estado del mapa:', { map: !!map, marker: !!marker });
    
    const position = { lat, lng };
    
    // Si el mapa y marcador están listos, aplicar inmediatamente
    if (map && marker) {
      marker.setPosition(position);
      marker.setVisible(true);
      map.setCenter(position);
      
      if (shouldZoom) {
        map.setZoom(16);
        // console.log('🔍 Zoom aplicado a nivel 16');
      }
      
      // console.log('✅ Ubicación aplicada inmediatamente:', position);
    } else {
      // Si no están listos, guardar como pendiente
      // console.log('⏳ Guardando ubicación como pendiente:', { lat, lng, shouldZoom });
      setPendingLocation({ lat, lng, shouldZoom });
    }

    // Siempre notificar el cambio de ubicación
    onLocationChange({ lat, lng });
    // console.log('📡 onLocationChange llamado con:', { lat, lng });
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const google = await loadGoogleMaps();
      const geocoder = new google.Geocoder();
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          onAddressChange(address);
          
          // Actualizar el input del buscador
          if (searchInputRef.current) {
            searchInputRef.current.value = address;
          }
        }
      });
    } catch (err) {
      console.error('Error en reverse geocoding:', err);
    }
  };


  return (
    <div className="space-y-3">
      {/* Buscador con botón de confirmar */}
      <div className="flex space-x-2 relative">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled={isLoading}
            autoComplete="off"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (onConfirmAddress && location.address) {
              onConfirmAddress();
            }
          }}
          disabled={!location.address || isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
            location.address && !isLoading
              ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Confirmar Dirección
        </button>
      </div>

      {/* Mapa */}
      <div className="relative">
        {/* El div del mapa SIEMPRE se renderiza */}
        <div 
          ref={mapRef} 
          style={{ height }}
          className="w-full rounded-lg border border-gray-300"
        />
        
        {/* Overlay de carga */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Cargando Google Maps...</p>
            </div>
          </div>
        )}

        {/* Overlay de error */}
        {error && (
          <div className="absolute inset-0 bg-red-50 rounded-lg border-2 border-dashed border-red-200 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  initializeMap();
                }}
                className="mt-2 text-xs text-red-800 hover:text-red-900 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
        
        {/* Indicador de ubicación confirmada */}
        {!isLoading && !error && location.lat && location.lng && (
          <div className="absolute top-2 left-2 bg-green-100 border border-green-300 rounded-md px-2 py-1">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-700 font-medium">Ubicación Confirmada</span>
            </div>
          </div>
        )}
      </div>


      {/* Instrucciones */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Use el buscador o haga clic directamente en el mapa para seleccionar ubicación</p>
        <p>• Puede arrastrar el marcador para ajustar la posición exacta</p>
        {location.lat && location.lng && (
          <p className="text-green-600 font-medium">
            • Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleMapSelector;