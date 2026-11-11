const menuButton = document.querySelector('.atx-menu-toggle');
const nav = document.querySelector('.atx-nav');
const servicesButton = document.querySelector('.atx-services-toggle');
const dropdown = document.querySelector('.atx-dropdown');

function closeServices() {
  dropdown.classList.remove('is-open');
  servicesButton.setAttribute('aria-expanded', 'false');
}
function closeMenu() {
  nav.classList.remove('is-open');
  menuButton.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  closeServices();
}

menuButton.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open);
  menuButton.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (!open) closeServices();
});

servicesButton.addEventListener('click', () => {
  const open = !dropdown.classList.contains('is-open');
  dropdown.classList.toggle('is-open', open);
  servicesButton.setAttribute('aria-expanded', String(open));
});

// Close menus after choosing a link.
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

// Close on Escape or a click outside the header.
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.atx-header')) closeMenu();
});

// Reset the mobile state when the screen becomes desktop sized.
window.matchMedia('(min-width: 1101px)').addEventListener('change', closeMenu);


/* STEP 2: HERO CAROUSEL | Paste at the END of your existing script.js */
(() => {
  const hero = document.querySelector('.atx-hero');
  if (!hero) return;

  const slides = [...hero.querySelectorAll('.atx-hero-slide')];
  const dots = [...hero.querySelectorAll('[data-dot]')];
  const prev = hero.querySelector('.atx-hero-prev');
  const next = hero.querySelector('.atx-hero-next');
  const counter = hero.querySelector('[data-hero-current]');
  const announcement = hero.querySelector('[data-hero-announcement]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let timer = null;
  let pointerInside = false;
  let focusInside = false;
  let touchStartX = 0;
  let touchStartY = 0;

  function showSlide(index, userInitiated = false) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const current = i === active;
      slide.classList.toggle('is-active', current);
      slide.setAttribute('aria-hidden', String(!current));
      slide.toggleAttribute('inert', !current);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      if (i === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    if (counter) counter.textContent = String(active + 1).padStart(2, '0');
    if (userInitiated && announcement) {
      announcement.textContent = `Slide ${active + 1} of ${slides.length}`;
    }
  }

  function stopAutoplay() {
    window.clearInterval(timer);
    timer = null;
  }
  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion.matches || document.hidden || pointerInside || focusInside) return;
    timer = window.setInterval(() => showSlide(active + 1), 5500);
  }
  function navigate(step) {
    showSlide(active + step, true);
    startAutoplay();
  }

  prev.addEventListener('click', () => navigate(-1));
  next.addEventListener('click', () => navigate(1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    showSlide(index, true);
    startAutoplay();
  }));

  hero.addEventListener('mouseenter', () => { pointerInside = true; stopAutoplay(); });
  hero.addEventListener('mouseleave', () => { pointerInside = false; startAutoplay(); });
  hero.addEventListener('focusin', () => { focusInside = true; stopAutoplay(); });
  hero.addEventListener('focusout', event => {
    if (!hero.contains(event.relatedTarget)) { focusInside = false; startAutoplay(); }
  });
  hero.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
  });
  hero.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    stopAutoplay();
  }, { passive: true });
  hero.addEventListener('touchend', event => {
    const deltaX = event.changedTouches[0].screenX - touchStartX;
    const deltaY = event.changedTouches[0].screenY - touchStartY;
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      navigate(deltaX < 0 ? 1 : -1);
    } else {
      startAutoplay();
    }
  }, { passive: true });
  document.addEventListener('visibilitychange', startAutoplay);
  reducedMotion.addEventListener('change', startAutoplay);

  showSlide(0);
  startAutoplay();
})();


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


/* STEP 6 + 7: Reveal, category filters and accessible gallery preview. */
(() => {
  const root = document.querySelector('.atx-graphics');
  const gallery = document.querySelector('.atx-portfolio');
  if (!root || !gallery) return;

  const revealItems = [...document.querySelectorAll('.atx-graphics .atx-enter, .atx-portfolio .atx-enter')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const watcher = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        watcher.unobserve(entry.target);
      });
    }, {threshold:0.06,rootMargin:'0px 0px -18px 0px'});
    document.documentElement.classList.add('atx-steps67-ready');
    revealItems.forEach(el => watcher.observe(el));
  }

  const filterButtons = [...gallery.querySelectorAll('[data-filter]')];
  const projectCards = [...gallery.querySelectorAll('[data-gallery-open]')];
  let activeFilter='all';
  function visibleCards(){return projectCards.filter(card=>!card.hidden);}
  filterButtons.forEach(button=>button.addEventListener('click',()=>{
    activeFilter=button.dataset.filter;
    filterButtons.forEach(btn=>{
      const active=btn===button;
      btn.classList.toggle('is-selected',active);
      btn.setAttribute('aria-pressed',String(active));
    });
    projectCards.forEach(card=>{
      const categories=(card.dataset.category||'').split(' ');
      card.hidden=!(activeFilter==='all'||categories.includes(activeFilter));
      // Filtered items need to be visible immediately instead of rerunning entry animation.
      if (!card.hidden) card.classList.add('is-visible');
    });
  }));

  const modal=document.getElementById('atx-lightbox');
  if (!modal || typeof modal.showModal!=='function') return;
  const modalImage=modal.querySelector('[data-lightbox-image]');
  const modalTitle=modal.querySelector('[data-lightbox-title]');
  const modalType=modal.querySelector('[data-lightbox-type]');
  let activeCard=null;
  let lastFocus=null;
  function showCard(card){
    if (!card) return;
    activeCard=card;
    modalImage.src=card.getAttribute('href');
    modalImage.alt=card.querySelector('img')?.alt||'';
    modalTitle.textContent=card.dataset.name||'Project example';
    modalType.textContent=card.dataset.type||'PROJECT';
  }
  projectCards.forEach(card=>card.addEventListener('click',event=>{
    event.preventDefault();
    lastFocus=document.activeElement;
    showCard(card);
    if (!modal.open) modal.showModal();
    modal.querySelector('[data-lightbox-close]').focus();
  }));
  const close=()=>modal.close();
  modal.querySelector('[data-lightbox-close]').addEventListener('click',close);
  function step(direction){
    const cards=visibleCards();
    if (!cards.length)return;
    const current=cards.indexOf(activeCard);
    showCard(cards[(current+direction+cards.length)%cards.length]);
  }
  modal.querySelector('[data-lightbox-prev]').addEventListener('click',()=>step(-1));
  modal.querySelector('[data-lightbox-next]').addEventListener('click',()=>step(1));
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  modal.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();step(1);}
    if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}
  });
  modal.addEventListener('close',()=>{
    modalImage.removeAttribute('src');
    lastFocus?.focus?.();
  });
})();


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


