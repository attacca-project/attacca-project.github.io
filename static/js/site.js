// site.js: small behaviours for the Attacca project page.
// The long-horizon player lives in stage-carousel.js.
(function () {
  'use strict';

  // Copy BibTeX
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var code = document.getElementById(btn.getAttribute('data-target'));
    if (!code) return;
    var text = code.textContent;
    var done = function () {
      var old = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {});
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (err) {}
      document.body.removeChild(ta);
    }
  });

  // Play/pause buttons on looping videos
  document.querySelectorAll('.video-toggle').forEach(function (btn) {
    var video = document.getElementById(btn.getAttribute('data-target'));
    if (!video) return;
    var sync = function () {
      var paused = video.paused;
      btn.classList.toggle('is-paused', paused);
      btn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
      btn.setAttribute('title', paused ? 'Play' : 'Pause');
    };
    btn.addEventListener('click', function () {
      if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else { video.__userPaused = true; video.pause(); }
    });
    video.addEventListener('play', function () { video.__userPaused = false; sync(); });
    video.addEventListener('pause', sync);
    sync();
  });

  // Comparison videos play only while visible, unless the visitor paused them
  var vids = Array.prototype.slice.call(document.querySelectorAll('video.cmp-video'));
  if (vids.length) {
    var want = function (v) { return v.__inView && !document.hidden && !v.__userPaused; };
    var apply = function (v) {
      if (want(v)) { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
      else if (!v.paused && !v.__userPaused) { v.pause(); }
    };
    vids.forEach(function (v) { v.muted = true; v.playsInline = true; v.__inView = false; });
    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) en.target.preload = 'auto'; });
      }, { rootMargin: '400px 0px' });
      var vis = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          en.target.__inView = en.isIntersecting && en.intersectionRatio >= 0.25;
          apply(en.target);
        });
      }, { threshold: [0, 0.25, 0.5] });
      vids.forEach(function (v) { near.observe(v); vis.observe(v); });
    } else {
      vids.forEach(function (v) { v.__inView = true; v.preload = 'auto'; apply(v); });
    }
    document.addEventListener('visibilitychange', function () { vids.forEach(apply); });
  }

  // Top bar border once the page scrolls, and the current section in the nav
  var bar = document.getElementById('topbar');
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var onScroll = function () {
    if (bar) bar.classList.toggle('is-scrolled', window.scrollY > 8);
    var y = window.scrollY + 120;
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-current', i === current); });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
