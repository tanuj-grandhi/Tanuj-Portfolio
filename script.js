/**
 * script.js
 * Tanuj Grandhi — Editorial Portfolio
 * Vanilla JS | No dependencies
 *
 * Sections:
 *  1. Utility helpers
 *  2. Scroll progress indicator
 *  3. Navigation (sticky, blur, mobile menu, active link)
 *  4. Smooth scrolling
 *  5. Scroll-reveal animations (IntersectionObserver)
 *  6. Hero entrance animations
 *  7. Project hover effects
 *  8. Skills stagger animation
 *  9. Typing / typewriter effect
 * 10. Footer year
 */

'use strict';

/* ============================================================
   1. UTILITY HELPERS
   ============================================================ */

/**
 * Shorthand querySelector
 * @param {string} selector
 * @param {Element|Document} [ctx=document]
 * @returns {Element|null}
 */
const qs = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand querySelectorAll → returns a real Array
 * @param {string} selector
 * @param {Element|Document} [ctx=document]
 * @returns {Element[]}
 */
const qsa = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

/**
 * Check whether the user has requested reduced motion via OS/browser preference.
 * Used to skip or tone-down animations globally.
 * @returns {boolean}
 */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Clamp a number between min and max.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ============================================================
   2. SCROLL PROGRESS INDICATOR
   A thin orange bar fixed at the very top of the viewport
   that fills left → right as the user scrolls the page.
   ============================================================ */

function initScrollProgress() {
  // Create the progress bar element programmatically so it doesn't
  // require changes to index.html.
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Page reading progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', '0');

  // Inline the minimal styles so the bar works even if CSS hasn't loaded.
  Object.assign(bar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0%',
    height: '3px',
    background: 'var(--accent, #FF6B35)',
    zIndex: '9999',
    transformOrigin: 'left center',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  });

  document.body.prepend(bar);

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    if (docHeight <= 0) return; // Prevent division by zero on short pages

    const progress = clamp((scrollTop / docHeight) * 100, 0, 100);
    bar.style.width = `${progress}%`;
    bar.setAttribute('aria-valuenow', Math.round(progress));
  }

  // Listen on scroll with passive flag for better performance
  window.addEventListener('scroll', updateProgress, { passive: true });

  // Run once on init to set correct state on page refresh
  updateProgress();
}

/* ============================================================
   3. NAVIGATION
   - Adds .scrolled class to <header> / <nav> when the user
     scrolls past 60 px (triggers backdrop-filter blur in CSS)
   - Hamburger toggle for mobile (aria-expanded, .menu-open)
   - Keyboard accessibility: Escape closes the mobile menu
   - Active link highlighting based on current scroll position
   ============================================================ */

function initNavigation() {
  const header  = qs('header') || qs('.site-header') || qs('nav');
  const nav     = qs('nav') || qs('.nav');
  const hamburger = qs('.hamburger') || qs('.nav-toggle') || qs('[data-menu-toggle]');
  const navLinks  = qsa('nav a[href], .nav a[href]');
  const SCROLL_THRESHOLD = 60; // px before header changes style

  if (!header && !nav) return; // Nothing to work with

  /* ---- 3a. Sticky / blur header ---- */
  function onHeaderScroll() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    const target = header || nav;
    target.classList.toggle('scrolled', scrolled);
  }

  window.addEventListener('scroll', onHeaderScroll, { passive: true });
  onHeaderScroll(); // Apply immediately in case page loads mid-scroll

  /* ---- 3b. Mobile hamburger menu ---- */
  if (hamburger && nav) {
    // Ensure proper initial ARIA state
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', nav.id || 'nav-menu');
    if (!nav.id) nav.id = 'nav-menu';

    function openMenu() {
      nav.classList.add('menu-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.classList.add('is-active');
      // Prevent background scrolling when menu is open
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      nav.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    function toggleMenu() {
      const isOpen = nav.classList.contains('menu-open');
      isOpen ? closeMenu() : openMenu();
    }

    // Click/tap toggle
    hamburger.addEventListener('click', toggleMenu);

    // Keyboard: Space or Enter activate toggle
    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });

    // Escape key closes the menu and returns focus to hamburger
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('menu-open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Close when any nav link is clicked (single-page navigation)
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('menu-open')) closeMenu();
      });
    });

    // Close when clicking outside the nav on mobile
    document.addEventListener('click', (e) => {
      if (
        nav.classList.contains('menu-open') &&
        !nav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });
  }

  /* ---- 3c. Active link highlighting ---- */
  // Collect all sections that have an id matching a nav href
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        return document.getElementById(href.slice(1));
      }
      return null;
    })
    .filter(Boolean);

  function updateActiveLink() {
    // Use a small offset so the active link updates slightly
    // before the section reaches the very top of the viewport
    const offset = 120;
    let current = '';

    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= sectionTop - offset) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href === `#${current}`;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
}

