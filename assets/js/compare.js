/**
 * Nodely — Compare Page Core Engine
 * Manages:
 * - Device Filter Bar (category, validated min/max price, ecosystem, protocol, rating)
 * - Device Grid with Compare checkboxes and Details modal triggers
 * - 2-4 Device Side-by-Side Feature Matrix with sticky headers, "Differences Only" toggle,
 *   Best Overall & Best Value badges, and UTM-tagged Check Price buttons
 * - Grouped Pros & Cons by category + Verdict box
 * - Accessible Device Detail Modal with focus trap and dynamic JSON-LD injection
 */

(function () {
  'use strict';

  let selectedDeviceIds = ['aetheris-pro', 'thermasync-halo', 'fortisvault-bolt'];
  let diffsOnly = false;
  let activeModalDevice = null;
  let lastActiveElement = null;

  window.CompareEngine = {
    init: function () {
      if (!window.NODELY_DATA) return;

      // Check URL parameters (e.g. compare.html?category=cameras)
      const urlParams = new URLSearchParams(window.location.search);
      const initialCategory = urlParams.get('category');
      if (initialCategory) {
        const catSelect = document.getElementById('filter-category');
        if (catSelect) catSelect.value = initialCategory;
      }

      this.bindFilterEvents();
      this.bindMatrixEvents();
      this.bindModalEvents();
      this.renderDeviceGrid();
      this.renderMatrix();
    },

    getSelectedIds: function () {
      return [...selectedDeviceIds];
    },

    addDeviceToMatrix: function (deviceId) {
      if (!selectedDeviceIds.includes(deviceId)) {
        if (selectedDeviceIds.length >= 4) {
          // Replace last one if maximum reached
          selectedDeviceIds[3] = deviceId;
        } else {
          selectedDeviceIds.push(deviceId);
        }
      }
      this.renderMatrix();
      this.updateGridCheckboxes();
    },

    removeDeviceFromMatrix: function (deviceId) {
      if (selectedDeviceIds.length <= 2) {
        alert("Comparison requires at least 2 devices for side-by-side analysis.");
        return;
      }
      selectedDeviceIds = selectedDeviceIds.filter(id => id !== deviceId);
      this.renderMatrix();
      this.updateGridCheckboxes();
    },

    bindFilterEvents: function () {
      const form = document.getElementById('filter-bar-form');
      const resetBtn = document.getElementById('filter-reset-btn');
      const minPriceInput = document.getElementById('filter-price-min');
      const maxPriceInput = document.getElementById('filter-price-max');

      // Validated numeric inputs
      const validatePriceInputs = () => {
        let min = parseFloat(minPriceInput.value) || 0;
        let max = parseFloat(maxPriceInput.value) || 999;
        if (min < 0) minPriceInput.value = 0;
        if (max > 1000) maxPriceInput.value = 1000;
        if (min > max) {
          minPriceInput.classList.add('input-invalid');
        } else {
          minPriceInput.classList.remove('input-invalid');
          maxPriceInput.classList.remove('input-invalid');
        }
      };

      if (minPriceInput && maxPriceInput) {
        minPriceInput.addEventListener('input', () => {
          validatePriceInputs();
          this.renderDeviceGrid();
        });
        maxPriceInput.addEventListener('input', () => {
          validatePriceInputs();
          this.renderDeviceGrid();
        });
      }

      const otherInputs = ['filter-category', 'filter-ecosystem', 'filter-protocol', 'filter-rating', 'filter-sort'];
      otherInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener('change', () => this.renderDeviceGrid());
        }
      });

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (form) form.reset();
          if (minPriceInput) minPriceInput.value = '';
          if (maxPriceInput) maxPriceInput.value = '';
          this.renderDeviceGrid();
        });
      }
    },

    getFilteredDevices: function () {
      const all = window.NODELY_DATA.devices || [];
      const cat = document.getElementById('filter-category')?.value || 'all';
      const eco = document.getElementById('filter-ecosystem')?.value || 'all';
      const proto = document.getElementById('filter-protocol')?.value || 'all';
      const minPrice = parseFloat(document.getElementById('filter-price-min')?.value) || 0;
      const maxPrice = parseFloat(document.getElementById('filter-price-max')?.value) || 9999;
      const minRating = parseFloat(document.getElementById('filter-rating')?.value) || 0;
      const sortBy = document.getElementById('filter-sort')?.value || 'score-desc';

      let results = all.filter(dev => {
        if (cat !== 'all' && dev.category !== cat) return false;
        if (dev.price < minPrice || dev.price > maxPrice) return false;
        if (dev.userRating < minRating) return false;

        if (eco !== 'all') {
          const st = dev.ecosystemCompatibility[eco]?.status;
          if (!st || st === 'not-supported') return false;
        }

        if (proto !== 'all') {
          const hasProto = dev.connectivity.some(p => p.toLowerCase().includes(proto.toLowerCase()));
          if (!hasProto) return false;
        }

        return true;
      });

      if (sortBy === 'score-desc') {
        results.sort((a, b) => b.editorialScore - a.editorialScore);
      } else if (sortBy === 'price-asc') {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        results.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating-desc') {
        results.sort((a, b) => b.userRating - a.userRating);
      }

      return results;
    },

    renderDeviceGrid: function () {
      const grid = document.getElementById('device-grid-container');
      const countEl = document.getElementById('device-results-count');
      if (!grid) return;

      const devices = this.getFilteredDevices();
      if (countEl) countEl.textContent = `${devices.length} Devices Found`;

      if (devices.length === 0) {
        grid.innerHTML = `
          <div class="grid-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            <h3>No devices match your criteria</h3>
            <p>Try clearing filters or adjusting your price thresholds.</p>
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('filter-reset-btn').click()">Reset Filters</button>
          </div>
        `;
        return;
      }

      grid.innerHTML = devices.map(dev => {
        const isSelected = selectedDeviceIds.includes(dev.id);
        const affiliateUrl = window.buildAffiliateUrl(dev.id, 'device_grid');
        return `
          <div class="device-card ${isSelected ? 'is-selected-for-compare' : ''}" data-device-id="${dev.id}">
            <div class="device-card-media">
              <img src="${dev.image}" alt="${dev.imageAlt}" class="device-card-img" loading="lazy">
              ${dev.tag ? `<span class="badge-highlight ${dev.tag === 'Best Overall' ? 'badge-overall' : 'badge-value'}">${dev.tag}</span>` : ''}
              <div class="device-score-pill" title="Lab Editorial Score /10">
                <span class="score-label">Score</span>
                <span class="score-val tabular">${dev.editorialScore}</span>
              </div>
            </div>

            <div class="device-card-body">
              <div class="device-header-meta">
                <span class="device-brand-name">${dev.brand}</span>
                <span class="device-category-chip">${dev.category}</span>
              </div>
              <h3 class="device-card-title">${dev.name}</h3>
              
              <div class="device-rating-row">
                <div class="stars-wrap">
                  ${window.ReviewsEngine ? window.ReviewsEngine.renderStars(dev.userRating) : '★ ' + dev.userRating}
                </div>
                <span class="rating-subtext tabular">${dev.userRating} (${dev.reviewCount})</span>
              </div>

              <div class="device-ecosystem-chips">
                <span class="eco-chip ${dev.ecosystemCompatibility.alexa.status}" title="Alexa: ${dev.ecosystemCompatibility.alexa.label}">Alexa</span>
                <span class="eco-chip ${dev.ecosystemCompatibility.google.status}" title="Google: ${dev.ecosystemCompatibility.google.label}">Google</span>
                <span class="eco-chip ${dev.ecosystemCompatibility.apple.status}" title="Apple: ${dev.ecosystemCompatibility.apple.label}">Apple</span>
              </div>

              <p class="device-summary-text">${dev.summary}</p>

              <div class="device-price-block">
                <div class="price-val tabular">$${dev.price}</div>
                <div class="price-sub">Est. Street Price</div>
              </div>

              <div class="device-card-actions">
                <label class="compare-toggle-label" for="compare-toggle-${dev.id}">
                  <input type="checkbox" id="compare-toggle-${dev.id}" class="grid-compare-checkbox" data-device-id="${dev.id}" ${isSelected ? 'checked' : ''}>
                  <span class="custom-check-marker"></span>
                  <span class="compare-label-text">Compare</span>
                </label>
                <button type="button" class="btn btn-secondary btn-sm btn-open-detail" data-device-id="${dev.id}">
                  Full Specs
                </button>
              </div>

              <!-- AFFILIATE_LINK -->
              <a href="${affiliateUrl}" 
                 class="btn btn-primary btn-block btn-check-price" 
                 data-affiliate-id="${dev.id}" 
                 data-product="${dev.id}" 
                 data-placement="grid_card" 
                 rel="sponsored noopener" 
                 target="_blank">
                Check Current Price
              </a>
              <div class="affiliate-disclosure-micro">Sponsored link · Independent testing</div>
            </div>
          </div>
        `;
      }).join('');

      this.bindGridCardEvents(grid);
    },

    bindGridCardEvents: function (grid) {
      grid.querySelectorAll('.grid-compare-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const id = e.target.getAttribute('data-device-id');
          if (e.target.checked) {
            this.addDeviceToMatrix(id);
          } else {
            this.removeDeviceFromMatrix(id);
          }
        });
      });

      grid.querySelectorAll('.btn-open-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-device-id');
          this.openDeviceModal(id);
        });
      });
    },

    updateGridCheckboxes: function () {
      document.querySelectorAll('.grid-compare-checkbox').forEach(cb => {
        const id = cb.getAttribute('data-device-id');
        cb.checked = selectedDeviceIds.includes(id);
        const card = cb.closest('.device-card');
        if (card) {
          if (cb.checked) card.classList.add('is-selected-for-compare');
          else card.classList.remove('is-selected-for-compare');
        }
      });
    },

    bindMatrixEvents: function () {
      const diffToggle = document.getElementById('matrix-diffs-toggle');
      if (diffToggle) {
        diffToggle.addEventListener('change', (e) => {
          diffsOnly = e.target.checked;
          this.renderMatrix();
        });
      }

      const selectorAdd = document.getElementById('matrix-add-selector');
      if (selectorAdd) {
        selectorAdd.addEventListener('change', (e) => {
          if (e.target.value) {
            this.addDeviceToMatrix(e.target.value);
            e.target.value = '';
          }
        });
      }
    },

    renderMatrix: function () {
      const matrixContainer = document.getElementById('comparison-matrix-container');
      const addSelector = document.getElementById('matrix-add-selector');
      if (!matrixContainer || !window.NODELY_DATA) return;

      const devices = window.NODELY_DATA.devices.filter(d => selectedDeviceIds.includes(d.id));

      // Populate Add selector with devices not currently in matrix
      if (addSelector) {
        const available = window.NODELY_DATA.devices.filter(d => !selectedDeviceIds.includes(d.id));
        addSelector.innerHTML = `
          <option value="">+ Add Another Device (${selectedDeviceIds.length}/4)...</option>
          ${available.map(d => `<option value="${d.id}">${d.name} ($${d.price} - ${d.category})</option>`).join('')}
        `;
        addSelector.disabled = selectedDeviceIds.length >= 4;
      }

      if (devices.length < 2) {
        matrixContainer.innerHTML = `
          <div class="matrix-empty-prompt">
            <p>Select at least 2 devices to generate the comparison matrix.</p>
          </div>
        `;
        return;
      }

      // Spec Rows Definition
      const rows = [
        {
          key: 'price',
          label: 'MSRP / Price',
          getValue: (d) => `<strong class="spec-highlight tabular">$${d.price}</strong>`
        },
        {
          key: 'editorialScore',
          label: 'Editorial Score (/10)',
          getValue: (d) => `
            <div class="spec-score-cell">
              <span class="score-number tabular">${d.editorialScore}</span>
              <a href="about.html#methodology" class="score-methodology-link" title="Read our testing criteria">How we score</a>
            </div>
          `
        },
        {
          key: 'userRating',
          label: 'User Rating (/5)',
          getValue: (d) => `
            <div class="spec-rating-cell">
              <span>★ ${d.userRating}</span>
              <small class="tabular">(${d.reviewCount} reviews)</small>
            </div>
          `
        },
        {
          key: 'connectivity',
          label: 'Connectivity Protocols',
          getValue: (d) => d.connectivity.map(c => `<span class="spec-pill">${c}</span>`).join(' ')
        },
        {
          key: 'alexa',
          label: 'Amazon Alexa',
          getValue: (d) => window.CompatibilityEngine.getStatusBadge(d.ecosystemCompatibility.alexa.status, d.ecosystemCompatibility.alexa.label)
        },
        {
          key: 'google',
          label: 'Google Home',
          getValue: (d) => window.CompatibilityEngine.getStatusBadge(d.ecosystemCompatibility.google.status, d.ecosystemCompatibility.google.label)
        },
        {
          key: 'apple',
          label: 'Apple Home',
          getValue: (d) => window.CompatibilityEngine.getStatusBadge(d.ecosystemCompatibility.apple.status, d.ecosystemCompatibility.apple.label)
        },
        {
          key: 'powerSource',
          label: 'Power Source',
          getValue: (d) => d.powerSource
        },
        {
          key: 'privacyFeatures',
          label: 'Privacy & Security Features',
          getValue: (d) => d.privacyFeatures
        },
        {
          key: 'appRating',
          label: 'Companion App Rating',
          getValue: (d) => d.appRating
        },
        {
          key: 'warranty',
          label: 'Warranty Coverage',
          getValue: (d) => d.warranty
        },
        {
          key: 'categorySpecs',
          label: 'Category Specific Spec',
          getValue: (d) => {
            const keys = Object.keys(d.categorySpecs || {});
            return keys.slice(0, 3).map(k => `<div><strong>${k}:</strong> ${d.categorySpecs[k]}</div>`).join('');
          }
        }
      ];

      // Filter rows if "Differences Only" is turned on
      const visibleRows = diffsOnly ? rows.filter(r => {
        const firstVal = r.getValue(devices[0]);
        return devices.some(d => r.getValue(d) !== firstVal);
      }) : rows;

      let matrixHtml = `
        <div class="matrix-table-scroller" role="region" aria-label="Device comparison matrix table" tabindex="0">
          <table class="matrix-table">
            <thead>
              <tr>
                <th class="matrix-col-feature sticky-col">
                  <div class="feature-head-title">Features & Specs</div>
                  <div class="feature-head-sub">${devices.length} devices compared</div>
                </th>
                ${devices.map(dev => {
                  const affiliateUrl = window.buildAffiliateUrl(dev.id, 'matrix_header');
                  return `
                    <th class="matrix-col-device">
                      <div class="matrix-device-header">
                        <button type="button" class="btn-remove-col" data-device-id="${dev.id}" title="Remove ${dev.name} from comparison" aria-label="Remove ${dev.name}">×</button>
                        ${dev.tag ? `<span class="badge-highlight ${dev.tag === 'Best Overall' ? 'badge-overall' : 'badge-value'}">${dev.tag}</span>` : ''}
                        <img src="${dev.image}" alt="${dev.imageAlt}" class="matrix-header-img" loading="lazy">
                        <h4 class="matrix-header-title">${dev.name}</h4>
                        <div class="matrix-header-price tabular">$${dev.price}</div>
                        
                        <!-- AFFILIATE_LINK -->
                        <a href="${affiliateUrl}" 
                           class="btn btn-primary btn-sm btn-block btn-check-price" 
                           data-affiliate-id="${dev.id}" 
                           data-product="${dev.id}" 
                           data-placement="matrix_header" 
                           rel="sponsored noopener" 
                           target="_blank">
                          Check Price
                        </a>
                        <div class="affiliate-disclosure-micro">Sponsored</div>
                      </div>
                    </th>
                  `;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${visibleRows.map(row => `
                <tr class="matrix-spec-row">
                  <td class="matrix-feature-name sticky-col">
                    <strong>${row.label}</strong>
                  </td>
                  ${devices.map(dev => `
                    <td class="matrix-spec-val">
                      ${row.getValue(dev)}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pros, Cons, and Verdict Breakdown for Compare Matrix Devices -->
        <div class="matrix-pros-cons-section">
          <div class="section-title-wrap">
            <h3 class="section-title">In-Depth Pros, Cons & Verdict Breakdown</h3>
            <p class="section-subtext">Category-grouped evaluations tested against our standardized lab protocol.</p>
          </div>
          
          <div class="matrix-pros-cons-grid">
            ${devices.map(dev => this.renderProsConsBlock(dev)).join('')}
          </div>
        </div>
      `;

      matrixContainer.innerHTML = matrixHtml;

      // Bind remove buttons
      matrixContainer.querySelectorAll('.btn-remove-col').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-device-id');
          this.removeDeviceFromMatrix(id);
        });
      });
    },

    renderProsConsBlock: function (dev) {
      const pc = dev.prosCons || {};
      const categories = [
        { key: 'setup', title: 'Setup & Onboarding' },
        { key: 'performance', title: 'Performance & Range' },
        { key: 'privacy', title: 'Privacy & Data Security' },
        { key: 'app', title: 'Companion App & Routine Automation' },
        { key: 'value', title: 'Hardware Build & Long-Term Value' }
      ];

      return `
        <div class="pros-cons-device-card">
          <div class="pros-cons-card-head">
            <img src="${dev.image}" alt="${dev.imageAlt}" class="pros-cons-thumb" loading="lazy">
            <div>
              <span class="badge-cat">${dev.category}</span>
              <h4 class="pros-cons-dev-name">${dev.name}</h4>
              <span class="tabular">$${dev.price} · Score: ${dev.editorialScore}/10</span>
            </div>
          </div>

          <div class="pros-cons-groups-container">
            ${categories.map(c => {
              const item = pc[c.key] || { pros: [], cons: [] };
              return `
                <div class="pc-category-block">
                  <h5 class="pc-group-title">${c.title}</h5>
                  <div class="pc-columns">
                    <div class="pc-pros-col">
                      <div class="pc-col-head pros-head">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Pros</span>
                      </div>
                      <ul class="pc-list">
                        ${item.pros.map(p => `<li>${p}</li>`).join('')}
                      </ul>
                    </div>

                    <div class="pc-cons-col">
                      <div class="pc-col-head cons-head">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span>Cons</span>
                      </div>
                      <ul class="pc-list">
                        ${item.cons.map(c => `<li>${c}</li>`).join('')}
                      </ul>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Verdict Box -->
          <div class="verdict-summary-box">
            <div class="verdict-who-for">
              <strong class="verdict-subhead for-head">Who It's For:</strong>
              <p>${dev.verdict.whoItsFor}</p>
            </div>
            <div class="verdict-who-skip">
              <strong class="verdict-subhead skip-head">Who Should Skip:</strong>
              <p>${dev.verdict.whoShouldSkip}</p>
            </div>
          </div>
        </div>
      `;
    },

    bindModalEvents: function () {
      const modal = document.getElementById('device-detail-modal');
      const closeBtn = document.getElementById('modal-close-btn');
      const backdrop = document.getElementById('modal-backdrop');

      if (!modal) return;

      const closeModal = () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastActiveElement) lastActiveElement.focus();
        activeModalDevice = null;
      };

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (backdrop) backdrop.addEventListener('click', closeModal);

      // Keyboard Trap & ESC close
      document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('is-open')) return;

        if (e.key === 'Escape') {
          closeModal();
          return;
        }

        if (e.key === 'Tab') {
          const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      });
    },

    openDeviceModal: function (deviceId) {
      const modal = document.getElementById('device-detail-modal');
      const modalContent = document.getElementById('modal-device-content');
      if (!modal || !modalContent || !window.NODELY_DATA) return;

      const dev = window.NODELY_DATA.devices.find(d => d.id === deviceId);
      if (!dev) return;

      lastActiveElement = document.activeElement;
      activeModalDevice = dev;

      const affiliateUrl = window.buildAffiliateUrl(dev.id, 'modal_detail');

      // Update JSON-LD dynamically for this device
      this.updateProductJsonLd(dev);

      modalContent.innerHTML = `
        <div class="modal-device-inner">
          <header class="modal-device-header">
            <div class="modal-header-media">
              <img src="${dev.image}" alt="${dev.imageAlt}" class="modal-header-img">
              ${dev.tag ? `<span class="badge-highlight ${dev.tag === 'Best Overall' ? 'badge-overall' : 'badge-value'}">${dev.tag}</span>` : ''}
            </div>
            <div class="modal-header-details">
              <div class="modal-brand-badge">${dev.brand} · ${dev.category}</div>
              <h2 id="modal-title" class="modal-title">${dev.name}</h2>
              <div class="modal-scores-row">
                <div class="modal-score-chip">
                  <span class="chip-label">Editorial Lab Score</span>
                  <span class="chip-val tabular">${dev.editorialScore} / 10</span>
                  <a href="about.html#methodology" class="chip-link">How we score</a>
                </div>
                <div class="modal-score-chip">
                  <span class="chip-label">Verified User Rating</span>
                  <span class="chip-val tabular">★ ${dev.userRating} / 5</span>
                  <span class="chip-link">(${dev.reviewCount} reviews)</span>
                </div>
              </div>
              <p class="modal-summary-text">${dev.summary}</p>
              <div class="modal-price-cta-bar">
                <div class="modal-price-box">
                  <span class="modal-price tabular">$${dev.price}</span>
                  <span class="modal-currency">USD · Street Price Estimate</span>
                </div>
                
                <!-- AFFILIATE_LINK -->
                <a href="${affiliateUrl}" 
                   class="btn btn-primary btn-check-price" 
                   data-affiliate-id="${dev.id}" 
                   data-product="${dev.id}" 
                   data-placement="modal_detail" 
                   rel="sponsored noopener" 
                   target="_blank">
                  Check Current Price
                </a>
              </div>
              <div class="affiliate-disclosure-line">Some links may be affiliate links. All reviews are independent and lab verified.</div>
            </div>
          </header>

          <!-- Full Tech Specs Table -->
          <section class="modal-specs-section">
            <h3 class="modal-section-heading">Detailed Hardware & Protocol Specifications</h3>
            <div class="modal-specs-grid">
              <div class="modal-spec-item">
                <span class="modal-spec-k">Connectivity</span>
                <span class="modal-spec-v">${dev.connectivity.join(', ')}</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-k">Amazon Alexa</span>
                <span class="modal-spec-v">${window.CompatibilityEngine.getStatusBadge(dev.ecosystemCompatibility.alexa.status, dev.ecosystemCompatibility.alexa.label)}</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-k">Google Home</span>
                <span class="modal-spec-v">${window.CompatibilityEngine.getStatusBadge(dev.ecosystemCompatibility.google.status, dev.ecosystemCompatibility.google.label)}</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-k">Apple Home</span>
                <span class="modal-spec-v">${window.CompatibilityEngine.getStatusBadge(dev.ecosystemCompatibility.apple.status, dev.ecosystemCompatibility.apple.label)}</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-k">Power Source</span>
                <span class="modal-spec-v">${dev.powerSource}</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-k">Privacy Protections</span>
                <span class="modal-spec-v">${dev.privacyFeatures}</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-k">Companion App Rating</span>
                <span class="modal-spec-v">${dev.appRating}</span>
              </div>
              <div class="modal-spec-item">
                <span class="modal-spec-k">Warranty Coverage</span>
                <span class="modal-spec-v">${dev.warranty}</span>
              </div>
              ${Object.keys(dev.categorySpecs || {}).map(k => `
                <div class="modal-spec-item">
                  <span class="modal-spec-k">${k}</span>
                  <span class="modal-spec-v">${dev.categorySpecs[k]}</span>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- Pros & Cons Breakdown -->
          <section class="modal-pc-section">
            ${this.renderProsConsBlock(dev)}
          </section>

          <!-- Verified User Reviews Container -->
          <section id="modal-reviews-mount" class="modal-reviews-section">
            <!-- Rendered by ReviewsEngine -->
          </section>
        </div>
      `;

      // Mount reviews
      const reviewsMount = document.getElementById('modal-reviews-mount');
      if (reviewsMount && window.ReviewsEngine) {
        window.ReviewsEngine.mountReviewSection(reviewsMount, dev.id);
      }

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      const closeBtn = document.getElementById('modal-close-btn');
      if (closeBtn) closeBtn.focus();
    },

    updateProductJsonLd: function (dev) {
      let script = document.getElementById('product-jsonld');
      if (!script) {
        script = document.createElement('script');
        script.id = 'product-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const ld = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": dev.name,
        "image": dev.image,
        "description": dev.summary,
        "brand": {
          "@type": "Brand",
          "name": dev.brand
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": dev.userRating.toString(),
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": dev.reviewCount.toString()
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "USD",
          "price": dev.price.toString(),
          "availability": "https://schema.org/InStock",
          "url": window.buildAffiliateUrl(dev.id, 'json_ld')
        },
        "review": {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": dev.editorialScore.toString(),
            "bestRating": "10"
          },
          "author": {
            "@type": "Organization",
            "name": "Nodely Test Lab"
          }
        }
      };

      script.textContent = JSON.stringify(ld, null, 2);
    }
  };
})();
