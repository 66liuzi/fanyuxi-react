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
// 媒体文件已迁移至腾讯云COS（国内加速），不再从 GitHub Pages 加载
const COS_BASE = 'https://huazi-1324532363.cos.ap-beijing.myqcloud.com';

const imageItems = [
  { id: 1, type: 'image', src: `${COS_BASE}/media/images/201400.JPG`, alt: 'Photo 1', w: 768,  h: 1360 },
  { id: 2, type: 'image', src: `${COS_BASE}/media/images/201401.JPG`, alt: 'Photo 2', w: 1280, h: 2267 },
  { id: 3, type: 'image', src: `${COS_BASE}/media/images/201402.JPG`, alt: 'Photo 3', w: 1280, h: 2267 },
  { id: 4, type: 'image', src: `${COS_BASE}/media/images/201403.JPG`, alt: 'Photo 4', w: 752,  h: 1360 },
  { id: 5, type: 'image', src: `${COS_BASE}/media/images/201406.JPG`, alt: 'Photo 5', w: 1217, h: 679  },
  { id: 6, type: 'image', src: `${COS_BASE}/media/images/201407.JPG`, alt: 'Photo 6', w: 1254, h: 708  },
];

// 视频全部为 mp4 格式，浏览器可播放
// 视频封面已预先生成并上传到COS，直接从COS加载
const videoItems = [
  { id: 1, type: 'video', src: `${COS_BASE}/media/videos/201410_raw.mp4`,    alt: 'Video 1', w: 1280, h: 720, poster: `${COS_BASE}/media/video-posters/201410_raw_poster.jpg` },
  { id: 2, type: 'video', src: `${COS_BASE}/media/videos/201411_raw.mp4`,    alt: 'Video 2', w: 1280, h: 720, poster: `${COS_BASE}/media/video-posters/201411_raw_poster.jpg` },
  { id: 3, type: 'video', src: `${COS_BASE}/media/videos/201412.mp4`,        alt: 'Video 3', w: 1280, h: 720, poster: `${COS_BASE}/media/video-posters/201412_poster.jpg` },
  { id: 4, type: 'video', src: `${COS_BASE}/media/videos/201209_raw.mp4`,    alt: 'Video 4', w: 1280, h: 720, poster: `${COS_BASE}/media/video-posters/201209_raw_poster.jpg` },
  { id: 5, type: 'video', src: `${COS_BASE}/media/videos/20260624003620.mp4`, alt: 'Video 5', w: 1280, h: 720, poster: `${COS_BASE}/media/video-posters/20260624003620_poster.jpg` },
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
function MediaCard({ item, cardW, cardH, onPreview, videoCache }) {
  const isVideo = item.type === 'video';
  const isCached = isVideo && videoCache && videoCache[item.src];
  // 视频封面：直接使用COS上的poster图片
  const posterUrl = isVideo && item.poster;

  // 图片卡片：整个卡片可点击；视频卡片：仅播放按钮可点击
  const handleCardClick = (e) => {
    if (isVideo) return; // 视频卡片不响应卡片区域的点击
    onPreview(item);
  };

  // 播放按钮点击（仅视频卡片）
  const handlePlayClick = (e) => {
    e.stopPropagation();
    onPreview(item);
  };

  return (
    <div className="portfolio__card"
      style={{ width: cardW + 'px', height: cardH + 'px' }}
      onClick={handleCardClick}>
      <div className="portfolio__card-folder">
        <div className="portfolio__card-tab">
          <span>{isVideo ? 'VIDEO' : 'IMG'}</span>
        </div>
        <div className="portfolio__card-body">
          {isVideo ? (
            <>
              {posterUrl ? (
                <img className="portfolio__card-media" src={posterUrl}
                  alt={item.alt} loading="lazy" />
              ) : (
                <div className="portfolio__card-poster" />
              )}
              {/* 圆形播放按钮 — 视频卡片的唯一交互入口 */}
              <button className="portfolio__card-play-btn" onClick={handlePlayClick}
                aria-label="播放视频">
                <svg viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
                  <path d="M19 14l14 10-14 10V14z" fill="white"/>
                </svg>
              </button>
            </>
          ) : (
            <img className="portfolio__card-media" src={item.src}
              alt={item.alt} loading="lazy" />
          )}
          {/* 缓存状态指示：绿色圆点=已缓存，蓝色脉冲=正在缓存 */}
          {isVideo && (
            <div className={`portfolio__card-cache ${isCached ? 'portfolio__card-cache--done' : 'portfolio__card-cache--loading'}`} />
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
   使用原生滚动 + JS 无限循环跳转
   ============================================= */
function ScrollableCards({ items, onPreview, videoCache }) {
  const trackRef = useRef(null);
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

  /* 无限循环跳转 — 基于原生 scroll 事件 */
  const loopCheck = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    // 如果滚过了第2份副本，跳回第1份
    if (el.scrollLeft >= oneSetWidth * 2) {
      el.scrollLeft = el.scrollLeft - oneSetWidth;
    }
    // 如果滚到了第0份（左侧），跳到第1份
    else if (el.scrollLeft <= 0) {
      el.scrollLeft = el.scrollLeft + oneSetWidth;
    }
    updBtn();
  }, [oneSetWidth, updBtn]);

  /* 滚动事件 — 使用原生 scroll 事件 */
  const onScroll = useCallback(() => {
    updBtn();
    userScrolling.current = true;
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      userScrolling.current = false;
      loopCheck();
    }, 150);
  }, [updBtn, loopCheck]);

  /* 初始化：跳到中间那份，并预加载相邻卡片 */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollLeft = oneSetWidth;
      updBtn();
    });
    return () => cancelAnimationFrame(id);
  }, [oneSetWidth, updBtn]);

  /* 自动缓慢滚动 — 尊重用户的滚动操作 */
  useEffect(() => {
    autoRef.current = setInterval(() => {
      const el = trackRef.current;
      if (!el || userScrolling.current) return;
      el.scrollLeft += 0.5;
      // 检查是否需要无限循环跳转
      if (el.scrollLeft >= oneSetWidth * 2 - 10) {
        el.scrollLeft = el.scrollLeft - oneSetWidth;
      }
      onScroll();
    }, 30);
    return () => clearInterval(autoRef.current);
  }, [onScroll, oneSetWidth]);

  /* 按钮点击 */
  const scrollOne = dir => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft += dir * (oneSetWidth / sizedItems.length);
    requestAnimationFrame(onScroll);
  };

  return (
    <div className="portfolio__scrollable">
      <div ref={trackRef} className="portfolio__track"
        onScroll={onScroll}>
        {/* 渲染 3 份实现无限循环 */}
        {[0,1,2].flatMap(copy =>
          sizedItems.map((it, i) => (
            <MediaCard key={`${copy}-${it.id}-${i}`}
              item={it} cardW={it.cardW} cardH={it.cardH}
              onPreview={onPreview} videoCache={videoCache} />
          ))
        )}
      </div>
    </div>
  );
}