/* ============================================================
   4. SMOOTH SCROLLING
   Intercepts clicks on internal anchor links and scrolls
   smoothly to the target. Handles:
   - All <a href="#..."> elements anywhere in the document
   - Accounts for sticky header height as an offset
   ============================================================ */

function initSmoothScrolling() {
  // Select all internal anchor links
  const anchorLinks = qsa('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Skip bare "#" which would scroll to the top in a jumpy way
      if (!href || href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const target = document.getElementById(href.slice(1));
      if (!target) return; // Let default behaviour handle external anchors

      e.preventDefault();

      // Measure the sticky header height to use as scroll offset
      const headerHeight =
        (qs('header') || qs('nav') || { offsetHeight: 0 }).offsetHeight;

      const targetTop =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        16; // Extra 16 px breathing room

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });

      // Move focus to the section for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/* ============================================================
   5. SCROLL-REVEAL ANIMATIONS (IntersectionObserver)
   Elements must carry one of these classes in the HTML:
     .reveal        — fade + slide up
     .reveal-left   — fade + slide from left
     .reveal-right  — fade + slide from right
     .stagger-item  — child items staggered with delay

   The CSS should define the initial hidden state for each
   class and transition to the .is-visible state.
   ============================================================ */

function initScrollReveal() {
  // Bail completely if the user wants reduced motion
  if (prefersReducedMotion()) {
    // Make all reveal elements immediately visible so nothing is hidden
    qsa('.reveal, .reveal-left, .reveal-right, .stagger-item').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const THRESHOLD = 0.15; // Fraction of element that must be visible

  const observerOptions = {
    root: null,       // Use the viewport as the root
    rootMargin: '0px',
    threshold: THRESHOLD,
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('is-visible');

      // Once revealed, no need to keep observing
      revealObserver.unobserve(el);
    });
  }, observerOptions);

  // Observe single-element reveal classes
  qsa('.reveal, .reveal-left, .reveal-right').forEach((el) => {
    revealObserver.observe(el);
  });

  /* ---- Stagger children ---- */
  // For each parent that contains .stagger-item children,
  // observe the parent, then cascade delays when it enters view.
  const staggerParents = new Set();
  qsa('.stagger-item').forEach((item) => {
    if (item.parentElement) staggerParents.add(item.parentElement);
  });

  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const parent = entry.target;
      const items = qsa('.stagger-item', parent);

      items.forEach((item, index) => {
        // 80 ms between each item — feels snappy without being rushed
        setTimeout(() => {
          item.classList.add('is-visible');
        }, index * 80);
      });

      staggerObserver.unobserve(parent);
    });
  }, { threshold: 0.1 });

  staggerParents.forEach((parent) => staggerObserver.observe(parent));
}

/* ============================================================
   6. HERO ENTRANCE ANIMATIONS
   Runs once on DOMContentLoaded. Adds .is-visible (or
   a custom class) to hero elements with staggered timeouts
   so the page feels alive as it loads.

   Expected hero HTML structure (classes are flexible):
     .hero-name      — author name block
     .hero-headline  — large display headline
     .hero-tagline   — sub-headline / descriptor
     .hero-ctas      — CTA button group
     .hero-accent    — decorative orange line

   Delays match the brief:
     200 ms  → name
     500 ms  → headline
     900 ms  → tagline
    1200 ms  → CTAs
    1500 ms  → accent line
   ============================================================ */

