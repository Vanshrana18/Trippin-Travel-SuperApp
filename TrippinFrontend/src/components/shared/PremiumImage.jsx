import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function PremiumImage({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  overlayText = '', 
  fallbackSrc = null 
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const [status, setStatus] = useState('loading');
  const imgRef = useRef(null);

  // Validate and set the image source
  useEffect(() => {
    const validSrc = getValidSrc(src);
    setImgSrc(validSrc);
    setStatus(validSrc ? 'loading' : 'error');
  }, [src]);

  // Handle cached images that load before React attaches onLoad
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0 && status === 'loading') {
      setStatus('loaded');
    }
  }, [imgSrc, status]);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setStatus('loading');
    } else {
      setStatus('error');
    }
  };

  // Check if a URL is likely to be a valid, working image
  function getValidSrc(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (trimmed.length < 10) return null;
    return trimmed;
  }

  const getGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
      'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      'linear-gradient(135deg, #1b2838 0%, #171a21 100%)'
    ];
    const index = overlayText ? overlayText.length % gradients.length : 0;
    return gradients[index];
  };

  return (
    <div 
      className={`premium-image-container ${className}`} 
      style={{ 
        ...style,
        position: 'relative', 
        overflow: 'hidden',
        background: status === 'error' ? getGradient() : '#1e293b'
      }}
    >
      {/* Loading Shimmer */}
      {status === 'loading' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
      )}

      {/* Actual Image */}
      {status !== 'error' && imgSrc && (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt}
          onError={handleError}
          onLoad={() => setStatus('loaded')}
          className={`premium-image-element ${status === 'loaded' ? 'loaded' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          loading="lazy"
        />
      )}

      {/* Error Fallback UI */}
      {status === 'error' && (
        <div 
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px', textAlign: 'center'
          }}
        >
          <ImageIcon size={32} color="rgba(255,255,255,0.15)" style={{ marginBottom: '12px' }} />
          {overlayText && (
            <span style={{ 
              color: 'rgba(255,255,255,0.6)', 
              fontFamily: 'var(--font-display)', 
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              letterSpacing: '0.02em',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {overlayText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
