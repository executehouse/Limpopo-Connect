import { getEnvVar } from './utils';

export interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  description?: string;
}

/**
 * Map Service supporting Mapbox
 * Displays maps with markers for local services and events
 * Mapbox free tier: 50,000 loads/month
 */
export class MapService {
  private readonly mapboxToken: string | undefined;

  constructor() {
    this.mapboxToken = getEnvVar('VITE_MAPBOX_TOKEN');
  }

  /**
   * Generate Mapbox static map URL
   */
  getMapboxStaticUrl(
    lat: number,
    lng: number,
    zoom: number = 12,
    width: number = 600,
    height: number = 400
  ): string | null {
    if (!this.mapboxToken) {
      console.warn('Mapbox token not configured');
      return null;
    }

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${lng},${lat},${zoom}/${width}x${height}?access_token=${this.mapboxToken}`;
  }

  /**
   * Generate Mapbox static map URL with marker
   */
  getMapboxStaticUrlWithMarker(
    lat: number,
    lng: number,
    zoom: number = 12,
    width: number = 600,
    height: number = 400
  ): string | null {
    if (!this.mapboxToken) {
      console.warn('Mapbox token not configured');
      return null;
    }

    return `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${lng},${lat})/${lng},${lat},${zoom}/${width}x${height}?access_token=${this.mapboxToken}`;
  }

  /**
   * Get iframe embed URL for interactive Mapbox map
   */
  getMapboxEmbedUrl(lat: number, lng: number): string {
    // Note: Mapbox doesn't provide direct iframe embed like Google Maps
    // This returns a URL that can be used with Mapbox GL JS
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.1},${lat - 0.1},${lng + 0.1},${lat + 0.1}&layer=mapnik&marker=${lat},${lng}`;
  }

  /**
   * Get Google Maps embed URL (no API key needed for basic embed)
   */
  getGoogleMapsEmbedUrl(lat: number, lng: number, zoom: number = 12): string {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }

  /**
   * Get directions URL
   */
  getDirectionsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  /**
   * Get OpenStreetMap embed URL (free alternative)
   */
  getOpenStreetMapEmbedUrl(lat: number, lng: number): string {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lng}`;
  }

  /**
   * Calculate distance between two coordinates (in km)
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const mapService = new MapService();
