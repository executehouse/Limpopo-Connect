import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, NavigationControl, FullscreenControl, ScaleControl } from 'react-map-gl';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import { getMapboxToken, getMapboxStyleUrl } from '@/services/maps';

// Ensure Mapbox CSS is loaded
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height: string;
  title?: string;
  onError?: (error: string) => void;
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  latitude,
  longitude,
  zoom = 12,
  height,
  title = 'Location',
  onError
}) => {
  const [mapboxToken] = useState(() => getMapboxToken());
  const [viewState, setViewState] = useState<ViewState>({
    latitude,
    longitude,
    zoom,
    bearing: 0,
    pitch: 0
  });
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle map errors
  const handleError = useCallback((error: any) => {
    console.error('Mapbox error:', error);
    const errorMessage = error?.message || 'Failed to load interactive map';
    setMapError(errorMessage);
    onError?.(errorMessage);
  }, [onError]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Custom zoom controls for touch-friendly interaction
  const zoomIn = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 20) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 1) }));
  }, []);

  if (!mapboxToken) {
    throw new Error('Mapbox token not available');
  }

  if (mapError) {
    throw new Error(mapError);
  }

  const mapStyle = getMapboxStyleUrl(mapboxToken) || 'mapbox://styles/mapbox/streets-v11';

  return (
    <div className="relative w-full" style={{ height }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onError={handleError}
        onLoad={handleLoad}
        attributionControl={false}
        // Accessibility and touch-friendly settings
        touchZoomRotate={{ around: 'center' }}
        touchPitch={false}
        dragRotate={false}
        pitchWithRotate={false}
        // Performance optimizations
        optimizeForTerrain={false}
        antialias={true}
      >
        {/* Location Marker */}
        <Marker
          latitude={latitude}
          longitude={longitude}
          anchor="bottom"
        >
          <div
            className="flex flex-col items-center cursor-pointer transform hover:scale-110 transition-transform"
            title={title}
          >
            <MapPin className="w-8 h-8 text-red-600 drop-shadow-md" />
          </div>
        </Marker>

        {/* Navigation Controls */}
        <NavigationControl 
          position="top-right" 
          showCompass={false}
          showZoom={true}
        />
        
        {/* Fullscreen Control */}
        <FullscreenControl position="top-right" />
        
        {/* Scale Control */}
        <ScaleControl 
          position="bottom-left"
          maxWidth={100}
          unit="metric"
        />

        {/* Custom Touch-Friendly Zoom Controls */}
        <div className="absolute top-4 left-4 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden md:hidden">
          <button
            onClick={zoomIn}
            className="p-3 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-limpopo-green border-b border-gray-200"
            aria-label="Zoom in"
            type="button"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={zoomOut}
            className="p-3 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-limpopo-green"
            aria-label="Zoom out"
            type="button"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </Map>

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-limpopo-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;