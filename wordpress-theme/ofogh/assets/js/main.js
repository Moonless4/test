/* =========================================================================
   Ofogh Properties — Main JavaScript
   Handles: header scroll state, mobile menu, reveal-on-scroll, favorites,
   property carousel, property gallery + lightbox, contact modal,
   newsletter form, contact form (AJAX).
   ========================================================================= */
(function () {
  'use strict';

  // ---- Helper: Persian digit conversion ----
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

  // ---- Header scroll state ----
  var header = document.querySelector('.site-header');
  if (header) {
    function updateHeader() {
      if (window.scrollY > 24) {
        header.classList.add('site-header--scrolled');
        header.classList.add('header--light');
        header.classList.remove('header--dark');
        header.classList.remove('site-header--transparent');
        header.classList.remove('site-header--navy');
      } else {
        header.classList.remove('site-header--scrolled');
        var isHome = header.classList.contains('is-home-header');
        if (isHome) {
          header.classList.add('header--dark');
          header.classList.add('site-header--transparent');
          header.classList.remove('header--light');
          header.classList.remove('site-header--navy');
        } else {
          header.classList.add('header--dark');
          header.classList.add('site-header--navy');
          header.classList.remove('header--light');
          header.classList.remove('site-header--transparent');
        }
      }
    }
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // ---- Mobile menu ----
  var menuToggle = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    var menuOpen = false;
    function setMenu(open) {
      menuOpen = open;
      mobileMenu.classList.toggle('mobile-menu--open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    menuToggle.addEventListener('click', function () {
      setMenu(!menuOpen);
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
  }

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll('.of-reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('of-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('of-revealed'); });
  }

  // ---- Favorites ----
  function getFavorites() {
    try {
      var raw = document.cookie.match(/ofogh_favorites=([^;]+)/);
      if (!raw) return [];
      return raw[1].split(',').filter(function (v) { return v; }).map(function (v) { return parseInt(v, 10); });
    } catch (e) { return []; }
  }

  function updateFavoriteBadges() {
    var favs = getFavorites();
    var count = favs.length;
    document.querySelectorAll('.fav-count-badge').forEach(function (badge) {
      badge.textContent = count > 0 ? toPersianDigits(count) : '';
      badge.style.display = count > 0 ? 'grid' : 'none';
    });
  }
  updateFavoriteBadges();

  document.querySelectorAll('.fav-btn').forEach(function (btn) {
    var propertyId = parseInt(btn.getAttribute('data-property-id'), 10);
    var saved = getFavorites().indexOf(propertyId) !== -1;
    if (saved) btn.classList.add('is-saved');

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var favs = getFavorites();
      var idx = favs.indexOf(propertyId);
      if (idx !== -1) {
        favs.splice(idx, 1);
        btn.classList.remove('is-saved');
      } else {
        favs.push(propertyId);
        btn.classList.add('is-saved');
      }
      // Set cookie.
      document.cookie = 'ofogh_favorites=' + favs.join(',') + ';path=/;max-age=' + (30 * 24 * 60 * 60);
      // AJAX (optional — for server-side tracking, non-blocking).
      if (typeof ofoghData !== 'undefined' && ofoghData.ajaxUrl) {
        fetch(ofoghData.ajaxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=ofogh_favorite&property_id=' + propertyId + '&nonce=' + ofoghData.nonce,
        }).catch(function () {});
      }
      updateFavoriteBadges();
    });
  });

  // ---- Property carousel ----
  document.querySelectorAll('.featured-carousel').forEach(function (carousel) {
    var scroller = carousel.querySelector('.carousel-scroller');
    var prevBtn = carousel.querySelector('.carousel-arrow--prev');
    var nextBtn = carousel.querySelector('.carousel-arrow--next');
    var progressBar = carousel.querySelector('.carousel-progress__bar');
    if (!scroller) return;

    function updateState() {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var position = Math.abs(scroller.scrollLeft);
      if (prevBtn) prevBtn.disabled = position <= 6;
      if (nextBtn) nextBtn.disabled = position >= max - 6;
      if (progressBar) progressBar.style.width = (max > 0 ? Math.min(position / max, 1) * 100 : 0) + '%';
    }

    function step() {
      var card = scroller.querySelector('[data-card]');
      return card ? card.offsetWidth + 24 : 340;
    }

    function go(direction) {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var position = Math.abs(scroller.scrollLeft);
      if (direction === 1 && position >= max - 6) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }
      if (direction === -1 && position <= 6) {
        scroller.scrollTo({ left: -max, behavior: 'smooth' });
        return;
      }
      scroller.scrollBy({ left: -step() * direction, behavior: 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });

    // Drag to scroll (mouse only).
    var drag = { active: false, startX: 0, startScroll: 0, moved: false };
    scroller.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag.active = true;
      drag.startX = e.clientX;
      drag.startScroll = scroller.scrollLeft;
      drag.moved = false;
    });
    scroller.addEventListener('pointermove', function (e) {
      if (!drag.active) return;
      var delta = e.clientX - drag.startX;
      if (Math.abs(delta) > 4) {
        if (!drag.moved) {
          drag.moved = true;
          scroller.setPointerCapture(e.pointerId);
        }
      }
      scroller.scrollLeft = drag.startScroll + delta;
    });
    function endDrag(e) {
      if (scroller.hasPointerCapture && scroller.hasPointerCapture(e.pointerId)) {
        scroller.releasePointerCapture(e.pointerId);
      }
      if (drag.active) {
        drag.active = false;
        updateState();
      }
      // Reset moved after the current event loop so the click that follows
      // a drag is still blocked, but subsequent genuine clicks work.
      setTimeout(function () { drag.moved = false; }, 0);
    }
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);
    scroller.addEventListener('click', function (e) {
      if (drag.moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // Keyboard.
    scroller.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(-1); }
    });

    scroller.addEventListener('scroll', updateState, { passive: true });
    window.addEventListener('resize', updateState);
    updateState();
  });

  // ---- Property gallery + lightbox ----
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var images = gallery.querySelectorAll('[data-gallery-img]');
    var thumbs = gallery.querySelectorAll('.gallery-thumb');
    var total = images.length;
    var currentIndex = 0;

    function showIndex(index) {
      currentIndex = (index + total) % total;
      images.forEach(function (img, i) {
        img.style.display = i === currentIndex ? 'block' : 'none';
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('gallery-thumb--active', i === currentIndex);
      });
    }
    showIndex(0);

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () { showIndex(i); });
    });

    // Lightbox.
    var lightbox = gallery.querySelector('.lightbox');
    var lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
    var lightboxCount = lightbox ? lightbox.querySelector('.lightbox__count') : null;

    gallery.querySelectorAll('[data-lightbox-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        if (!lightbox) return;
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateLightbox();
      });
    });

    function updateLightbox() {
      if (!lightboxImg) return;
      var activeImg = images[currentIndex];
      if (activeImg) {
        lightboxImg.src = activeImg.getAttribute('data-full') || activeImg.src;
        lightboxImg.alt = activeImg.alt;
      }
      if (lightboxCount) {
        lightboxCount.textContent = toPersianDigits(currentIndex + 1) + ' / ' + toPersianDigits(total);
      }
    }

    if (lightbox) {
      lightbox.querySelectorAll('[data-lightbox-close]').forEach(function (btn) {
        btn.addEventListener('click', closeLightbox);
      });
      lightbox.querySelectorAll('[data-lightbox-prev]').forEach(function (btn) {
        btn.addEventListener('click', function () { showIndex(currentIndex - 1); updateLightbox(); });
      });
      lightbox.querySelectorAll('[data-lightbox-next]').forEach(function (btn) {
        btn.addEventListener('click', function () { showIndex(currentIndex + 1); updateLightbox(); });
      });

      document.addEventListener('keydown', function (e) {
        if (lightbox.style.display !== 'flex') return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') { showIndex(currentIndex + 1); updateLightbox(); }
        if (e.key === 'ArrowRight') { showIndex(currentIndex - 1); updateLightbox(); }
      });
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // ---- Contact modal ----
  document.querySelectorAll('[data-modal-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var modalId = trigger.getAttribute('data-modal-trigger');
      var modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Switch form fields based on the contact kind (viewing vs agent).
        var kind = trigger.getAttribute('data-contact-kind') || 'contact';
        var kindInput = modal.querySelector('[name="kind"]');
        if (kindInput) kindInput.value = kind;

        var viewingFields = modal.querySelector('[data-fields-viewing]');
        var agentFields = modal.querySelector('[data-fields-agent]');
        var titleEl = modal.querySelector('[data-modal-title]');
        var submitBtn = modal.querySelector('[data-submit-btn]');

        if (kind === 'viewing') {
          if (viewingFields) viewingFields.style.display = '';
          if (agentFields) agentFields.style.display = 'none';
          if (titleEl) titleEl.textContent = 'تعیین وقت بازدید';
          if (submitBtn) submitBtn.childNodes[0].nodeValue = 'ثبت درخواست بازدید ';
        } else {
          if (viewingFields) viewingFields.style.display = 'none';
          if (agentFields) agentFields.style.display = '';
          if (titleEl) titleEl.textContent = 'تماس با مشاور';
          if (submitBtn) submitBtn.childNodes[0].nodeValue = 'ارسال پیام ';
        }

        var focusEl = modal.querySelector('[autofocus]');
        if (focusEl) focusEl.focus();
      }
    });
  });
  document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
        if (overlay.style.display === 'flex') {
          overlay.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    }
  });

  // ---- Contact form (AJAX) ----
  document.querySelectorAll('form[data-ofogh-contact]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errorEl = form.querySelector('[data-contact-error]');
      var submitBtn = form.querySelector('[type="submit"]');
      var successEl = form.querySelector('.contact-success');
      var formEl = form.querySelector('.contact-form-fields');

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var phone = form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value.trim() : '';
      var kind = form.querySelector('[name="kind"]') ? form.querySelector('[name="kind"]').value : 'contact';

      // Read the correct message field — viewing uses [name="message"], agent uses [name="message_agent"].
      var messageField = form.querySelector('[name="message"]') || form.querySelector('[name="message_agent"]');
      var message = messageField ? messageField.value.trim() : '';
      var preferredDate = form.querySelector('[name="preferred_date"]') ? form.querySelector('[name="preferred_date"]').value.trim() : '';
      var preferredTime = form.querySelector('[name="preferred_time"]') ? form.querySelector('[name="preferred_time"]').value.trim() : '';

      if (!name || !email || !phone) {
        if (errorEl) errorEl.textContent = 'لطفاً نام، ایمیل و شمارهٔ تماس خود را وارد کنید.';
        return;
      }
      if (kind === 'viewing' && !preferredDate) {
        if (errorEl) errorEl.textContent = 'لطفاً تاریخ پیشنهادی برای بازدید را وارد کنید.';
        return;
      }
      if (kind === 'agent' && !message) {
        if (errorEl) errorEl.textContent = 'لطفاً متن پیام خود را وارد کنید.';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorEl) errorEl.textContent = 'این نشانی ایمیل درست به نظر نمی‌رسد.';
        return;
      }
      if (!/^09\d{9}$/.test(toLatinDigits(phone.trim()))) {
        if (errorEl) errorEl.textContent = 'شمارهٔ تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.';
        return;
      }
      if (errorEl) errorEl.textContent = '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'در حال ارسال…'; }

      if (typeof ofoghData !== 'undefined' && ofoghData.ajaxUrl) {
        var body = 'action=ofogh_contact&nonce=' + ofoghData.nonce +
          '&name=' + encodeURIComponent(name) +
          '&email=' + encodeURIComponent(email) +
          '&phone=' + encodeURIComponent(phone) +
          '&message=' + encodeURIComponent(message) +
          '&kind=' + encodeURIComponent(kind) +
          '&preferred_date=' + encodeURIComponent(preferredDate) +
          '&preferred_time=' + encodeURIComponent(preferredTime);

        fetch(ofoghData.ajaxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body,
        })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) {
            if (formEl) formEl.style.display = 'none';
            if (successEl) successEl.style.display = 'block';
            form.reset();
          } else {
            if (errorEl) errorEl.textContent = (res.data && res.data.message) || 'خطایی رخ داد. دوباره تلاش کنید.';
          }
        })
        .catch(function () {
          if (errorEl) errorEl.textContent = 'خطای ارتباط. دوباره تلاش کنید.';
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.childNodes[0].nodeValue = (kind === 'viewing' ? 'ثبت درخواست بازدید ' : 'ارسال پیام ');
          }
        });
      } else {
        // Fallback: submit normally.
        form.off();
        form.submit();
      }
    });
  });

  // ---- Newsletter form ----
  document.querySelectorAll('form[data-ofogh-newsletter]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var msg = form.querySelector('.newsletter-msg');
      var email = input ? input.value.trim() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (msg) msg.textContent = 'لطفاً یک ایمیل معتبر وارد کنید.';
        return;
      }
      if (typeof ofoghData !== 'undefined' && ofoghData.ajaxUrl) {
        fetch(ofoghData.ajaxUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=ofogh_contact&nonce=' + ofoghData.nonce +
            '&name=' + encodeURIComponent(email) +
            '&email=' + encodeURIComponent(email) +
            '&message=' + encodeURIComponent('درخواست عضویت در خبرنامه') +
            '&kind=contact',
        }).then(function () {
          if (msg) msg.textContent = 'سپاسگزاریم — به‌زودی با شما تماس می‌گیریم.';
          if (input) input.value = '';
        });
      }
    });
  });

  // ---- Filters toggle (mobile) ----
  var filtersToggle = document.getElementById('filters-toggle');
  var filtersPanel = document.getElementById('filters-panel');
  if (filtersToggle && filtersPanel) {
    filtersToggle.addEventListener('click', function () {
      var open = filtersPanel.classList.toggle('filters-panel--hidden');
      filtersPanel.classList.toggle('filters-panel');
      // Toggle visibility.
      if (filtersPanel.style.display === 'none') {
        filtersPanel.style.display = '';
      } else {
        filtersPanel.style.display = filtersPanel.style.display === 'none' ? '' : 'none';
      }
    });
  }

})();
