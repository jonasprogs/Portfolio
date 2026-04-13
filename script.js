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

/* ─── Generic scroll reveals ────────────────────────────── */
observe('.reveal', (el, obs) => {
  el.classList.add('visible');
  obs.unobserve(el);
});

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
// Füge hier die Dateinamen deiner Fotos ein:
const FOTOS = [
  // Beispiel: 'fotos/foto1.jpeg', 'fotos/foto2.jpeg', ...
];

const PER_PAGE   = 12; // 2 Reihen à 6 Fotos
let   shownCount = 0;
let   lbIndex    = 0;

const fotoGrid     = document.getElementById('fotoGrid');
const fotoMoreWrap = document.getElementById('fotoMoreWrap');
const fotoMoreBtn  = document.getElementById('fotoMore');
const lightbox     = document.getElementById('lightbox');
const lbImg        = document.getElementById('lbImg');

function openLightbox(index) {
  lbIndex = index;
  lbImg.src = FOTOS[lbIndex];
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);

document.getElementById('lbPrev').addEventListener('click', () => {
  lbIndex = (lbIndex - 1 + FOTOS.length) % FOTOS.length;
  lbImg.src = FOTOS[lbIndex];
});

document.getElementById('lbNext').addEventListener('click', () => {
  lbIndex = (lbIndex + 1) % FOTOS.length;
  lbImg.src = FOTOS[lbIndex];
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')  { lbIndex = (lbIndex - 1 + FOTOS.length) % FOTOS.length; lbImg.src = FOTOS[lbIndex]; }
  if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % FOTOS.length;                lbImg.src = FOTOS[lbIndex]; }
});

function loadMoreFotos() {
  const next = FOTOS.slice(shownCount, shownCount + PER_PAGE);
  next.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'foto-item';
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Foto';
    img.loading = 'lazy';
    const globalIndex = shownCount + i;
    item.addEventListener('click', () => openLightbox(globalIndex));
    item.appendChild(img);
    fotoGrid.appendChild(item);
  });
  shownCount += next.length;
  fotoMoreWrap.style.display = shownCount < FOTOS.length ? 'block' : 'none';
}

if (FOTOS.length > 0) {
  loadMoreFotos();
  if (fotoMoreBtn) fotoMoreBtn.addEventListener('click', loadMoreFotos);
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