function initHeroAnimations() {
  // All selectors that need hero-visible added
  const allSelectors = [
    '.name-line', '.hero-title', '.hero-intro',
    '.hero-ctas', '.hero-orange-rule', '.hero-github-link', '.hero-photo-frame'
  ];

  if (prefersReducedMotion()) {
    // Instantly reveal everything
    qsa(allSelectors.join(', ')).forEach((el) => el.classList.add('hero-visible'));
    return;
  }

  const sequence = [
    { selector: '.hero-greeting',    delay: 100  }, // "Hey, I'm" first
    { selector: '.name-line',        delay: 250  }, // Tanuj / Grandhi.
    { selector: '.hero-orange-rule', delay: 550  }, // orange bar expands
    { selector: '.hero-title',       delay: 700  }, // subtitle
    { selector: '.hero-intro',       delay: 900  }, // intro paragraph
    { selector: '.hero-ctas',        delay: 1100 }, // CTA buttons
    { selector: '.hero-github-link', delay: 1300 }, // github link
    { selector: '.hero-photo-frame', delay: 400  }, // photo slides up
  ];

  sequence.forEach(({ selector, delay }) => {
    const elements = qsa(selector);
    if (elements.length === 0) return;

    setTimeout(() => {
      elements.forEach((el) => el.classList.add('hero-visible'));
    }, delay);
  });
}

/* ============================================================
   7. PROJECT HOVER EFFECTS
   Adds subtle interactive feedback to project/work rows:
   - Background tint on row hover
   - Arrow icon shifts right on .arrow-link hover

   Note: Pure CSS handles the visual transition; JS merely
   ensures event listeners are attached if CSS :hover is
   insufficient (e.g., touch devices needing focus states).
   ============================================================ */

function initProjectHoverEffects() {
  /* ---- Project rows ---- */
  const projectRows = qsa(
    '.project-row, .work-row, .project-item, [data-project-row]'
  );

  projectRows.forEach((row) => {
    // Mouse events
    row.addEventListener('mouseenter', () => row.classList.add('is-hovered'));
    row.addEventListener('mouseleave', () => row.classList.remove('is-hovered'));

    // Focus events for keyboard / accessibility parity
    row.addEventListener('focusin',  () => row.classList.add('is-hovered'));
    row.addEventListener('focusout', () => row.classList.remove('is-hovered'));
  });

  /* ---- Arrow links ---- */
  const arrowLinks = qsa('.arrow-link, [data-arrow-link]');

  arrowLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => link.classList.add('arrow-active'));
    link.addEventListener('mouseleave', () => link.classList.remove('arrow-active'));
    link.addEventListener('focus',      () => link.classList.add('arrow-active'));
    link.addEventListener('blur',       () => link.classList.remove('arrow-active'));
  });
}

/* ============================================================
   8. SKILLS STAGGER ANIMATION
   Finds skill category containers and reveals their child
   tags with a staggered delay when they scroll into view.

   Expected structure:
     .skills-category  (or similar)
       └── .skill-tag  (repeated)
   ============================================================ */

