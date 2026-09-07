import './GameGallery.css';

export function GameGallery({ images = [] }) {
  if (images.length === 0) return null;

  return (
    <section className="game-gallery" aria-label="Screenshots">
      <h2 className="game-gallery__title">Gallery</h2>
      <div className="game-gallery__scroller">
        {images.map((src, i) => (
          // IMAGE SLOT: substituir por screenshot oficial do jogo
          <img key={i} src={src} alt={`Screenshot ${i + 1}`} loading="lazy" />
        ))}
      </div>
    </section>
  );
}
