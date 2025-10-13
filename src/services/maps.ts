import { getEnvVar } from './utils';
import type { MapViewConfig } from './types';

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  description?: string;
}

/**
 * Enhanced Map Service supporting Mapbox with fallbacks
 * Displays interactive and static maps with markers for local services and events
 * Mapbox free tier: 50,000 map loads/month, 100,000 geocoding requests/month
 */

/**
 * Get Mapbox access token with validation
 */
export function getMapboxToken(): string | null {
  const token = getEnvVar('VITE_MAPBOX_TOKEN');
  if (!token) {
    console.warn('Mapbox token not configured - falling back to OpenStreetMap');
    return null;
  }
  return token;
}

/**
 * Get Mapbox style URL for interactive maps
 */
export function getMapboxStyleUrl(token?: string): string | null {
  const mapboxToken = token || getMapboxToken();
  if (!mapboxToken) return null;
  
  // Default to Mapbox Streets v11 style
  return `mapbox://styles/mapbox/streets-v11`;
}

/**
 * Generate Mapbox static map URL
 */
export function getMapboxStaticUrl(
  lat: number,
  lng: number,
  zoom: number = 12,
  width: number = 600,
  height: number = 400,
  token?: string
): string | null {
  const mapboxToken = token || getMapboxToken();
  if (!mapboxToken) return null;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${mapboxToken}`;
}

/**
 * Generate Mapbox static map URL with marker
 */
export function getMapboxStaticUrlWithMarker(
  lat: number,
  lng: number,
  zoom: number = 12,
  width: number = 600,
  height: number = 400,
  markerColor: string = 'ff0000',
  token?: string
): string | null {
  const mapboxToken = token || getMapboxToken();
  if (!mapboxToken) return null;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+${markerColor}(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}?access_token=${mapboxToken}`;
}

/**
 * Get Google Maps directions URL
 */
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Get OpenStreetMap embed URL (free alternative)
 */
export function getOpenStreetMapEmbedUrl(lat: number, lng: number, zoom: number = 12): string {
  const bbox = calculateBoundingBox(lat, lng, zoom);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.west},${bbox.south},${bbox.east},${bbox.north}&layer=mapnik&marker=${lat},${lng}`;
}

/**
 * Calculate bounding box for a given center point and zoom level
 */
function calculateBoundingBox(lat: number, lng: number, zoom: number) {
  // Approximate degree span based on zoom level
  const degreeSpan = 360 / Math.pow(2, zoom);
  const latSpan = degreeSpan * 0.5;
  const lngSpan = degreeSpan * 0.7; // Adjust for latitude compression
  
  return {
    north: lat + latSpan,
    south: lat - latSpan,
    east: lng + lngSpan,
    west: lng - lngSpan
  };
}

/**
 * Calculate distance between two coordinates (in km) using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Default map configuration for South Africa/Limpopo
 */
export const DEFAULT_MAP_CONFIG: MapViewConfig = {
  center: [29.45, -23.9], // [lng, lat] for Polokwane, Limpopo
  zoom: 10,
  pitch: 0,
  bearing: 0
};

/**
 * Legacy class for backwards compatibility
 */
export class MapService {
  private readonly mapboxToken: string | undefined;

  constructor() {
    this.mapboxToken = getMapboxToken() || undefined;
  }

  getMapboxStaticUrl(
    lat: number,
    lng: number,
    zoom: number = 12,
    width: number = 600,
    height: number = 400
  ): string | null {
    return getMapboxStaticUrl(lat, lng, zoom, width, height, this.mapboxToken);
  }

  getMapboxStaticUrlWithMarker(
    lat: number,
    lng: number,
    zoom: number = 12,
    width: number = 600,
    height: number = 400
  ): string | null {
    return getMapboxStaticUrlWithMarker(lat, lng, zoom, width, height, 'ff0000', this.mapboxToken);
  }

  getMapboxEmbedUrl(lat: number, lng: number): string {
    return getOpenStreetMapEmbedUrl(lat, lng);
  }

  getGoogleMapsEmbedUrl(lat: number, lng: number, zoom: number = 12): string {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }

  getDirectionsUrl(lat: number, lng: number): string {
    return getDirectionsUrl(lat, lng);
  }

  getOpenStreetMapEmbedUrl(lat: number, lng: number): string {
    return getOpenStreetMapEmbedUrl(lat, lng);
  }

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    return calculateDistance(lat1, lng1, lat2, lng2);
  }
}

export const mapService = new MapService();
