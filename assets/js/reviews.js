/**
 * Nodely — Verified User Reviews Engine
 * Renders rating summaries, 5-to-1 star distribution bars,
 * verified owner cards, filtering (verified only), and sorting (newest/highest/lowest).
 */

(function () {
  'use strict';

  window.ReviewsEngine = {
    /**
     * Generate HTML for star rating
     * @param {number} rating - 1 to 5
     * @returns {string} HTML snippet
     */
    renderStars: function (rating) {
      let stars = '';
      const fullStars = Math.floor(rating);
      const hasHalf = (rating - fullStars) >= 0.4;
      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          stars += '<span class="star star-filled" aria-hidden="true">★</span>';
        } else if (i === fullStars + 1 && hasHalf) {
          stars += '<span class="star star-half" aria-hidden="true">★</span>';
        } else {
          stars += '<span class="star star-empty" aria-hidden="true">☆</span>';
        }
      }
      return `<span class="star-rating" aria-label="${rating} out of 5 stars">${stars}</span>`;
    },

    /**
     * Computes rating breakdown from distribution object
     */
    computeDistribution: function (distribution) {
      const counts = distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const total = Object.values(counts).reduce((acc, curr) => acc + curr, 0) || 1;
      return [5, 4, 3, 2, 1].map(stars => {
        const count = counts[stars] || 0;
        const percentage = Math.round((count / total) * 100);
        return { stars, count, percentage };
      });
    },

    /**
     * Renders the rating summary header and distribution bars
     */
    renderRatingSummary: function (device) {
      const breakdown = this.computeDistribution(device.ratingDistribution);
      const totalReviews = device.reviewCount;
      const avg = device.userRating.toFixed(1);

      return `
        <div class="reviews-summary-card">
          <div class="rating-aggregate-column">
            <div class="rating-large-number">${avg}</div>
            <div class="rating-stars-wrap">${this.renderStars(device.userRating)}</div>
            <div class="rating-total-label">Based on ${totalReviews} verified community ratings</div>
            <div class="demo-badge-sub">Demo Aggregate Data</div>
          </div>
          <div class="rating-distribution-column" role="region" aria-label="Rating distribution breakdown">
            ${breakdown.map(b => `
              <div class="dist-row" title="${b.stars} stars: ${b.count} reviews (${b.percentage}%)">
                <span class="dist-label">${b.stars} <span aria-hidden="true">★</span></span>
                <div class="dist-bar-track">
                  <div class="dist-bar-fill" style="width: ${b.percentage}%" role="progressbar" aria-valuenow="${b.percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <span class="dist-count tabular">${b.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    /**
     * Renders reviews controls (sort dropdown + verified only toggle)
     */
    renderControls: function (deviceId) {
      return `
        <div class="reviews-filter-toolbar">
          <div class="filter-controls-group">
            <label for="review-sort-${deviceId}" class="control-label">Sort by:</label>
            <select id="review-sort-${deviceId}" class="select-input review-sort-select" data-device-id="${deviceId}">
              <option value="newest">Newest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
          <label class="toggle-checkbox-label">
            <input type="checkbox" id="review-verified-toggle-${deviceId}" class="review-verified-toggle" data-device-id="${deviceId}">
            <span class="custom-check-marker"></span>
            <span>Verified Owners Only</span>
          </label>
        </div>
      `;
    },

    /**
     * Renders a list of review cards
     */
    renderReviewCards: function (reviews) {
      if (!reviews || reviews.length === 0) {
        return `
          <div class="no-reviews-empty">
            <p>No reviews match your selected filter criteria.</p>
          </div>
        `;
      }

      return reviews.map(rev => `
        <article class="review-item-card">
          <header class="review-item-header">
            <div class="reviewer-avatar" aria-hidden="true"><img src="${rev.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(rev.author)}`}" alt="" loading="lazy"></div>
            <div class="reviewer-meta">
              <div class="reviewer-name-row">
                <strong class="reviewer-name">${rev.author}</strong>
                ${rev.verified ? `
                  <span class="badge-verified-owner" title="Verified hardware purchase and testing serial authenticated" aria-label="Verified hardware owner">
                    <svg class="icon-verified" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Verified Owner
                  </span>
                ` : `
                  <span class="badge-community" aria-label="Community review">Community Member</span>
                `}
              </div>
              <time class="review-date" datetime="${rev.date}">${rev.date}</time>
            </div>
            <div class="review-rating-block">
              ${this.renderStars(rev.rating)}
            </div>
          </header>
          <h4 class="review-title">${rev.title}</h4>
          <p class="review-body">${rev.body}</p>
          <footer class="review-item-footer">
            <span class="review-helpful-tag">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
              ${rev.helpfulCount} people found this helpful
            </span>
            <span class="demo-tag">Sample Verified Entry</span>
          </footer>
        </article>
      `).join('');
    },

    /**
     * Returns reviews for a device, optionally sorted and filtered
     */
    getReviewsForDevice: function (deviceId, sortBy = 'newest', verifiedOnly = false) {
      if (!window.NODELY_DATA || !window.NODELY_DATA.sampleReviews) return [];
      
      let list = window.NODELY_DATA.sampleReviews.filter(r => r.deviceId === deviceId);
      
      // If none explicitly matched, provide universal fallback pool for demo richness
      if (list.length === 0) {
        list = window.NODELY_DATA.sampleReviews.slice(0, 3).map(r => ({
          ...r,
          deviceId: deviceId
        }));
      }

      if (verifiedOnly) {
        list = list.filter(r => r.verified === true);
      }

      if (sortBy === 'highest') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'lowest') {
        list.sort((a, b) => a.rating - b.rating);
      } else {
        // default newest
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      return list;
    },

    /**
     * Initializes the review container for a modal or page section
     */
    mountReviewSection: function (containerElement, deviceId) {
      if (!containerElement) return;
      const device = (window.NODELY_DATA.devices || []).find(d => d.id === deviceId);
      if (!device) return;

      containerElement.innerHTML = `
        <div class="device-reviews-block">
          <div class="reviews-section-header">
            <h3>Verified Owner Reviews & Sentiment</h3>
            <p class="section-subtext">All reviews are verified via serial hash or companion app authentication token (Demo Data).</p>
          </div>
          ${this.renderRatingSummary(device)}
          ${this.renderControls(deviceId)}
          <div class="reviews-list-container" id="reviews-list-${deviceId}">
            ${this.renderReviewCards(this.getReviewsForDevice(deviceId, 'newest', false))}
          </div>
        </div>
      `;

      // Attach event listeners for sort and filter
      const sortSelect = containerElement.querySelector(`#review-sort-${deviceId}`);
      const verifiedCheck = containerElement.querySelector(`#review-verified-toggle-${deviceId}`);
      const listContainer = containerElement.querySelector(`#reviews-list-${deviceId}`);

      const updateList = () => {
        const currentSort = sortSelect ? sortSelect.value : 'newest';
        const isVerifiedOnly = verifiedCheck ? verifiedCheck.checked : false;
        const filtered = this.getReviewsForDevice(deviceId, currentSort, isVerifiedOnly);
        listContainer.innerHTML = this.renderReviewCards(filtered);
      };

      if (sortSelect) sortSelect.addEventListener('change', updateList);
      if (verifiedCheck) verifiedCheck.addEventListener('change', updateList);
    }
  };
})();
