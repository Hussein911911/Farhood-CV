/* ============================================================
   حسين عباس فرهود — محرك الحركات البابلي
   GSAP + ScrollTrigger + Canvas Dust (sprite-optimized)
   ============================================================ */

(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(pointer: fine)').matches;
  const gateIntro = document.getElementById('gateIntro');

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

  /* ---------- نافذة عرض الشهادة (تعمل بدون GSAP أيضاً) ---------- */
  (function initLightbox() {
    const openBtns = document.querySelectorAll('[data-open-cert]');
    const box = document.getElementById('certLightbox');
    if (!openBtns.length || !box) return;
    const closeEls = box.querySelectorAll('[data-close]');
    let lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      box.classList.add('is-open');
      box.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const closeBtn = box.querySelector('.lightbox__close');
      closeBtn && closeBtn.focus();
    }
    function close() {
      box.classList.remove('is-open');
      box.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lastFocus && lastFocus.focus && lastFocus.focus();
    }

    openBtns.forEach((btn) => btn.addEventListener('click', open));
    closeEls.forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && box.classList.contains('is-open')) close();
    });
  })();

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
    if (gateIntro) gateIntro.remove();
    document.querySelectorAll('.lang__fill').forEach((f) =>
      f.style.setProperty('--w', f.dataset.width + '%')
    );
    initBasicInteractions();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  window.__animReady = true;

  /* أقنعة الكلمات الابتدائية */
  gsap.set('.word__inner', { yPercent: 110 });

  /* ============================================================
     1) بوابة عشتار: انفتاح ثلاثي الأبعاد ثم دخول الهيرو
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

  function playGateIntro() {
    if (!gateIntro) { heroIntro(); return; }

    document.body.style.overflow = 'hidden';
    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = '';
        gateIntro.remove();
      },
    });

    /* النص المركزي يظهر بهدوء */
    tl.from('#gateCenter', { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out' })
      .to('#gateCenter', { opacity: 0, y: -18, duration: 0.5, ease: 'power2.in' }, '+=0.55');

    /* الضوء يتسرب من الشق قبل الفتح */
    tl.to('#gateLight', { opacity: 1, scaleX: 1, duration: 0.7, ease: 'power2.out' }, '-=0.25');

    /* البابان ينفتحان بعمق ثلاثي الأبعاد */
    tl.to('.gate-door--start', {
      rotateY: 104,
      duration: 1.9,
      ease: 'power3.inOut',
    }, '-=0.45')
      .to('.gate-door--end', {
        rotateY: -104,
        duration: 1.9,
        ease: 'power3.inOut',
      }, '<')
      .to('.gate-door__edge', { opacity: 1, duration: 0.9 }, '<')
      .to('#gateLight', { opacity: 0, duration: 1.1, ease: 'power1.out' }, '<0.35');

    /* إزالة البوابة وكشف الهيرو */
    tl.to(gateIntro, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete() {
        gateIntro.classList.add('is-open');
      },
    }, '-=0.95')
      .add(heroIntro, '-=0.5');

    /* الضغط في أي مكان يسرّع الفتح */
    gateIntro.addEventListener('click', () => tl.timeScale(2.4), { once: true });
  }
  playGateIntro();

  /* ============================================================
     2) الستائر اللازوردية — IntersectionObserver موثوق على الموبايل
        (لا يتأثر بالـpin أو شريط العنوان المتغير، والحركة تكتمل دائماً)
     ============================================================ */
  if ('IntersectionObserver' in window) {
    const curtainIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const curtain = entry.target;
        curtainIO.unobserve(curtain);
        gsap.fromTo(curtain,
          { yPercent: 101 },
          { yPercent: -101, duration: 1.3, ease: 'power4.inOut' }
        );
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    gsap.utils.toArray('.curtain').forEach((c) => curtainIO.observe(c));
  } else {
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
  }

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
        scrollTrigger: { trigger: el, start: 'top 89%', once: true },
      }
    );
  });

  gsap.utils.toArray('.section__title').forEach((title) => {
    gsap.to(title.querySelectorAll('.word__inner'), {
      yPercent: 0,
      stagger: 0.09,
      duration: 0.95,
      ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 87%', once: true },
    });
  });

  gsap.utils.toArray('.section__line').forEach((line) => {
    gsap.from(line, {
      scaleX: 0,
      duration: 1.3,
      ease: 'power3.inOut',
      scrollTrigger: { trigger: line, start: 'top 85%', once: true },
    });
  });

  /* ============================================================
     4) كشف الصور السينمائي + Parallax مباشر على transform
     ============================================================ */
  gsap.utils.toArray('[data-img-reveal]').forEach((wrap) => {
    gsap.fromTo(wrap,
      { clipPath: 'inset(12% 7% 12% 7%)', opacity: 0.4 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        duration: 1.4,
        ease: 'power4.out',
        scrollTrigger: { trigger: wrap, start: 'top 88%', once: true },
      }
    );
  });

  gsap.utils.toArray('[data-parallax-img]').forEach((img) => {
    gsap.fromTo(img,
      { y: -26 },
      {
        y: 26,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('[data-img-reveal]') || img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
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
     10) غبار بابل — sprites مرسومة مسبقاً + إيقاف خارج الشاشة
     ============================================================ */
  function initDust() {
    const canvas = document.getElementById('dust');
    const hero = document.getElementById('hero');
    if (!canvas || !hero) return;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, raf = 0;
    let particles = [];
    let visible = true;

    /* نرسم شكل الغبارة مرة واحدة بدل createRadialGradient كل إطار */
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
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
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

    function start() {
      if (raf || !visible) return;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    }

    /* إيقاف الرسم كلياً عندما يغادر الهيرو الشاشة */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }, { threshold: 0 }).observe(hero);
    }

    resize();
    window.addEventListener('resize', resize);
    start();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  }
  initDust();

  /* تحديث مواقع التمرير بعد تحميل الخطوط والصور */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.querySelectorAll('img').forEach((img) =>
    img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
  );

  /* إعادة حساب عند تغيير حجم الشاشة (شريط عنوان كروم المتغير على الموبايل) */
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });

  /* ============================================================
     11) شبكة أمان: لا شيء يبقى مخفياً داخل الشاشة لأي سبب كان
     ============================================================ */
  function rescueHidden() {
    const vh = window.innerHeight;
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < vh * 0.95 && r.bottom > 0;
    };

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (el.dataset.rescued || !inView(el)) return;
      el.dataset.rescued = '1';
      gsap.to(el, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' });
    });

    document.querySelectorAll('.section__title').forEach((t) => {
      if (t.dataset.rescued || !inView(t)) return;
      t.dataset.rescued = '1';
      gsap.to(t.querySelectorAll('.word__inner'), {
        yPercent: 0, duration: 0.7, stagger: 0.05, ease: 'power2.out',
      });
    });

    document.querySelectorAll('[data-img-reveal]').forEach((w) => {
      if (w.dataset.rescued || !inView(w)) return;
      w.dataset.rescued = '1';
      gsap.to(w, {
        clipPath: 'inset(0% 0% 0% 0%)', opacity: 1,
        duration: 0.9, ease: 'power2.out',
      });
    });
  }
  let rescueTicking = false;
  function onRescueScroll() {
    if (rescueTicking) return;
    rescueTicking = true;
    requestAnimationFrame(() => { rescueHidden(); rescueTicking = false; });
  }
  window.addEventListener('scroll', onRescueScroll, { passive: true });
  window.addEventListener('resize', rescueHidden);
  setTimeout(rescueHidden, 3500);
  window.addEventListener('load', rescueHidden);

  /* إزالة قسرية للبوابة الافتتاحية تحت أي ظرف (لا تعلق الموقع أبداً) */
  setTimeout(() => {
    if (gateIntro && document.body.contains(gateIntro)) {
      document.body.style.overflow = '';
      gateIntro.remove();
    }
  }, 9000);

  /* شبكة أمان: أي فشل غير متوقع لا يخفي المحتوى */
  setTimeout(() => {
    if (!window.__animReady && gateIntro) gateIntro.remove();
  }, 5000);
})();
