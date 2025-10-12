import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { mapService, locationService } from '@/services';

interface MapViewProps {
  lat?: number;
  lng?: number;
  title?: string;
  height?: string;
  showDirections?: boolean;
}

export function MapView({
  lat,
  lng,
  title = 'Location',
  height = '400px',
  showDirections = true,
}: MapViewProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );
  const [loading, setLoading] = useState(!coordinates);

  const loadLocation = useCallback(async () => {
    try {
      const coords = await locationService.getCoordinates();
      setCoordinates(coords);
    } catch (err) {
      console.error('Map location error:', err);
      // Fallback to Polokwane
      setCoordinates({ lat: -23.9, lng: 29.45 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!coordinates) {
      loadLocation();
    }
  }, [coordinates, loadLocation]);

  if (loading || !coordinates) {
    return (
      <div
        className="bg-gray-200 rounded-lg animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <MapPin className="w-8 h-8 text-gray-400" />
      </div>
    );
  }

  const embedUrl = mapService.getGoogleMapsEmbedUrl(coordinates.lat, coordinates.lng);
  const directionsUrl = mapService.getDirectionsUrl(coordinates.lat, coordinates.lng);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-limpopo-green text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        {showDirections && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm hover:underline"
          >
            <Navigation className="w-4 h-4 mr-1" />
            Directions
          </a>
        )}
      </div>
      <div style={{ height }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title}
        />
      </div>
    </div>
  );
}
