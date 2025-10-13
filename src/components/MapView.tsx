import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';
import { getMapboxToken, getDirectionsUrl, getOpenStreetMapEmbedUrl, isValidCoordinates, DEFAULT_MAP_CONFIG } from '@/services/maps';
import { locationService } from '@/services';

// Lazy load Mapbox component to avoid loading heavy library unless needed
const MapboxMap = lazy(() => import('./MapboxMap'));

interface MapViewProps {
  lat?: number;
  lng?: number;
  title?: string;
  height?: string;
  showDirections?: boolean;
  zoom?: number;
  interactive?: boolean;
  className?: string;
}

type MapState = 'loading' | 'mapbox' | 'osm' | 'error';

export function MapView({
  lat,
  lng,
  title = 'Location',
  height = '400px',
  showDirections = true,
  zoom = 12,
  interactive = true,
  className = ''
}: MapViewProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [mapState, setMapState] = useState<MapState>('loading');
  const [mapboxError, setMapboxError] = useState<string | null>(null);

  // Determine which map provider to use
  const determineMapProvider = useCallback(() => {
    const mapboxToken = getMapboxToken();
    if (mapboxToken && interactive) {
      setMapState('mapbox');
    } else {
      setMapState('osm');
    }
  }, [interactive]);

  // Load location if not provided
  const loadLocation = useCallback(async () => {
    if (coordinates) return;

    try {
      const coords = await locationService.getCoordinates();
      if (isValidCoordinates(coords.lat, coords.lng)) {
        setCoordinates(coords);
      } else {
        throw new Error('Invalid coordinates from location service');
      }
    } catch (err) {
      console.warn('Map location error, using default:', err);
      // Fallback to Polokwane, Limpopo
      setCoordinates({ 
        lat: DEFAULT_MAP_CONFIG.center[1], 
        lng: DEFAULT_MAP_CONFIG.center[0] 
      });
    }
  }, [coordinates]);

  useEffect(() => {
    loadLocation().then(() => {
      determineMapProvider();
    });
  }, [loadLocation, determineMapProvider]);

  // Handle Mapbox loading errors
  const handleMapboxError = useCallback((error: string) => {
    console.warn('Mapbox error, falling back to OSM:', error);
    setMapboxError(error);
    setMapState('osm');
  }, []);

  // Loading state
  if (mapState === 'loading' || !coordinates) {
    return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
        <div className="bg-limpopo-green text-white px-4 py-3">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            <h3 className="font-semibold">{title}</h3>
          </div>
        </div>
        <div 
          className="bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ height }}
        >
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  const directionsUrl = getDirectionsUrl(coordinates.lat, coordinates.lng);

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-limpopo-green text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">{title}</h3>
          {mapState === 'osm' && (
            <span className="ml-2 text-xs bg-limpopo-green-light px-2 py-1 rounded">
              {mapboxError ? 'Fallback Mode' : 'OpenStreetMap'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {showDirections && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded px-2 py-1"
              aria-label={`Get directions to ${title}`}
            >
              <Navigation className="w-4 h-4 mr-1" />
              Directions
            </a>
          )}
        </div>
      </div>

      {/* Map Content */}
      <div style={{ height }} className="relative">
        {mapState === 'mapbox' ? (
          <Suspense fallback={<MapLoadingFallback height={height} />}>
            <MapboxMap
              latitude={coordinates.lat}
              longitude={coordinates.lng}
              zoom={zoom}
              height={height}
              title={title}
              onError={handleMapboxError}
            />
          </Suspense>
        ) : (
          <OSMFallbackMap
            lat={coordinates.lat}
            lng={coordinates.lng}
            title={title}
            height={height}
            zoom={zoom}
          />
        )}

        {/* Attribution */}
        <div className="absolute bottom-0 right-0 bg-white bg-opacity-90 text-xs p-2 text-gray-600">
          {mapState === 'mapbox' ? (
            <span>© <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Mapbox</a></span>
          ) : (
            <span>© <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer" className="hover:underline">OpenStreetMap</a></span>
          )}
        </div>

        {/* Error indicator */}
        {mapboxError && (
          <div className="absolute top-2 left-2 bg-yellow-100 border border-yellow-300 rounded p-2 text-sm text-yellow-800 flex items-start max-w-xs">
            <AlertTriangle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>Interactive map unavailable, showing static map</span>
          </div>
        )}
      </div>
    </div>
  );
}

// OSM Fallback Component
function OSMFallbackMap({ 
  lat, 
  lng, 
  title, 
  height, 
  zoom 
}: { 
  lat: number; 
  lng: number; 
  title: string; 
  height: string; 
  zoom: number;
}) {
  const embedUrl = getOpenStreetMapEmbedUrl(lat, lng, zoom);

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`${title} - OpenStreetMap`}
      className="w-full h-full"
    />
  );
}

// Loading fallback component
function MapLoadingFallback({ height }: { height: string }) {
  return (
    <div 
      className="bg-gray-100 flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-limpopo-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Loading interactive map...</p>
      </div>
    </div>
  );
}
