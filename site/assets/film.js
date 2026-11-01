/* BeforeExams hero: a rendered film scrubbed by scroll.
   Stage A: the past papers lift out of a book and settle into two piles, IGCSE and AS & A Level.
   Stage B (on click): the chosen pile's pages fly up and re-form into its five subject stacks. */
(function () {
  "use strict";
  var LEVELS = [
    { key: "ig", name: "IGCSE", short: "IGCSE", code: "Cambridge International", color: "#e0a25e" },
    { key: "al", name: "AS & A Level", short: "A Level", code: "Cambridge International", color: "#5cc39c" }
  ];
  var SUBJ = {
    al: [
      { key: "cs", name: "Computer Science", short: "CS", code: "9618", color: "#a596e6" },
      { key: "biology", name: "Biology", short: "Bio", code: "9700", color: "#8fcb67" },
      { key: "chemistry", name: "Chemistry", short: "Chem", code: "9701", color: "#7ea4ec" },
      { key: "physics", name: "Physics", short: "Physics", code: "9702", color: "#5cc39c" },
      { key: "maths", name: "Mathematics", short: "Maths", code: "9709", color: "#f2b866" }
    ],
    ig: [
      { key: "ig-cs", name: "Computer Science", short: "CS", code: "0478", color: "#a596e6" },
      { key: "ig-biology", name: "Biology", short: "Bio", code: "0610", color: "#8fcb67" },
      { key: "ig-chemistry", name: "Chemistry", short: "Chem", code: "0620", color: "#7ea4ec" },
      { key: "ig-physics", name: "Physics", short: "Physics", code: "0625", color: "#5cc39c" },
      { key: "ig-maths", name: "Mathematics", short: "Maths", code: "0580", color: "#f2b866" }
    ]
  };
  /* click areas on the last frame of each film: [left, top, right, bottom] as fractions of the image */
  var BOX_A = { w: [[0.2829, 0.2274, 0.4149, 0.5665], [0.5845, 0.2274, 0.7166, 0.5664]], t: [[0.2095, 0.2294, 0.473, 0.491], [0.5257, 0.2294, 0.7892, 0.4909]] };
  var BOX_B = { w: [[0.037, 0.3935, 0.211, 0.6335], [0.2573, 0.3531, 0.3886, 0.5717], [0.4447, 0.3407, 0.5547, 0.5529], [0.6109, 0.353, 0.7422, 0.5716], [0.7884, 0.3934, 0.9623, 0.6334]],
               t: [[0.1094, 0.251, 0.3593, 0.356], [0.214, 0.356, 0.4767, 0.5514], [0.385, 0.2509, 0.6136, 0.356], [0.522, 0.356, 0.7847, 0.5513], [0.6393, 0.2509, 0.8892, 0.356]] };
  var FA = 90, FB = 50, END = 0.9, PLAY_MS = 1400;
  var SEQ = (window.PAPERS_BASE || "") + "/seq/";   // the frames live on the papers host, so they use no website bandwidth
  var FILM_VERSION = 2;   // frames are cached for a week; raise this when the film changes

  var stage = document.getElementById("hero"), cv = document.getElementById("heroFilm");
  if (!stage || !cv) return;
  var ctx = cv.getContext("2d");
  var poster = document.getElementById("heroPoster");
  var steps = [].slice.call(stage.querySelectorAll(".cine-step"));
  var bar = document.getElementById("heroLoad");
  var shade = stage.querySelector(".cine-shade");
  var labelsBox = document.getElementById("heroLabels");
  var tallMQ = matchMedia("(max-aspect-ratio: 11/10)");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var set = tallMQ.matches ? "t" : "w";

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function progress() { var r = stage.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
  function pad(i) { return (i < 10 ? "00" : i < 100 ? "0" : "") + i; }

  /* ---------- frame sets ---------- */
  function FrameSet(dir, count) { this.dir = dir; this.n = count; this.imgs = []; this.ready = []; this.loaded = 0; this.still = null; this.started = false; }
  FrameSet.prototype.load = function (onProgress) {
    if (this.started) return; this.started = true;
    var self = this, order = [], seen = {};
    [15, 6, 3, 1].forEach(function (step) { for (var i = 0; i < self.n; i += step) if (!seen[i]) { seen[i] = 1; order.push(i); } });
    if (!seen[self.n - 1]) order.splice(1, 0, self.n - 1);
    var next = 0, active = 0;
    function pump() {
      while (active < 6 && next < order.length) {
        (function (i) {
          var im = new Image(); active++; im.decoding = "async";
          im.onload = function () { var done = function () { self.ready[i] = true; self.loaded++; active--; if (onProgress) onProgress(self); kick(); pump(); }; im.decode ? im.decode().then(done, done) : done(); };
          im.onerror = function () { active--; pump(); };
          im.src = self.dir + "/" + pad(i) + ".webp?v=" + FILM_VERSION; self.imgs[i] = im;
        })(order[next++]);
      }
    }
    pump();
    var st = new Image(); st.decoding = "async";
    st.onload = function () { var ok = function () { self.still = st; kick(); }; st.decode ? st.decode().then(ok, ok) : ok(); };
    setTimeout(function () { st.src = self.dir + "/still.webp?v=" + FILM_VERSION; }, 1200);
  };
  FrameSet.prototype.nearest = function (i) {
    if (this.ready[i]) return i;
    for (var d = 1; d < this.n; d++) { if (i - d >= 0 && this.ready[i - d]) return i - d; if (i + d < this.n && this.ready[i + d]) return i + d; }
    return -1;
  };
  var sets = {};
  function setFor(name) {
    var key = name + "-" + set;
    if (!sets[key]) sets[key] = name === "a" ? new FrameSet(SEQ + set, FA) : new FrameSet(SEQ + set + "-" + name, FB);
    return sets[key];
  }
  function loadA() {
    setFor("a").load(function (fs) { if (bar) { bar.style.width = (fs.loaded / fs.n * 100).toFixed(1) + "%"; if (fs.loaded === fs.n) { bar.style.opacity = "0"; setTimeout(preloadB, 800); } } });
  }
  function preloadB() { setFor("ig").load(); setFor("al").load(); }

  /* ---------- level state ---------- */
  var level = null, playStart = 0, rewindStart = 0;   // level chosen in the film; playStart: time stage B began playing; rewindStart: time it began playing backwards
  function leaveLevel() { rewindStart = 0; level = null; buildPicks(); kick(); if (window.BE_setLevel) window.BE_setLevel(null, true); }
  function chooseLevel(lv, instant) {
    rewindStart = 0; level = lv; setFor(lv).load();
    playStart = instant || reduce ? -1 : performance.now();
    buildPicks(); kick();
  }
  window.BE_filmLevel = function (lv) { if (lv !== level) chooseLevel(lv, true); };
  window.BE_filmReset = function () { if (level) leaveLevel(); pS = 0; kick(); };

  /* ---------- clickable labels ---------- */
  var picks = [], pickMode = "";
  function buildPicks() {
    var mode = level ? "b-" + level : "a";
    if (mode === pickMode) return; pickMode = mode;
    var he = document.getElementById("heroEnd");
    if (he) he.textContent = !level ? "Two levels. Pick yours." : (level === "ig" ? "IGCSE: five subjects. Pick yours." : "AS & A Level: five subjects. Pick yours.");
    labelsBox.innerHTML = ""; picks = [];
    var list = level ? SUBJ[level] : LEVELS;
    list.forEach(function (sb) {
      var a = document.createElement("a");
      a.className = "cine-pick" + (level ? "" : " level"); a.tabIndex = -1; a.style.setProperty("--c", sb.color);
      a.href = level ? "#/?subject=" + sb.key : "#/?level=" + sb.key;
      a.setAttribute("aria-label", level ? "Open " + sb.name + " " + sb.code : "Open " + sb.name);
      a.innerHTML = '<span class="cine-label"><span class="lf">' + sb.name + '</span><span class="ls">' + sb.short + "</span><small>" + sb.code + "</small></span>";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        if (!level) { chooseLevel(sb.key); if (window.BE_setLevel) window.BE_setLevel(sb.key, true); }
        else if (window.BE_openSubject) window.BE_openSubject(sb.key);
      });
      labelsBox.appendChild(a); picks.push(a);
    });
    if (level) {
      var back = document.createElement("button");
      back.className = "cine-back"; back.type = "button"; back.textContent = "← Change level";
      back.addEventListener("click", function () {
        if (reduce) { leaveLevel(); return; }
        if (!rewindStart) { rewindStart = performance.now(); kick(); }
      });
      labelsBox.appendChild(back);
    }
  }

  function paintSteps(p) {
    steps.forEach(function (el) {
      var a = +el.dataset.in, b = +el.dataset.out, f = 0.06;
      var o = Math.min(smooth((p - a) / f), 1 - smooth((p - (b - f)) / f));
      el.style.opacity = o.toFixed(3);
      el.style.transform = "translateY(" + ((1 - o) * (p < a + f ? 28 : -28)).toFixed(1) + "px)";
      el.classList.toggle("on", o > 0.5);
    });
    document.body.classList.toggle("on-hero", stage.getBoundingClientRect().bottom > 70 && document.body.getAttribute("data-view") === "library");
  }

  /* ---------- drawing ---------- */
  var W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var s2 = tallMQ.matches ? "t" : "w";
    if (s2 !== set) { set = s2; loadA(); if (level) setFor(level).load(); }
    kick();
  }
  function cover(im) {
    var iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(W / iw, H / ih * 0.86);
    if (set === "w") s = W / iw;   // never zoom past the outer stacks
    var h = ih * s, y = h < H ? (H - h) * 0.75 : (H - h) / 2;
    if (set === "t" && h > H) y = clamp(H * 0.56 - h * 0.42, H - h, 0);    // keep the stacks in view when the top and bottom are cropped
    return { x: (W - iw * s) / 2, y: y, w: iw * s, h: h };
  }
  function draw(fs, fp) {
    var a = Math.floor(fp), frac = fp - a;
    var ia = fs.nearest(a), ib = frac > 0.01 ? fs.nearest(Math.min(fs.n - 1, a + 1)) : -1;
    if (ia < 0) return null;
    var c = cover(fs.imgs[ia]);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1; ctx.fillStyle = "#030201"; ctx.fillRect(0, 0, W, H); ctx.drawImage(fs.imgs[ia], c.x, c.y, c.w, c.h);
    if (ib >= 0 && ib !== ia) { ctx.globalAlpha = frac; ctx.drawImage(fs.imgs[ib], c.x, c.y, c.w, c.h); ctx.globalAlpha = 1; }
    if (fs.still && fp > fs.n - 2) { ctx.globalAlpha = clamp(fp - (fs.n - 2), 0, 1); ctx.drawImage(fs.still, c.x, c.y, c.w, c.h); ctx.globalAlpha = 1; }
    if (poster) poster.style.visibility = "hidden";
    return c;
  }
  function placePicks(c, boxes, lo) {
    labelsBox.classList.toggle("on", lo > 0.5);
    picks.forEach(function (P, s) {
      var b = boxes[s]; if (!b) return;
      var padX = (set === "t" ? 0 : (b[2] - b[0]) * 0.1) * c.w;
      var L = c.x + b[0] * c.w - padX, R = c.x + b[2] * c.w + padX, T = c.y + b[1] * c.h - 64, B = c.y + b[3] * c.h + 12;
      P.style.left = L.toFixed(1) + "px"; P.style.top = T.toFixed(1) + "px";
      P.style.width = (R - L).toFixed(1) + "px"; P.style.height = (B - T).toFixed(1) + "px";
      P.style.opacity = lo.toFixed(3); P.style.zIndex = (set === "t" && level && s % 2) ? 2 : 1;
      P.classList.toggle("on", lo > 0.5); P.tabIndex = lo > 0.5 ? 0 : -1;
    });
    var back = labelsBox.querySelector(".cine-back"); if (back) back.style.opacity = lo.toFixed(3);
  }

  var pS = progress(), running = false, visible = true, last = performance.now();
  function frame(now) {
    running = false;
    if (cv.clientWidth !== W || cv.clientHeight !== H) resize();
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    var p = progress();
    pS += (p - pS) * (1 - Math.exp(-dt * 7));
    if (Math.abs(p - pS) < 0.0004) pS = p;
    paintSteps(pS);
    if (shade) shade.style.opacity = (1 - smooth((pS - 0.62) / 0.2) * 0.75).toFixed(3);
    var atEnd = pS >= END - 0.02;
    if (level && pS < 0.8) leaveLevel();
    var again = p !== pS;
    if (level && atEnd) {
      var fsB = setFor(level);
      var back = rewindStart ? clamp((now - rewindStart) / PLAY_MS, 0, 1) : 0;
      var t = rewindStart ? 1 - back : playStart < 0 ? 1 : clamp((now - playStart) / PLAY_MS, 0, 1);
      var c = draw(fsB, smooth(t) * (fsB.n - 1)) || draw(setFor("a"), FA - 1);
      if (c) placePicks(c, BOX_B[set], rewindStart ? 0 : smooth((t - 0.9) / 0.1));
      if (rewindStart && back >= 1) leaveLevel();
      else if (rewindStart || t < 1) again = true;
    } else {
      buildPicks();
      var fsA = setFor("a"), fp = clamp(pS / END, 0, 1) * (FA - 1);
      var c2 = draw(fsA, fp);
      if (c2) placePicks(c2, BOX_A[set], smooth((fp - (FA - 1) * 0.94) / ((FA - 1) * 0.05)));
    }
    if (again) kick();
  }
  function kick() { if (!running && visible) { running = true; requestAnimationFrame(frame); } }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); else document.body.classList.remove("on-hero"); }).observe(stage);
  }
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", resize);
  if ("ResizeObserver" in window) new ResizeObserver(function () { resize(); }).observe(cv);
  if (tallMQ.addEventListener) tallMQ.addEventListener("change", resize);
  /* the hero button plays the film at a watchable pace and stops at the level picks; any user scroll takes over */
  var GUIDE_MS = 8000;
  window.BE_playToPicks = function () {
    var r = stage.getBoundingClientRect(), span = r.height - innerHeight;
    var from = scrollY, to = r.top + scrollY + span * END, dist = to - from;
    if (span <= 0 || dist <= 0) return;
    if (reduce) { window.scrollTo({ top: to, behavior: "instant" }); return; }
    var ms = Math.max(1500, GUIDE_MS * dist / (span * END)), start = performance.now(), stopped = false;
    function stop() {
      stopped = true;
      ["wheel", "touchstart", "keydown"].forEach(function (ev) { removeEventListener(ev, stop); });
    }
    ["wheel", "touchstart", "keydown"].forEach(function (ev) { addEventListener(ev, stop, { passive: true }); });
    (function step(now) {
      if (stopped) return;
      var t = clamp((now - start) / ms, 0, 1);
      window.scrollTo({ top: from + dist * smooth(t), behavior: "instant" });
      if (t < 1) requestAnimationFrame(step); else stop();
    })(start);
  };

  resize(); loadA(); buildPicks(); kick();
})();
(function () {
  var b = document.getElementById("heroOpen");
  if (b) b.addEventListener("click", function (e) {
    e.preventDefault();
    if (window.BE_playToPicks) { window.BE_playToPicks(); return; }
    var el = document.getElementById("library"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  var f = document.getElementById("heroCount");
  fetch("/assets/library.json").then(function (r) { return r.json(); }).then(function (d) {
    if (f) f.textContent = d.papers.length.toLocaleString("en-US") + " past papers. IGCSE and A Level. Twelve years of sessions.";
  }).catch(function () {});
})();
