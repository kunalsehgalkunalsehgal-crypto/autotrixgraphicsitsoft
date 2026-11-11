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