/* AUTOTRIX / Steps 11–13: animations, quote-email preparation, service selection */
(() => {
  'use strict';
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveal=[...document.querySelectorAll('.atx-final-cta .atx-finish-reveal,.atx-final-contact .atx-finish-reveal,.atx-final-footer .atx-finish-reveal')];
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('atx-finish-motion');
    const observer=new IntersectionObserver((entries,obs)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target)}})}, {threshold:0.06,rootMargin:'0px 0px -20px 0px'});
    reveal.forEach(el=>observer.observe(el));
  }
  const year=document.getElementById('atx-current-year');
  if(year)year.textContent=String(new Date().getFullYear());
  const form=document.getElementById('atx-quote-form');
  if(!form)return;
  const service=form.querySelector('#atx-service');
  const status=document.getElementById('atx-form-status');
  function getDraft(){
    const fields=new FormData(form);
    const name=String(fields.get('name')||'').trim();
    const email=String(fields.get('email')||'').trim();
    const phone=String(fields.get('phone')||'').trim();
    const kind=String(fields.get('service')||'').trim();
    const message=String(fields.get('message')||'').trim();
    const subject=`Autotrix Quote Request: ${kind}`;
    const body=`Hello Autotrix Team,\n\nI'd like to request a quote.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone||'Not provided'}\nService: ${kind}\n\nProject details:\n${message}\n\nThank you!`;
    return {subject,body};
  }
  function validateForm(){
    // Browser's native validity checks, even with the custom submit handler.
    if(!form.checkValidity()){form.reportValidity();return false;}
    return true;
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!validateForm())return;
    const {subject,body}=getDraft();
    const url=`mailto:autotrixgraphics@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent='Your email app should open with the request. Please press Send there to finish. No request has been sent from this page.';
    window.location.href=url;
  });
  const copy=document.getElementById('atx-copy-quote');
  if(copy)copy.addEventListener('click',async()=>{
    if(!validateForm())return;
    const {subject,body}=getDraft();
    const toCopy=`To: autotrixgraphics@gmail.com\nSubject: ${subject}\n\n${body}`;
    try{
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(toCopy)}
      else {
        const temporary=document.createElement('textarea');temporary.value=toCopy;temporary.style.position='fixed';temporary.style.left='-9999px';document.body.appendChild(temporary);temporary.select();
        const copied=document.execCommand('copy');temporary.remove();if(!copied)throw Error('Copy not available');
      }
      status.textContent='Quote request copied. Paste it into your email or message app to send it.';
      const previous=copy.textContent;copy.textContent='Copied!';window.setTimeout(()=>{copy.textContent=previous},2000);
    }catch(e){status.textContent='Copy was blocked. Please use the email button instead.'}
  });
  // Connect quote CTA links from earlier steps to the new form, retaining the service context.
  document.querySelectorAll('[data-quote-service]').forEach(link=>{
    link.addEventListener('click',()=>{
      const wanted=link.getAttribute('data-quote-service');
      if([...service.options].some(option=>option.value===wanted))service.value=wanted;
    });
  });
})();


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

/* AUTOTRIX FLOATING CONTACT BUTTONS: CONFIGURE VERIFIED WHATSAPP HERE */
(() => {
  // Digits only with country code. Example: '1406XXXXXXX'. Do NOT assume the call number supports WhatsApp.
  const WHATSAPP_NUMBER = '14064437881';
  const blocks = document.querySelectorAll('.atx-floating-contacts');
  if (!blocks.length) return;
  blocks.forEach((block, index) => { if (index > 0) block.remove(); });
  const digits = WHATSAPP_NUMBER.replace(/\D/g, '');
  const isValid = /^[1-9]\d{7,14}$/.test(digits);
  document.querySelectorAll('.atx-floating-contacts .atx-float-whatsapp').forEach(link => {
    if (!isValid) {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('aria-label', 'WhatsApp number not set');
      link.setAttribute('title', 'WhatsApp number not set');
      link.removeAttribute('target');
      link.removeAttribute('rel');
    } else {
      link.href = `https://wa.me/${digits}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.setAttribute('aria-label', 'Chat with Autotrix on WhatsApp');
      link.removeAttribute('title');
    }
  });
})();
