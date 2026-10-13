# Nodely — Smart Home Gadgets Comparison & Review Guide

Nodely is a client-side comparison portal and empirical review guide for smart home gadgets, built with vanilla HTML, modern CSS, and modular ES6 JavaScript.

## 📋 Project Specifications & Deliverables

- **Site Type:** Review / Guide Comparison Portal (no auth, no dashboard)
- **Pages (Exactly 4 HTML files at root level):**
  1. `index.html` (Home) — 7+ sections: Animated device-network hero, category grid, top picks, compatibility teaser, how we test, verified reviews highlights, newsletter & FAQ, footer.
  2. `about.html` (About) — 4+ sections: Founding story & mission, testing lab & analyst bios, 10-point scoring methodology (`#methodology`), independence statement, CTA.
  3. `services.html` (Services) — 5+ sections: Buying guides (`#guides`), side-by-side comparisons (`#comparisons`), setup help (`#setup`), starter bundles (`#bundles`), FAQ, and fully validated contact form (`#contact`).
  4. `compare.html` (Tool / Compare) — 5+ sections: Filter bar, device results grid, 2–4 device sticky feature matrix with differences-only toggle, grouped pros & cons with verdict box, compatibility checker (forward & reverse modes), and accessible detail modal with verified user reviews.
- **Tech Stack:** Plain HTML5, CSS3 with Custom Properties, Modular Vanilla JavaScript (ES6+). Zero external frameworks; zero dead links.
- **Theme:** Soft-dark minimalist-tech aesthetic with cool cyber cyan accent (`#00E5FF`).

---

## 🏗️ Directory Structure

```
Nodely/
├── index.html               # Home page (7+ sections, hero network canvas, top picks)
├── about.html               # About & Lab page (methodology #methodology, independence)
├── services.html            # Services & Bundles (#guides, #comparisons, #setup, #bundles, #contact)
├── compare.html             # Tool/Compare page (matrix, filters, compatibility checker, modal)
├── assets/
│   ├── css/
│   │   └── style.css        # Master design system tokens, layout, typography, components
│   └── js/
│       ├── data.js          # Single source of truth seed dataset (devices, specs, bundles, bios)
│       ├── affiliate.js     # Delegated click listener, UTM generator, dataLayer event dispatcher
│       ├── reviews.js       # Star ratings, 5-to-1 distribution bars, verified filters, sorting
│       ├── compat.js        # Compatibility checker (forward ecosystem lookup & reverse audit)
│       ├── compare.js       # Matrix rendering, sticky columns, differences toggle, modal trap
│       └── main.js          # Navigation drawer, keyboard dropdown, hero canvas, form validations
└── README.md                # Technical documentation and verification checklist
```

---

## ⚡ Core Feature Implementations

### 1. Side-by-Side Feature Matrix (`compare.html`)
- Interactive selection of 2 to 4 devices across smart speakers, cameras, thermostats, lighting, and locks.
- Aligned spec rows: MSRP, editorial score (/10), user rating (/5), connectivity protocols, Alexa support, Google Home support, Apple Home support, power source, privacy features, companion app rating, warranty, and category-specific specs.
- "Best overall" and "Best value" badges.
- Sticky table header and sticky first feature column on both desktop and mobile viewports.
- Independent horizontal scroll container (`.matrix-table-scroller`) — never triggers page-level horizontal overflow.
- "Check price" affiliate buttons in every device column header.
- "Differences only" toggle dynamically hides identical attributes.

### 2. Verified User Reviews Engine (`assets/js/reviews.js`)
- Rating summaries: average /5, total review counts, and interactive 5-to-1-star distribution bars with percentage fills.
- Review cards with reviewer initials avatar, star ratings, date, title, body, and "Verified Owner" badges.
- Live sorting (Newest first, Highest rating, Lowest rating).
- Live filtering (All reviews vs. "Verified owners only").

### 3. Pros & Cons Breakdown & Verdict Box
- Grouped into 5 standardized categories per device: Setup, Performance, Privacy, App Experience, and Value.
- Equal-height dual columns with checkmark (pros) and cross (cons) icons.
- Verdict box with distinct "Who It's For" and "Who Should Skip" summaries.

### 4. Compatibility Checker Engine (`assets/js/compat.js`)
- **Forward Mode:** Filter by target ecosystem (Alexa, Google Home, Apple Home), category, and protocol (Matter, Thread, Wi-Fi, Bluetooth). Status shown with icon and text:
  - *Works Natively* (Green check)
  - *Works via Matter* (Cyan Matter cube)
  - *Needs Hub / Bridge* (Amber bridge)
  - *Not Supported* (Red cross)
- **Reverse Mode:** Select devices you own to run an ecosystem audit calculating compatibility coverage scores, bridge requirements, and optimal hub recommendation.
- Includes "How compatibility is verified" engineering notes and last verified dates.

### 5. Affiliate Link Tracking (`assets/js/affiliate.js`)
- Every "Check price" button features:
  - UTM-tagged URL (`utm_source=nodely&utm_medium=affiliate&utm_campaign=...&utm_content=...`)
  - `data-affiliate-id`, `data-product`, and `data-placement` attributes
  - `rel="sponsored noopener"`
  - `<!-- AFFILIATE_LINK -->` HTML comment
  - Transparent disclosure line nearby and in the footer
- Delegated click listener dispatches events to `window.dataLayer.push({ event: 'affiliate_click', ... })` and displays a non-intrusive demo toast.

### 6. Client-Side Form Validation (`assets/js/main.js`)
- **Services Contact Form (`#contact`):** Full client-side validation of name, email regex, inquiry topic, message (15+ chars), and terms checkbox. Highlights invalid fields with red borders/messages and valid fields with green borders. Displays inline success message without page reload.
- **Newsletter Form:** Validates email format and provides inline feedback.

### 7. Accessibility & SEO
- WCAG 2.1 AA compliant contrast ratios and focus indicators.
- Keyboard accessible navigation with ARIA attributes (`aria-expanded`, `aria-haspopup`, `aria-modal`, `role="dialog"`).
- Keyboard focus trap and ESC listener on modals and drawer.
- Skip to content link (`#main-content`).
- Structured JSON-LD on `index.html` (WebSite, Organization, ItemList) and dynamic JSON-LD injection on `compare.html` (Product, Review, AggregateRating).

---

## 🚀 Local Preview

Open any of the HTML files directly in a modern web browser:
```bash
# Using Python built-in server (optional)
python -m http.server 8000

# Or open index.html directly
start index.html
```
