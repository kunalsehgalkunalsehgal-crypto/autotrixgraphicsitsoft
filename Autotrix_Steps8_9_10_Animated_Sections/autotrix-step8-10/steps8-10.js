/* AUTOTRIX: Steps 8-10. No libraries needed. */
(() => {
  'use strict';

  // Fade + stagger on scroll and animate the process timeline.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animated = [...document.querySelectorAll('.atx-process .atx-into-view, .atx-reviews .atx-into-view, .atx-faq .atx-into-view')];
  const processTimeline = document.querySelector('.atx-process-steps');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.documentElement.classList.add('atx-new-motion');
    animated.forEach((item) => observer.observe(item));
    if (processTimeline) observer.observe(processTimeline);
  } else if (processTimeline) {
    processTimeline.classList.add('is-visible');
  }

  // Step 9: testimonial slider. Sample reviews, not verified testimonials.
  const reviews = document.querySelector('.atx-reviews');
  if (reviews) {
    const stage = reviews.querySelector('.atx-review-showcase');
    const track = reviews.querySelector('.atx-review-track');
    const slides = [...reviews.querySelectorAll('.atx-review-slide')];
    const dots = [...reviews.querySelectorAll('[data-review-dot]')];
    const count = reviews.querySelector('[data-review-count]');
    const live = reviews.querySelector('[data-review-live]');
    const prev = reviews.querySelector('.atx-review-prev');
    const next = reviews.querySelector('.atx-review-next');
    let index = 0;

    const showSlide = (newIndex) => {
      index = (newIndex + slides.length) % slides.length;
      track.style.setProperty('--atx-review-index', String(index));
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        if (active) {
          slide.removeAttribute('aria-hidden');
          slide.removeAttribute('inert');
        } else {
          slide.setAttribute('aria-hidden', 'true');
          slide.setAttribute('inert', '');
        }
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      count.textContent = String(index + 1).padStart(2, '0');
      live.textContent = `Showing sample review ${index + 1} of ${slides.length}`;
    };

    prev.addEventListener('click', () => showSlide(index - 1));
    next.addEventListener('click', () => showSlide(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
    stage.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(index - 1); }
    });
    // Swipe: listener only starts on the testimonial panel.
    let startX = null;
    stage.addEventListener('touchstart', (event) => { startX = event.changedTouches[0]?.screenX ?? null; }, { passive: true });
    stage.addEventListener('touchend', (event) => {
      if (startX === null) return;
      const delta = (event.changedTouches[0]?.screenX ?? startX) - startX;
      if (Math.abs(delta) >= 45) showSlide(index + (delta < 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
    showSlide(0);
  }

  // Step 10: Accordion (one answer at a time, first question starts open).
  const faq = document.querySelector('.atx-faq');
  if (faq) {
    const items = [...faq.querySelectorAll('.atx-faq-item')];
    const setOpen = (item, open) => {
      item.classList.toggle('is-open', open);
      const button = item.querySelector('.atx-faq-trigger');
      const panel = item.querySelector('.atx-faq-panel');
      button.setAttribute('aria-expanded', String(open));
      if (open) {
        panel.removeAttribute('aria-hidden');
        panel.removeAttribute('inert');
      } else {
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('inert', '');
      }
    };
    items.forEach((item) => {
      const button = item.querySelector('.atx-faq-trigger');
      button.addEventListener('click', () => {
        const shouldOpen = !item.classList.contains('is-open');
        items.forEach((other) => setOpen(other, other === item && shouldOpen));
      });
    });
  }
})();
