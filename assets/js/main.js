/**
 * Nodely — Main Application Script
 * Controls:
 * - Responsive Navbar & Mobile Slide Drawer with Accordion
 * - Dropdown Keyboard Accessibility & ARIA states
 * - Animated Hero Device-Network Canvas
 * - Reveal on Scroll Animations (respecting prefers-reduced-motion)
 * - Form Validation (Services Contact Form & Home Newsletter)
 * - Home Page Dynamic Highlights Mounts
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollReveal();
    initHeroNetworkCanvas();
    initForms();
    initHomeHighlights();
  });

  /**
   * 1. Navigation & Slide Drawer
   */
  function initNavigation() {
    const hamburgerBtn = document.querySelector('.nav-hamburger-btn');
    const drawer = document.querySelector('.mobile-drawer');
    const drawerBackdrop = document.querySelector('.drawer-backdrop');
    const drawerCloseBtn = document.querySelector('.drawer-close-btn');
    const servicesDropdown = document.querySelector('.has-dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    // Desktop Dropdown Keyboard Navigation
    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener('click', function (e) {
        if (window.innerWidth > 1024) {
          e.preventDefault();
          const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
          dropdownToggle.setAttribute('aria-expanded', !isExpanded);
          dropdownMenu.classList.toggle('is-visible');
        }
      });

      // Escape key closes desktop dropdown
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && dropdownToggle.getAttribute('aria-expanded') === 'true') {
          dropdownToggle.setAttribute('aria-expanded', 'false');
          dropdownMenu.classList.remove('is-visible');
          dropdownToggle.focus();
        }
      });

      // Close when clicking outside
      document.addEventListener('click', function (e) {
        if (window.innerWidth > 1024 && !servicesDropdown.contains(e.target)) {
          dropdownToggle.setAttribute('aria-expanded', 'false');
          dropdownMenu.classList.remove('is-visible');
        }
      });
    }

    // Mobile Drawer Open / Close
    function openDrawer() {
      if (!drawer) return;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      if (drawerBackdrop) drawerBackdrop.classList.add('is-visible');
      document.body.classList.add('drawer-open');
      if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
      if (drawerCloseBtn) drawerCloseBtn.focus();
    }

    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      if (drawerBackdrop) drawerBackdrop.classList.remove('is-visible');
      document.body.classList.remove('drawer-open');
      if (hamburgerBtn) {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        hamburgerBtn.focus();
      }
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openDrawer);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    // Escape closes drawer
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    // Mobile Accordion inside drawer
    const drawerAccordionToggle = document.querySelector('.drawer-accordion-toggle');
    const drawerAccordionMenu = document.querySelector('.drawer-accordion-menu');

    if (drawerAccordionToggle && drawerAccordionMenu) {
      drawerAccordionToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const expanded = drawerAccordionToggle.getAttribute('aria-expanded') === 'true';
        drawerAccordionToggle.setAttribute('aria-expanded', !expanded);
        drawerAccordionMenu.classList.toggle('is-open');
      });
    }

    // Close drawer when any mobile nav link is clicked
    document.querySelectorAll('.drawer-nav-link, .drawer-sublink').forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Highlight current page active link
    highlightActivePage();
  }

  function highlightActivePage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const cleanPath = path === '' ? 'index.html' : path;

    document.querySelectorAll('.nav-link, .drawer-nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === cleanPath || (cleanPath === 'index.html' && (href === './' || href === 'index.html')))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * 2. Scroll Reveal Animations
   */
  function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.12
    });

    revealElements.forEach(el => observer.observe(el));
  }

  /**
   * 3. Animated Device-Network Canvas for Hero
   */
  function initHeroNetworkCanvas() {
    const canvas = document.getElementById('hero-network-canvas');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = 42;
    const maxDistance = 140;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class NodeParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2 + 1.5;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.03;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        const currentRadius = this.radius + Math.sin(this.pulse) * 0.8;
        ctx.arc(this.x, this.y, Math.max(1, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 152, 255, 0.75)';
        ctx.shadowColor = 'rgba(139, 152, 255, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new NodeParticle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 152, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update and draw nodes
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  /**
   * 4. Forms Validation (Services Contact Form & Newsletter)
   */
  function initForms() {
    // Services Contact Form
    const contactForm = document.getElementById('services-contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        let isValid = true;

        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const subjectInput = document.getElementById('contact-subject');
        const messageInput = document.getElementById('contact-message');
        const termsCheck = document.getElementById('contact-terms');
        const statusBox = document.getElementById('contact-form-status');

        const validateField = (input, testFn, errorMsg) => {
          const errorEl = input.parentElement.querySelector('.field-error-msg');
          if (!testFn(input.value)) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            if (errorEl) errorEl.textContent = errorMsg;
            isValid = false;
          } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (errorEl) errorEl.textContent = '';
          }
        };

        // Name min 2 chars
        validateField(nameInput, val => val.trim().length >= 2, 'Please enter your full name (minimum 2 characters).');

        // Email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validateField(emailInput, val => emailRegex.test(val.trim()), 'Please enter a valid email address.');

        // Subject required
        validateField(subjectInput, val => val.trim().length >= 4, 'Please select or enter a subject topic.');

        // Message min 15 chars
        validateField(messageInput, val => val.trim().length >= 15, 'Please enter at least 15 characters explaining your query.');

        // Terms Checkbox
        const termsError = termsCheck.parentElement.querySelector('.field-error-msg');
        if (!termsCheck.checked) {
          termsCheck.classList.add('is-invalid');
          if (termsError) termsError.textContent = 'You must agree to the privacy policy to submit.';
          isValid = false;
        } else {
          termsCheck.classList.remove('is-invalid');
          if (termsError) termsError.textContent = '';
        }

        if (isValid) {
          // Simulation of Formspree / Netlify submission
          const submitBtn = contactForm.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Transmitting Enquiry...</span>`;

          setTimeout(() => {
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Send Advisory Enquiry</span>`;
            
            // Clear valid classes
            [nameInput, emailInput, subjectInput, messageInput].forEach(inp => inp.classList.remove('is-valid'));

            statusBox.innerHTML = `
              <div class="form-success-banner" role="alert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <div>
                  <strong>Enquiry Transmitted to Nodely Lab Team!</strong>
                  <p>Our smart home deployment specialists will review your specs and respond within 1 business day.</p>
                </div>
              </div>
            `;
            statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 850);
        }
      });
    }

    // Home Newsletter Form
    const newsForm = document.getElementById('home-newsletter-form');
    if (newsForm) {
      newsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const feedback = document.getElementById('newsletter-feedback');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
          emailInput.classList.add('is-invalid');
          if (feedback) {
            feedback.className = 'form-feedback error';
            feedback.textContent = 'Please provide a valid email address.';
          }
          return;
        }

        emailInput.classList.remove('is-invalid');
        const btn = newsForm.querySelector('button[type="submit"]');
        btn.disabled = true;

        setTimeout(() => {
          emailInput.value = '';
          btn.disabled = false;
          if (feedback) {
            feedback.className = 'form-feedback success';
            feedback.textContent = 'Subscribed! You will receive our monthly protocol firmware bulletin.';
          }
        }, 500);
      });
    }
  }

  /**
   * 5. Home Dynamic Highlights Mount
   */
  function initHomeHighlights() {
    // Mount Top Picks on Home if container exists
    const topPicksContainer = document.getElementById('home-top-picks-container');
    if (topPicksContainer && window.NODELY_DATA) {
      const topPicks = window.NODELY_DATA.devices.filter(d => d.tag === 'Best Overall').slice(0, 3);
      topPicksContainer.innerHTML = topPicks.map(dev => {
        const affiliateUrl = window.buildAffiliateUrl(dev.id, 'home_top_picks');
        return `
          <div class="device-card top-pick-card">
            <div class="device-card-media">
              <img src="${dev.image}" alt="${dev.imageAlt}" class="device-card-img" loading="lazy">
              <span class="badge-highlight badge-overall">Best Overall</span>
              <div class="device-score-pill">
                <span class="score-label">Editorial Score</span>
                <span class="score-val tabular">${dev.editorialScore}/10</span>
              </div>
            </div>
            <div class="device-card-body">
              <div class="device-header-meta">
                <span class="device-brand-name">${dev.brand}</span>
                <span class="device-category-chip">${dev.category}</span>
              </div>
              <h3 class="device-card-title">${dev.name}</h3>
              <div class="device-rating-row">
                <div class="stars-wrap">${window.ReviewsEngine ? window.ReviewsEngine.renderStars(dev.userRating) : '★ ' + dev.userRating}</div>
                <span class="rating-subtext tabular">${dev.userRating} (${dev.reviewCount} reviews)</span>
              </div>
              <p class="device-summary-text">${dev.summary}</p>
              
              <div class="top-pick-specs-row">
                <div class="spec-mini-item">
                  <span class="mini-k">Connectivity</span>
                  <span class="mini-v">${dev.connectivity.slice(0, 2).join(', ')}</span>
                </div>
                <div class="spec-mini-item">
                  <span class="mini-k">App Rating</span>
                  <span class="mini-v">${dev.appRating}</span>
                </div>
              </div>

              <div class="device-price-block">
                <div class="price-val tabular">$${dev.price}</div>
                <div class="price-sub">Est. Street Price</div>
              </div>

              <div class="home-card-cta-group">
                <!-- AFFILIATE_LINK -->
                <a href="${affiliateUrl}" 
                   class="btn btn-primary btn-block btn-check-price" 
                   data-affiliate-id="${dev.id}" 
                   data-product="${dev.id}" 
                   data-placement="home_top_picks" 
                   rel="sponsored noopener" 
                   target="_blank">
                  Check Current Price
                </a>
                <a href="compare.html?category=${dev.category}" class="btn btn-secondary btn-block">
                  Compare in ${dev.category}
                </a>
              </div>
              <div class="affiliate-disclosure-micro">Sponsored link · Tested independently by Nodely Lab</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Mount Verified Reviews Highlights on Home
    const homeReviewsMount = document.getElementById('home-reviews-container');
    if (homeReviewsMount && window.NODELY_DATA && window.ReviewsEngine) {
      const featuredReviews = window.NODELY_DATA.sampleReviews.slice(0, 3);
      homeReviewsMount.innerHTML = featuredReviews.map(rev => {
        const dev = window.NODELY_DATA.devices.find(d => d.id === rev.deviceId) || { name: 'Smart Device', brand: 'Tested Hardware' };
        return `
          <div class="review-item-card home-featured-review">
            <header class="review-item-header">
              <div class="reviewer-avatar" aria-hidden="true"><img src="https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(rev.author)}&backgroundColor=c7ceff,d9c8ff,b9e3ff&radius=50" alt="" loading="lazy"></div>
              <div class="reviewer-meta">
                <div class="reviewer-name-row">
                  <strong class="reviewer-name">${rev.author}</strong>
                  ${rev.verified ? `<span class="badge-verified-owner">Verified Owner</span>` : ''}
                </div>
                <div class="review-reviewed-product">Verified on: <strong>${dev.name}</strong></div>
              </div>
              <div class="review-rating-block">
                ${window.ReviewsEngine.renderStars(rev.rating)}
              </div>
            </header>
            <h4 class="review-title">${rev.title}</h4>
            <p class="review-body">${rev.body}</p>
            <footer class="review-item-footer">
              <time datetime="${rev.date}">${rev.date}</time>
              <span class="review-helpful-tag">${rev.helpfulCount} found helpful</span>
            </footer>
          </div>
        `;
      }).join('');
    }
  }
})();

// Cursor-following spotlight on scoring cards
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('.value-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();
