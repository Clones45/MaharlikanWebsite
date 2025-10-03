// ===================== Splash timing (min 5s) =====================
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MIN_SPLASH_MS = 1000; // stay time in ms
  const start = Date.now();

  // If user prefers reduced motion, don't hold them on the splash
  if (prefersReduced) {
    document.body.classList.add('loaded');
    return;
  }

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(() => document.body.classList.add('loaded'), remaining);
  });
});

// ===================== Section spy (active nav link) =====================
const sections = Array.from(document.querySelectorAll('section.snap'));
const navLinks = Array.from(document.querySelectorAll('.nav a'));

const linkFor = (id) => navLinks.find(a => a.getAttribute('href') === '#' + id);

// Guard: if no sections or links, do nothing
if (sections.length && navLinks.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      // Optional: keep the URL hash in sync (without jump)
      if (id && history.replaceState) {
        history.replaceState(null, '', '#' + id);
      }
    });
  }, { threshold: 0.6 });

  sections.forEach(s => io.observe(s));
}

// ===================== Keyboard navigation (↑ / ↓) =====================
window.addEventListener('keydown', (e) => {
  if (!['ArrowDown','ArrowUp'].includes(e.key)) return;

  // If a text input/textarea/select is focused, don't hijack
  const tag = (document.activeElement?.tagName || '').toLowerCase();
  if (['input', 'textarea', 'select'].includes(tag) || document.activeElement?.isContentEditable) return;

  e.preventDefault();

  // Find the section whose mid-point is closest to the viewport center
  const centerY = window.scrollY + window.innerHeight / 2;
  let idx = 0;
  let bestDelta = Infinity;

  sections.forEach((s, i) => {
    const mid = s.offsetTop + s.offsetHeight / 2;
    const delta = Math.abs(mid - centerY);
    if (delta < bestDelta) { bestDelta = delta; idx = i; }
  });

  const next = e.key === 'ArrowDown'
    ? Math.min(idx + 1, sections.length - 1)
    : Math.max(idx - 1, 0);

  sections[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ===================== Mobile menu toggle =====================
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;

  // Open/close
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close menu after clicking any link
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Optional: close if user clicks outside the nav when open
  document.addEventListener('click', (e) => {
    const open = nav.classList.contains('open');
    if (!open) return;
    const withinNav = nav.contains(e.target) || toggle.contains(e.target);
    if (!withinNav) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }, { capture: true });
});
