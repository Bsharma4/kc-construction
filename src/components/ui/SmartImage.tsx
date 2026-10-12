import { useState, type ImgHTMLAttributes } from 'react'
import { unsplash } from '../../lib/images'

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  /** Unsplash photo id */
  photo: string
  width?: number
  alt: string
  imgClassName?: string
  eager?: boolean
}

/** Lazy, responsive Unsplash image with a graceful architectural placeholder. */
export function SmartImage({ photo, width = 1400, alt, className = '', imgClassName = '', eager, style, ...rest }: Props) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const srcSet = [480, 800, 1200, 1800]
    .filter((w) => w <= Math.max(width, 480) * 1.5)
    .map((w) => `${unsplash(photo, w)} ${w}w`)
    .join(', ')
  return (
    <div className={`img-fallback relative overflow-hidden ${className}`} style={style}>
      {state !== 'error' && (
        <img
          src={unsplash(photo, width)}
          srcSet={srcSet}
          sizes={`(max-width: 768px) 100vw, ${Math.min(width, 1400)}px`}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('error')}
          className={`h-full w-full object-cover transition-opacity duration-700 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...rest}
        />
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex items-end p-4" role="img" aria-label={alt}>
          <span className="eyebrow !text-[0.6rem] text-concrete">{alt}</span>
        </div>
      )}
    </div>
  )
}
