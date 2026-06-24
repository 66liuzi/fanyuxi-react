import { useState, useRef, useEffect, useCallback } from 'react';
import LightRays from './LightRays';
import './Portfolio.css';

/* =============================================
   数据：图片和视频（使用实际文件 + 比例信息）
   所有素材已转换为浏览器兼容格式
   ============================================= */

// 图片原始尺寸：
// 201400=768×1360(竖), 201401=1280×2267(竖), 201402=1280×2267(竖),
// 201403=752×1360(竖), 201406=1217×679(横), 201407=1254×708(横)
const imageItems = [
  { id: 1, type: 'image', src: '/media/images/201400.JPG', alt: 'Photo 1', w: 768,  h: 1360 },
  { id: 2, type: 'image', src: '/media/images/201401.JPG', alt: 'Photo 2', w: 1280, h: 2267 },
  { id: 3, type: 'image', src: '/media/images/201402.JPG', alt: 'Photo 3', w: 1280, h: 2267 },
  { id: 4, type: 'image', src: '/media/images/201403.JPG', alt: 'Photo 4', w: 752,  h: 1360 },
  { id: 5, type: 'image', src: '/media/images/201406.JPG', alt: 'Photo 5', w: 1217, h: 679  },
  { id: 6, type: 'image', src: '/media/images/201407.JPG', alt: 'Photo 6', w: 1254, h: 708  },
];

// 视频全部为 mp4 格式，浏览器可播放
const videoItems = [
  { id: 1, type: 'video', src: '/media/videos/201410_raw.mp4',    alt: 'Video 1', w: 1280, h: 720 },
  { id: 2, type: 'video', src: '/media/videos/201411_raw.mp4',    alt: 'Video 2', w: 1280, h: 720 },
  { id: 3, type: 'video', src: '/media/videos/201412.mp4',        alt: 'Video 3', w: 1280, h: 720 },
  { id: 4, type: 'video', src: '/media/videos/201209_raw.mp4',    alt: 'Video 4', w: 1280, h: 720 },
  { id: 5, type: 'video', src: '/media/videos/20260624003620.mp4', alt: 'Video 5', w: 1280, h: 720 },
];

/* =============================================
   卡片尺寸计算：根据原素材比例动态生成
   ============================================= */
const CARD_MAX_H = 340;  // 桌面端最大卡片高度
const CARD_MIN_W = 140;  // 最小宽度
const CARD_MAX_W = 360;  // 最大宽度
const GAP = 20;          // 卡片间距

function calcCardSize(item) {
  const ratio = item.w / item.h;
  let cardH = CARD_MAX_H;
  let cardW = Math.round(cardH * ratio);
  // 宽度越界时反向调整
  if (cardW > CARD_MAX_W) {
    cardW = CARD_MAX_W;
    cardH = Math.round(cardW / ratio);
  }
  if (cardW < CARD_MIN_W) {
    cardW = CARD_MIN_W;
    cardH = Math.round(cardW / ratio);
  }
  return { cardW, cardH };
}

// 预计算每张卡片的尺寸和步长（宽度+间距）
function calcCardSteps(items) {
  return items.map(item => {
    const { cardW, cardH } = calcCardSize(item);
    return { ...item, cardW, cardH, step: cardW + GAP };
  });
}

/* =============================================
   卡片组件（带文件夹装饰，无文字，尺寸自适应）
   ============================================= */
function MediaCard({ item, cardW, cardH, onPreview }) {
  const isVideo = item.type === 'video';

  return (
    <div className="portfolio__card"
      style={{ width: cardW + 'px', height: cardH + 'px' }}
      onClick={() => onPreview(item)}>
      <div className="portfolio__card-folder">
        <div className="portfolio__card-tab">
          <span>{isVideo ? 'VIDEO' : 'IMG'}</span>
        </div>
        <div className="portfolio__card-body">
          {isVideo ? (
            <video className="portfolio__card-media" src={item.src}
              muted loop playsInline preload="metadata" />
          ) : (
            <img className="portfolio__card-media" src={item.src}
              alt={item.alt} loading="lazy" />
          )}
          <div className="portfolio__card-glow" />
        </div>
        <div className="portfolio__card-reflect" />
      </div>
    </div>
  );
}

/* =============================================
   可滚动卡片列表（无限循环 + 左右按钮）
   支持不同宽度的卡片，纵向居中对齐
   ============================================= */
