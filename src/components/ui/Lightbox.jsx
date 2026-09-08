import { useEffect } from 'react';
import { X, CaretLeft, CaretRight } from '@phosphor-icons/react';
import './Lightbox.css';

export function Lightbox({ images, selectedIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (selectedIndex === null || !images.length) return null;

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image viewer">
      <button className="lightbox__close" onClick={onClose} aria-label="Close image viewer">
        <X weight="bold" size={28} />
      </button>

      <button
        className="lightbox__nav lightbox__nav--prev"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous image"
      >
        <CaretLeft weight="bold" size={32} />
      </button>

      <div className="lightbox__image-wrap" onClick={(e) => e.stopPropagation()}>
        <img
          src={images[selectedIndex]}
          alt={`Image ${selectedIndex + 1}`}
          className="lightbox__image"
        />
      </div>

      <button
        className="lightbox__nav lightbox__nav--next"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next image"
      >
        <CaretRight weight="bold" size={32} />
      </button>

      <div className="lightbox__counter">
        {selectedIndex + 1} / {images.length}
      </div>
    </div>
  );
}