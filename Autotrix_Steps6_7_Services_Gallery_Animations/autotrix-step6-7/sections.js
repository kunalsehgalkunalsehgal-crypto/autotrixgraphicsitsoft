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
