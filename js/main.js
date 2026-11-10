/**
 * NT Partner Support — Main JavaScript
 * Minimal, Aman-inspired interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initRevealAnimations();
  initMobileMenu();
  initFloatingCTA();
  initCounters();
  initHeroLoad();
});

/**
 * Hero load state
 */
function initHeroLoad() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Slight delay for dramatic reveal
  setTimeout(() => {
    hero.classList.add('is-loaded');
  }, 200);
}

/**
 * Header — minimal scroll behavior
 */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 80) {
      header.classList.add('header--scrolled');
      header.classList.remove('header--transparent');
    } else {
      header.classList.remove('header--scrolled');
      header.classList.add('header--transparent');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/**
 * Intersection Observer for subtle reveals
 */
function initRevealAnimations() {
  const elements = document.querySelectorAll('.reveal, .fade, .reveal-stagger, .img-reveal, .line-draw');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/**
 * Mobile menu
 */
function initMobileMenu() {
  const hamburger = document.querySelector('.header__hamburger');
  const mobileMenu = document.querySelector('.header__mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('is-active');
    mobileMenu.classList.toggle('is-open');
    const isOpen = mobileMenu.classList.contains('is-open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    document.body.classList.toggle('menu-open', isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-active');
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    });
  });
}

/**
 * Floating CTA
 */
function initFloatingCTA() {
  const ctaFloat = document.querySelector('.cta-float');
  if (!ctaFloat) return;

  const onScroll = () => {
    ctaFloat.classList.toggle('is-visible', window.scrollY > 500);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * Counter animation
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(eased * target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = prefix + target.toLocaleString() + suffix;
    }
  };

  requestAnimationFrame(step);
}

/**
 * Smooth scroll for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = document.querySelector('.header')?.offsetHeight || 72;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth',
      });
    }
  });
});
