import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height: string;
  title?: string;
  onError?: (error: string) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  latitude,
  longitude,
  height,
  title = 'Location',
  onError
}) => {
  // For now, just trigger the fallback since react-map-gl has dependency issues
  React.useEffect(() => {
    onError?.('Mapbox interactive map not available, using fallback');
  }, [onError]);

  return (
    <div className="relative w-full bg-gray-100 flex items-center justify-center" style={{ height }}>
      <div className="text-center p-8">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map Unavailable</h3>
        <p className="text-gray-600 text-sm">
          Falling back to static map view. Location: {title}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      </div>
    </div>
  );
};

export default MapboxMap;