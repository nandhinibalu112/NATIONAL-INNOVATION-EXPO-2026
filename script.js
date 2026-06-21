(function () {
  'use strict';

  /* ────────────────────────────────────────────
     1. NAVBAR & Hamburger Menu
     ──────────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const navToggle   = document.getElementById('navToggle');
  const navLinks    = document.getElementById('navLinks');
  const heroSection = document.getElementById('hero');

  // Scroll background highlight
  window.addEventListener('scroll', () => {
    const heroHeight = heroSection ? heroSection.offsetHeight : 600;
    if (window.scrollY > heroHeight - 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggling
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile links on tap
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Active state navigation highlighting via IntersectionObserver
  const sectionIds = ['hero', 'updates', 'about', 'sponsorship', 'stalls', 'downloads', 'faq', 'contact'];
  const navAnchorLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -50% 0px',
    threshold: 0
  };

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchorLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) activeObserver.observe(el);
  });

  /* ────────────────────────────────────────────
     2. FLOATING CTA Visibility Toggle
     ──────────────────────────────────────────── */
  const floatingCta = document.querySelector('.floating-cta');
  if (floatingCta) {
    window.addEventListener('scroll', () => {
      // Show floating CTA after scrolling past 400px
      if (window.scrollY > 400) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
      }
    }, { passive: true });
  }

  /* ────────────────────────────────────────────
     3. SCROLL REVEAL (Lightweight Stagger)
     ──────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach((el, index) => {
    // Inject custom CSS delay variables based on sequence
    el.style.setProperty('--stagger', index % 4);
    revealObserver.observe(el);
  });

  /* ────────────────────────────────────────────
     4. FAQ ACCORDION
     ──────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.faq-content');
          if (otherContent) otherContent.style.maxHeight = '0px';
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });

        // Toggle current item
        if (!isActive) {
          item.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        } else {
          item.classList.remove('active');
          content.style.maxHeight = '0px';
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  /* ────────────────────────────────────────────
     5. STATS COUNT-UP ANIMATION
     ──────────────────────────────────────────── */
  const countUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.getAttribute('data-animated') === 'true') return;
        el.setAttribute('data-animated', 'true');
        countUpObserver.unobserve(el);

        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1500; // fixed ~1500ms
        const startTime = performance.now();

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function updateCounter(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);
          const currentVal = Math.round(easedProgress * target);

          // Add comma formatting for large numbers
          let formattedVal = currentVal.toLocaleString('en-US');
          el.textContent = formattedVal + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = target.toLocaleString('en-US') + suffix;
          }
        }

        requestAnimationFrame(updateCounter);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.stat-number').forEach(stat => {
    countUpObserver.observe(stat);
  });

  /* ────────────────────────────────────────────
     6. HERO CANVAS PARTICLES
     ──────────────────────────────────────────── */
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId = null;
    let width = 0;
    let height = 0;

    function resizeCanvas() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    }

    class GoldParticle {
      constructor() {
        this.reset();
        this.y = Math.random() * height; // Spread initially
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.size = Math.random() * 2.0 + 0.8;
        this.speedY = Math.random() * 0.35 + 0.15;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.4 + 0.15;
        this.fadeSpeed = 0.005 + Math.random() * 0.005;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        if (this.opacity < this.maxOpacity) {
          this.opacity += this.fadeSpeed;
        }

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = 25;
      for (let i = 0; i < count; i++) {
        particles.push(new GoldParticle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationFrameId) {
            resizeCanvas();
            initParticles();
            animateParticles();
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0 });

    if (heroSection) {
      heroObserver.observe(heroSection);
    }

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    }, { passive: true });
  }

  /* ────────────────────────────────────────────
     7. HONEYCOMB BACKGROUND PARALLAX DRIFT
     ──────────────────────────────────────────── */
  const hexBg = document.getElementById('global-hex-bg');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        // Run parallax drift only on desktop viewports
        if (window.innerWidth > 768 && hexBg) {
          const scrolled = window.scrollY;
          hexBg.style.transform = `translate3d(0, ${-scrolled * 0.08}px, 0)`;
        } else if (hexBg) {
          hexBg.style.transform = 'none';
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

})();
