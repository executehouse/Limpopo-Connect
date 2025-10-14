import React, { useState } from 'react';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  initials: string;
  className?: string;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  initials,
  className = '',
  size = 128,
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const showFallback = !src || hasError;

  return (
    <div
      className={`relative rounded-full flex items-center justify-center bg-gradient-to-br from-limpopo-blue to-limpopo-green text-white font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {showFallback ? (
        <span>{initials}</span>
      ) : (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="w-full h-full rounded-full object-cover"
          onError={handleError}
        />
      )}
    </div>
  );
};

export default Avatar;
