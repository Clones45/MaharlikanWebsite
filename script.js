// ==== Shared script for multi-page site with transitions & scroll-reveal ====
(() => {
  const qs  = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  // Ensure crossfade overlay exists & handle enter animation
  const ensureOverlay = () => {
    if (qs('#page-xfade')) return;
    const fx = document.createElement('div');
    fx.id = 'page-xfade';
    document.documentElement.classList.add('just-entered');
    document.body.appendChild(fx);
    requestAnimationFrame(() => {
      document.documentElement.classList.add('ready');
      document.documentElement.classList.remove('just-entered');
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureOverlay, { once: true });
  } else {
    ensureOverlay();
  }

  // Update --header-h dynamically (zoom / wraps / orientation)
  const setHeaderVar = () => {
    const header = qs('.header');
    if (!header) return;
    const h = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  window.addEventListener('DOMContentLoaded', setHeaderVar);
  window.addEventListener('load', setHeaderVar);
  window.addEventListener('resize', setHeaderVar);
  window.addEventListener('orientationchange', setHeaderVar);
  setTimeout(setHeaderVar, 200);

  // Splash (Home page only)
  document.addEventListener('DOMContentLoaded', () => {
    const splash = qs('#splash');
    if (!splash) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const MIN_SPLASH_MS = 1000;
    if (prefersReduced) { document.body.classList.add('loaded'); return; }
    const start = Date.now();
    window.addEventListener('load', () => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => document.body.classList.add('loaded'), remaining);
    });
  });

  // Mobile menu toggle
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = qs('.menu-toggle');
    const nav = qs('.nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    qsa('a', nav).forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      const inside = nav.contains(e.target) || toggle.contains(e.target);
      if (!inside) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    }, { capture: true });
  });

  // Active tab by page
  document.addEventListener('DOMContentLoaded', () => {
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const key = path === '' || path === '/' ? 'index' : (path.endsWith('index.html') ? 'index' : path.replace('.html', ''));
    qsa('.nav a').forEach(a => {
      const page = (a.getAttribute('data-page') || '').toLowerCase();
      a.classList.toggle('active', page === key);
    });
  });

  // Footer year
  document.addEventListener('DOMContentLoaded', () => {
    const yearEl = qs('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  // Page-leave crossfade on link clicks
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = qs('#page-xfade');
    if (!overlay) return;

    const sameOrigin = (url) => {
      try { return new URL(url, location.href).origin === location.origin; }
      catch { return false; }
    };
    const isLeftClick = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!isLeftClick(e)) return;
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (!sameOrigin(href)) return;

      const url = new URL(href, location.href);
      const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname === location.pathname;
      if (!isHTML) return;

      e.preventDefault();
      document.documentElement.classList.add('is-leaving');
      setTimeout(() => { location.href = url.href; }, 280);
    });
  });

  window.addEventListener('pageshow', () => {
    document.documentElement.classList.remove('is-leaving');
    const fx = qs('#page-xfade');
    if (fx) { document.documentElement.classList.add('ready'); document.documentElement.classList.remove('just-entered'); }
  });

  // ===== Scroll reveal (fade-up) =====
  document.addEventListener('DOMContentLoaded', () => {
    const revealEls = qsa('.reveal');
    if (!revealEls.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });

    revealEls.forEach(el => io.observe(el));
  });
})();
