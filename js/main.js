/* ============================================================
   حسين عباس فرهود — محرك الحركات
   فلسفة الحركة: انبثاق ناعم عند الدخول (Pop Reveals)
   لا توجد حركات مربوطة بالتمرير — كل شيء يظهر بهدوء مرة واحدة
   ============================================================ */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(pointer: fine)').matches;
  const gateIntro = document.getElementById('gateIntro');

  const toArabicDigits = (n) =>
    String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

  /* ---------- تقسيم كلمات العنوان الرئيسي (آمن للعربية) ---------- */
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, i) => {
      const wrap = document.createElement('span');
      wrap.className = 'word';
      const inner = document.createElement('span');
      inner.className = 'word__inner';
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  }
  const heroTitle = document.querySelector('.hero__title[data-split]');
  if (heroTitle) splitWords(heroTitle);

  /* ---------- نافذة العرض المكبّر العامة ---------- */
  (function initLightbox() {
    const box = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const caption = document.getElementById('lightboxCaption');
    const triggers = document.querySelectorAll('[data-lightbox]');
    if (!box || !img || !triggers.length) return;
    let lastFocus = null;

    function open(trigger) {
      lastFocus = document.activeElement;
      img.src = trigger.dataset.full || trigger.querySelector('img')?.src || '';
      img.alt = trigger.querySelector('img')?.alt || '';
      caption.textContent = trigger.dataset.caption || '';
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      box.querySelector('.lightbox__close')?.focus();
    }
    function close() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lastFocus && lastFocus.focus && lastFocus.focus();
    }

    triggers.forEach((t) => t.addEventListener('click', () => open(t)));
    box.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
  })();

  /* ---------- تفاعلات أساسية ---------- */
  function initBasicInteractions() {
    const toTopBtn = document.getElementById('toTop');
    toTopBtn && toTopBtn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );

    const navToggleBtn = document.getElementById('navToggle');
    navToggleBtn && navToggleBtn.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      document.body.style.overflow = open ? 'hidden' : '';
      navToggleBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    });
    document.querySelectorAll('.mobile-menu a').forEach((a) =>
      a.addEventListener('click', () => {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
      })
    );

    const copyButton = document.getElementById('copyPhone');
    const copyText = document.getElementById('copyPhoneLabel');
    copyButton && copyButton.addEventListener('click', async () => {
      const phone = '07715993271';
      try {
        await navigator.clipboard.writeText(phone);
      } catch (err) {
        const tmp = document.createElement('input');
        tmp.value = phone;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        tmp.remove();
      }
      const original = copyText.textContent;
      copyText.textContent = 'تم النسخ ✓';
      setTimeout(() => { copyText.textContent = original; }, 2200);
    });
  }

  /* ---------- وضع تقليل الحركة أو غياب GSAP ---------- */
  if (REDUCED || !window.gsap) {
    document.body.classList.add('no-anim');
    if (gateIntro) gateIntro.remove();
    document.querySelectorAll('.lang__fill').forEach((f) => { f.style.width = f.dataset.width + '%'; });
    document.querySelectorAll('.timeline').forEach((t) => t.classList.add('is-visible'));
    initBasicInteractions();
    return;
  }

  initBasicInteractions();

  /* ============================================================
     1) بوابة عشتار ثم دخول الهيرو
     ============================================================ */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero__eyebrow', { y: 0, opacity: 1, duration: 0.9 }, 0.1)
      .to('.hero__title .word__inner', { yPercent: 0, duration: 1.15, stagger: 0.13 }, 0.22)
      .to('.hero__role', { y: 0, opacity: 1, duration: 0.85 }, 0.55)
      .to('.hero__subtitle', { y: 0, opacity: 1, duration: 0.9 }, 0.68)
      .to('.hero__cta', { y: 0, opacity: 1, duration: 0.9 }, 0.82)
      .to('.hero__meta', { y: 0, opacity: 1, duration: 0.9 }, 0.96)
      .fromTo('.hero__scroll', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 1.15);
  }

  gsap.set('[data-hero]:not([data-split])', { y: 36, opacity: 0 });
  gsap.set('.hero__scroll', { opacity: 0 });
  gsap.set('.hero__title .word__inner', { yPercent: 110 });

  function playGateIntro() {
    if (!gateIntro) { heroIntro(); return; }

    document.body.style.overflow = 'hidden';
    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = '';
        gateIntro.remove();
      },
    });

    tl.from('#gateCenter', { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out' })
      .to('#gateCenter', { opacity: 0, y: -18, duration: 0.5, ease: 'power2.in' }, '+=0.55')
      .to('#gateLight', { opacity: 1, scaleX: 1, duration: 0.7, ease: 'power2.out' }, '-=0.25')
      .to('.gate-door--start', { rotateY: 104, duration: 1.9, ease: 'power3.inOut' }, '-=0.45')
      .to('.gate-door--end', { rotateY: -104, duration: 1.9, ease: 'power3.inOut' }, '<')
      .to('.gate-door__edge', { opacity: 1, duration: 0.9 }, '<')
      .to('#gateLight', { opacity: 0, duration: 1.1, ease: 'power1.out' }, '<0.35')
      .to(gateIntro, {
        opacity: 0, duration: 0.6, ease: 'power2.out',
        onComplete() { gateIntro.classList.add('is-open'); },
      }, '-=0.95')
      .add(heroIntro, '-=0.5');

    gateIntro.addEventListener('click', () => tl.timeScale(2.4), { once: true });
  }
  playGateIntro();

  /* ============================================================
     2) نظام الانبثاق الناعم — IntersectionObserver
     ============================================================ */
  const popIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      popIO.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('[data-pop-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-pop]');
    items.forEach((el, i) => {
      const delay = Math.min(i * 95, 480);
      el.style.transitionDelay = delay + 'ms';
      setTimeout(() => { el.style.transitionDelay = ''; }, 1400 + delay);
    });
  });
  document.querySelectorAll('[data-pop]').forEach((el) => popIO.observe(el));

  /* ============================================================
     3) العدادات — تنبض once عند الدخول
     ============================================================ */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counterIO.unobserve(el);
      const end = Number(el.dataset.count);
      const state = { v: 0 };
      gsap.to(state, {
        v: end, duration: 1.7, ease: 'power2.out',
        onUpdate() {
          el.textContent = toArabicDigits(String(Math.round(state.v)).padStart(2, '0'));
        },
      });
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => counterIO.observe(el));

  /* ============================================================
     4) أشرطة اللغات — امتلاء ناعم عند الدخول
     ============================================================ */
  const barIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const fill = entry.target;
      barIO.unobserve(fill);
      fill.style.width = fill.dataset.width + '%';
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.lang__fill').forEach((f) => barIO.observe(f));

  /* ============================================================
     5) خط الخط الزمني ينمو once عند دخول القسم
     ============================================================ */
  const timelineIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      timelineIO.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.timeline').forEach((t) => timelineIO.observe(t));

  /* ============================================================
     6) حالة الشريط العلوي وزر العودة
     ============================================================ */
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');
  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 40);
      toTop.classList.toggle('is-visible', y > 600);
      scrollTicking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     7) المؤشر المخصص + المغناطيس + الإمالة
     ============================================================ */
  if (FINE) {
    const cursor = document.getElementById('cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    }, { passive: true });
    gsap.ticker.add(() => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      gsap.set(ring, { x: rx, y: ry });
    });

    document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });

    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.32,
          y: (e.clientY - r.top - r.height / 2) * 0.32,
          duration: 0.45, ease: 'power3.out',
        });
      });
      el.addEventListener('mouseleave', () =>
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' })
      );
    });

    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        gsap.to(card, {
          rotateY: (px - 0.5) * 6, rotateX: (0.5 - py) * 6,
          duration: 0.5, transformPerspective: 900, ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', () =>
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' })
      );
    });
  }

  /* ============================================================
     8) غبار بابل — sprites + إيقاف خارج الشاشة
     ============================================================ */
  function initDust() {
    const canvas = document.getElementById('dust');
    const hero = document.getElementById('hero');
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0, particles = [], visible = true;

    function makeSprite(rgb) {
      const s = document.createElement('canvas');
      const size = 32;
      s.width = size; s.height = size;
      const c = s.getContext('2d');
      const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, `rgba(${rgb},0.95)`);
      g.addColorStop(0.35, `rgba(${rgb},0.45)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, size, size);
      return s;
    }
    const goldSprite = makeSprite('216,181,106');
    const blueSprite = makeSprite('125,180,238');

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    function seed() {
      const count = Math.min(46, Math.floor((w * h) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.7,
        vy: -(Math.random() * 0.3 + 0.1),
        sway: Math.random() * Math.PI * 2,
        swaySp: Math.random() * 0.012 + 0.004,
        gold: Math.random() > 0.35,
        alpha: Math.random() * 0.45 + 0.2,
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy;
        p.sway += p.swaySp;
        p.x += Math.sin(p.sway) * 0.22;
        if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
        ctx.globalAlpha = p.alpha;
        const size = p.r * 7;
        ctx.drawImage(p.gold ? goldSprite : blueSprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0 }).observe(hero);
    }
    resize();
    window.addEventListener('resize', resize);
    start();
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  }
  initDust();

  /* إزالة قسرية للبوابة تحت أي ظرف */
  setTimeout(() => {
    if (gateIntro && document.body.contains(gateIntro)) {
      document.body.style.overflow = '';
      gateIntro.remove();
    }
  }, 9000);
})();
