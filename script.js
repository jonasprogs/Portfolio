/* ─── Helpers ───────────────────────────────────────────── */
function onMobile() { return window.innerWidth < 768; }

/* ─── Year ─────────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ─── Hero bubble reveal ───────────────────────────────── */
const heroBubble = document.querySelector('.hero-bubble');
const portfolioSection = document.getElementById('portfolio');
const heroPortfolioLink = document.querySelector('#hero a[href="#portfolio"]');

function scrollToSection(target) {
  const navHeight = document.getElementById('mainNav')?.offsetHeight || 0;
  const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 24;

  window.scrollTo({
    top: Math.max(y, 0),
    behavior: 'smooth'
  });
}

function updateHeroBubble() {
  if (!heroBubble || !portfolioSection || !heroBubble.dataset.ready) return;

  const portfolioTop = portfolioSection.getBoundingClientRect().top;
  const fadeStart = window.innerHeight * 0.82;
  const hideAt = window.innerHeight * 0.62;
  const shouldFade = portfolioTop <= fadeStart && portfolioTop > hideAt;
  const shouldShow = portfolioTop > hideAt;

  heroBubble.classList.toggle('is-fading', shouldFade);
  heroBubble.classList.toggle('visible', shouldShow);
}

if (heroBubble) {
  window.setTimeout(() => {
    heroBubble.dataset.ready = 'true';
    updateHeroBubble();
  }, 2200);

  heroBubble.addEventListener('click', (event) => {
    if (!portfolioSection) return;
    event.preventDefault();
    scrollToSection(portfolioSection);
  });
}

if (heroPortfolioLink && portfolioSection) {
  heroPortfolioLink.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToSection(portfolioSection);
  });
}

window.addEventListener('scroll', updateHeroBubble, { passive: true });
window.addEventListener('resize', updateHeroBubble);

/* ─── Nav – frosted glass on scroll ────────────────────── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── Mobile nav toggle ─────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('active');
  mobileNav.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

mobileNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ─── Intersection Observer helper ─────────────────────── */
function observe(selector, callback, options = {}) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) callback(entry.target, observer);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px', ...options });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  return observer;
}

/* ─── Generic scroll reveals (bidirectional) ────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.classList.remove('gone');
    } else if (entry.boundingClientRect.top < 0) {
      // scrolled past — fade out upward
      entry.target.classList.add('gone');
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── Stats counter animation ───────────────────────────── */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function countUp(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const format   = el.dataset.format;
  const duration = 3500;
  const start    = performance.now();

  function tick(now) {
    const progress = easeOutCubic(Math.min((now - start) / duration, 1));
    const value    = Math.round(progress * target);
    el.textContent = (format === 'de'
      ? value.toLocaleString('de-DE')
      : value.toString()) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-card').forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('animate');
          countUp(card.querySelector('.stat-num'));
        }, i * 150);
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const statsSection = document.getElementById('stats');
if (statsSection) statsObserver.observe(statsSection);

/* ─── Portfolio: left-to-right stagger reveal ───────────── */
const reelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.reel-item').forEach((item, i) => {
        setTimeout(() => item.classList.add('animate'), 900 + i * 160);
      });
      reelObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.reel-grid').forEach(grid => {
  reelObserver.observe(grid);
});

/* ─── About section slide-in ────────────────────────────── */
const aboutObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.getElementById('aboutImg')?.classList.add('animate');
      document.getElementById('aboutTxt')?.classList.add('animate');
      aboutObserver.disconnect();
    }
  });
}, { threshold: 0.2 });

const aboutSection = document.getElementById('about');
if (aboutSection) aboutObserver.observe(aboutSection);

/* ─── Vimeo iframe loading ───────────────────────────────── */
function loadIframe(iframe) {
  if (iframe.dataset.src) {
    iframe.src = iframe.dataset.src;
    delete iframe.dataset.src;
  }
}

/* Load iframes only when they actually enter the viewport.
   This ensures Mercedes (top of page) loads first, Blacklane
   only loads when the user scrolls down to it. */
const iframeLazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    loadIframe(entry.target);
    iframeLazyObserver.unobserve(entry.target);
  });
}, { rootMargin: '400px' });  /* large margin — preload iframes well before visible */

document.querySelectorAll('iframe.reel-video[data-src]').forEach(iframe => {
  iframeLazyObserver.observe(iframe);
});

