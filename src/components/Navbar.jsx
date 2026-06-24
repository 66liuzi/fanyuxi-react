import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_ITEMS = [
  { id: 'hero', label: '首页' },
  { id: 'portfolio', label: '作品' },
  { id: 'about', label: '关于' }
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map(item => document.getElementById(item.id));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(s => s && observer.observe(s));
    return () => sections.forEach(s => s && observer.unobserve(s));
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <div className="navbar__logo">
          <span className="navbar__logo-text">FYX</span>
        </div>
        <div className="navbar__menu">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`navbar__link ${active === item.id ? 'navbar__link--active' : ''}`}
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
              {active === item.id && <span className="navbar__link-dot" />}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
