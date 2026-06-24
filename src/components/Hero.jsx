import { useEffect, useRef, useState } from 'react';
import Strands from './Strands';
import './Hero.css';

export default function Hero() {
  const sectionRef = useRef(null);
  const glowRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 鼠标光晕跟随（仅PC端）
  useEffect(() => {
    if (isMobile) return;

    const onMove = (e) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [isMobile]);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    const el = document.getElementById('portfolio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" ref={sectionRef} className={`hero ${loaded ? 'hero--loaded' : ''}`}>
      {/* Strands 彩色光丝背景 */}
      <div className="hero__bg">
        <Strands
          colors={['#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b']}
          count={isMobile ? 4 : 6}
          speed={0.5}
          amplitude={1.0}
          waviness={1.5}
          thickness={0.6}
          glow={3}
          taper={3.0}
          spread={1.5}
          intensity={0.8}
          saturation={1.5}
          opacity={0.85}
          scale={1.5}
        />
      </div>

      {/* 鼠标光晕（仅PC端） */}
      {!isMobile && (
        <div
          className="hero__glow-trail"
          style={{
            left: `${mouse.x}px`,
            top: `${mouse.y}px`,
          }}
        />
      )}

      {/* 暗角叠加 */}
      <div className="hero__vignette" />

      {/* 中心内容 */}
      <div className="hero__content">
        <div className="hero__name-block">
          <span className="hero__greeting">Hi, I'm</span>
          <h1 className="hero__name">钰栖</h1>
          <div className="hero__divider" />
          <p className="hero__subtitle">天津传媒学院 广播电视编导</p>
          <p className="hero__desc">
            Take AI as my brush, delve into film and image creation, and turn visual creativity into reality through technology.
          </p>
        </div>

        <button className="hero__cta" onClick={handleEnter}>
          <span className="hero__cta-text">查看作品集</span>
          <span className="hero__cta-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
          <span className="hero__cta-glow" />
        </button>
      </div>

      {/* 底部滚动指示 */}
      <div className="hero__scroll-hint">
        <div className="hero__scroll-line" />
        <span>SCROLL</span>
      </div>
    </section>
  );
}
