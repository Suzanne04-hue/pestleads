/* ============================================
   PESTLEADS — MAIN.JS
   Scroll animations and polish
   ============================================ */

/* ─── FADE UP ON SCROLL ─── */
const fadeElements = document.querySelectorAll(
  '.hero-inner, .widget-header, .widget-card, .cta-header, .cta-card, .footer-inner'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

fadeElements.forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── HERO CTA SCROLL ─── */
const heroBtn = document.querySelector('.hero-btn-main');
if (heroBtn) {
  heroBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const widget = document.getElementById('widget');
    if (widget) widget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}