/* =============================================
   全屏预览器
   ============================================= */
function Viewer({ item, onClose, videoCache }) {
  const isVideo = item.type === 'video';
  const videoRef = useRef(null);
  const videoSrc = isVideo && videoCache?.[item.src] ? videoCache[item.src] : item.src;

  // 微信兼容：手动触发播放
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const videoEl = videoRef.current;
      const timer = setTimeout(() => {
        const p = videoEl.play();
        if (p) p.catch(() => {});
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVideo, videoSrc]);

  const handleVideoClick = (e) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };

  return (
    <div className="portfolio__viewer" onClick={onClose}>
      <div className="portfolio__viewer-content" onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video
            ref={videoRef}
            className="portfolio__viewer-media"
            src={videoSrc}
            controls
            playsInline
            webkit-playsInline
            x5-video-player-type="h5"
            x5-video-player-fullscreen="true"
            x5-playsinline
            preload="auto"
            style={{ objectFit: 'contain' }}
            onClick={handleVideoClick}
          />
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
function Folder({ title, color, items, onPreview, videoCache, description }) {
  const [hover, setHover] = useState(false);
  return (
    <div className={`portfolio__folder${hover ? ' portfolio__folder--open' : ''}`}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onTouchStart={() => setHover(h => !h)}>
      <div className="portfolio__folder-tab" style={{ background: color }}>
        <span>{title}</span>
      </div>
      <div className="portfolio__folder-body" style={{ borderColor: color }}>
        {description && (
          <p className="portfolio__folder-desc">{description}</p>
        )}
        <ScrollableCards items={items} onPreview={onPreview} videoCache={videoCache} />
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

  /* 视频预加载缓存：页面打开时自动下载所有视频到 blob
     用户点击视频时，如果已缓存则 blob URL 即时播放；否则降级用原始 URL
     COS 跨域 fetch 需要 CORS 配置，失败时静默降级 */
  const [videoCache, setVideoCache] = useState({});   // src → blobUrl
  const blobUrlsRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    // 预加载视频 blob 缓存
    const preloadVideos = async () => {
      for (const v of videoItems) {
        if (cancelled) break;
        try {
          const res = await fetch(v.src, { mode: 'cors' });
          const blob = await res.blob();
          if (!cancelled) {
            const url = URL.createObjectURL(blob);
            blobUrlsRef.current.push(url);
            setVideoCache(prev => ({ ...prev, [v.src]: url }));
          }
        } catch {
          // 跨域 fetch 失败（CORS未配置）时静默忽略，Viewer 会降级使用原始 URL
        }
      }
    };

    preloadVideos();

    return () => {
      cancelled = true;
      blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

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
        <Folder title="Video Portfolio" color="#c084fc" description="精选视频作品 · 点击播放按钮预览"
          items={videoItems} onPreview={setPreview} videoCache={videoCache} />
      </div>
      {preview && <Viewer item={preview} onClose={() => setPreview(null)} videoCache={videoCache} />}
    </section>
  );
}
