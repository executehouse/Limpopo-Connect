import { useState, useEffect, useCallback } from 'react';
import { imageService, type UnsplashImage } from '@/services';

interface HeroImageBannerProps {
  query?: string;
  height?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

export function HeroImageBanner({
  query = 'community nature africa',
  height = '400px',
  overlay = true,
  children,
}: HeroImageBannerProps) {
  const [image, setImage] = useState<UnsplashImage | null>(null);
  const [loading, setLoading] = useState(true);

  const loadImage = useCallback(async () => {
    try {
      setLoading(true);
      const imageData = await imageService.getRandomImage(query);
      setImage(imageData);
    } catch (err) {
      console.error('Hero image error:', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  if (loading) {
    return (
      <div
        className="bg-gradient-to-br from-limpopo-green to-limpopo-blue animate-pulse"
        style={{ height }}
      />
    );
  }

  const backgroundImage = image
    ? `url(${image.urls.regular})`
    : 'linear-gradient(to bottom right, var(--limpopo-green), var(--limpopo-blue))';

  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        height,
        backgroundImage,
      }}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      
      {children && (
        <div className="relative z-10 h-full flex items-center justify-center">
          {children}
        </div>
      )}

      {image && (
        <div className="absolute bottom-2 right-2 z-20">
          <a
            href={`https://unsplash.com/@${image.user.username}?utm_source=limpopo_connect&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/80 hover:text-white bg-black/30 px-2 py-1 rounded"
          >
            Photo by {image.user.name}
          </a>
        </div>
      )}
    </div>
  );
}
