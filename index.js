/* ============================================================
   ScoRAGE V1 — Landing Page Interactions
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. NAVBAR — Scroll background
  // ============================================================
  const navbar = document.getElementById('navbar');
  
  const handleNavbarScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ============================================================
  // 2. MOBILE MENU TOGGLE
  // ============================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      
      const isOpen = navLinks.classList.contains('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      
      // Update icon
      if (isOpen) {
        mobileToggle.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <line x1="6" y1="6" x2="18" y2="18"></line>
            <line x1="6" y1="18" x2="18" y2="6"></line>
          </svg>`;
        document.body.style.overflow = 'hidden';
      } else {
        mobileToggle.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>`;
        document.body.style.overflow = '';
      }
    });

    // Close menu on link click
    navLinks.querySelectorAll('.navbar__link, .navbar__cta a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        document.body.style.overflow = '';
        mobileToggle.innerHTML = `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>`;
      });
    });
  }

  // ============================================================
  // 3. SMOOTH SCROLL for anchor links
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================
  // 4. F.I.R.E.S. TABS
  // ============================================================
  const firesNav = document.getElementById('fires-nav');
  const firesContent = document.getElementById('fires-content');

  if (firesNav && firesContent) {
    const tabs = firesNav.querySelectorAll('.fires__tab');
    const panels = firesContent.querySelectorAll('.fires__panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.fires;

        // Deactivate all
        tabs.forEach(t => t.classList.remove('is-active'));
        panels.forEach(p => p.classList.remove('is-active'));

        // Activate clicked
        tab.classList.add('is-active');
        const targetPanel = firesContent.querySelector(`[data-fires-panel="${target}"]`);
        if (targetPanel) {
          targetPanel.classList.add('is-active');
        }
      });
    });
  }

  // ============================================================
  // 5. FAQ ACCORDION
  // ============================================================
  const faqList = document.getElementById('faq-list');

  if (faqList) {
    const faqItems = faqList.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-item__question');

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all
        faqItems.forEach(i => {
          i.classList.remove('is-open');
          i.querySelector('.faq-item__toggle').textContent = '+';
        });

        // Open clicked (if it was closed)
        if (!isOpen) {
          item.classList.add('is-open');
          item.querySelector('.faq-item__toggle').textContent = '−';
        }
      });
    });
  }

  // ============================================================
  // 6. SCROLL REVEAL ANIMATIONS
  // ============================================================
  const revealElements = document.querySelectorAll(
    '.section__header, .card, .card-feature, .process__step, .fires__layout, .mockup-frame, .cta-final__title, .cta-final .btn-primary'
  );

  // Add initial hidden state
  const style = document.createElement('style');
  style.textContent = `
    .reveal-hidden {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 500ms ease-out, transform 500ms ease-out;
    }
    .reveal-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  revealElements.forEach((el, index) => {
    el.classList.add('reveal-hidden');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger animation for sibling elements
        const parent = entry.target.parentElement;
        const siblings = parent ? parent.querySelectorAll('.reveal-hidden:not(.reveal-visible)') : [];
        
        let delay = 0;
        if (siblings.length > 1 && parent.classList.contains('why__grid') || 
            parent.classList.contains('usecases__grid') || 
            parent.classList.contains('chains__grid') ||
            parent.classList.contains('pricing__grid') ||
            parent.classList.contains('process__grid')) {
          const index = Array.from(siblings).indexOf(entry.target);
          delay = index * 80;
        }

        setTimeout(() => {
          entry.target.classList.add('reveal-visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================================
  // 7. SCORE COUNTER ANIMATION (hero)
  // ============================================================
  const scoreValue = document.querySelector('.hero .card-score__value');
  
  if (scoreValue) {
    const targetScore = parseInt(scoreValue.textContent);
    let counted = false;

    const scoreObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          animateScore(scoreValue, targetScore);
          scoreObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    scoreObserver.observe(scoreValue);
  }

  function animateScore(element, target) {
    const duration = 1200;
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

});
