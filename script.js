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

/* ─── Portfolio staggered reveal ────────────────────────── */
const reelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.reel-item').forEach((item, i) => {
        setTimeout(() => item.classList.add('animate'), i * 90);
      });
      reelObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

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

/* ─── Video autoplay on scroll ──────────────────────────── */
/*
  Sobald du ein echtes Video einfügst:
    <video class="reel-video" src="dein-video.mp4" muted loop playsinline preload="metadata">
  startet es automatisch, wenn es im Sichtfeld erscheint, und pausiert wenn nicht.
*/
const videoPlayObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target.querySelector('.reel-video');
    if (!video) return;
    if (entry.isIntersecting) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.reel-item').forEach(item => {
  videoPlayObserver.observe(item);
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

/* build all items once (shuffled) */
function buildGallery() {
  shuffle(FOTOS).forEach(foto => {
    const item = document.createElement('div');
    item.className   = 'foto-item';
    item.dataset.cat = foto.cat;
    const img = document.createElement('img');
    img.src     = foto.src;
    img.alt     = 'Foto';
    img.loading = 'lazy';
    item.appendChild(img);
    fotoGrid.appendChild(item);
  });

  /* show all with stagger on load */
  const allItems = Array.from(fotoGrid.querySelectorAll('.foto-item'));
  allItems.forEach((item, i) => {
    setTimeout(() => item.classList.add('visible'), i * 40);
  });

  /* click → lightbox with current visible set */
  allItems.forEach(item => {
    item.addEventListener('click', () => {
      const visible = allItems.filter(el => !el.classList.contains('hidden'));
      const srcs    = visible.map(el => el.querySelector('img').src);
      const idx     = visible.indexOf(item);
      openLightbox(srcs, idx);
    });
  });
}

/* filter with animation */
function applyFotoFilter(cat) {
  const allItems = Array.from(fotoGrid.querySelectorAll('.foto-item'));

  /* phase 1: exit all visible */
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
      if (!match) {
        item.classList.add('hidden');
      } else {
        item.classList.remove('hidden');
        const delay = vi * 38;
        vi++;
        setTimeout(() => item.classList.add('visible'), delay);
      }
    });
  }, 200);
}

document.querySelectorAll('.foto-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.foto-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFotoFilter(btn.dataset.cat);
  });
});

buildGallery();

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
