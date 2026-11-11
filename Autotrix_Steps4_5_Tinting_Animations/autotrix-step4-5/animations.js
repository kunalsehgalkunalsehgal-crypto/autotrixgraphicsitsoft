/* STEP 4 + STEP 5: Animate tinting sections when they enter the screen.
   This script is optional: without JS all content is still visible. */
(() => {
  const elements = [...document.querySelectorAll('.atx-tint-services .atx-reveal, .atx-tint-benefits .atx-reveal')];
  if (!elements.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -45px 0px', threshold: 0.07 });

  // Only enable hidden-before-reveal style AFTER the observer is ready.
  document.documentElement.classList.add('atx-enhanced');
  elements.forEach((item) => observer.observe(item));
})();
