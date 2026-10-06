/* =========================================================================
   Ofogh Properties — Property Filters
   Handles client-side filtering and sorting on the property archive.
   Reads filter values from the filter panel dropdowns and filters displayed
   property cards. Uses URL query params for shareable filtered views.
   ========================================================================= */
(function () {
  'use strict';

  var filterForm = document.getElementById('ofogh-filter-form');
  var propertyGrid = document.querySelector('.properties-grid');
  if (!filterForm || !propertyGrid) return;

  var allCards = Array.prototype.slice.call(propertyGrid.querySelectorAll('.property-card-item'));
  var noResults = document.querySelector('.no-results');
  var countEl = document.querySelector('.properties-count');

  var PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  function toPersianDigits(value) {
    return String(value).replace(/[0-9]/g, function (d) {
      return PERSIAN_DIGITS[parseInt(d, 10)];
    });
  }
  function toLatinDigits(value) {
    return String(value).replace(/[۰-۹]/g, function (d) {
      return String(PERSIAN_DIGITS.indexOf(d));
    });
  }

  function getFilters() {
    return {
      search:   (filterForm.querySelector('[name="search"]') || {}).value || '',
      location: (filterForm.querySelector('[name="location"]') || {}).value || 'all',
      type:     (filterForm.querySelector('[name="type"]') || {}).value || 'all',
      price:    (filterForm.querySelector('[name="price"]') || {}).value || 'all',
      beds:     (filterForm.querySelector('[name="beds"]') || {}).value || 'all',
      baths:    (filterForm.querySelector('[name="baths"]') || {}).value || 'all',
      sort:     (filterForm.querySelector('[name="sort"]') || {}).value || 'featured',
    };
  }

  function applyFilters() {
    var filters = getFilters();
    var term = filters.search.trim().toLowerCase();
    var visible = [];

    allCards.forEach(function (card) {
      var name = (card.getAttribute('data-name') || '').toLowerCase();
      var city = (card.getAttribute('data-city') || '').toLowerCase();
      var region = (card.getAttribute('data-region') || '').toLowerCase();
      var type = card.getAttribute('data-type') || '';
      var price = parseInt(card.getAttribute('data-price') || '0', 10);
      var beds = parseInt(card.getAttribute('data-beds') || '0', 10);
      var baths = parseInt(card.getAttribute('data-baths') || '0', 10);
      var summary = (card.getAttribute('data-summary') || '').toLowerCase();
      var locationStr = (card.getAttribute('data-location') || '').toLowerCase();

      var show = true;

      if (term) {
        if (name.indexOf(term) === -1 && city.indexOf(term) === -1 && region.indexOf(term) === -1 && summary.indexOf(term) === -1 && type.toLowerCase().indexOf(term) === -1) {
          show = false;
        }
      }

      if (filters.location !== 'all' && locationStr !== filters.location.toLowerCase()) {
        show = false;
      }

      if (filters.type !== 'all' && type !== filters.type) {
        show = false;
      }

      if (filters.price !== 'all') {
        var parts = filters.price.split('-');
        var min = parseInt(parts[0], 10);
        var max = parseInt(parts[1], 10);
        if (price < min || price > max) show = false;
      }

      if (filters.beds !== 'all' && beds < parseInt(filters.beds, 10)) {
        show = false;
      }

      if (filters.baths !== 'all' && baths < parseInt(filters.baths, 10)) {
        show = false;
      }

      if (show) {
        card.style.display = '';
        visible.push(card);
      } else {
        card.style.display = 'none';
      }
    });

    // Sort.
    var sortValue = filters.sort;
    visible.sort(function (a, b) {
      switch (sortValue) {
        case 'price-asc':
          return parseInt(a.getAttribute('data-price'), 10) - parseInt(b.getAttribute('data-price'), 10);
        case 'price-desc':
          return parseInt(b.getAttribute('data-price'), 10) - parseInt(a.getAttribute('data-price'), 10);
        case 'size-desc':
          return parseInt(b.getAttribute('data-area'), 10) - parseInt(a.getAttribute('data-area'), 10);
        case 'newest':
          return parseInt(b.getAttribute('data-year'), 10) - parseInt(a.getAttribute('data-year'), 10);
        default: // featured
          var af = a.getAttribute('data-featured') === '1' ? 1 : 0;
          var bf = b.getAttribute('data-featured') === '1' ? 1 : 0;
          return bf - af;
      }
    });

    // Re-append in sorted order.
    visible.forEach(function (card) {
      propertyGrid.appendChild(card);
    });

    // Update count.
    if (countEl) {
      countEl.textContent = toPersianDigits(visible.length) + ' ملک در دسترس';
    }

    // Show/hide no results.
    if (noResults) {
      noResults.style.display = visible.length === 0 ? 'block' : 'none';
    }
  }

  // Listen for changes on all filter controls.
  filterForm.addEventListener('change', applyFilters);
  filterForm.addEventListener('input', applyFilters);
  filterForm.addEventListener('submit', function (e) { e.preventDefault(); applyFilters(); });

  // Reset button.
  var resetBtn = document.getElementById('filter-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      filterForm.querySelectorAll('select, input').forEach(function (el) {
        if (el.tagName === 'SELECT') {
          el.value = el.querySelector('option').value;
        } else {
          el.value = '';
        }
      });
      applyFilters();
    });
  }

  // Featured toggle chips.
  document.querySelectorAll('[data-featured-toggle]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var featuredOnly = chip.getAttribute('data-featured-toggle') === '1';
      allCards.forEach(function (card) {
        var isFeatured = card.getAttribute('data-featured') === '1';
        if (featuredOnly && !isFeatured) {
          card.style.display = 'none';
        }
      });
      document.querySelectorAll('[data-featured-toggle]').forEach(function (c) { c.classList.remove('filter-chip--active'); c.classList.add('filter-chip--inactive'); });
      chip.classList.add('filter-chip--active');
      chip.classList.remove('filter-chip--inactive');
      if (!featuredOnly) applyFilters();
    });
  });

  // Apply on load (for URL-based initial filters).
  applyFilters();
})();
