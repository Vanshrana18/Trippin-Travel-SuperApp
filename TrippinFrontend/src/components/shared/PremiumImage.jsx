import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function PremiumImage({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  overlayText = '', 
  fallbackSrc = null 
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [status, setStatus] = useState('loading'); // 'loading', 'loaded', 'error'

  useEffect(() => {
    setImgSrc(src);
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setStatus('loading');
    } else {
      setStatus('error');
    }
  };

  const handleLoad = () => {
    setStatus('loaded');
  };

  // Generate a random gradient based on the text length or just a static premium one
  const getGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
      'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
      'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      'linear-gradient(135deg, #434343 0%, #000000 100%)'
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
        <div className="premium-image-shimmer absolute inset-0 z-10" />
      )}

      {/* Actual Image */}
      {status !== 'error' && imgSrc && (
        <img
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
          className="premium-image-fallback absolute inset-0 z-20 flex flex-col items-center justify-center"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '20px', textAlign: 'center'
          }}
        >
          <ImageIcon size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: '12px' }} />
          {overlayText && (
            <span style={{ 
              color: 'rgba(255,255,255,0.7)', 
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
