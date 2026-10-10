/*
 * Medora — front-end behaviour.
 *
 * Plain ES5-compatible JavaScript, no dependency and no build step: the theme must work on a
 * plain WordPress install. Every module bails out when its markup is not on the page.
 */

(function () {
  'use strict';

  var FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  function toFa(value) {
    return String(value).replace(/\d/g, function (d) {
      return FA_DIGITS[Number(d)];
    });
  }

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function on(root, event, selector, handler) {
    if (!root) return;
    root.addEventListener(event, function (e) {
      var target = e.target.closest(selector);
      if (target && root.contains(target)) handler(target, e);
    });
  }

  /* ---------------------------------------------------------------- *
   * Sticky header shadow
   * ---------------------------------------------------------------- */

  function initHeader() {
    var header = document.querySelector('[data-medora-header]');
    if (!header) return;

    function update() {
      if (window.scrollY > 50) {
        header.style.boxShadow = '0 8px 28px -18px rgba(13,53,68,.35)';
      } else {
        header.style.boxShadow = 'none';
      }
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------------------------------------------------------------- *
   * Mega menu: CSS opens it on hover for pointers; this adds click and
   * keyboard control (and Escape to close).
   * ---------------------------------------------------------------- */

  function initMegaMenu() {
    var nav = document.querySelector('[data-medora-nav]');
    if (!nav) return;

    var items = nav.querySelectorAll('[data-medora-menu-item]');

    function closeAll(except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove('is-open');
        var trigger = item.querySelector('a[aria-haspopup]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }

    items.forEach(function (item) {
      var trigger = item.querySelector('a[aria-haspopup]');
      if (!trigger) return;

      trigger.addEventListener('click', function (e) {
        // The first click opens the panel instead of navigating away on touch devices.
        if (!item.classList.contains('is-open') && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          closeAll(item);
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) closeAll(null);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll(null);
    });
  }

  /* ---------------------------------------------------------------- *
   * Drawers (cart, categories)
   * ---------------------------------------------------------------- */

  function openLayer(element) {
    if (!element) return;
    element.classList.remove('hidden');
    element.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLayer(element) {
    if (!element) return;
    element.classList.add('hidden');
    element.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initDrawers() {
    var cart = document.querySelector('[data-medora-cart-drawer]');
    var categories = document.querySelector('[data-medora-category-drawer]');

    document.querySelectorAll('[data-medora-cart-open]').forEach(function (button) {
      button.addEventListener('click', function () {
        openLayer(cart);
      });
    });

    on(document, 'click', '[data-medora-cart-close]', function () {
      closeLayer(cart);
    });

    document.querySelectorAll('[data-medora-category-open]').forEach(function (button) {
      button.addEventListener('click', function () {
        openLayer(categories);
      });
    });

    on(document, 'click', '[data-medora-category-close]', function () {
      closeLayer(categories);
    });

    // Category tabs inside the drawer.
    on(document, 'click', '[data-medora-category-tab]', function (button) {
      var id = button.getAttribute('data-medora-category-tab');

      document.querySelectorAll('[data-medora-category-tab]').forEach(function (tab) {
        var active = tab === button;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-current', active ? 'true' : 'false');
      });

      document.querySelectorAll('[data-medora-category-panel]').forEach(function (panel) {
        var active = panel.getAttribute('data-medora-category-panel') === id;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeLayer(cart);
      closeLayer(categories);
    });

    // Any link inside a drawer closes it before the browser follows it.
    on(document, 'click', '[data-medora-cart-drawer] a, [data-medora-category-drawer] a', function (link, event) {
      if (link.closest('[data-medora-cart-close], [data-medora-category-close]')) return;
      closeLayer(link.closest('[data-medora-cart-drawer]') ? cart : categories);
      void event;
    });
  }

  /* ---------------------------------------------------------------- *
   * The hero slider
   * ---------------------------------------------------------------- */

  function initSlider() {
    var slider = document.querySelector('[data-medora-slider]');
    if (!slider) return;

    var slides = slider.querySelectorAll('[data-medora-slide]');
    var dots = slider.querySelectorAll('[data-medora-slide-dot]');
    if (slides.length < 2) return;

    var index = 0;
    var timer = null;
    var interval = parseInt(slider.getAttribute('data-interval'), 10) || 7000;

    function show(next) {
      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('is-active', active);
        slide.classList.toggle('opacity-100', active);
        slide.classList.toggle('opacity-0', !active);
        slide.classList.toggle('pointer-events-none', !active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.setAttribute('aria-current', active ? 'true' : 'false');
        dot.classList.toggle('bg-white', active);
        dot.classList.toggle('bg-white/60', !active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, interval);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    var prev = slider.querySelector('[data-medora-slide-prev]');
    var next = slider.querySelector('[data-medora-slide-next]');

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-medora-slide-dot'), 10) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) start();
  }

  /* ---------------------------------------------------------------- *
   * Product rails: drag to scroll on touch/pointer, and a next button
   * that walks towards the end of the rail (RTL-aware).
   * ---------------------------------------------------------------- */

  function initRails() {
    document.querySelectorAll('[data-medora-rail]').forEach(function (rail) {
      var step = function () {
        var isRtl = window.getComputedStyle(rail).direction === 'rtl';
        var delta = Math.max(rail.clientWidth * 0.8, 260);
        rail.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
      };

      var section = rail.closest('section');
      var buttons = section ? section.querySelectorAll('[data-medora-rail-next]') : [];

      buttons.forEach(function (button) {
        button.addEventListener('click', step);
      });

      var startX = 0;
      var startScroll = 0;
      var dragging = false;

      rail.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        startX = e.clientX;
        startScroll = rail.scrollLeft;
        rail.classList.add('cursor-grabbing');
      });

      rail.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var moved = e.clientX - startX;
        if (Math.abs(moved) > 4) rail.scrollLeft = startScroll - moved;
      });

      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (type) {
        rail.addEventListener(type, function () {
          dragging = false;
          rail.classList.remove('cursor-grabbing');
        });
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Countdown: real sale end dates only. Each panel carries the Unix
   * timestamp of the sale it belongs to.
   * ---------------------------------------------------------------- */

  function initCountdowns() {
    var panels = document.querySelectorAll('[data-medora-countdown]');
    if (!panels.length) return;

    function tick() {
      var now = Math.floor(Date.now() / 1000);

      panels.forEach(function (panel) {
        var end = parseInt(panel.getAttribute('data-medora-countdown'), 10) || 0;
        var left = Math.max(0, end - now);

        var hours = Math.floor(left / 3600);
        var minutes = Math.floor((left % 3600) / 60);
        var seconds = left % 60;

        var map = { hours: hours, minutes: minutes, seconds: seconds };

        Object.keys(map).forEach(function (unit) {
          var node = panel.querySelector('[data-medora-cd="' + unit + '"]');
          if (node) node.textContent = toFa(pad(map[unit]));
        });

        if (left <= 0) panel.classList.add('is-ended');
      });
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------- *
   * Scroll reveal
   * ---------------------------------------------------------------- */

  function initReveal() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach(function (element) {
        element.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.05 }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  /* ---------------------------------------------------------------- *
   * FAQ: one answer at a time, plus the topic chips.
   * ---------------------------------------------------------------- */

  function initFaq() {
    var toggles = document.querySelectorAll('.medora-faq-toggle');

    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var item = toggle.closest('.medora-faq-item');
        var answer = item ? item.querySelector('.medora-faq-answer') : null;
        var open = toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (answer) answer.hidden = open;
      });
    });

    on(document, 'click', '[data-medora-faq-filter]', function (chip) {
      var wanted = chip.getAttribute('data-medora-faq-filter');

      document.querySelectorAll('[data-medora-faq-filter]').forEach(function (other) {
        var active = other === chip;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      document.querySelectorAll('[data-medora-faq-group]').forEach(function (group) {
        group.hidden = wanted !== 'all' && group.getAttribute('data-medora-faq-group') !== wanted;
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Newsletter (the theme's own handler, nonce checked server-side)
   * ---------------------------------------------------------------- */

  function initNewsletter() {
    var forms = document.querySelectorAll('[data-medora-newsletter]');
    if (!forms.length || typeof window.medoraData === 'undefined') return;

    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var input = form.querySelector('input[type="email"]');
        var message = form.parentNode.querySelector('[data-medora-newsletter-message]');
        if (!input) return;

        var body = new FormData();
        body.append('action', 'medora_newsletter');
        body.append('nonce', window.medoraData.nonce);
        body.append('email', input.value);

        fetch(window.medoraData.ajaxUrl, { method: 'POST', body: body, credentials: 'same-origin' })
          .then(function (response) {
            return response.json();
          })
          .then(function (payload) {
            if (message) {
              message.textContent = (payload && payload.data && payload.data.message) || window.medoraData.i18n.subscribed;
              message.classList.remove('hidden');
            }
            if (payload && payload.success) form.reset();
          })
          .catch(function () {
            if (message) {
              message.textContent = window.medoraData.i18n.error;
              message.classList.remove('hidden');
            }
          });
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * The phone tab bar: lift it by the strip a dynamic browser toolbar
   * hides below the layout viewport (a no-op where the two agree).
   * ---------------------------------------------------------------- */

  function initTabBar() {
    var bar = document.querySelector('[data-medora-tab-bar]');
    if (!bar) return;

    var viewport = window.visualViewport;
    if (!viewport) return;

    function sync() {
      var hidden = document.documentElement.clientHeight - viewport.height - viewport.offsetTop;
      bar.style.transform = 'translateY(' + -Math.max(0, hidden) + 'px)';
    }

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
  }

  /* ---------------------------------------------------------------- *
   * Boot
   * ---------------------------------------------------------------- */

  function boot() {
    initHeader();
    initMegaMenu();
    initDrawers();
    initSlider();
    initRails();
    initCountdowns();
    initReveal();
    initFaq();
    initNewsletter();
    initTabBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
