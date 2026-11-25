import React from 'react';
import type { ProjectImage } from '../../data/types';

interface ResponsivePhotoProps {
  image: ProjectImage;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  mode?: 'responsive' | 'lightbox';
  includeDimensions?: boolean;
}

export const ResponsivePhoto: React.FC<ResponsivePhotoProps> = ({
  image,
  sizes,
  className,
  style,
  loading = 'lazy',
  decoding = 'async',
  mode = 'responsive',
  includeDimensions = false,
}) => {
  const dimensionProps = includeDimensions
    ? { width: image.width, height: image.height }
    : {};

  if (mode === 'lightbox' && image.lightboxWebp) {
    return (
      <picture className="responsive-picture">
        <source type="image/webp" srcSet={image.lightboxWebp} />
        <img
          src={image.lightboxJpg || image.src}
          alt={image.alt}
          className={className}
          style={style}
          loading="eager"
          decoding={decoding}
        />
      </picture>
    );
  }

  if (mode === 'responsive' && image.webpSrcSet) {
    return (
      <picture className="responsive-picture">
        <source type="image/webp" srcSet={image.webpSrcSet} sizes={sizes} />
        <img
          src={image.thumbSrc || image.src}
          srcSet={image.jpgSrcSet}
          sizes={sizes}
          alt={image.alt}
          className={className}
          style={style}
          loading={loading}
          decoding={decoding}
          {...dimensionProps}
        />
      </picture>
    );
  }

  return (
    <img
      src={image.src}
      alt={image.alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
      {...dimensionProps}
    />
  );
};
