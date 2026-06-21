/* ============================================================
   NATIONAL INNOVATION EXPO 2026 — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────
     1. NAVBAR — scroll state + mobile toggle
     ──────────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const navToggle   = document.getElementById('navToggle');
  const navLinks    = document.getElementById('navLinks');
  const heroSection = document.getElementById('hero');
 
  // Scroll state (scrolled past hero)
  window.addEventListener('scroll', () => {
    const heroHeight = heroSection ? heroSection.offsetHeight : 600;
    if (window.scrollY > heroHeight - 72) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
 
  // Mobile toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
 
  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
 
  // Active section highlighting (using single performant IntersectionObserver to prevent glitching)
  const sectionIds = ['hero', 'stats', 'about', 'different', 'structure', 'get-involved', 'partner-advantages', 'impact', 'contact'];
  const navAnchorLinks = navLinks.querySelectorAll('.nav-link');
 
  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -60% 0px',
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
     2. SCROLL-REVEAL (Intersection Observer with Stagger)
     ──────────────────────────────────────────── */
  // Auto-set stagger index to children in layout grids
  document.querySelectorAll('.stats-grid, .different-grid, .sponsor-grid, .stalls-grid, .value-grid, .impact-grid').forEach(grid => {
    const items = grid.querySelectorAll('.scroll-reveal');
    items.forEach((item, index) => {
      item.style.setProperty('--stagger', index);
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );
 
  document.querySelectorAll('.scroll-reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Animated Stat Counters
  const countUpObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.getAttribute('data-animated') === 'true') return;
        el.setAttribute('data-animated', 'true');
        countUpObserver.unobserve(el);

        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1500; // fixed ~1500ms duration
        const startTime = performance.now();

        // Cubic ease-out
        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        function updateCounter(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutCubic(progress);
          const currentVal = Math.round(easedProgress * target);

          // Format value with comma if 1,000+
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
     4. SMOOTH SCROLL for anchor links
     ──────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 72; // navbar height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ────────────────────────────────────────────
     5. PARALLAX — hero orbs subtle movement
     ──────────────────────────────────────────── */
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  const orb3 = document.querySelector('.hero-orb-3');

  let ticking = false;
  window.addEventListener('mousemove', (e) => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        if (orb1) orb1.style.transform = `translate(${dx * 20}px, ${dy * 15}px)`;
        if (orb2) orb2.style.transform = `translate(${-dx * 15}px, ${-dy * 10}px)`;
        if (orb3) orb3.style.transform = `translate(calc(-50% + ${dx * 10}px), calc(-50% + ${dy * 8}px))`;
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ────────────────────────────────────────────
     6. CARD TILT effect on sponsor/stall/hexagon cards
     ──────────────────────────────────────────── */
  const tiltCards = document.querySelectorAll('.sponsor-card, .impact-card, .diff-card, .hexagon-tile');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const maxTilt = 5;
      card.style.transform = `
        translateY(-6px)
        rotateX(${-dy * maxTilt}deg)
        rotateY(${dx * maxTilt}deg)
      `;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.35s cubic-bezier(0.4,0,0.2,1)';
    });
  });

  /* ────────────────────────────────────────────
     7. GOLD PARTICLES / SHIMMER (Hero Canvas)
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
        this.y = Math.random() * height; // initial spread
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 20;
        this.size = Math.random() * 2.2 + 0.8; // fine gold dust size
        this.speedY = Math.random() * 0.4 + 0.15; // slow float up
        this.speedX = Math.random() * 0.2 - 0.1; // gentle drift
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.5 + 0.15;
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
        ctx.fillStyle = `rgba(212, 164, 55, ${this.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(212, 164, 55, 0.4)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = 22; // premium, non-busy gold foil sparkle
      for (let i = 0; i < count; i++) {
        particles.push(new GoldParticle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0; // reset for next frame redraw
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animateParticles);
    }

    // performance-first: only animate when hero is visible in viewport
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
     8. BACKGROUND HONEYCOMB PARALLAX DRIFT
     ──────────────────────────────────────────── */
  const hexBg = document.getElementById('global-hex-bg');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        // Only run parallax drift on screens > 768px width (mobile optimization)
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

  /* ────────────────────────────────────────────
     9. INIT — fire on load
     ──────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const heroHeight = heroSection ? heroSection.offsetHeight : 600;
    if (window.scrollY > heroHeight - 72) navbar.classList.add('scrolled');
  });

})();
