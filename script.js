/* ============================================================
   LUMETHICS — shared site scripts
   Extracted from the original single-page build and generalised
   to work across all pages (multi-form support + Services dropdown).
   ============================================================ */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky nav glass on scroll ---------- */
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  var hamburger = document.getElementById('hamburger');
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('overlay');
  function setMenu(open) {
    if (!hamburger || !drawer || !overlay) return;
    hamburger.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (hamburger && drawer && overlay) {
    hamburger.addEventListener('click', function () { setMenu(!drawer.classList.contains('open')); });
    overlay.addEventListener('click', function () { setMenu(false); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- Services dropdown (desktop nav) ---------- */
  var navItems = document.querySelectorAll('.nav-item');
  function closeOtherNavItems(except) {
    navItems.forEach(function (item) {
      if (item === except) return;
      item.classList.remove('open');
      var t = item.querySelector('.nav-toggle');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }
  navItems.forEach(function (item) {
    var toggle = item.querySelector('.nav-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      closeOtherNavItems(item);
      var open = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    item.addEventListener('mouseenter', function () { closeOtherNavItems(item); });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav-item.open').forEach(function (item) {
      if (!item.contains(e.target)) {
        item.classList.remove('open');
        var t = item.querySelector('.nav-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.nav-item.open').forEach(function (item) {
        item.classList.remove('open');
        var t = item.querySelector('.nav-toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ---------- Scroll reveal (Intersection Observer) ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Case study accordion ---------- */
  document.querySelectorAll('.case-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var caseEl = btn.closest('.case');
      var body = caseEl.querySelector('.case-body');
      var open = caseEl.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
    });
  });

  /* ---------- Testimonials show more / fewer ---------- */
  var moreBtn = document.getElementById('moreQuotes');
  if (moreBtn) {
    var quoteGrid = document.querySelector('.quote-grid');
    moreBtn.addEventListener('click', function () {
      var expanded = quoteGrid.classList.toggle('expanded');
      moreBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      moreBtn.textContent = expanded ? 'Show fewer testimonials' : 'Show more testimonials';
      if (!expanded) {
        document.getElementById('testimonials').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /* ---------- Count-up metrics ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    if (reduceMotion) { el.textContent = prefix + target.toLocaleString() + suffix; return; }
    var start = null, dur = 1600;
    function fmt(v) {
      if (decimals > 0) return v.toFixed(decimals);
      return Math.round(v).toLocaleString();
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(target) + suffix;
    }
    requestAnimationFrame(step);
  }
  var nums = document.querySelectorAll('.num[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { cio.observe(n); });
  } else {
    nums.forEach(animateCount);
  }

  /* ---------- Forms: validation + submit (works for every .js-form) ---------- */
  function validateField(input) {
    var field = input.closest('.field');
    if (!field) return true;
    var valid = input.checkValidity() && (input.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value));
    if (input.value.trim() === '' && !input.required) valid = true;
    field.classList.toggle('error', !valid);
    return valid;
  }

  document.querySelectorAll('form.js-form').forEach(function (form) {
    var success = (form.parentElement && form.parentElement.querySelector('.form-success')) || form.nextElementSibling;
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn ? submitBtn.textContent : 'Submit';

    form.querySelectorAll('input, textarea, select').forEach(function (input) {
      input.addEventListener('blur', function () { if (input.required || input.value) validateField(input); });
      input.addEventListener('input', function () {
        if (input.closest('.field') && input.closest('.field').classList.contains('error')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        if (!validateField(input)) allValid = false;
      });
      if (!allValid) {
        var firstErr = form.querySelector('.field.error input, .field.error textarea, .field.error select');
        if (firstErr) firstErr.focus();
        return;
      }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          if (success) {
            success.classList.add('show');
            success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
        } else {
          throw new Error('Submit failed');
        }
      }).catch(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        alert('Something went wrong. Please email contact@lumethics.co.uk directly.');
      });
    });
  });

  /* ---------- Cursor-follow spotlight on cards ---------- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.service-card, .problem-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Hero network animation (IT connectivity motif) ---------- */
  (function heroNetwork() {
    var canvas = document.getElementById('heroNet');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var GOLD = '201, 168, 76';
    var LINK = 168;          // connection distance
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, nodes = [], raf = null, visible = true, running = false;

    function build() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(26, Math.min(96, Math.round((w * h) / 12000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.24, vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.3 + 1.0
        });
      }
    }

    function draw(move) {
      ctx.clearRect(0, 0, w, h);
      var i, j, n;
      if (move) {
        for (i = 0; i < nodes.length; i++) {
          n = nodes[i];
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
      }
      for (i = 0; i < nodes.length; i++) {
        for (j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(' + GOLD + ',' + ((1 - d / LINK) * 0.34) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        ctx.fillStyle = 'rgba(' + GOLD + ',0.8)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop() { draw(true); raf = requestAnimationFrame(loop); }
    function start() { clearTimeout(stopTimer); if (!running && !reduceMotion) { running = true; loop(); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    build();
    if (reduceMotion) { draw(false); }
    else { start(); }

    var stopTimer;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) {
          start();
        } else {
          /* Debounce: iOS Safari fires rapid intersection toggles during
             address-bar show/hide on scroll — stopping immediately kills
             the rAF loop after a single frame. Only stop once genuinely
             out of view for a sustained period. */
          clearTimeout(stopTimer);
          stopTimer = setTimeout(stop, 400);
        }
      }, { threshold: 0 }).observe(canvas);
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { build(); if (reduceMotion) draw(false); }, 200);
    }, { passive: true });
  })();

  /* ---------- Circuit / data-line animation (inner page headers) ---------- */
  (function circuitTraces() {
    var canvases = document.querySelectorAll('.circuit-bg');
    if (!canvases.length) return;
    var GOLD = '201, 168, 76', BRIGHT = '232, 201, 106';

    canvases.forEach(function (canvas) {
      var ctx = canvas.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = 0, h = 0, traces = [], raf = null, running = false, last = 0;

      function makeTrace() {
        var y = Math.random() * h, x = 0;
        var pts = [{ x: 0, y: y }];
        var segs = 2 + Math.floor(Math.random() * 2);
        for (var s = 0; s < segs; s++) {
          x += w * (0.22 + Math.random() * 0.4); if (x > w) x = w;
          pts.push({ x: x, y: y });
          if (s < segs - 1 && x < w) {
            y += (Math.random() < 0.5 ? -1 : 1) * (h * (0.12 + Math.random() * 0.3));
            y = Math.max(6, Math.min(h - 6, y));
            pts.push({ x: x, y: y });
          }
        }
        if (pts[pts.length - 1].x < w) pts.push({ x: w, y: pts[pts.length - 1].y });
        var len = 0, segLen = [];
        for (var k = 1; k < pts.length; k++) {
          var l = Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
          segLen.push(l); len += l;
        }
        return { pts: pts, segLen: segLen, len: len, pos: Math.random(), speed: 0.05 + Math.random() * 0.08 };
      }
      function pointAt(tr, t) {
        var target = t * tr.len, acc = 0;
        for (var k = 0; k < tr.segLen.length; k++) {
          if (acc + tr.segLen[k] >= target) {
            var f = (target - acc) / (tr.segLen[k] || 1), a = tr.pts[k], b = tr.pts[k + 1];
            return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
          }
          acc += tr.segLen[k];
        }
        return tr.pts[tr.pts.length - 1];
      }
      function build() {
        var r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
        canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        traces = [];
        var count = Math.max(6, Math.min(18, Math.round(w / 85)));
        for (var i = 0; i < count; i++) traces.push(makeTrace());
      }
      function draw(dt) {
        ctx.clearRect(0, 0, w, h);
        traces.forEach(function (tr) {
          ctx.strokeStyle = 'rgba(' + GOLD + ',0.10)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
          for (var k = 1; k < tr.pts.length; k++) ctx.lineTo(tr.pts[k].x, tr.pts[k].y);
          ctx.stroke();
          for (var k2 = 1; k2 < tr.pts.length - 1; k2++) {
            ctx.fillStyle = 'rgba(' + GOLD + ',0.28)';
            ctx.beginPath(); ctx.arc(tr.pts[k2].x, tr.pts[k2].y, 2, 0, Math.PI * 2); ctx.fill();
          }
          tr.pos += tr.speed * dt; if (tr.pos > 1) tr.pos -= 1;
          var p = pointAt(tr, tr.pos);
          var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
          g.addColorStop(0, 'rgba(' + BRIGHT + ',0.85)'); g.addColorStop(1, 'rgba(' + GOLD + ',0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(' + BRIGHT + ',1)'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill();
        });
      }
      function loop(ts) { var dt = Math.min(0.05, (ts - last) / 1000) || 0.016; last = ts; draw(dt); raf = requestAnimationFrame(loop); }
      function start() { clearTimeout(stopTimer2); if (!running && !reduceMotion) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); } }
      function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

      build();
      if (reduceMotion) draw(0); else start();
      var stopTimer2;
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          if (es[0].isIntersecting) {
            start();
          } else {
            clearTimeout(stopTimer2);
            stopTimer2 = setTimeout(stop, 400);
          }
        }, { threshold: 0 }).observe(canvas);
      }
      var rt2;
      window.addEventListener('resize', function () {
        clearTimeout(rt2);
        rt2 = setTimeout(function () { build(); if (reduceMotion) draw(0); }, 200);
      }, { passive: true });
    });
  })();
})();
