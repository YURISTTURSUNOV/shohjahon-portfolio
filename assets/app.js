const hasGsap = !!(window.gsap && window.ScrollTrigger);
const LANG = (document.documentElement.lang || 'uz').slice(0, 2);
const SEP = { uz: '\u00a0', ru: '\u00a0', en: ',' }[LANG] || '\u00a0';
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, SEP);
/* til almashtirganda bo'lim (#) saqlansin */
document.querySelectorAll('.lang a').forEach(a => a.addEventListener('click', () => { if (location.hash) a.href = a.getAttribute('href').split('#')[0] + location.hash; }));

/* harflarga bo'lish (maxsus kutubxonasiz) */
function splitChars(el){
  const t = el.textContent; el.textContent = ''; el.setAttribute('aria-hidden','true');
  [...t].forEach(c => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; el.appendChild(s); });
}
document.querySelectorAll('[data-split]').forEach(splitChars);
document.querySelectorAll('[data-split-in]').forEach(splitChars);
document.querySelector('.name .line:nth-child(2)').setAttribute('aria-hidden','true');

/* "Haqimda" matnini so'zlarga bo'lish */
const about = document.getElementById('about');
about.innerHTML = about.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');

/* tez savollar: tayyor javoblar */
(function(){
  const box = document.getElementById('qans'); if (!box) return;
  const btns = [...document.querySelectorAll('.qbtn')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  btns.forEach(b => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') === 'true';
    btns.forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (on){ box.innerHTML = '<p class="qempty"></p>'; box.firstChild.textContent = box.dataset.empty; return; }
    b.setAttribute('aria-pressed', 'true');
    box.innerHTML = document.getElementById(b.dataset.a).innerHTML;
    if (window.gsap && !reduced) gsap.from(box.firstElementChild, { y: 10, opacity: 0, duration: .45, ease: 'power3.out', clearProps: 'all' });
  }));
})();

