/**
 * Nodely — Affiliate Link Tracking Engine
 * Handles UTM link generation, delegated click listener,
 * dataLayer event dispatching, and feedback toasts for demo verification.
 */

(function () {
  'use strict';

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];

  /**
   * Builds an affiliate URL with proper UTM tags and placement metadata
   * @param {string} productId 
   * @param {string} placement 
   * @returns {string}
   */
  window.buildAffiliateUrl = function (productId, placement) {
    const cleanProduct = encodeURIComponent(productId || 'generic-device');
    const cleanPlacement = encodeURIComponent(placement || 'default-cta');
    return `https://example-retailer.com/smart-home/product/${cleanProduct}?utm_source=nodely&utm_medium=affiliate&utm_campaign=smart_home_guide_2026&utm_content=${cleanPlacement}_${cleanProduct}`;
  };

  /**
   * Displays a discreet toast to confirm affiliate telemetry fired in demo mode
   */
  function showAffiliateToast(productId, placement) {
    let toast = document.getElementById('affiliate-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'affiliate-toast';
      toast.className = 'affiliate-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <div class="affiliate-toast-content">
        <span class="affiliate-toast-icon">⚡</span>
        <div>
          <strong>Affiliate Telemetry Logged</strong>
          <p>Product: <code>${productId}</code> | Placement: <code>${placement}</code> | Event: <code>dataLayer.push</code></p>
        </div>
      </div>
    `;

    toast.classList.add('visible');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3800);
  }

  // Delegated click listener for all affiliate tracking buttons
  document.addEventListener('click', function (e) {
    const affiliateBtn = e.target.closest('[data-affiliate-id], .btn-check-price');
    if (!affiliateBtn) return;

    const productId = affiliateBtn.getAttribute('data-product') || affiliateBtn.getAttribute('data-affiliate-id') || 'unknown-device';
    const placement = affiliateBtn.getAttribute('data-placement') || 'matrix-row';
    const href = affiliateBtn.getAttribute('href');

    const trackingEvent = {
      event: 'affiliate_click',
      timestamp: new Date().toISOString(),
      productId: productId,
      placement: placement,
      destinationUrl: href,
      page: window.location.pathname
    };

    window.dataLayer.push(trackingEvent);

    // Provide immediate user feedback and simulate outbound click in demo mode
    showAffiliateToast(productId, placement);

    // If it's a dummy # link or example link, prevent navigating away from demo
    if (href && (href.startsWith('#') || href.includes('example-retailer.com'))) {
      e.preventDefault();
    }
  });
})();
