import React, { useEffect, useState } from 'react';
import { getFallbackAvatarForCharacter } from '../assets/demoFaces';

interface AvatarImageProps {
  src?: string;
  name: string;
  characterId?: string;
  className?: string;
  alt?: string;
}

/**
 * Robust Avatar component that renders the photo/asset if available,
 * and automatically seamlessly falls back to the in-code vector SVG demo face
 * if the image fails, 404s, or is unavailable offline.
 */
export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  name,
  characterId,
  className = 'w-full h-full object-cover',
  alt
}) => {
  const [hasError, setHasError] = useState(false);
  const fallbackUri = getFallbackAvatarForCharacter(characterId || name);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  // If no source provided or failed to load, use guaranteed in-code vector SVG face
  if (!src || hasError) {
    return (
      <img
        src={fallbackUri}
        alt={alt || name}
        className={className}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
};
