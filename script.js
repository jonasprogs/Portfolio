/* ─── Year ─────────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

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
  const duration = 2200;
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
      document.querySelectorAll('.reel-item').forEach((item, i) => {
        setTimeout(() => item.classList.add('animate'), i * 90);
      });
      reelObserver.disconnect();
    }
  });
}, { threshold: 0.1 });

const reelGrid = document.querySelector('.reel-grid');
if (reelGrid) reelObserver.observe(reelGrid);

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

/* ─── Portfolio category filter ────────────────────────── */
let activeCategory = 'all';

function applyFilter() {
  const items = document.querySelectorAll('.reel-item');
  let visible = 0;

  items.forEach(item => {
    const match = activeCategory === 'all' || item.dataset.cat === activeCategory;
    item.classList.remove('animate');

    if (match) {
      item.style.display = '';
      const idx = visible;
      setTimeout(() => item.classList.add('animate'), idx * 80);
      visible++;
    } else {
      item.style.display = 'none';
    }
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.filter;
    applyFilter();
  });
});

applyFilter();

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
