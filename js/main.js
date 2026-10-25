/* ============================================================
   حسين عباس فرهود — محرك الحركات والتفاعل
   GSAP + ScrollTrigger + Canvas DNA + Custom Cursor
   ============================================================ */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(pointer: fine)').matches;
  const preloader = document.getElementById('preloader');

  const toArabicDigits = (n) =>
    String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

  /* ---------- تقسيم الكلمات (آمن للعربية: على مستوى الكلمة لا الحرف) ---------- */
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

  /* ---------- حالة عدم وجود GSAP أو تقليل الحركة ---------- */
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
     1) شاشة التحميل ثم دخول الهيرو
     ============================================================ */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('#scene', { opacity: 0 }, { opacity: 0.9, duration: 1.4 }, 0)
      .to('.hero__eyebrow', { y: 0, opacity: 1, duration: 0.9 }, 0.15)
      .to('.hero__title .word__inner', {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.12,
      }, 0.28)
      .to('.hero__subtitle', { y: 0, opacity: 1, duration: 0.9 }, 0.62)
      .to('.hero__cta', { y: 0, opacity: 1, duration: 0.9 }, 0.76)
      .to('.hero__meta', { y: 0, opacity: 1, duration: 0.9 }, 0.9)
      .fromTo('.hero__scroll', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 1.1);
  }

  gsap.set('[data-hero]:not([data-split])', { y: 34, opacity: 0 });
  gsap.set('.hero__scroll', { opacity: 0 });

  if (!REDUCED && preloader) {
    const countEl = document.getElementById('preloaderCount');
    const barEl = document.getElementById('preloaderBar');
    const counter = { v: 0 };

    gsap.to(counter, {
      v: 100,
      duration: 1.9,
      ease: 'power2.inOut',
      onUpdate() {
        const val = Math.round(counter.v);
        countEl.textContent = toArabicDigits(val);
        barEl.style.width = val + '%';
      },
      onComplete() {
        gsap.timeline()
          .to('.preloader__inner', { y: -34, opacity: 0, duration: 0.5, ease: 'power2.in' })
          .to('.preloader__panel', {
            yPercent: -100,
            stagger: 0.13,
            duration: 0.95,
            ease: 'power4.inOut',
          }, '-=0.15')
          .set(preloader, { display: 'none' })
          .add(heroIntro, '-=0.6');
      },
    });
  } else {
    heroIntro();
  }

  /* ============================================================
     2) انتقالات الظهور عند التمرير
     ============================================================ */
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.fromTo(el,
      { y: 48, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 89%' },
      }
    );
  });

  /* عناوين الأقسام: كلمات تصعد من أقنعة */
  gsap.utils.toArray('.section__title').forEach((title) => {
    gsap.to(title.querySelectorAll('.word__inner'), {
      yPercent: 0,
      stagger: 0.09,
      duration: 0.95,
      ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 87%' },
    });
  });

  /* خط زخرفة العنوان */
  gsap.utils.toArray('.section__line').forEach((line) => {
    gsap.from(line, {
      scaleX: 0,
      duration: 1.3,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: line, start: 'top 85%' },
    });
  });

  /* العدادات */
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

  /* الخط الزمني يمتلئ مع التمرير */
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

  /* أشرطة اللغات */
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

  /* شريط تقدم القراءة */
  gsap.to('#scrollProgress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  /* حركة Parallax للكرات الضوئية */
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
     3) القائمة العلوية وزر العودة
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

  toTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  /* قائمة الجوال */
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
     4) المؤشر المخصص + الأزرار المغناطيسية + الإمالة
     ============================================================ */
  if (FINE) {
    const cursor = document.getElementById('cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });

    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

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

    /* الأزرار المغناطيسية */
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

    /* إمالة البطاقات + بقعة الضوء */
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        gsap.to(card, {
          rotateY: (px - 0.5) * 7,
          rotateX: (0.5 - py) * 7,
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
     5) نسخ رقم الهاتف
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
     6) مشهد الحمض النووي DNA على Canvas
     ============================================================ */
  function initScene() {
    const canvas = document.getElementById('scene');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const N = 24;

    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.3 + 0.3,
      tw: Math.random() * Math.PI * 2,
      sp: 0.4 + Math.random() * 0.9,
    }));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    if (FINE) {
      window.addEventListener('mousemove', (e) => {
        mouse.tx = e.clientX / innerWidth - 0.5;
        mouse.ty = e.clientY / innerHeight - 0.5;
      }, { passive: true });
    }

    function drawStrand(pts, rgb) {
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.strokeStyle = `rgba(${rgb},0.22)`;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      pts.slice().sort((a, b) => a.depth - b.depth).forEach((p) => {
        const r = 2.1 + p.depth * 4.1;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.6);
        glow.addColorStop(0, `rgba(${rgb},${0.3 + p.depth * 0.55})`);
        glow.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 2.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${rgb},${0.45 + p.depth * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function frame(t) {
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      ctx.clearRect(0, 0, w, h);

      /* النجوم */
      for (const s of stars) {
        const alpha = 0.18 + 0.32 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.sp + s.tw));
        ctx.fillStyle = `rgba(243,226,179,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* الحلزون المزدوج */
      const cx = w / 2 + mouse.x * 60;
      const cy = h / 2 + mouse.y * 28;
      const R = Math.min(w * 0.24, 150);
      const gap = Math.min(33, h * 0.58 / N);
      const startY = cy - (gap * (N - 1)) / 2;
      const rot = t * 0.0007;
      const A = [], B = [];

      for (let i = 0; i < N; i++) {
        const ang = i * 0.42 + rot;
        const zA = Math.sin(ang);
        const zB = Math.sin(ang + Math.PI);
        A.push({ x: cx + Math.cos(ang) * R, y: startY + i * gap, depth: (zA + 1) / 2 });
        B.push({ x: cx + Math.cos(ang + Math.PI) * R, y: startY + i * gap, depth: (zB + 1) / 2 });
      }

      /* الروابط العرضية */
      for (let i = 0; i < N; i++) {
        const alpha = 0.07 + 0.13 * Math.abs(A[i].depth - 0.5) * 2;
        ctx.strokeStyle = `rgba(154,163,178,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(A[i].x, A[i].y);
        ctx.lineTo(B[i].x, B[i].y);
        ctx.stroke();
      }

      drawStrand(A, '216,181,106');   /* ذهبي */
      drawStrand(B, '65,217,155');    /* أخضر حيوي */

      raf = requestAnimationFrame(frame);
    }

    if (REDUCED) {
      frame(0);
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!REDUCED) {
        raf = requestAnimationFrame(frame);
      }
    });
  }
  initScene();

  /* تحديث مواقع التمرير بعد تحميل الخطوط */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());

  /* شبكة أمان: أي فشل غير متوقع لا يخفي المحتوى */
  setTimeout(() => {
    if (!window.__animReady) {
      document.body.classList.add('no-anim');
      if (preloader) preloader.remove();
    }
  }, 4000);
})();