function initSkillsAnimation() {
  if (prefersReducedMotion()) return;

  const skillCategories = qsa(
    '.skills-category, .skills-group, [data-skills-group]'
  );

  if (skillCategories.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const tags = qsa('.skill-tag, [data-skill-tag]', entry.target);
        tags.forEach((tag, i) => {
          setTimeout(() => {
            tag.classList.add('is-visible');
          }, i * 60); // 60 ms stagger feels crisp for small tags
        });

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  skillCategories.forEach((cat) => observer.observe(cat));
}

/* ============================================================
   9. TYPING / TYPEWRITER EFFECT
   Optional: adds a typewriter effect to the hero sub-headline.
   Targets the first element matching .hero-tagline or
   [data-typewriter].

   Skipped entirely when prefers-reduced-motion is set.
   ============================================================ */

function initTypewriterEffect() {
  if (prefersReducedMotion()) return;

  const target = qs('[data-typewriter]') || qs('.hero-tagline');
  if (!target) return;

  // Save original text, then clear the element
  const originalText = target.textContent.trim();
  if (!originalText) return;

  // Only run if the element has the data-typewriter attribute
  // OR is specifically opted-in via a class. Without an explicit
  // opt-in we respect whatever the designer put in the markup.
  if (!target.hasAttribute('data-typewriter')) return;

  target.textContent = '';
  target.setAttribute('aria-label', originalText); // Screen readers see full text immediately
  target.setAttribute('aria-live', 'off');          // Don't announce every character

  let charIndex = 0;
  const CHAR_DELAY = 40; // ms per character — adjust for speed preference

  // Start typing only after the hero tagline's reveal delay (900 ms)
  setTimeout(() => {
    target.classList.add('hero-visible'); // Make element visible first

    const interval = setInterval(() => {
      if (charIndex >= originalText.length) {
        clearInterval(interval);
        return;
      }
      target.textContent += originalText[charIndex];
      charIndex++;
    }, CHAR_DELAY);
  }, 950); // Slightly after the hero sequence delay for tagline
}

/* ============================================================
   10. FOOTER YEAR
   Dynamically inject the current year into any element that
   has the class .footer-year or [data-year].
   ============================================================ */

function initFooterYear() {
  const year = new Date().getFullYear();
  const yearEls = qsa('.footer-year, [data-year]');

  yearEls.forEach((el) => {
    el.textContent = year;
  });
}

/* ============================================================
   BONUS: CURSOR SPOTLIGHT (subtle, editorial feel)
   A very subtle radial highlight that follows the cursor
   to add depth. Disabled on touch devices and when
   prefers-reduced-motion is set.
   ============================================================ */

function initCursorSpotlight() {
  if (prefersReducedMotion()) return;

  // Only run on non-touch devices
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (isTouchDevice) return;

  const spotlight = document.createElement('div');
  spotlight.id = 'cursor-spotlight';
  Object.assign(spotlight.style, {
    position: 'fixed',
    pointerEvents: 'none',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    top: '0',
    left: '0',
    zIndex: '0',
    transition: 'opacity 0.3s ease',
    opacity: '0',
  });

  document.body.appendChild(spotlight);

  let mouseX = 0;
  let mouseY = 0;
  let rafId = null;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    spotlight.style.opacity = '1';

    // Cancel any pending animation frame to avoid stacking
    if (rafId) cancelAnimationFrame(rafId);

    rafId = requestAnimationFrame(() => {
      spotlight.style.left = `${mouseX}px`;
      spotlight.style.top  = `${mouseY}px`;
    });
  });

  // Fade out when cursor leaves the window
  document.addEventListener('mouseleave', () => {
    spotlight.style.opacity = '0';
  });
}

/* ============================================================
   BONUS: SECTION COUNTER ANIMATION
   Animates numbers inside [data-count-to] from 0 to the
   target value when they scroll into view.
   ============================================================ */

function initCounterAnimation() {
  if (prefersReducedMotion()) {
    qsa('[data-count-to]').forEach((el) => {
      el.textContent = el.getAttribute('data-count-to');
    });
    return;
  }

  const counters = qsa('[data-count-to]');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count-to'), 10);
        const duration = parseInt(el.getAttribute('data-count-duration') || '1200', 10);
        const suffix = el.getAttribute('data-count-suffix') || '';
        const startTime = performance.now();
        const startValue = 0;

        function step(timestamp) {
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out cubic for a natural feel
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(startValue + (target - startValue) * eased);
          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ============================================================
   INIT — Wire everything up once the DOM is ready
   ============================================================ */

function init() {
  // Core functionality
  initFooterYear();         // Set year immediately — no delay needed
  initScrollProgress();     // Reading progress bar
  initNavigation();         // Header scroll state + mobile menu
  initSmoothScrolling();    // Intercept anchor clicks
  initScrollReveal();       // IntersectionObserver-based reveal
  initHeroAnimations();     // Timed hero entrance sequence
  initProjectHoverEffects(); // Row + arrow hover feedback
  initSkillsAnimation();    // Skill tag stagger reveal
  initTypewriterEffect();   // Optional typewriter (opt-in via data attr)

  // Enhancements
  initCursorSpotlight();    // Subtle cursor glow
  initCounterAnimation();   // Number count-up for stats
}

/* ============================================================
   ENTRY POINT
   Use DOMContentLoaded so we don't have to wait for images,
   fonts, or other sub-resources to load.
   ============================================================ */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already parsed (script loaded with defer or at end of body)
  init();
}