/* ─── Foto-Galerie ──────────────────────────────────────── */
const FOTOS = [
  // Blacklane
  { src: 'Bilder%20Blacklane/IMG_0128.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_1565.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_1956.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_1958.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_4453.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_4890.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_5607.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_5612.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_5724.JPG',  cat: 'blacklane' },
  { src: 'Bilder%20Blacklane/IMG_7310.JPG',  cat: 'blacklane' },
  // Mercedes-Benz
  { src: 'Bilder%20Mercedes/DSC02248.jpg',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/DSC02261%20(2).jpg', cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/DSC02386.jpg',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/DSC02447.jpg',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/DSC02556.jpg',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/IMG_0646.JPG',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/IMG_2354.JPG',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/IMG_2396.jpg',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/IMG_2454.JPG',       cat: 'mercedes' },
  { src: 'Bilder%20Mercedes/IMG_5514.JPG',       cat: 'mercedes' },
  // Automotive
  { src: 'Bilder%20Cars/IMG_2938.jpg',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_4140.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_4735.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_4739.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_4957.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_6755.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_7085.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_7225.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_7262.JPG',  cat: 'automotive' },
  { src: 'Bilder%20Cars/IMG_7263.JPG',  cat: 'automotive' },
  // Spaces
  { src: 'Bilder%20Places/IMG_0333.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_1090.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_2392.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_4452.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_4614.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_5267.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_5609.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_7839.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_7842.JPG',  cat: 'spaces' },
  { src: 'Bilder%20Places/IMG_9345.JPG',  cat: 'spaces' },
];

let lbSrcs  = [];
let lbIndex = 0;

const fotoGrid = document.getElementById('fotoGrid');
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lbImg');

/* shuffle helper */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* lightbox */
function openLightbox(srcs, index) {
  lbSrcs  = srcs;
  lbIndex = index;
  lbImg.src = lbSrcs[lbIndex];
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function lbNavigate(dir) {
  lbIndex = (lbIndex + dir + lbSrcs.length) % lbSrcs.length;
  lbImg.src = lbSrcs[lbIndex];
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => lbNavigate(-1));
document.getElementById('lbNext').addEventListener('click', () => lbNavigate(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbNavigate(-1);
  if (e.key === 'ArrowRight') lbNavigate(1);
});

const fotoMoreWrap = document.getElementById('fotoMoreWrap');
const fotoMoreBtn  = document.getElementById('fotoMore');
const MOBILE_PER_PAGE = 6;
let   mobileCat       = 'all';
let   mobileShown     = 0;

/* ── Desktop: build all items at once (shuffled + animated) ── */
function buildGalleryDesktop() {
  shuffle(FOTOS).forEach(foto => {
    const item = document.createElement('div');
    item.className   = 'foto-item';
    item.dataset.cat = foto.cat;
    const img = document.createElement('img');
    img.src = foto.src; img.alt = 'Foto'; img.loading = 'lazy';
    item.appendChild(img);
    fotoGrid.appendChild(item);
  });

  const allItems = Array.from(fotoGrid.querySelectorAll('.foto-item'));
  allItems.forEach((item, i) => setTimeout(() => item.classList.add('visible'), i * 40));
  allItems.forEach(item => {
    item.addEventListener('click', () => {
      const vis  = allItems.filter(el => !el.classList.contains('hidden'));
      openLightbox(vis.map(el => el.querySelector('img').src), vis.indexOf(item));
    });
  });
}

function applyFotoFilter(cat) {
  const allItems = Array.from(fotoGrid.querySelectorAll('.foto-item'));
  allItems.forEach(item => {
    if (!item.classList.contains('hidden')) {
      item.classList.remove('visible');
      item.classList.add('exiting');
    }
  });
  setTimeout(() => {
    let vi = 0;
    allItems.forEach(item => {
      const match = cat === 'all' || item.dataset.cat === cat;
      item.classList.remove('exiting', 'visible');
      if (!match) { item.classList.add('hidden'); }
      else {
        item.classList.remove('hidden');
        setTimeout(() => item.classList.add('visible'), vi++ * 38);
      }
    });
  }, 200);
}

/* ── Mobile: paginated, simple fade-in ───────────────────── */
function mobileFotoList() {
  return mobileCat === 'all' ? FOTOS : FOTOS.filter(f => f.cat === mobileCat);
}

function buildGalleryMobile(reset = false) {
  if (reset) { mobileShown = 0; fotoGrid.innerHTML = ''; }
  const list  = mobileFotoList();
  const batch = list.slice(mobileShown, mobileShown + MOBILE_PER_PAGE);

  batch.forEach((foto, i) => {
    const item = document.createElement('div');
    item.className   = 'foto-item';
    item.dataset.cat = foto.cat;
    const img = document.createElement('img');
    img.src = foto.src; img.alt = 'Foto'; img.loading = 'lazy';
    item.appendChild(img);
    fotoGrid.appendChild(item);
    setTimeout(() => item.classList.add('visible'), i * 60);
    item.addEventListener('click', () => {
      const all = Array.from(fotoGrid.querySelectorAll('.foto-item'));
      openLightbox(all.map(el => el.querySelector('img').src), all.indexOf(item));
    });
  });

  mobileShown += batch.length;
  fotoMoreWrap.style.display = mobileShown < list.length ? 'block' : 'none';
}

/* ── Filter buttons ──────────────────────────────────────── */
document.querySelectorAll('.foto-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.foto-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (onMobile()) {
      mobileCat = btn.dataset.cat;
      buildGalleryMobile(true);
    } else {
      applyFotoFilter(btn.dataset.cat);
    }
  });
});

if (fotoMoreBtn) fotoMoreBtn.addEventListener('click', () => buildGalleryMobile(false));

/* ── Init ────────────────────────────────────────────────── */
if (onMobile()) {
  buildGalleryMobile();
} else {
  buildGalleryDesktop();
}

/* ─── Contact form → Formspree ──────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn  = this.querySelector('button[type="submit"]');
  const orig = btn.textContent;

  btn.textContent   = 'Wird gesendet …';
  btn.disabled      = true;

  try {
    const res = await fetch(this.action, {
      method:  'POST',
      body:    new FormData(this),
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      btn.textContent   = 'Gesendet \u2713';
      btn.style.cssText = 'background:#1a1a1a;color:#555;cursor:default;transform:none;';
      this.reset();
      setTimeout(() => {
        btn.textContent   = orig;
        btn.disabled      = false;
        btn.style.cssText = '';
      }, 4000);
    } else {
      btn.textContent = 'Fehler – bitte erneut versuchen';
      btn.disabled    = false;
      setTimeout(() => { btn.textContent = orig; }, 4000);
    }
  } catch {
    btn.textContent = 'Fehler – bitte erneut versuchen';
    btn.disabled    = false;
    setTimeout(() => { btn.textContent = orig; }, 4000);
  }
});
