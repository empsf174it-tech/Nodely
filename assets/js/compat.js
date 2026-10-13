/**
 * Nodely — Smart Home Compatibility Checker Engine
 * Features:
 * 1. Forward Mode: Filter by Ecosystem (Alexa, Google Home, Apple Home), Category, and Protocol.
 *    Displays status with ICON + TEXT (never color alone): Works Natively, Works via Matter, Needs Hub / Bridge, Not Supported.
 *    Includes "How compatibility is verified" note and last verified dates.
 * 2. Reverse Mode: Select multiple devices you own and compute optimal ecosystem coverage.
 */

(function () {
  'use strict';

  const STATUS_ICONS = {
    'works-natively': `<svg class="status-icon icon-success" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    'works-matter': `<svg class="status-icon icon-matter" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
    'needs-hub': `<svg class="status-icon icon-warning" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    'not-supported': `<svg class="status-icon icon-error" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
  };

  window.CompatibilityEngine = {
    statusIcons: STATUS_ICONS,

    getStatusBadge: function (statusKey, labelText) {
      const icon = STATUS_ICONS[statusKey] || STATUS_ICONS['not-supported'];
      const text = labelText || (statusKey ? statusKey.replace('-', ' ') : 'Unknown');
      return `
        <span class="compat-status-badge status-${statusKey}">
          ${icon}
          <span class="status-label">${text}</span>
        </span>
      `;
    },

    /**
     * Initializes the Compatibility Checker UI inside a target container
     */
    init: function (containerSelector) {
      const container = document.querySelector(containerSelector);
      if (!container || !window.NODELY_DATA) return;

      container.innerHTML = `
        <div class="checker-wrapper">
          <!-- Checker Mode Tabs -->
          <div class="checker-tabs-header" role="tablist" aria-label="Compatibility Checker Modes">
            <button type="button" class="checker-tab-btn active" id="tab-forward" role="tab" aria-selected="true" aria-controls="panel-forward">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
              Forward Checker (Ecosystem Discovery)
            </button>
            <button type="button" class="checker-tab-btn" id="tab-reverse" role="tab" aria-selected="false" aria-controls="panel-reverse">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 3h5v5"></path><path d="M4 20L21 3"></path><path d="M21 16v5h-5"></path><path d="M15 15l6 6"></path><path d="M4 4l5 5"></path></svg>
              Reverse Checker (My Devices Audit)
            </button>
          </div>

          <!-- TAB 1: Forward Mode Panel -->
          <div class="checker-tab-panel active" id="panel-forward" role="tabpanel" aria-labelledby="tab-forward">
            <div class="checker-controls-card">
              <div class="checker-control-col">
                <label for="compat-ecosystem" class="field-label">Target Smart Ecosystem</label>
                <select id="compat-ecosystem" class="select-input">
                  <option value="all">All Ecosystems</option>
                  <option value="alexa" selected>Amazon Alexa</option>
                  <option value="google">Google Home</option>
                  <option value="apple">Apple Home</option>
                </select>
              </div>

              <div class="checker-control-col">
                <label for="compat-category" class="field-label">Device Category</label>
                <select id="compat-category" class="select-input">
                  <option value="all" selected>All Categories</option>
                  <option value="speakers">Smart Speakers</option>
                  <option value="cameras">Security Cameras</option>
                  <option value="thermostats">Smart Thermostats</option>
                  <option value="lighting">Smart Lighting</option>
                  <option value="locks">Smart Locks</option>
                </select>
              </div>

              <div class="checker-control-col">
                <label for="compat-protocol" class="field-label">Protocol / Spec</label>
                <select id="compat-protocol" class="select-input">
                  <option value="all" selected>All Protocols</option>
                  <option value="Matter">Matter</option>
                  <option value="Thread">Thread</option>
                  <option value="Wi-Fi">Wi-Fi</option>
                  <option value="Bluetooth">Bluetooth</option>
                </select>
              </div>
            </div>

            <!-- Methodology Verification Note Box -->
            <div class="compat-verification-banner">
              <div class="banner-icon-col">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div class="banner-text-col">
                <strong>How Compatibility is Verified in Nodely Labs:</strong>
                <p>Every certified status reflects rigorous test bench commissioning against real production Border Routers (Apple HomePod 2nd Gen, Nest Hub 2nd Gen, Echo 4th Gen) running official Matter 1.3 clusters and Thread border routing. Statuses and RF latency tests are refreshed monthly (Demo Benchmarks).</p>
              </div>
            </div>

            <!-- Forward Results Grid -->
            <div id="compat-forward-results" class="compat-results-grid" aria-live="polite">
              <!-- Rendered via JS -->
            </div>
          </div>

          <!-- TAB 2: Reverse Mode Panel -->
          <div class="checker-tab-panel" id="panel-reverse" role="tabpanel" aria-labelledby="tab-reverse" hidden>
            <div class="reverse-intro-box">
              <h3 class="reverse-heading">Select the Devices You Currently Own or Wish to Buy</h3>
              <p class="section-subtext">Our matrix audit engine evaluates your selected equipment against Amazon Alexa, Google Home, and Apple Home to calculate your optimal single-platform ecosystem.</p>
            </div>

            <div class="reverse-device-selection-grid">
              ${window.NODELY_DATA.devices.map(dev => `
                <label class="reverse-select-card" for="rev-check-${dev.id}">
                  <input type="checkbox" id="rev-check-${dev.id}" class="reverse-device-checkbox" value="${dev.id}" ${['aetheris-pro', 'thermasync-halo', 'fortisvault-bolt'].includes(dev.id) ? 'checked' : ''}>
                  <div class="reverse-card-body">
                    <img src="${dev.image}" alt="${dev.imageAlt}" class="reverse-card-thumb" loading="lazy">
                    <div class="reverse-card-info">
                      <span class="reverse-card-category">${dev.category}</span>
                      <strong class="reverse-card-title">${dev.name}</strong>
                      <span class="reverse-card-price tabular">$${dev.price}</span>
                    </div>
                  </div>
                </label>
              `).join('')}
            </div>

            <!-- Reverse Scorecard & Recommendation -->
            <div id="reverse-scorecard-container" class="reverse-scorecard-wrap" aria-live="polite">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      `;

      this.bindEvents(container);
      this.renderForwardResults();
      this.renderReverseResults();
    },

    bindEvents: function (container) {
      // Tab switching
      const tabForward = container.querySelector('#tab-forward');
      const tabReverse = container.querySelector('#tab-reverse');
      const panelForward = container.querySelector('#panel-forward');
      const panelReverse = container.querySelector('#panel-reverse');

      tabForward.addEventListener('click', () => {
        tabForward.classList.add('active');
        tabForward.setAttribute('aria-selected', 'true');
        tabReverse.classList.remove('active');
        tabReverse.setAttribute('aria-selected', 'false');
        panelForward.classList.add('active');
        panelForward.removeAttribute('hidden');
        panelReverse.classList.remove('active');
        panelReverse.setAttribute('hidden', '');
      });

      tabReverse.addEventListener('click', () => {
        tabReverse.classList.add('active');
        tabReverse.setAttribute('aria-selected', 'true');
        tabForward.classList.remove('active');
        tabForward.setAttribute('aria-selected', 'false');
        panelReverse.classList.add('active');
        panelReverse.removeAttribute('hidden');
        panelForward.classList.remove('active');
        panelForward.setAttribute('hidden', '');
      });

      // Forward filter events
      const ecosystemSelect = container.querySelector('#compat-ecosystem');
      const categorySelect = container.querySelector('#compat-category');
      const protocolSelect = container.querySelector('#compat-protocol');

      [ecosystemSelect, categorySelect, protocolSelect].forEach(el => {
        if (el) el.addEventListener('change', () => this.renderForwardResults());
      });

      // Reverse checkbox events
      const checkboxes = container.querySelectorAll('.reverse-device-checkbox');
      checkboxes.forEach(cb => {
        cb.addEventListener('change', () => this.renderReverseResults());
      });
    },

    renderForwardResults: function () {
      const resultsContainer = document.getElementById('compat-forward-results');
      if (!resultsContainer || !window.NODELY_DATA) return;

      const ecoFilter = document.getElementById('compat-ecosystem').value;
      const catFilter = document.getElementById('compat-category').value;
      const protoFilter = document.getElementById('compat-protocol').value;

      let filtered = window.NODELY_DATA.devices.filter(dev => {
        // Category check
        if (catFilter !== 'all' && dev.category !== catFilter) return false;
        
        // Protocol check
        if (protoFilter !== 'all') {
          const hasProto = dev.connectivity.some(p => p.toLowerCase().includes(protoFilter.toLowerCase()));
          if (!hasProto) return false;
        }

        // Ecosystem check
        if (ecoFilter !== 'all') {
          const status = dev.ecosystemCompatibility[ecoFilter]?.status;
          if (!status || status === 'not-supported') return false;
        }

        return true;
      });

      if (filtered.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-compat-results">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <h4>No devices match this exact combination</h4>
            <p>Try switching protocol to "All Protocols" or selecting a different ecosystem.</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = filtered.map(dev => {
        return `
          <div class="compat-device-card">
            <div class="compat-card-header">
              <img src="${dev.image}" alt="${dev.imageAlt}" class="compat-device-img" loading="lazy">
              <div class="compat-header-text">
                <span class="badge-cat">${dev.category}</span>
                <h4 class="compat-device-title">${dev.name}</h4>
                <div class="compat-meta-row">
                  <span class="compat-brand">${dev.brand}</span>
                  <span class="compat-price tabular">$${dev.price}</span>
                </div>
              </div>
            </div>

            <!-- Ecosystem Status Breakdown with Icon + Text -->
            <div class="compat-matrix-list">
              <div class="compat-matrix-item ${ecoFilter === 'alexa' ? 'highlight-eco' : ''}">
                <div class="compat-item-label">
                  <span class="eco-name">Amazon Alexa</span>
                  ${this.getStatusBadge(dev.ecosystemCompatibility.alexa.status, dev.ecosystemCompatibility.alexa.label)}
                </div>
                <p class="compat-note">${dev.ecosystemCompatibility.alexa.note}</p>
              </div>

              <div class="compat-matrix-item ${ecoFilter === 'google' ? 'highlight-eco' : ''}">
                <div class="compat-item-label">
                  <span class="eco-name">Google Home</span>
                  ${this.getStatusBadge(dev.ecosystemCompatibility.google.status, dev.ecosystemCompatibility.google.label)}
                </div>
                <p class="compat-note">${dev.ecosystemCompatibility.google.note}</p>
              </div>

              <div class="compat-matrix-item ${ecoFilter === 'apple' ? 'highlight-eco' : ''}">
                <div class="compat-item-label">
                  <span class="eco-name">Apple Home</span>
                  ${this.getStatusBadge(dev.ecosystemCompatibility.apple.status, dev.ecosystemCompatibility.apple.label)}
                </div>
                <p class="compat-note">${dev.ecosystemCompatibility.apple.note}</p>
              </div>
            </div>

            <div class="compat-card-footer">
              <div class="verified-timestamp">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Lab Verified: ${dev.lastVerified} (Demo)</span>
              </div>
              <button type="button" class="btn btn-secondary btn-sm btn-quick-compare" data-device-id="${dev.id}">
                Compare Specs
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Add handler to "Compare Specs" buttons
      resultsContainer.querySelectorAll('.btn-quick-compare').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-device-id');
          if (window.CompareEngine && window.CompareEngine.addDeviceToMatrix) {
            window.CompareEngine.addDeviceToMatrix(id);
            const matrixSec = document.getElementById('matrix-section');
            if (matrixSec) matrixSec.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
    },

    renderReverseResults: function () {
      const scorecardContainer = document.getElementById('reverse-scorecard-container');
      if (!scorecardContainer || !window.NODELY_DATA) return;

      const checkedBoxes = Array.from(document.querySelectorAll('.reverse-device-checkbox:checked'));
      const selectedIds = checkedBoxes.map(cb => cb.value);

      if (selectedIds.length === 0) {
        scorecardContainer.innerHTML = `
          <div class="no-compat-results">
            <p>Please select at least one device above to audit ecosystem harmony.</p>
          </div>
        `;
        return;
      }

      const selectedDevices = window.NODELY_DATA.devices.filter(d => selectedIds.includes(d.id));
      const total = selectedDevices.length;

      const ecosystems = [
        { id: 'alexa', name: 'Amazon Alexa', color: '#00E5FF' },
        { id: 'google', name: 'Google Home', color: '#38BDF8' },
        { id: 'apple', name: 'Apple Home', color: '#F1F5F9' }
      ];

      const scores = ecosystems.map(eco => {
        let nativeCount = 0;
        let matterCount = 0;
        let bridgeCount = 0;
        let unsupportedCount = 0;

        selectedDevices.forEach(d => {
          const st = d.ecosystemCompatibility[eco.id].status;
          if (st === 'works-natively') nativeCount++;
          else if (st === 'works-matter') matterCount++;
          else if (st === 'needs-hub') bridgeCount++;
          else unsupportedCount++;
        });

        const effectiveScore = Math.round(((nativeCount * 1.0 + matterCount * 0.95 + bridgeCount * 0.6) / total) * 100);

        return {
          eco,
          nativeCount,
          matterCount,
          bridgeCount,
          unsupportedCount,
          effectiveScore
        };
      });

      // Find top recommendation
      scores.sort((a, b) => b.effectiveScore - a.effectiveScore);
      const topPick = scores[0];

      scorecardContainer.innerHTML = `
        <div class="reverse-analysis-card">
          <div class="reverse-verdict-banner">
            <div class="verdict-tag">Recommended Main Hub Platform</div>
            <h3 class="verdict-title">${topPick.eco.name} delivers highest unified coverage (${topPick.effectiveScore}%)</h3>
            <p class="verdict-desc">Based on your ${total} selected items, ${topPick.eco.name} offers the lowest protocol friction with ${topPick.nativeCount} native integrations, ${topPick.matterCount} Matter endpoints, and ${topPick.bridgeCount} bridged devices.</p>
          </div>

          <div class="ecosystem-score-columns">
            ${scores.map(s => `
              <div class="eco-score-column ${s.eco.id === topPick.eco.id ? 'best-eco-col' : ''}">
                <div class="eco-col-header">
                  <strong>${s.eco.name}</strong>
                  <span class="eco-score-badge tabular">${s.effectiveScore}% Match</span>
                </div>
                <div class="eco-progress-bar">
                  <div class="eco-progress-fill" style="width: ${s.effectiveScore}%"></div>
                </div>
                <ul class="eco-stat-breakdown">
                  <li>
                    <span class="status-indicator stat-native"></span>
                    <span>${s.nativeCount} of ${total} Native Out-of-Box</span>
                  </li>
                  <li>
                    <span class="status-indicator stat-matter"></span>
                    <span>${s.matterCount} of ${total} via Matter Spec</span>
                  </li>
                  ${s.bridgeCount > 0 ? `
                    <li>
                      <span class="status-indicator stat-bridge"></span>
                      <span>${s.bridgeCount} of ${total} Requires Hub / Bridge</span>
                    </li>
                  ` : ''}
                  ${s.unsupportedCount > 0 ? `
                    <li>
                      <span class="status-indicator stat-unsupported"></span>
                      <span>${s.unsupportedCount} of ${total} Not Supported</span>
                    </li>
                  ` : ''}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  };
})();