function ScrollableCards({ items, onPreview }) {
  const trackRef = useRef(null);
  const drag = useRef(null);
  const autoRef = useRef(null);
  const scrollEndTimer = useRef(null);
  const userScrolling = useRef(false);

  const canScroll = useRef({ left: false, right: true });
  const [btn, setBtn] = useState({ left: false, right: true });

  // 预计算带尺寸的 items
  const sizedItems = calcCardSteps(items);
  const oneSetWidth = sizedItems.reduce((s, it) => s + it.step, 0);

  /* 更新按钮状态 */
  const updBtn = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cur = el.scrollLeft - oneSetWidth;
    const max = oneSetWidth;
    const vw = el.clientWidth;
    const ns = { left: cur > 3, right: cur < max - vw - 3 };
    if (ns.left !== canScroll.current.left || ns.right !== canScroll.current.right) {
      canScroll.current = ns;
      setBtn(ns);
    }
  }, [oneSetWidth]);

  /* 无限循环跳转 */
  const loopCheck = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    if (el.scrollLeft >= oneSetWidth * 2) el.scrollLeft -= oneSetWidth;
    else if (el.scrollLeft <= 0) el.scrollLeft += oneSetWidth;
    updBtn();
  }, [oneSetWidth, updBtn]);

  /* 滚动事件 */
  const onScroll = useCallback(() => {
    updBtn();
    userScrolling.current = true;
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      userScrolling.current = false;
      loopCheck();
    }, 150);
  }, [updBtn, loopCheck]);

  /* 初始化 */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollLeft = oneSetWidth;
      updBtn();
    });
    return () => cancelAnimationFrame(id);
  }, [oneSetWidth, updBtn]);

  /* 自动缓慢滚动 */
  useEffect(() => {
    autoRef.current = setInterval(() => {
      const el = trackRef.current;
      if (!el || drag.current || userScrolling.current) return;
      el.scrollLeft += 0.5;
      onScroll();
    }, 30);
    return () => clearInterval(autoRef.current);
  }, [onScroll]);

  /* 鼠标拖动 */
  const onDown = e => {
    const el = trackRef.current;
    if (!el) return;
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    drag.current = { x: e.pageX, s: el.scrollLeft };
    el.style.cursor = 'grabbing';
  };
  const onMove = e => {
    if (!drag.current) return;
    e.preventDefault();
    const el = trackRef.current;
    el.scrollLeft = drag.current.s - (e.pageX - drag.current.x);
    onScroll();
  };
  const onUp = () => {
    if (!trackRef.current) return;
    trackRef.current.style.cursor = 'grab';
    drag.current = null;
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      userScrolling.current = false;
      loopCheck();
    }, 150);
  };

  /* 按钮点击 */
  const scrollOne = dir => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft += dir * (oneSetWidth / sizedItems.length);
    requestAnimationFrame(onScroll);
  };

  return (
    <div className="portfolio__scrollable">
      {btn.left && (
        <button className="portfolio__scroll-btn portfolio__scroll-btn--left"
          onClick={e => { e.stopPropagation(); scrollOne(-1); }}
          onMouseDown={e => e.stopPropagation()}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4l-6 6 6 6" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      <div ref={trackRef} className="portfolio__track"
        onScroll={onScroll}
        onMouseDown={onDown} onMouseMove={onMove}
        onMouseUp={onUp} onMouseLeave={onUp}>
        {/* 渲染 3 份实现无限循环 */}
        {[0,1,2].flatMap(copy =>
          sizedItems.map((it, i) => (
            <MediaCard key={`${copy}-${it.id}-${i}`}
              item={it} cardW={it.cardW} cardH={it.cardH}
              onPreview={onPreview} />
          ))
        )}
      </div>

      {btn.right && (
        <button className="portfolio__scroll-btn portfolio__scroll-btn--right"
          onClick={e => { e.stopPropagation(); scrollOne(1); }}
          onMouseDown={e => e.stopPropagation()}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/* =============================================
   全屏预览器
   ============================================= */
function Viewer({ item, onClose }) {
  const isVideo = item.type === 'video';

  return (
    <div className="portfolio__viewer" onClick={onClose}>
      <div className="portfolio__viewer-content" onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video className="portfolio__viewer-media" src={item.src}
            controls autoPlay playsInline style={{ objectFit: 'contain' }} />
        ) : (
          <img className="portfolio__viewer-media" src={item.src} alt={item.alt}
            style={{ objectFit: 'contain' }} />
        )}
        <button className="portfolio__viewer-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* =============================================
   文件夹组件
   ============================================= */
function Folder({ title, color, items, onPreview }) {
  const [hover, setHover] = useState(false);
  return (
    <div className={`portfolio__folder${hover ? ' portfolio__folder--open' : ''}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(h => !h)}>
      <div className="portfolio__folder-tab" style={{ background: color }}>
        <span>{title}</span>
      </div>
      <div className="portfolio__folder-body" style={{ borderColor: color }}>
        <ScrollableCards items={items} onPreview={onPreview} />
      </div>
      {hover && (
        <div className="portfolio__folder-glow"
          style={{ background: `radial-gradient(ellipse at center, ${color}33 0%, transparent 70%)` }} />
      )}
    </div>
  );
}

/* =============================================
   Portfolio 主组件
   ============================================= */
export default function Portfolio() {
  const [preview, setPreview] = useState(null);
  return (
    <section className="portfolio" id="portfolio">
      {/* LightRays 背景层 */}
      <div className="portfolio__rays-bg">
        <LightRays
          raysOrigin="top-center"
          raysColor="#d8b4fe"
          raysSpeed={0.6}
          lightSpread={1.2}
          rayLength={1.8}
          pulsating={false}
          fadeDistance={1.5}
          saturation={0.7}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0.03}
          distortion={0.02}
          intensity={2.5}
        />
      </div>

      <div className="portfolio__grid">
        <Folder title="Image Portfolio" color="#818cf8"
          items={imageItems} onPreview={setPreview} />
        <Folder title="Video Portfolio" color="#c084fc"
          items={videoItems} onPreview={setPreview} />
      </div>
      {preview && <Viewer item={preview} onClose={() => setPreview(null)} />}
    </section>
  );
}
