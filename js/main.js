/* ============================================================
   حسين عباس فرهود — محرك الحركات البابلي
   GSAP + ScrollTrigger + Canvas Dust + Pinned Gallery
   ============================================================ */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(pointer: fine)').matches;
  const preloader = document.getElementById('preloader');

  const toArabicDigits = (n) =>
    String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

  /* ---------- تقسيم الكلمات (آمن للعربية) ---------- */
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
  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* ---------- تفاعلات أساسية تعمل بدون أنيميشن ---------- */
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
    if (preloader) preloader.remove();
    document.querySelectorAll('.lang__fill').forEach((f) =>
      f.style.setProperty('--w', f.dataset.width + '%')
    );
    initBasicInteractions();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  window.__animReady = true;

  /* الأقنعة الابتدائية للكلمات */
  gsap.set('.word__inner', { yPercent: 110 });

  /* ============================================================
     1) شاشة التحميل: انفتاح بوابتَي عشتار ثم دخول الهيرو
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

  if (preloader) {
    const countEl = document.getElementById('preloaderCount');
    const barEl = document.getElementById('preloaderBar');
    const counter = { v: 0 };

    gsap.to(counter, {
      v: 100,
      duration: 2,
      ease: 'power2.inOut',
      onUpdate() {
        const val = Math.round(counter.v);
        countEl.textContent = toArabicDigits(val);
        barEl.style.width = val + '%';
      },
      onComplete() {
        gsap.timeline()
          .to('.preloader__inner', { y: -30, opacity: 0, duration: 0.45, ease: 'power2.in' })
          .to('.gate--start', { xPercent: 102, duration: 1.15, ease: 'power4.inOut' }, '-=0.1')
          .to('.gate--end', { xPercent: -102, duration: 1.15, ease: 'power4.inOut' }, '<')
          .set(preloader, { display: 'none' })
          .add(heroIntro, '-=0.75');
      },
    });
  } else {
    heroIntro();
  }

  /* ============================================================
     2) الستائر اللازوردية بين الأقسام
     ============================================================ */
  gsap.utils.toArray('.curtain').forEach((curtain) => {
    gsap.fromTo(curtain,
      { yPercent: 101 },
      {
        yPercent: -101,
        duration: 1.3,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: curtain.parentElement, start: 'top 72%' },
      }
    );
  });

  /* ============================================================
     3) انتقالات الظهور وعناوين الأقسام
     ============================================================ */
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.fromTo(el,
      { y: 48, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 89%' },
      }
    );
  });

  gsap.utils.toArray('.section__title').forEach((title) => {
    gsap.to(title.querySelectorAll('.word__inner'), {
      yPercent: 0,
      stagger: 0.09,
      duration: 0.95,
      ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 87%' },
    });
  });

  gsap.utils.toArray('.section__line').forEach((line) => {
    gsap.from(line, {
      scaleX: 0,
      duration: 1.3,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: line, start: 'top 85%' },
    });
  });

  /* ============================================================
     4) كشف الصور السينمائي + Parallax
     ============================================================ */
  gsap.utils.toArray('[data-img-reveal]').forEach((wrap) => {
    gsap.fromTo(wrap,
      { clipPath: 'inset(12% 7% 12% 7%)', opacity: 0.4 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        duration: 1.4,
        ease: 'power4.out',
        scrollTrigger: { trigger: wrap, start: 'top 88%' },
      }
    );
  });

  gsap.utils.toArray('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(img,
      { '--py': '-28px' },
      {
        '--py': '28px',
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('[data-img-reveal]') || img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      }
    );
  });

  /* ============================================================
     5) معرض بابل — تمرير أفلي مثبّت
     ============================================================ */
  const gallery = document.getElementById('gallery');
  const track = document.getElementById('galleryTrack');
  const viewport = document.getElementById('galleryViewport');
  const galleryProgress = document.getElementById('galleryProgress');

  if (gallery && track) {
    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    gsap.to(track, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: gallery,
        start: 'top top',
        end: () => '+=' + getDistance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate(self) {
          if (galleryProgress) galleryProgress.style.width = self.progress * 100 + '%';
        },
      },
    });
    viewport.classList.add('is-pinned');
  }

  /* ============================================================
     6) العدادات والخط الزمني والأشرطة والتقدم
     ============================================================ */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter() {
        const state = { v: 0 };
        gsap.to(state, {
          v: end,
          duration: 1.7,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = toArabicDigits(String(Math.round(state.v)).padStart(2, '0'));
          },
        });
      },
    });
  });

  gsap.to('#timelineLine', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 68%',
      end: 'bottom 70%',
      scrub: 0.7,
    },
  });

  document.querySelectorAll('.lang__fill').forEach((fill) => {
    const w = fill.dataset.width;
    fill.style.setProperty('--w', w + '%');
    gsap.to(fill, {
      width: w + '%',
      duration: 1.5,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: fill, start: 'top 93%' },
    });
  });

  gsap.to('#scrollProgress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  /* كرات الضوء */
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) * 120;
    gsap.fromTo(el,
      { yPercent: -speed / 2 },
      {
        yPercent: speed,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.1,
        },
      }
    );
  });

  /* ============================================================
     7) القائمة العلوية وزر العودة وقائمة الجوال
     ============================================================ */
  const nav = document.getElementById('nav');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  navToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    navToggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
    })
  );

  /* ============================================================
     8) المؤشر المخصص + المغناطيس + الإمالة
     ============================================================ */
  if (FINE) {
    const cursor = document.getElementById('cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });

    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
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
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: x * 0.32, y: y * 0.32, duration: 0.45, ease: 'power3.out' });
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
          rotateY: (px - 0.5) * 6,
          rotateX: (0.5 - py) * 6,
          duration: 0.5,
          transformPerspective: 900,
          ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', () =>
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3.out' })
      );
    });
  }

  /* ============================================================
     9) نسخ رقم الهاتف
     ============================================================ */
  const copyBtn = document.getElementById('copyPhone');
  const copyLabel = document.getElementById('copyPhoneLabel');
  copyBtn.addEventListener('click', async () => {
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
    const original = copyLabel.textContent;
    copyLabel.textContent = 'تم النسخ ✓';
    setTimeout(() => { copyLabel.textContent = original; }, 2200);
  });

  /* ============================================================
     10) غبار بابل الذهبي على Canvas
     ============================================================ */
  function initDust() {
    const canvas = document.getElementById('dust');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0;
    let particles = [];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const count = Math.min(80, Math.floor((w * h) / 16000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2.2 + 0.6,
        vy: -(Math.random() * 0.35 + 0.12),
        sway: Math.random() * Math.PI * 2,
        swaySp: Math.random() * 0.015 + 0.005,
        gold: Math.random() > 0.35,
        alpha: Math.random() * 0.5 + 0.2,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y += p.vy;
        p.sway += p.swaySp;
        p.x += Math.sin(p.sway) * 0.25;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }

        const color = p.gold ? '216,181,106' : '125,180,238';
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0, `rgba(${color},${p.alpha})`);
        glow.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${color},${Math.min(1, p.alpha + 0.35)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(frame);
    });
  }
  initDust();

  /* تحديث مواقع التمرير بعد تحميل الخطوط */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* شبكة أمان */
  setTimeout(() => {
    if (!window.__animReady) {
      document.body.classList.add('no-anim');
      if (preloader) preloader.remove();
    }
  }, 4000);
})();
