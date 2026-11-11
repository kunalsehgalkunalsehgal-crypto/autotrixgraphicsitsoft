/* Only runs the reveal animation for the two new sections. Other site behavior is untouched. */
(() => {
  const features = document.querySelectorAll('.atx-feature-reveal');
  if (!features.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('atx-feature-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .13, rootMargin: '0px 0px -18px 0px' });
  features.forEach(el => observer.observe(el));
})();
