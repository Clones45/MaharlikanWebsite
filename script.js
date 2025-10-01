
// Keep the splash visible for ~5 seconds, then fade out
document.addEventListener('DOMContentLoaded', () => {
  const MIN_SPLASH_MS = 5000;         // ⬅️ stay time in ms
  const start = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(() => document.body.classList.add('loaded'), remaining);
  });
});


const sections = Array.from(document.querySelectorAll('section.snap'));
const navLinks = Array.from(document.querySelectorAll('.nav a'));

const byId = id => document.getElementById(id);
const linkFor = id => navLinks.find(a => a.getAttribute('href') === '#' + id);

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  });
}, { threshold: 0.6 });

sections.forEach(s => io.observe(s));

// Optional: Arrow ↑/↓ to move to prev/next section
window.addEventListener('keydown', (e) => {
  if (!['ArrowDown','ArrowUp'].includes(e.key)) return;
  e.preventDefault();
  const y = window.scrollY;
  const idx = sections.findIndex(s => Math.abs(s.offsetTop - y) < window.innerHeight * 0.6);
  const next = e.key === 'ArrowDown' ? Math.min(idx + 1, sections.length - 1)
                                     : Math.max(idx - 1, 0);
  sections[next]?.scrollIntoView({ behavior:'smooth' });
});
