import { useEffect, useState, type ImgHTMLAttributes } from 'react';

type Props = ImgHTMLAttributes<HTMLImageElement> & { maxRetries?: number };

/**
 * <img> that retries a dropped request.
 *
 * Product photography is hotlinked from a third-party CDN; when the page opens
 * with a burst of requests some of them are aborted by the network layer and the
 * slot would stay empty forever. A failed element gets a fresh, unique URL after
 * a short pause, which recovers the image.
 */
export default function Img({ src, alt = '', maxRetries = 2, ...rest }: Props) {
  const [attempt, setAttempt] = useState(0);

  useEffect(() => setAttempt(0), [src]);

  const url =
    !src || attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}r=${attempt}`;

  return (
    <img
      {...rest}
      src={url}
      alt={alt}
      onError={(event) => {
        if (attempt < maxRetries) {
          window.setTimeout(() => setAttempt((a) => a + 1), 300 * (attempt + 1));
        }
        rest.onError?.(event);
      }}
    />
  );
}