if (hasGsap){
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add({
    ok: '(prefers-reduced-motion: no-preference)',
    fine: '(prefers-reduced-motion: no-preference) and (pointer: fine)',
    wide: '(prefers-reduced-motion: no-preference) and (min-width: 900px)'
  }, (ctx) => {
    const { fine, wide } = ctx.conditions;
    const cleanups = [];
    const on = (el, ev, fn) => { el.addEventListener(ev, fn); cleanups.push(() => el.removeEventListener(ev, fn)); };

    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    /* aurora: sekin suzadi va skroll bilan siljiydi */
    [['.b1', 60, 40, 17], ['.b2', -70, 50, 21], ['.b3', 50, -60, 19], ['.b4', -40, -40, 23]].forEach(([s, x, y, d]) => {
      gsap.to(s, { x, y, duration: d, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });
    gsap.to('.b1', { yPercent: 38, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
    gsap.to('.b2', { yPercent: 55, xPercent: -12, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
    gsap.to('.b3', { yPercent: -45, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });
    gsap.to('.b4', { yPercent: -60, xPercent: 18, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 1.2 } });

    /* hero */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.bar', { y: -40, opacity: 0, duration: .7 })
      .from('.eyebrow', { y: 14, opacity: 0, duration: .6 }, '-=.4')
      .from('.name .ch', { yPercent: 118, rotation: 6, duration: 1.05, stagger: .035, ease: 'power4.out' }, '<.05')
      .from('.name .dot', { scale: 0, transformOrigin: '50% 80%', duration: .5, ease: 'back.out(3)' }, '-=.35')
      .from('.role', { y: 22, opacity: 0, duration: .7 }, '-=.6')
      .from('.hero .lead, .hero .chips .chip, .hero .cta > *', { y: 16, opacity: 0, stagger: .07, duration: .55 }, '-=.45');
    if (document.querySelector('.deck').offsetParent){
      tl.from('.gcard', { y: 90, opacity: 0, scale: .86, stagger: .14, duration: 1, ease: 'power4.out' }, 1.0)
        .from('#spark', { strokeDashoffset: 1, duration: 1.2, ease: 'power2.inOut' }, 1.6)
        .from('#sdot', { scale: 0, transformOrigin: '50% 50%', duration: .4, ease: 'back.out(3)' }, 2.6);
      gsap.utils.toArray('.gcard').forEach((c, i) => gsap.to(c, { yPercent: i % 2 ? 4 : -4, duration: 3.2 + i * .6, repeat: -1, yoyo: true, ease: 'sine.inOut' }));
    }
    gsap.to('.name .line:nth-child(1)', { xPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.name .line:nth-child(2)', { xPercent: 5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    /* marquee: skroll tezligiga qarab tezlashadi */
    const mq = gsap.to('#mtrack', { xPercent: -50, repeat: -1, duration: 34, ease: 'none' });
    let settle;
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 320, 6);
      gsap.to(mq, { timeScale: boost, duration: .25, overwrite: true });
      clearTimeout(settle);
      settle = setTimeout(() => gsap.to(mq, { timeScale: 1, duration: .9 }), 140);
    }});

    /* raqamlar */
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = +el.dataset.count, suf = el.dataset.suffix || '', o = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => {
        el.textContent = fmt(0) + suf;
        gsap.to(o, { v: end, duration: 1.5, ease: 'power2.out',
          onUpdate: () => { el.textContent = fmt(o.v) + suf; },
          onComplete: () => { el.textContent = fmt(end) + suf; } });
      }});
    });

    /* "Haqimda": so'zlar skroll bilan qorayadi */
    gsap.fromTo('#about .w', { opacity: .16 }, { opacity: 1, stagger: .12, ease: 'none',
      scrollTrigger: { trigger: '#about', start: 'top 82%', end: 'bottom 52%', scrub: true } });

    /* bloklar */
    gsap.utils.toArray('.sec-h, .stats-card, .about-meta > div, .panel, .sub, .tile, .skill, .tech a').forEach(el => {
      gsap.from(el, { y: 40, opacity: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
    });

    /* gorizontal "Ishlar" (keng ekranda) */
    if (wide){
      const hs = document.getElementById('hs'), track = document.getElementById('hsTrack');
      gsap.set(hs, { overflow: 'visible' });
      const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
      gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '#worksIn', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true } });
      gsap.utils.toArray('.work').forEach((c, i) => {
        gsap.from(c, { y: 60, opacity: 0, duration: .9, delay: i * .07, ease: 'power3.out',
          scrollTrigger: { trigger: '#worksIn', start: 'top 80%', once: true } });
      });
    } else {
      gsap.utils.toArray('.work').forEach(c => {
        gsap.from(c, { y: 40, opacity: .1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
      });
    }

    /* aloqa */
    gsap.from('.contact h2 .w > span', { yPercent: 115, duration: 1, stagger: .12, ease: 'power4.out',
      scrollTrigger: { trigger: '.contact h2', start: 'top 85%', once: true } });
    gsap.from('.contact .lead, .contact .cta > *, .contact .socials a', { y: 20, opacity: .1, stagger: .08, duration: .7, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact .lead', start: 'top 92%', once: true } });

    /* sichqoncha bor qurilmalar: yog'du, halqa, 3D qiyalik, magnit tugma */
    if (fine){
      const hero = document.querySelector('.hero'), spot = document.getElementById('spot'), ring = document.getElementById('ring');
      gsap.set(spot, { opacity: 1 });
      const rx = gsap.quickTo(ring, 'x', { duration: .35, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .35, ease: 'power3' });
      const deckCards = gsap.utils.toArray('.gcard').map(c => ({ c, d: +c.dataset.depth, x: gsap.quickTo(c, 'x', { duration: .8, ease: 'power3' }), y: gsap.quickTo(c, 'y', { duration: .8, ease: 'power3' }) }));
      on(window, 'pointermove', e => {
        ring.classList.add('on'); rx(e.clientX); ry(e.clientY);
        ring.classList.toggle('hot', !!e.target.closest('a, button, [data-tilt]'));
      });
      on(hero, 'pointermove', e => {
        const r = hero.getBoundingClientRect();
        spot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        spot.style.setProperty('--my', (e.clientY - r.top) + 'px');
        const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
        deckCards.forEach(o => { if (!o.busy) { o.x(-nx * o.d * 2); o.y(-ny * o.d * 2); } });
      });

      /* kartalarni sudrash: qo'yib yuborilganda joyiga qaytadi */
      let drag = null;
      deckCards.forEach(o => {
        const c = o.c;
        on(c, 'pointerdown', e => {
          if (e.pointerType === 'touch' || e.button !== 0) return;
          o.busy = true; gsap.killTweensOf(c, 'x,y,rotation');
          drag = { o, sx: e.clientX, sy: e.clientY, bx: +gsap.getProperty(c, 'x'), by: +gsap.getProperty(c, 'y'), br: +gsap.getProperty(c, 'rotation'), px: e.clientX };
          c.setPointerCapture(e.pointerId); c.classList.add('drag');
        });
        on(c, 'pointermove', e => {
          if (!drag || drag.o !== o) return;
          gsap.set(c, { x: drag.bx + e.clientX - drag.sx, y: drag.by + e.clientY - drag.sy });
          gsap.to(c, { rotation: drag.br + gsap.utils.clamp(-9, 9, (e.clientX - drag.px) * .7), duration: .25, overwrite: 'auto' });
          drag.px = e.clientX;
        });
        const end = () => {
          if (!drag || drag.o !== o) return;
          const br = drag.br; drag = null; c.classList.remove('drag');
          gsap.to(c, { x: 0, y: 0, rotation: br, duration: 1.1, ease: 'elastic.out(1,.55)', onComplete: () => { o.busy = false; } });
        };
        on(c, 'pointerup', end); on(c, 'pointercancel', end);
      });
      cleanups.push(() => ring.classList.remove('on'));
      document.querySelectorAll('.shine').forEach(el => {
        const mv = e => { const r = el.getBoundingClientRect(); el.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%'); el.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%'); };
        on(el, 'pointermove', mv);
      });
      document.querySelectorAll('[data-tilt]').forEach(el => {
        gsap.set(el, { transformPerspective: 900 });
        const tx = gsap.quickTo(el, 'rotationY', { duration: .5, ease: 'power3' }), ty = gsap.quickTo(el, 'rotationX', { duration: .5, ease: 'power3' });
        on(el, 'pointermove', e => { const r = el.getBoundingClientRect(); tx(((e.clientX - r.left) / r.width - .5) * 12); ty(-((e.clientY - r.top) / r.height - .5) * 12); });
        on(el, 'pointerleave', () => { tx(0); ty(0); });
      });
      document.querySelectorAll('[data-mag]').forEach(b => {
        const bx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3' }), by = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3' });
        on(b, 'pointermove', e => { const r = b.getBoundingClientRect(); bx((e.clientX - (r.left + r.width / 2)) * .2); by((e.clientY - (r.top + r.height / 2)) * .28); });
        on(b, 'pointerleave', () => { bx(0); by(0); });
      });
    }
    return () => { cleanups.forEach(f => f()); };
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
