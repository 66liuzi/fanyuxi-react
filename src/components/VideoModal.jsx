import { useState } from 'react';
import './VideoModal.css';

export default function VideoModal({ video, onClose }) {
  if (!video) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="modal__player">
          <div className="modal__placeholder">
            <div className="modal__play-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
              </svg>
            </div>
            <p className="modal__placeholder-text">{video.title}</p>
          </div>
        </div>

        <div className="modal__info">
          <h3 className="modal__title">{video.title}</h3>
          <p className="modal__desc">{video.description}</p>
          <div className="modal__meta">
            <span>{video.year}</span>
            <span className="modal__dot">·</span>
            <span>{video.category}</span>
            <span className="modal__dot">·</span>
            <span>{video.duration}</span>
          </div>
          <div className="modal__tags">
            {video.tags.map(tag => (
              <span key={tag} className="modal__tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
