(function () {
  "use strict";

  var app = document.getElementById("app");
  var DATA = null;
  var SESSION = { m: "Feb/Mar", s: "May/Jun", w: "Oct/Nov" };
  var SESSION_ORDER = { m: 0, s: 1, w: 2 };
  var ICONS = {
    maths: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
    physics: '<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>',
    chemistry: '<path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3M6 14h12"/>',
    biology: '<path d="m10 16 1.5 1.5M14 8l-1.5-1.5M15 2c-1.8 3-1.8 6.6 0 9.6s1.8 6.6 0 9.6M9 2.4c1.8 3 1.8 6.6 0 9.6s-1.8 6.6 0 9.6M7.5 8h9M7.5 16h9"/>',
    cs: '<rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4M14 10h4M6 14h2v6M14 4h2v6"/>'
  };
  var I = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    arrow: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>',
    back: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 19l-7-7 7-7"/></svg>',
    check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    ext: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    dl: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    file: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    split: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18"/></svg>',
    layers: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/></svg>'
  };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var BASE = String(window.PAPERS_BASE || "").replace(/\/+$/, "");
  function fileUrl(p) { return BASE + p.split("/").map(encodeURIComponent).join("/"); }
  function subj(key) { return DATA.subjects.find(function (s) { return s.key === key; }) || null; }
  function comp(s, n) { return s.components.find(function (c) { return c.number === n; }) || null; }
  function groupName(s, n) { return (s.topicalGroups && s.topicalGroups[n]) || "Paper " + n; }
  var LEVEL_NAME = { ig: "IGCSE", al: "AS & A Level" };
  function levelOf(s) { return s && s.level === "ig" ? "ig" : "al"; }
  function currentLevel(params) {
    var s = subj(params.get("subject"));
    if (s) return levelOf(s);
    var lv = params.get("level") || store("be-level");
    return lv === "ig" ? "ig" : "al";
  }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* theme */
  document.getElementById("themeBtn").addEventListener("click", function () {
    var dark = document.documentElement.classList.toggle("dark");
    store("be-theme", dark ? "dark" : "light");
  });

  /* the logo always returns to the untouched home page */
  document.querySelector(".brand").addEventListener("click", function (e) {
    e.preventDefault();
    store("be-last", ""); store("be-level", "");
    if (window.BE_filmReset) window.BE_filmReset();
    if (location.hash === "#/") render(); else location.hash = "#/";
    window.scrollTo({ top: 0, behavior: "instant" });
  });

  /* Library menu: hover opens it on a computer, tap opens it on a phone */
  var libMenu = document.getElementById("libMenu"), libBtn = document.getElementById("libBtn");
  function menuOpen(on) { libMenu.classList.toggle("open", on); libBtn.setAttribute("aria-expanded", String(on)); }
  function jumpTo(selector) {
    var el = document.querySelector(selector);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: "instant" });
  }
  libBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (matchMedia("(hover: none)").matches) { menuOpen(!libMenu.classList.contains("open")); return; }
    go("/", new URLSearchParams());
    jumpTo(".finder");
  });
  document.addEventListener("click", function (e) { if (!libMenu.contains(e.target)) menuOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { menuOpen(false); libMenu.classList.add("shut"); if (libMenu.contains(document.activeElement)) document.activeElement.blur(); } });
  libMenu.addEventListener("mouseleave", function () { libMenu.classList.remove("shut"); });
  libBtn.addEventListener("focus", function () { libMenu.classList.remove("shut"); });
  libMenu.querySelectorAll("a[href]").forEach(function (a) {
    if (a !== libBtn) a.addEventListener("click", function () { menuOpen(false); libMenu.classList.add("shut"); a.blur(); });
  });
  function openMode(mode) {
    var p = new URLSearchParams(), last = new URLSearchParams(store("be-last") || ""), here = parse().params.get("subject") || last.get("subject");
    if (here) p.set("subject", here);
    if (mode !== "topicals" || !p.get("subject")) p.set("mode", mode);
    store("be-last", p.toString());
    go("/", p);
    jumpTo(p.get("subject") ? ".section-head" : ".lib-head");
  }
  libMenu.querySelectorAll("[data-goto]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); openMode(a.dataset.goto); });
  });

  /* routing */
  function parse() {
    var h = location.hash.replace(/^#/, "") || "/";
    var q = h.indexOf("?");
    var path = q >= 0 ? h.slice(0, q) : h;
    var params = new URLSearchParams(q >= 0 ? h.slice(q + 1) : "");
    return { path: path, params: params };
  }
  function go(path, params, replace) {
    var qs = params ? params.toString() : "";
    var target = "#" + path + (qs ? "?" + qs : "");
    if (replace) history.replaceState(null, "", target); else location.hash = target;
    render();
  }

  /* index */
  var PAPERS = [], TOPICALS = [], BY_ID = {};
  function index() {
    PAPERS = DATA.papers.map(function (r) {
      return { id: r[0], kind: "paper", subject: r[1], code: r[2], year: r[3], session: r[4], component: r[5], variant: r[6], qp: r[7], ms: r[8], extra: r[9] || [] };
    });
    TOPICALS = DATA.topicals.map(function (r) {
      return { id: r[0], kind: "topical", subject: r[1], code: r[2], component: r[3], topic: r[4], name: r[5], questions: r[6], years: r[7], qp: r[8] };
    });
    PAPERS.concat(TOPICALS).forEach(function (p) { BY_ID[p.id] = p; });
  }
  function paperNo(p) { return String(p.component) + (p.variant == null ? "" : p.variant); }

  var BOOK = { cs: "#B9A6E8", biology: "#8FD06A", chemistry: "#7FA9F0", physics: "#5FD0A4", maths: "#F0AA45" };
  function bookColor(key) { return BOOK[key.replace(/^ig-/, "")] || "var(--forest)"; }

  function libraryView(params) {
    var sKey = params.get("subject");
    var s = subj(sKey);
    var mode = ["papers", "notes", "guide", "trends"].indexOf(params.get("mode")) >= 0 ? params.get("mode") : "topicals";
    var lv = currentLevel(params);
    store("be-level", lv);
    var html = '<main class="page"><div class="wrap">' +
      '<div class="finder" id="library"><label class="finder-box">' + I.search.replace('width="16" height="16"', 'width="20" height="20"') +
        '<input id="finder" type="search" autocomplete="off" placeholder="Try ' + FINDER_HINTS[hintAt] + '" aria-label="Search all subjects, papers and topics"></label>' +
        '<div class="finder-results" id="finderResults" hidden></div></div>' +
      (s ? '' : statStrip()) +
      '<div class="lib-head"><h2 class="lib-title">Choose a subject</h2>' +
      '<div class="seg level-seg" role="tablist" aria-label="Level">' +
        '<button role="tab" data-level="ig" aria-selected="' + (lv === "ig") + '">IGCSE</button>' +
        '<button role="tab" data-level="al" aria-selected="' + (lv === "al") + '">AS &amp; A Level</button></div></div>' +
      '<div class="subjects">' + DATA.subjects.filter(function (x) { return levelOf(x) === lv; }).sort(function (a, b) {
        var mine = (window.BE_study.profile() || {}).subjects || [];
        return (mine.indexOf(b.key) >= 0) - (mine.indexOf(a.key) >= 0);
      }).map(function (x) {
        var np = PAPERS.filter(function (p) { return p.subject === x.key; }).length;
        var nt = TOPICALS.filter(function (p) { return p.subject === x.key; }).length;
        var nn =(DATA.notes || []).filter(function (n) { return n[0] === x.key; }).length;
        return '<button class="panel subject-card" style="--book:' + bookColor(x.key) + '" data-glow="' + x.key.replace(/^ig-/, "") + '" data-subject="' + x.key + '" aria-pressed="' + (s && s.key === x.key) + '">' +
          '<span class="subject-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + ICONS[x.key.replace(/^ig-/, "")] + '</svg></span>' +
          '<span class="subject-name">' + esc(x.name) + '</span>' +
          '<span class="font-code subject-code">' + esc([].concat(x.legacy, [x.code]).join(" / ")) + '</span>' +
          (x.comingSoon ? '<span class="subject-count">Coming soon</span>' :
            '<span class="subject-nums"><span><b>' + np + '</b> papers</span><span><b>' + nt + '</b> topicals</span>' + (nn ? '<span><b>' + nn + '</b> notes</span>' : '') + '</span>') + '</button>';
      }).join("") + '</div>' +
      '';

    if (!s) {
      var wanted = params.get("mode") ? { papers: "past papers", notes: "revision notes", topicals: "topical questions", guide: "exam guide", trends: "topic trends" }[mode] : "topical questions, past papers and revision notes";
      html += '<div class="hint">' + I.layers + ' Choose a subject to see its ' + wanted + '.</div>';
    } else {
      html += '<section><div class="section-head"><div><h2>' + esc(s.name) + '</h2><p>' + LEVEL_NAME[levelOf(s)] + ' · Cambridge ' + esc([].concat(s.legacy, [s.code]).join(" and ")) + '</p></div>' +
        '<div class="seg" role="tablist" aria-label="What to practise">' +
        '<button role="tab" data-mode="topicals" aria-selected="' + (mode === "topicals") + '"><span class="tab-long">Topical questions</span><span class="tab-short">Topicals</span></button>' +
        '<button role="tab" data-mode="papers" aria-selected="' + (mode === "papers") + '"><span class="tab-long">Past papers</span><span class="tab-short">Papers</span></button>' +
        '<button role="tab" data-mode="notes" aria-selected="' + (mode === "notes") + '"><span class="tab-long">Revision notes</span><span class="tab-short">Notes</span></button>' +
        '<button role="tab" data-mode="guide" aria-selected="' + (mode === "guide") + '"><span class="tab-long">Exam guide</span><span class="tab-short">Guide</span></button>' +
        '<button role="tab" data-mode="trends" aria-selected="' + (mode === "trends") + '">Trends</button>' +
        (["ig-biology", "ig-chemistry", "ig-physics", "biology", "chemistry", "physics"].indexOf(s.key) >= 0 ? '<button role="tab" data-go="#/practice?subject=' + s.key + '" aria-selected="false"><span class="tab-long">Practice</span><span class="tab-short">Practice</span></button>' : '') +
        '<button role="tab" data-go="#/worksheet?subject=' + s.key + '" aria-selected="false"><span class="tab-long">Worksheet maker</span><span class="tab-short">Worksheets</span></button>' +
        '<button role="tab" data-go="#/grades?subject=' + s.key + '" aria-selected="false"><span class="tab-long">Grade calculator</span><span class="tab-short">Grades</span></button></div></div>' +
        (mode === "trends" ? '<div id="trendsBox" class="trends"><p class="lede">Loading trends…</p></div>' : mode === "guide" ? guideView(s) : s.comingSoon && mode !== "notes" ? comingSoon(s) : mode === "topicals" ? topicalsView(s, params) : mode === "papers" ? papersView(s, params) : notesList(s)) + '</section>';
    }
    html += howItWorks() + '</div></main>' + footer();
    app.innerHTML = html;
    if (s && mode === "trends") window.BE_trends.mount(s);

    app.querySelectorAll(".subject-card").forEach(function (b) {
      b.addEventListener("mouseenter", function () { if (window.BE_highlight) window.BE_highlight(b.dataset.subject); });
      b.addEventListener("mouseleave", function () { if (window.BE_highlight) window.BE_highlight(null); });
    });
    app.querySelectorAll("[data-subject]").forEach(function (b) {
      b.addEventListener("click", function () { var p = new URLSearchParams(); p.set("subject", b.dataset.subject); if (mode !== "topicals") p.set("mode", mode); store("be-last", p.toString()); go("/", p);
        var head = document.querySelector(".section-head"); if (head) window.scrollTo({ top: head.getBoundingClientRect().top + scrollY - 90, behavior: "smooth" }); });
    });
    app.querySelectorAll("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () { var p = new URLSearchParams(); p.set("subject", s.key); if (b.dataset.mode !== "topicals") p.set("mode", b.dataset.mode); store("be-last", p.toString()); go("/", p); });
    });
    app.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { location.hash = b.dataset.go; }); });
    app.querySelectorAll("[data-level]").forEach(function (b) {
      b.addEventListener("click", function () { setLevel(b.dataset.level, false); });
    });
    app.querySelectorAll("[data-set]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = new URLSearchParams(params.toString());
        var kv = b.dataset.set.split("=");
        if (kv[1]) p.set(kv[0], kv[1]); else p.delete(kv[0]);
        store("be-last", p.toString());
        go("/", p, true);
      });
    });
    bindFinder();
    var search = app.querySelector("#q");
    if (search) {
      search.addEventListener("input", function () {
        var p = new URLSearchParams(params.toString());
        if (search.value) p.set("q", search.value); else p.delete("q");
        history.replaceState(null, "", "#/?" + p.toString());
        var grid = app.querySelector("#coverGrid");
        grid.outerHTML = coverGrid(s, p);
      });
      if (params.get("q")) { search.focus(); search.setSelectionRange(search.value.length, search.value.length); }
    }
  }


  /* stats and countdown; exam start dates are estimates until Cambridge publishes each timetable */
  var EXAM_STARTS = [[1, 24, "Feb/March"], [3, 26, "May/June"], [9, 1, "Oct/Nov"]];
  function nextExam() {
    var now = new Date(), y = now.getFullYear();
    var dates = EXAM_STARTS.concat([[EXAM_STARTS[0][0], EXAM_STARTS[0][1], EXAM_STARTS[0][2], 1]]).map(function (e) {
      return { when: new Date(y + (e[3] || 0), e[0], e[1]), name: e[2] };
    });
    var n = dates.filter(function (d) { return d.when > now; })[0];
    return { days: Math.ceil((n.when - now) / 864e5), name: n.name };
  }
  function statStrip() {
    var t = totals(), mine = window.BE_study.nextExam(), e = nextExam();
    return '<div class="strip">' +
      '<div class="panel tile"><b>' + t.papers.toLocaleString() + '</b><span>past papers</span></div>' +
      '<div class="panel tile"><b>' + t.ms.toLocaleString() + '</b><span>mark schemes</span></div>' +
      '<div class="panel tile"><b>' + t.topicals.toLocaleString() + '</b><span>topical sets</span></div>' +
      '<div class="tile tile-pop"><b>' + (mine ? mine.days : e.days) + '</b><span>' + (mine ? 'days to your ' + esc(mine.name) + ' exam' : 'days until ' + e.name + ' exams, about') + '</span></div></div>';
  }

  /* search across every subject */
  var FIND_SUBJECT = { physics: "physics", phy: "physics", phys: "physics", chemistry: "chemistry", chem: "chemistry", biology: "biology", bio: "biology",
    maths: "maths", math: "maths", mathematics: "maths", cs: "cs", computer: "cs", computing: "cs" };
  var FIND_SESSION = { feb: "m", february: "m", mar: "m", march: "m", fm: "m", may: "s", jun: "s", june: "s", mj: "s", oct: "w", october: "w", nov: "w", november: "w", on: "w" };
  function findStem(w) {
    if (/^moments?$/.test(w)) return "turning";
    return w.length > 6 ? w.slice(0, w.length - 3) : w;
  }
  function readQuery(raw) {
    var q = { words: [] };
    raw.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).forEach(function (w, i, all) {
      var m;
      if (/^20(1[5-9]|2\d)$/.test(w)) q.year = Number(w);
      else if (/^\d{4}$/.test(w)) q.code = w;
      else if (w === "igcse") q.level = "ig";
      else if (w === "alevel" || w === "as" || (w === "a" && all[i + 1] === "level")) q.level = "al";
      else if (w === "level" && all[i - 1] === "a") return;
      else if (FIND_SUBJECT[w]) q.subject = FIND_SUBJECT[w];
      else if (w === "science" && q.subject === "cs") return;
      else if (FIND_SESSION[w]) q.session = FIND_SESSION[w];
      else if (w === "paper" || w === "p") return;
      else if ((m = w.match(/^p?(\d{1,2})$/))) q.paper = m[1];
      else q.words.push(w);
    });
    return q;
  }
  function findAll(raw) {
    var q = readQuery(raw);
    var subjects = DATA.subjects.filter(function (x) {
      return (!q.level || levelOf(x) === q.level) && (!q.subject || x.key.replace(/^ig-/, "") === q.subject) &&
        (!q.code || [].concat(x.legacy, [x.code]).indexOf(q.code) >= 0);
    });
    var keys = subjects.map(function (x) { return x.key; });
    var out = [];
    if ((q.subject || q.code) && !q.words.length && !q.year && !q.session && !q.paper) {
      subjects.forEach(function (x) { out.push({ href: "#/?subject=" + x.key, title: x.name + " " + x.code, sub: LEVEL_NAME[levelOf(x)], tag: "Subject" }); });
    }
    if (q.words.length) {
      TOPICALS.filter(function (t) {
        var name = t.name.toLowerCase(), span = yearSpan(t);
        return keys.indexOf(t.subject) >= 0 && q.words.every(function (w) { return name.indexOf(findStem(w)) >= 0; }) && (!q.year || (span[0] <= q.year && q.year <= span[1]));
      }).forEach(function (t) {
        var x = subj(t.subject);
        out.push({ href: "#/view/" + t.id, title: t.name, sub: LEVEL_NAME[levelOf(x)] + " " + x.name + " · " + groupName(x, t.component), tag: "Topical" });
      });
    } else if (q.year || q.session || q.paper) {
      PAPERS.filter(function (p) {
        return keys.indexOf(p.subject) >= 0 && (!q.year || p.year === q.year) && (!q.session || p.session === q.session) &&
          (!q.paper || (q.paper.length === 1 ? String(p.component) === q.paper : paperNo(p) === q.paper));
      }).sort(function (a, b) { return (b.year - a.year) || (SESSION_ORDER[b.session] - SESSION_ORDER[a.session]) || paperNo(a).localeCompare(paperNo(b), undefined, { numeric: true }); })
        .forEach(function (p) {
          var x = subj(p.subject);
          out.push({ href: "#/view/" + p.id, title: x.name + " Paper " + paperNo(p), sub: LEVEL_NAME[levelOf(x)] + " · " + p.code + " · " + SESSION[p.session] + " " + p.year, tag: "Paper" });
        });
    }
    return out;
  }
  var FINDER_HINTS = ["physics 2023 paper 4", "electricity", "biology 2024 paper 2", "enzymes", "chemistry 2021 paper 1", "photosynthesis", "maths 2022 paper 3", "organic chemistry", "computer science 2023", "trigonometry"];
  var hintAt = Math.floor(Math.random() * FINDER_HINTS.length);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(function () {
    var box = app.querySelector("#finder");
    if (!box || box.value || box === document.activeElement || document.hidden) return;
    hintAt = (hintAt + 1) % FINDER_HINTS.length;
    box.placeholder = "Try " + FINDER_HINTS[hintAt];
  }, 4000);
  function bindFinder() {
    var box = app.querySelector("#finder"), wrap = app.querySelector(".finder"), list = app.querySelector("#finderResults");
    var active = -1;
    function links() { return list.querySelectorAll("a"); }
    function mark() { [].forEach.call(links(), function (a, i) { a.classList.toggle("active", i === active); }); }
    function show() {
      var raw = box.value.trim();
      active = -1;
      if (!raw) { list.hidden = true; return; }
      var hits = findAll(raw);
      list.innerHTML = hits.length ? hits.slice(0, 8).map(function (h) {
        return '<a href="' + h.href + '"><span class="finder-tag">' + h.tag + '</span><span class="finder-main"><b>' + esc(h.title) + '</b><small>' + esc(h.sub) + '</small></span></a>';
      }).join("") + (hits.length > 8 ? '<p class="finder-more">' + (hits.length - 8).toLocaleString() + ' more. Add a subject, year or paper number to narrow it down.</p>' : '')
        : '<p class="finder-more">Nothing found. Try a subject, a year, a paper number or a word from a topic name.</p>';
      list.hidden = false;
    }
    box.addEventListener("input", show);
    box.addEventListener("focus", show);
    box.addEventListener("keydown", function (e) {
      var n = links().length;
      if (e.key === "ArrowDown" && n) { e.preventDefault(); active = (active + 1) % n; mark(); }
      else if (e.key === "ArrowUp" && n) { e.preventDefault(); active = (active - 1 + n) % n; mark(); }
      else if (e.key === "Enter" && n) { e.preventDefault(); links()[Math.max(active, 0)].click(); }
      else if (e.key === "Escape") { box.value = ""; list.hidden = true; }
    });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    box.addEventListener("blur", function () { list.hidden = true; });
  }

  function guideView(s) {
    var g = (window.BE_EXAMS || {})[s.key];
    if (!g) return '<div class="panel empty"><h3>The exam guide is coming</h3></div>';
    var alevel = g.papers[0].as !== undefined;
    return '<div class="guide"><section class="panel st-box gc-cta"><div><h2>Grade calculator</h2><p class="st-note">Type your marks and see the grade they would get, using Cambridge&rsquo;s real thresholds.</p></div><a class="mini primary" href="#/grades?subject=' + s.key + '">Open the calculator</a></section>' +
      '<section class="panel st-box"><h2>Who takes which papers</h2><ul class="static-list">' + g.routes.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join("") + '</ul></section>' +
      '<section class="panel st-box"><h2>The papers</h2><div class="table-wrap"><table class="tbl"><thead><tr><th>Paper</th><th>Time</th><th>Marks</th>' +
      (alevel ? '<th>AS weight</th><th>A Level weight</th>' : '<th>Weight</th>') + '<th>Covers</th></tr></thead><tbody>' +
      g.papers.map(function (p) {
        return '<tr><td><b>Paper ' + p.n + '</b><small>' + esc(p.name) + '</small></td><td>' + esc(p.time) + '</td><td>' + p.marks + '</td>' +
          (alevel ? '<td>' + (esc(p.as) || "–") + '</td><td>' + (esc(p.a) || "–") + '</td>' : '<td>' + esc(p.weight) + '</td>') + '<td>' + esc(p.covers) + '</td></tr>';
      }).join("") + '</tbody></table></div></section>' +
      '<section class="panel st-box"><h2>Syllabus topics</h2><ul class="static-list guide-topics">' + s.topics.map(function (t) { return '<li>' + esc(t.name) + '</li>'; }).join("") + '</ul>' +
      '<p class="st-note">From the Cambridge syllabus for ' + esc(g.syllabus) + '. Check with your teacher, as your exam year may use a different syllabus.</p></section></div>';
  }
  function comingSoon(s) {
    return '<div class="panel empty"><span class="subject-icon" style="margin:0 auto">' + I.layers + '</span><h3>' + esc(s.name) + ' ' + esc(s.code) + ' is on its way</h3>' +
      '<p>The topical questions and past papers for this subject are being prepared now. Revision notes are listed under <b>Revision notes</b> as they are finished.</p></div>';
  }
  function notesList(s) {
    var list = (DATA.notes || []).filter(function (n) { return n[0] === s.key; });
    if (!list.length) return '<div class="panel empty"><span class="subject-icon" style="margin:0 auto">' + I.file + '</span><h3>Revision notes are coming</h3><p>Notes for ' + esc(s.name) + ' are being written. Topicals and past papers are ready now.</p></div>';
    return '<p class="notes-intro">Short, complete notes for every topic, written to the mark schemes: the definitions examiners want, the equations, worked examples and the common mistakes. Free for everyone.</p>' +
      '<ul class="panel rows notes-rows">' + list.map(function (n) {
        var slug = n[3].split("/").pop().replace(/\.html$/, "");
        return '<li class="row"><span class="pnum">' + esc(n[1]) + '</span><a class="row-main" href="#/notes/' + s.key + '/' + slug + '"><span class="row-title">' + esc(n[2]) + '</span><span class="row-sub">' + esc(n[4]) + '</span></a>' +
          '<span class="row-links"><a class="mini primary" href="#/notes/' + s.key + '/' + slug + '">Read</a></span></li>';
      }).join("") + '</ul>';
  }
  function notesView(key, slug) {
    var s = subj(key);
    var list = (DATA.notes || []).filter(function (n) { return n[0] === key; });
    var i = -1; list.forEach(function (n, k) { if (n[3].split("/").pop() === slug + ".html") i = k; });
    if (!s || i < 0) { app.innerHTML = '<main class="page"><div class="wrap"><div class="panel empty"><h3>Notes not found</h3><p><a class="mini primary" href="#/">Back to the library</a></p></div></div></main>'; return; }
    var n = list[i], prev = list[i - 1], next = list[i + 1];
    var link = function (x, label) { return x ? '<a class="mini" href="#/notes/' + key + '/' + x[3].split("/").pop().replace(/\.html$/, "") + '">' + label + '</a>' : '<span></span>'; };
    app.innerHTML = '<main class="page"><div class="wrap notes-wrap"><a class="back" href="#/?subject=' + key + '&mode=notes">' + I.back + ' ' + esc(s.name) + ' notes</a>' +
      '<p class="label-caps eyebrow">' + LEVEL_NAME[levelOf(s)] + ' · ' + esc(s.name) + ' ' + esc(s.code) + '</p>' +
      '<article class="notes" id="notesBody"><p class="lede">Loading…</p></article>' +
      '<nav class="notes-nav">' + link(prev, "← " + (prev ? esc(prev[2]) : "")) + link(next, (next ? esc(next[2]) : "") + " →") + '</nav></div></main>' + footer();
    window.scrollTo(0, 0);
    fetch(n[3]).then(function (r) { return r.text(); }).then(function (h) { var el = document.getElementById("notesBody"); if (el) el.innerHTML = h; })
      .catch(function () { var el = document.getElementById("notesBody"); if (el) el.innerHTML = '<p>These notes could not load. Check your connection and refresh.</p>'; });
  }
  function setLevel(lv, fromFilm) {
    var p = new URLSearchParams();
    if (lv) { p.set("level", lv); store("be-level", lv); }
    var keep = parse().params.get("mode");
    if (keep) p.set("mode", keep);
    store("be-last", p.toString());
    if (!fromFilm && window.BE_filmLevel && lv) window.BE_filmLevel(lv);
    var y = window.scrollY; go("/", p, true); window.scrollTo(0, y);
  }
  window.BE_setLevel = function (lv, fromFilm) { if (lv) setLevel(lv, fromFilm); };

  function emailLink() { return '<span>Email: <a href="mailto:dusboyevc@gmail.com">dusboyevc@gmail.com</a></span>'; }
  function contactLinks() {
    return '<span>Instagram: <a href="https://www.instagram.com/dusboyevc" target="_blank" rel="noopener">@dusboyevc</a></span>' +
      '<span>Telegram: <a href="https://t.me/dusboyevc" target="_blank" rel="noopener">@dusboyevc</a></span>' + emailLink();
  }
  /* the Explore links stay in index.html for crawlers; on the page the footer carries them */
  var exploreNav = document.querySelector("nav.explore");
  if (exploreNav) exploreNav.remove();
  function footer() { return window.BE_FOOTER || ""; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-foot-mode]");
    if (a) { e.preventDefault(); openMode(a.dataset.footMode); }
  });
  function totals() {
    return { papers: PAPERS.length, topicals: TOPICALS.length, ms: PAPERS.filter(function (p) { return p.ms; }).length };
  }
  function locked() { return Boolean(window.BE_auth && window.BE_auth.enabled); }
  /* what the site has, each with a small picture of the feature itself */
  function features() {
    var years = [2026, 2025, 2024, 2023, 2022].map(function (y, i) { return '<i' + (i === 1 || i === 2 ? ' class="on"' : '') + '>' + y + '</i>'; }).join("");
    var card = function (href, attr, title, text, pic) { return '<a class="panel feat" href="' + href + '"' + attr + '><div class="feat-pic">' + pic + '</div><h3>' + title + '</h3><p>' + text + '</p></a>'; };
    return '<section class="explain feats-wrap"><p class="label-caps eyebrow">What you get</p><h2 class="explain-title">Everything for one exam, in one place.</h2><div class="feats">' +
      card("/#/?mode=topicals", ' data-foot-mode="topicals"', "Topical questions by chapter and year", "Every past question sorted by chapter, then split by year. Open one year or join several into one PDF.", '<div class="fp-chips">' + years + '</div><div class="fp-line"><b>Ch 4</b> Biological molecules</div>') +
      card("/#/?mode=topicals", ' data-foot-mode="topicals"', "Three ways to download", "Questions with their mark schemes, questions only for a test, or mark schemes only for checking.", '<div class="fp-modes"><span class="on">Questions + mark schemes</span><span>Questions only</span><span>Mark schemes only</span></div>') +
      card("#/practice", "", "Multiple choice practice online", "Answer on screen, see right or wrong straight away and get your score at the end.", '<div class="fp-abcd"><i>A</i><i class="good">B</i><i>C</i><i class="bad">D</i></div>') +
      card("#/grades", "", "Grade calculator", "Type your marks and see the grade, using Cambridge&rsquo;s real thresholds for each exam series.", '<div class="fp-grade"><b>A*</b><span><i style="width:78%"></i></span></div>') +
      card("#/account", "", "Timed mock tests", "Sit a real past paper against the clock, mark it with the mark scheme and track your scores.", '<div class="fp-timer">1:14:59</div>') +
      card("#/worksheet", "", "Worksheet maker", "Mix any topics and years into one PDF, shuffled and numbered from 1, with or without mark schemes.", '<div class="fp-sheet"><i><b>1</b></i><i><b>2</b></i><i><b>3</b></i></div>') +
      '</div></section>';
  }
  function howItWorks() {
    return features() + '<section class="explain" id="how">' +
      '<p class="label-caps eyebrow">How it works</p>' +
      '<h2 class="explain-title">Four steps from revision to exam day.</h2>' +
      '<div class="steps">' +
        '<div class="panel step"><span class="step-n">1</span><h3>Pick your level and subject</h3><p>IGCSE or AS &amp; A Level, then Mathematics, Physics, Chemistry, Biology or Computer Science.</p></div>' +
        '<div class="panel step"><span class="step-n">2</span><h3>Choose how to practise</h3><p><b>Topical questions</b> group every past question on one topic, 2015–2026. <b>Past papers</b> are the full exams, by year and series.</p></div>' +
        '<div class="panel step"><span class="step-n">3</span><h3>Check your answers</h3><p>Every paper opens with its mark scheme; use <b>Side by side</b> to see both together. Topicals have the mark schemes inside.' + (locked() ? ' Papers ask for the site password each time, or once every 15 days if you log in; revision notes are free for everyone.' : '') + '</p></div>' +
        '<div class="panel step"><span class="step-n">4</span><h3>Track your progress</h3><p>Take timed <b>mock tests</b>, log your scores, add your exam dates and see your averages, progress charts and weakest topics on your account page.</p></div>' +
      '</div>' +
      '<p class="explain-more"><a href="#/about">More about BeforeExams →</a></p></section>';
  }
  function accountView(params) {
    var u = window.BE_auth && window.BE_auth.user();
    window.scrollTo(0, 0);
    if (!u) {
      app.innerHTML = '<main class="page"><div class="wrap account-page"><div class="panel empty locked"><h3>Log in to see your account</h3><p>Creating an account is free and takes a few seconds.</p>' +
        '<p><button class="mini primary" id="accountLogin" type="button">Log in or create an account</button></p></div></div></main>' + footer();
      document.getElementById("accountLogin").addEventListener("click", function () { window.BE_auth.open(render); });
      return;
    }
    window.BE_study.account(app, params);
  }
  function aboutView() {
    var t = totals();
    var rows = DATA.subjects.map(function (x) {
      var np = PAPERS.filter(function (p) { return p.subject === x.key; }).length;
      var nt = TOPICALS.filter(function (p) { return p.subject === x.key; }).length;
      return '<tr><td><b>' + (levelOf(x) === "ig" ? "IGCSE " : "A Level ") + esc(x.name) + '</b></td><td class="font-code">' + esc([].concat(x.legacy, [x.code]).join(" / ")) + '</td><td>' + nt + '</td><td>' + np + '</td></tr>';
    }).join("");
    var faq = [
      ["Is it free?", locked() ? "Yes. Browsing and revision notes need nothing at all. Past papers and topical PDFs ask for the site password each time. Log in and you're asked only once every 15 days; you stay logged in for 10 days on each device." : "Yes. Everything here is free to open."],
      ["How does score tracking work?", "After a paper or topical, log your marks on your account page. You get your average, latest score, a progress chart for each subject and your weakest topics. Your scores are private to your account."],
      ["How do mock tests work?", "Press <b>Mock</b> on any past paper, or pick an unseen paper from your account page. The real paper opens with a timer. When you finish, the mark scheme opens so you can mark your work, and your score saves automatically."],
      ["Which years are included?", "Cambridge IGCSE and AS &amp; A Level series from 2015 to 2026: Feb/March, May/June and Oct/Nov, wherever Cambridge published the paper. Oct/Nov 2026 is added once those papers are released."],
      ["What is a topical?", "A topical collects every past-paper question on one syllabus topic in one file, with the official mark scheme after each question, so you can drill one topic at a time."],
      ["Why are some topicals split by years?", "A few topics have so many questions that one file would be very large, so they are split into year ranges, for example 2024–2026 and 2015–2023. Newest years come first."],
      ["What does &ldquo;UNOFFICIAL BeforeExams mark scheme&rdquo; mean?", "For the very few papers where Cambridge has not released a mark scheme, BeforeExams wrote one based on how earlier mark schemes award marks. It is clearly labelled so you know it is not from Cambridge."],
      ["Why is a paper missing?", "A handful of papers were never published by Cambridge (for example 9709 Oct/Nov 2019 Paper 71, 9700 Feb/March 2016 Paper 5 and 9608 May/June 2020 Paper 32), so they cannot be included. A few IGCSE papers from 2020 to 2025 are also missing because no copy could be found yet."],
      ["Reading on a phone?", "Tap <b>Open</b> on any paper to view the PDF full screen, or <b>Download</b> to keep it offline."]
    ];
    app.innerHTML = '<main class="page"><div class="wrap about">' +
      '<p class="label-caps eyebrow">About</p>' +
      '<h1 class="hero">Cambridge IGCSE and A Level past papers, sorted the way you revise.</h1>' +
      '<p class="lede">BeforeExams is a free library of Cambridge IGCSE and AS &amp; A Level <b>topical questions</b> and <b>full past papers</b>, from 2015 to 2026, with their mark schemes and revision notes. It is built for students who want to practise one topic at a time, check their answers straight away, take timed mock tests and track their scores up to exam day.</p>' +
      '<div class="stats"><div class="panel stat"><b>' + t.papers.toLocaleString() + '</b><span>past papers</span></div><div class="panel stat"><b>' + t.topicals + '</b><span>topical sets</span></div><div class="panel stat"><b>5</b><span>subjects at each level</span></div><div class="panel stat"><b>2015–2026</b><span>exam years</span></div></div>' +
      '<h2 class="explain-title">What&rsquo;s inside</h2>' +
      '<div class="panel table-wrap"><table class="tbl"><thead><tr><th>Subject</th><th>Syllabus</th><th>Topicals</th><th>Past papers</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      howItWorks().replace('<p class="explain-more"><a href="#/about">More about BeforeExams →</a></p>', '') +
      '<h2 class="explain-title">Questions</h2><div class="faq">' + faq.map(function (f) { return '<details class="panel"><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>'; }).join("") + '</div>' +
      '<div class="panel makers"><p class="label-caps eyebrow" style="margin:0">Made by</p><div class="makers-row">' +
        '<div class="maker-person"><img class="maker-photo" src="/assets/dusboyevc.webp" alt="DusboyevC" width="112" height="112" loading="lazy"><h3 class="font-brand maker-name">DusboyevC</h3></div>' +
        '<div class="maker-person maker-lower"><img class="maker-photo" src="/assets/magnetars.webp" alt="Magnetars" width="92" height="92" loading="lazy"><h3 class="font-brand maker-name">Magnetars</h3></div>' +
      '</div><p class="makers-text">BeforeExams was made to make Cambridge revision faster: the right questions, grouped by topic, with the mark scheme one click away and your progress in one place.</p></div>' +
      '<h2 class="explain-title">Contact</h2><p class="contact-links">' + contactLinks() + '</p>' +
      '<p style="margin-top:28px"><a class="mini primary" href="#/">Open the library</a></p>' +
      '</div></main>' + footer();
    window.scrollTo(0, 0);
  }

  function chipRow(key, current, items, allLabel) {
    return '<div class="chips"><button class="chip" data-set="' + key + '=" aria-pressed="' + !current + '">' + allLabel + '</button>' +
      items.map(function (it) { return '<button class="chip" data-set="' + key + '=' + it.value + '" aria-pressed="' + (String(current) === String(it.value)) + '"' + (it.title ? ' title="' + esc(it.title) + '"' : "") + '>' + esc(it.label) + '</button>'; }).join("") + '</div>';
  }

  function yearSpan(t) {
    var m = String(t.years || t.name).match(/(\d{4})(?:\s*[–-]\s*(\d{4}))?/);
    if (!m) return [0, 0];
    return [Number(m[1]), Number(m[2] || m[1])];
  }
  function topicalsList(s, params) {
    var paper = params.get("paper");
    var needle = (params.get("q") || "").trim().toLowerCase();
    var topicIndex = {};
    s.topics.forEach(function (t, i) { topicIndex[t.code] = i; });
    return TOPICALS.filter(function (t) { return t.subject === s.key; })
      .filter(function (t) { return !paper || String(t.component) === paper; })
      .filter(function (t) { return !needle || t.name.toLowerCase().indexOf(needle) >= 0; })
      .sort(function (a, b) {
        var ya = yearSpan(a), yb = yearSpan(b);
        return (a.component - b.component) || String(a.topic).localeCompare(String(b.topic), undefined, { numeric: true }) ||
          (yb[1] - ya[1]) || (yb[0] - ya[0]) || a.name.localeCompare(b.name, undefined, { numeric: true });
      });
  }
  function coverGrid(s, params) {
    var list = topicalsList(s, params);
    if (!list.length) return '<div id="coverGrid" class="panel empty"><span class="subject-icon" style="margin:0 auto">' + I.file + '</span><h3>No topicals match</h3><p>Try another paper or clear the search.</p></div>';
    var groups = [];
    list.forEach(function (t) {
      var g = groups[groups.length - 1];
      if (!g || g.component !== t.component) groups.push(g = { component: t.component, items: [] });
      g.items.push(t);
    });
    return '<div id="coverGrid" class="topic-groups">' + groups.map(function (g) {
      var c = comp(s, g.component), name = groupName(s, g.component), title = c && c.title && c.title !== name ? c.title : "";
      var topics = [];   // a topic split into year ranges shows as one row
      g.items.forEach(function (t) {
        var last = topics[topics.length - 1];
        if (last && baseName(last[0]) === baseName(t)) last.push(t); else topics.push([t]);
      });
      return '<section><h3 class="topic-head">' + esc(name) + (title ? '<small>' + esc(title) + '</small>' : '') + '</h3><div class="topic-list">' + topics.map(function (all) {
        var t = all[0], ys = [].concat.apply([], all.map(function (x) { return String(x.years || "").match(/\d{4}/g) || []; })).map(Number);
        var span = ys.length ? Math.min.apply(null, ys) + (Math.max.apply(null, ys) > Math.min.apply(null, ys) ? "–" + Math.max.apply(null, ys) : "") : "";
        var count = all.reduce(function (a, x) { return a + (x.questions || 0); }, 0);
        var meta = [span, count ? count + " questions" : ""].filter(Boolean).join(" · ");
        return '<a class="topic-row" href="#/topic/' + topicGroup(t)[0].id + '"><span class="pnum">' + esc(t.topic) + '</span><span class="row-main"><span class="row-title">' + esc(baseName(t)) + '</span><span class="row-sub">' + esc(meta) + '</span></span>' + I.arrow + '</a>';
      }).join("") + '</div></section>';
    }).join("") + '</div>';
  }
  function topicalsView(s, params) {
    var comps = Array.from(new Set(TOPICALS.filter(function (t) { return t.subject === s.key; }).map(function (t) { return t.component; }))).sort();
    return '<div class="filters"><label class="search">' + I.search + '<input id="q" class="field" placeholder="Search topics…" aria-label="Search topics" value="' + esc(params.get("q") || "") + '"></label>' +
      chipRow("paper", params.get("paper"), comps.map(function (n) { var c = comp(s, n); return { value: n, label: groupName(s, n), title: c && c.title }; }), "All papers") + '</div>' +
      coverGrid(s, params);
  }

  function papersView(s, params) {
    var paper = params.get("paper"), year = params.get("year");
    var all = PAPERS.filter(function (p) { return p.subject === s.key; });
    var comps = Array.from(new Set(all.map(function (p) { return p.component; }))).sort();
    var years = Array.from(new Set(all.map(function (p) { return p.year; }))).sort(function (a, b) { return b - a; });
    var list = all.filter(function (p) { return (!paper || String(p.component) === paper) && (!year || String(p.year) === year); });
    var html = '<div class="filters">' +
      chipRow("paper", paper, comps.map(function (n) { var c = comp(s, n); return { value: n, label: "Paper " + n, title: c && c.title }; }), "All papers") +
      chipRow("year", year, years.map(function (y) { return { value: y, label: y }; }), "All years") + '</div>';
    if (!list.length) return html + '<div class="panel empty"><h3>No papers match</h3><p>Try another paper number or year.</p></div>';
    var byYear = {};
    list.forEach(function (p) { (byYear[p.year] = byYear[p.year] || {}); (byYear[p.year][p.session] = byYear[p.year][p.session] || []).push(p); });
    html += '<div class="years">' + Object.keys(byYear).sort(function (a, b) { return b - a; }).map(function (y) {
      return '<section class="panel" style="overflow:hidden"><h3 class="year-head">' + y + '</h3>' +
        Object.keys(byYear[y]).sort(function (a, b) { return SESSION_ORDER[a] - SESSION_ORDER[b]; }).map(function (ses) {
          var rows = byYear[y][ses].sort(function (a, b) { return paperNo(a).localeCompare(paperNo(b), undefined, { numeric: true }); });
          return '<div class="series"><p class="label-caps series-head">' + SESSION[ses] + '</p><ul class="rows">' + rows.map(function (p) {
            var c = comp(s, p.component);
            return '<li class="row"><span class="pnum">' + paperNo(p) + '</span><a class="row-main" href="#/view/' + p.id + '"><span class="row-title">Paper ' + paperNo(p) + (c ? " · " + esc(c.title) : "") + '</span><span class="row-sub">' + esc((c && c.stage ? c.stage + " · " : "") + p.code + " · " + SESSION[p.session] + " " + p.year) + '</span></a>' +
              '<span class="row-links"><a class="mini primary" href="#/view/' + p.id + '" title="Question paper">QP</a>' +
              (p.ms ? '<a class="mini" href="#/view/' + p.id + '?show=ms" title="Mark scheme">MS</a>' +
                '<a class="mini" href="#/view/' + p.id + '?split=1" title="Question paper and mark scheme side by side">' + I.split + '<span class="lbl"> Both</span></a>' : "") +
              '<a class="mini" href="#/mock/' + p.id + '" title="Take this paper as a timed mock test">Mock</a></span></li>';
          }).join("") + '</ul></div>';
        }).join("") + '</section>';
    }).join("") + '</div>';
    return html;
  }

  /* viewer */
  function pane(label, url, name) {
    var u = fileUrl(url);
    var signed = window.BE_auth && window.BE_auth.enabled && window.PDF_SIGNER;
    return '<div class="pane" data-path="' + esc(url) + '"><div class="pane-label"><span class="label-caps">' + label + '</span><span class="row-links"><a class="mini" href="' + (signed ? "#" : u) + '" target="_blank" rel="noopener" data-open>' + I.ext + '<span class="lbl"> Open</span></a><a class="mini" href="' + (signed ? "#" : u) + '" download="' + esc(name) + '" data-dl>' + I.dl + '<span class="lbl"> Download</span></a></span></div>' +
      '<iframe ' + (signed ? 'data-src' : 'src') + '="' + u + '#toolbar=1&navpanes=0" title="' + esc(label) + '" loading="lazy"></iframe></div>';
  }
  var guestFor = null;   // the one paper a guest has unlocked with the site password
  function lockedView(p, title, sub, backHref) {
    var member = Boolean(window.BE_auth.user());
    app.innerHTML = '<div class="viewer"><div class="viewer-bar"><div class="wrap"><div class="viewer-title"><a class="back" href="' + backHref + '">' + I.back + ' Library</a><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div></div></div>' +
      '<main class="page"><div class="wrap"><div class="panel empty locked"><span class="subject-icon" style="margin:0 auto"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>' +
      '<h3>Enter the password to open this ' + (p.kind === "topical" ? "topical" : "paper") + '</h3>' +
      (member ? '<p>We ask once every 15 days.</p>' : '') +
      '<form id="gateForm" class="gate-form"><input class="field gate-field" id="gatePw" type="password" autocomplete="off" aria-label="Site password" placeholder="Password"><button class="mini primary" type="submit">Open</button></form>' +
      '<p class="st-error" id="gateErr" role="alert"></p>' +
      (member ? '' : '<div class="gate-login"><p>With a free account the password is asked once every 15 days, and your mock scores and progress are saved.</p><button class="mini" id="unlockBtn" type="button">Create a free account</button></div>') + '</div></div></main></div>';
    if (!member) document.getElementById("unlockBtn").addEventListener("click", function () { window.BE_auth.open(render, "Enter the password once every 15 days, save your mock scores and track your progress.", "up"); });
    document.getElementById("gateForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var pw = document.getElementById("gatePw").value, err = document.getElementById("gateErr");
      if (!pw) { err.textContent = "Enter the password."; return; }
      window.BE_auth.checkPassword(pw).then(function (ok) {
        if (!ok) { err.textContent = "That password is not right."; shake(document.getElementById("gateForm")); return; }
        window.BE_auth.passGate(pw); if (!member) guestFor = p.id; render();
      }).catch(function () { err.textContent = "We could not check that just now. Try again in a minute."; });
    });
    window.scrollTo(0, 0);
  }
  function hydratePanes() {
    if (!(window.BE_auth && window.BE_auth.enabled && window.PDF_SIGNER)) return;
    app.querySelectorAll("[data-extra]").forEach(function (a) {
      var path = a.getAttribute("data-extra");
      window.BE_auth.signedUrl(path, fileUrl(path)).then(function (u) { a.href = u; }).catch(function () {});
    });
    app.querySelectorAll(".pane[data-path]").forEach(function (el) {
      var path = el.getAttribute("data-path");
      var show = function (u) {
        var f = el.querySelector("iframe"), page = el.dataset.page; if (f) f.src = u + "#" + (page ? "page=" + page + "&" : "") + "toolbar=1&navpanes=0";
        el.querySelectorAll("[data-open],[data-dl]").forEach(function (a) { a.href = u; });
      };
      window.BE_auth.signedUrl(path, fileUrl(path)).then(show).catch(function (e) {
        if (e.message === "login") window.BE_auth.open(render); else show(fileUrl(path));
      });
    });
  }
  function shake(el) { if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  /* a short note at the bottom of the screen, so a save never goes unconfirmed */
  function toast(text) {
    var t = document.getElementById("toast") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "toast", className: "toast" }));
    t.setAttribute("role", "status"); t.textContent = text; t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 2400);
  }
  /* the site password asked in place, for practice, worksheets and joined downloads; onOk runs once it is accepted */
  function gateBox(el, onOk) {
    el.innerHTML = '<div class="gate-inline"><h3>Enter the site password to continue</h3>' +
      '<form class="gate-form"><input class="field gate-field" type="password" autocomplete="off" aria-label="Site password" placeholder="Password"><button class="mini primary" type="submit">Continue</button></form>' +
      '<p class="st-error" role="alert"></p><p class="st-note">Or <button class="auth-link" type="button">log in</button> to be asked only once every 15 days.</p></div>';
    var form = el.querySelector("form"), input = el.querySelector("input"), err = el.querySelector(".st-error");
    input.focus();
    el.querySelector(".auth-link").addEventListener("click", function () { window.BE_auth.open(onOk); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input.value) { err.textContent = "Enter the password."; return; }
      window.BE_auth.checkPassword(input.value).then(function (ok) {
        if (!ok) { err.textContent = "That password is not right."; shake(form); return; }
        window.BE_auth.passGate(input.value); onOk();
      }).catch(function () { err.textContent = "We could not check that just now. Try again in a minute."; });
    });
  }

  /* one topic: every year as its own PDF, and any years joined into one download */
  function baseName(t) { return t.name.replace(/\s*\(\d{4}(?:[–-]\d{4})?\)$/, ""); }
  function topicGroup(t) { return TOPICALS.filter(function (x) { return x.subject === t.subject && x.component === t.component && baseName(x) === baseName(t); }); }
  function topicRows(group) {
    var rows = [];
    group.forEach(function (t) {
      var yrs = (DATA.years || {})[t.id];
      if (yrs && yrs.length) yrs.forEach(function (y) { rows.push({ label: String(y[0]), year: y[0], href: "#/view/" + t.id + "?y=" + y[0], path: y[1], count: y[2], marks: y[3], tid: t.id }); });
      else rows.push({ label: t.years || "All years", year: +(String(t.years).match(/\d{4}$/) || [0])[0], href: "#/view/" + t.id, path: t.qp, count: t.questions });
    });
    return rows.sort(function (a, b) { return b.year - a.year; });
  }
  var pdfLib = null;
  function loadPdfLib() {
    return pdfLib = pdfLib || new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
      s.onload = function () { ok(window.PDFLib); }; s.onerror = function () { pdfLib = null; fail(new Error("lib")); };
      document.head.appendChild(s);
    });
  }
  /* a joined download gets one cover saying exactly what is inside; each year's own cover is left out.
     "both" keeps question and mark scheme pages, "q" drops mark scheme pages and covers each multiple choice answer line,
     "m" keeps mark scheme pages and turns multiple choice answers into an answer key */
  var MODE_NAME = { both: "Questions and mark schemes", q: "Questions only", m: "Mark schemes only" };
  /* the topical cover, drawn exactly like pipeline/cover.py (same font, positions, sizes and colours) with this download's details */
  var coverAssets = null;
  function loadCover() {
    return coverAssets = coverAssets || new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js";
      s.onload = ok; s.onerror = function () { coverAssets = null; fail(new Error("lib")); };
      document.head.appendChild(s);
    }).then(function () {
      return Promise.all(["/assets/cover/Chococooky.ttf", "/assets/cover/logo.png"].map(function (u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error("fetch"); return r.arrayBuffer(); }); }));
    });
  }
  var SUBJECT_LINE = { "ig-physics": "IGCSE Physics", "ig-chemistry": "IGCSE Chemistry", "ig-biology": "IGCSE Biology", "ig-maths": "IGCSE Mathematics", "ig-cs": "IGCSE Computer Science",
    biology: "A-Level Biology", chemistry: "A-Level Chemistry", physics: "A-Level Physics", maths: "A-Level Mathematics", cs: "A-Level Computer Science" };
  function makeCover(L, out, o) {
    return loadCover().then(function (a) {
      out.registerFontkit(window.fontkit);
      return Promise.all([out.embedFont(a[0], { subset: true }), out.embedPng(a[1])]);
    }).then(function (r) {
      var font = r[0], logo = r[1], W = 595.2756, H = 841.8898, page = out.addPage([W, H]);
      var c = function (rr, g, b) { return L.rgb(rr / 255, g / 255, b / 255); };
      var GREEN = c(74, 158, 124), DGREEN = c(46, 110, 84), ORANGE = c(233, 162, 59), GREY = c(118, 118, 118), LGREY = L.rgb(0.86, 0.86, 0.86), RING = L.rgb(0.92, 0.92, 0.92), BLACK = L.rgb(0.08, 0.08, 0.08);
      var width = function (t, size) { return font.widthOfTextAtSize(t, size); };
      var spaced = function (x, y, text, size, color, sp, right) {
        var ws = text.split("").map(function (ch) { return width(ch, size); }), total = ws.reduce(function (a, b) { return a + b; }, 0) + sp * (text.length - 1);
        if (right) x -= total;
        text.split("").forEach(function (ch, i) { page.drawText(ch, { x: x, y: y, size: size, font: font, color: color }); x += ws[i] + sp; });
      };
      var cx = 555, cy = H - 397;
      page.drawCircle({ x: cx, y: cy, size: 207, borderColor: RING, borderWidth: 1.6 });
      page.drawCircle({ x: cx, y: cy, size: 147, borderColor: RING, borderWidth: 1.6 });
      page.drawCircle({ x: cx, y: cy, size: 87, color: GREEN });
      page.drawImage(logo, { x: 48, y: H - 78, width: 34, height: 32 });
      page.drawText("Before", { x: 96, y: H - 70, size: 21, font: font, color: BLACK });
      page.drawText("Exams", { x: 96 + width("Before", 21), y: H - 70, size: 21, font: font, color: DGREEN });
      spaced(550, H - 66, o.series || "TOPICAL SERIES", 8.5, GREY, 1.6, true);
      spaced(44, H - 300, o.kicker, 8.5, DGREEN, 1.9);
      var wrap = function (size) {
        var lines = [], cur = "";
        o.title.split(/\s+/).forEach(function (w) { var t = (cur + " " + w).trim(); if (width(t, size) <= 400 || !cur) cur = t; else { lines.push(cur); cur = w; } });
        if (cur) lines.push(cur);
        return lines;
      };
      var size = 50, lines;
      for (;;) {
        lines = wrap(size);
        if (((lines.length <= 2 && lines.every(function (l) { return width(l, size) <= 410; })) || size <= 30) && lines.length <= 3) break;
        size -= 2;
      }
      var y = H - 360, lh = size * 1.25;
      lines.forEach(function (l) { page.drawText(l, { x: 44, y: y, size: size, font: font, color: BLACK }); y -= lh; });
      y += lh;
      page.drawText(o.subject, { x: 44, y: y - 48, size: 19, font: font, color: L.rgb(0.2, 0.2, 0.2) });
      page.drawLine({ start: { x: 45, y: y - 72 }, end: { x: 96, y: y - 72 }, thickness: 3, color: ORANGE });
      page.drawLine({ start: { x: 45, y: H - 659 }, end: { x: 550, y: H - 659 }, thickness: 0.8, color: LGREY });
      var cols = [45, 219, 394];
      o.fields.forEach(function (f, i) {
        var x = cols[i % 3], ylab = i < 3 ? 688 : 739;
        spaced(x, H - ylab, f[0], 8.3, GREY, 1.5);
        page.drawText(String(f[1]), { x: x, y: H - ylab - 19, size: 14, font: font, color: BLACK });
      });
      page.drawText(o.footer || "Practice with purpose. Track what you learn.", { x: 45, y: H - 798, size: 9, font: font, color: GREY });
    });
  }
  function yearsText(ys) {
    var n = ys.map(Number).sort(function (a, b) { return b - a; });
    var run = n.every(function (y, i) { return !i || y === n[i - 1] - 1; });
    return n.length > 2 && run ? "[" + n[0] + " – " + n[n.length - 1] + "]" : "[" + n.join(", ") + "]";
  }
  /* question labels written out clearly: "Question 3" and "Paper 22 · Oct/Nov 2015 · Q1", in place of the tiny grey "Q3 QUESTION 9702/22/O/N/15 Q1" */
  var SESSION_LONG = { "F/M": "Feb/March", "M/J": "May/June", "O/N": "Oct/Nov" };
  function sourceText(src) {
    var m = String(src || "").match(/\d{4}\/(\d\d)\/([FMO]\/[MJN])\/(\d\d)\s+Q(\d+)/);
    return m ? "Paper " + m[1] + " · " + (SESSION_LONG[m[2]] || m[2]) + " 20" + m[3] + " · Q" + m[4] : "";
  }
  /* take the question labels (old small ones or the clear ones the PDFs now carry, and a multiple choice answer next
     to them) out of a page's content, so a relabelled page has no hidden text left under the new label */
  var LABEL_OPS = /q 0\.18 0\.49 0\.36 rg 14 [\d.]+ [\d.]+ 12 re f Q\s*BT \/F1 [78] Tf 1 1 1 rg [\d.]+ [\d.]+ Td \((?:[^()\\]|\\.|\([^()]*\))*\) Tj ET(?:\s*BT \/F[12] [789] Tf [\d. ]+ rg [\d.]+ [\d.]+ Td \((?:[^()\\]|\\.)*\) Tj ET)?/g;
  function stripLabels(L, doc, page) {
    var node = page.node, c = node.Contents();
    if (!c) return 0;
    var parts = c instanceof L.PDFArray ? c.asArray().map(function (r) { return doc.context.lookup(r); }) : [c];
    var text = "";
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i], bytes;
      if (s instanceof L.PDFRawStream) bytes = L.decodePDFRawStream(s).decode();
      else if (s && s.getContents) bytes = s.getContents();
      else return 0;
      for (var k = 0; k < bytes.length; k += 8192) text += String.fromCharCode.apply(null, bytes.subarray(k, k + 8192));
      text += "\n";
    }
    var n = 0, out = text.replace(LABEL_OPS, function () { n++; return ""; });
    if (!n) return 0;
    var raw = new Uint8Array(out.length);
    for (var j = 0; j < out.length; j++) raw[j] = out.charCodeAt(j) & 255;
    node.set(L.PDFName.of("Contents"), doc.context.register(doc.context.flateStream(raw)));
    return n;
  }
  /* y is the bottom of the old 12 point label row. Everything stays inside that row (x 14 to 330), which is empty
     on every page apart from the old label, so nothing of the question itself is painted over. */
  function drawLabel(L, pg, reg, bold, y, n, kind, src, answer) {   // kind: "q" or "m", "+" when continued; answer: the letter, for multiple choice
    var text = (kind.charAt(0) === "m" ? "Mark scheme · Question " : "Question ") + n + (kind.charAt(1) === "+" ? " (continued)" : "");
    pg.drawRectangle({ x: 14, y: y, width: 316, height: 12, color: L.rgb(1, 1, 1) });   // the old small label and its paper code
    var w = bold.widthOfTextAtSize(text, 8) + 10;
    pg.drawRectangle({ x: 14, y: y, width: w, height: 12, color: L.rgb(0.18, 0.49, 0.36) });
    pg.drawText(text, { x: 19, y: y + 3.4, size: 8, font: bold, color: L.rgb(1, 1, 1) });
    var st = answer ? "" : sourceText(src);
    if (st) pg.drawText(st, { x: 14 + w + 7, y: y + 3.4, size: 8, font: reg, color: L.rgb(0.2, 0.2, 0.2) });
    if (answer) pg.drawText("Answer: " + answer, { x: 14 + w + 7, y: y + 3, size: 9, font: bold, color: L.rgb(0.1, 0.1, 0.1) });
  }
  /* multiple choice mark schemes are only letters, so they become an answer key: number, letter, where it came from */
  function keyPages(L, out, font, bold, title, answers) {
    var y = 0, page = null;
    answers.forEach(function (a, i) {
      if (!page || y < 50) { page = out.addPage([595.28, 841.89]); page.drawText(title + (i ? " (cont.)" : ""), { x: 40, y: 790, size: 13, font: bold }); y = 760; }
      page.drawText("Q" + a[0], { x: 40, y: y, size: 10, font: bold }); page.drawText(a[2] || "-", { x: 90, y: y, size: 10, font: bold });
      page.drawText(a[1], { x: 120, y: y, size: 9, font: font, color: L.rgb(0.4, 0.4, 0.4) });
      y -= 17;
    });
  }
  function joinPdfs(items, mode, step, info) {
    return loadPdfLib().then(function (L) {
      return L.PDFDocument.create().then(function (out) {
        return Promise.all([out.embedFont(L.StandardFonts.Helvetica), out.embedFont(L.StandardFonts.HelveticaBold)]).then(function (fonts) {
          var offset = 0;   // questions run Q1, Q2, ... straight through all the years
          return makeCover(L, out, info.cover).then(function () { return items.reduce(function (chain, it, i) {
            return chain.then(function () {
              step(i + 1);
              return fetch(it.url).then(function (r) { if (!r.ok) throw new Error("fetch"); return r.arrayBuffer(); })
                .then(function (b) { return L.PDFDocument.load(b); })
                .then(function (src) {
                  var meta = it.meta, all = src.getPageIndices(), shift = offset;
                  var keep = !meta ? all.slice(1) : all.filter(function (n) { var k = meta.p.charAt(n); return k !== "c" && (mode === "both" || (mode === "q" ? k !== "m" : k === "m")); });
                  return out.copyPages(src, keep).then(function (pages) {
                    pages.forEach(function (pg, j) {
                      out.addPage(pg);
                      if (meta) stripLabels(L, out, pg);
                      if (meta) (meta.l[keep[j]] || []).forEach(function (l) {
                        var ms = /MARK SCHEME/.test(l[1]), n = +(l[1].match(/^Q(\d+)/) || [0, 0])[1];
                        if (mode === "q" && ms) return;   // that strip is covered below
                        var ans = ms && meta.p.charAt(keep[j]) === "x" ? (meta.a.filter(function (a) { return a[0] === n; })[0] || [])[2] || "-" : "";
                        drawLabel(L, pg, fonts[0], fonts[1], l[0], n + shift, (ms ? "m" : "q") + (/cont/.test(l[1]) ? "+" : ""), (it.srcs || {})[n], ans);
                      });
                      var strips = meta && mode === "q" && meta.s[keep[j]];
                      if (strips) strips.forEach(function (y) { pg.drawRectangle({ x: 0, y: y - 3, width: pg.getWidth(), height: 17, color: L.rgb(1, 1, 1) }); });
                    });
                    if (meta && mode === "m" && meta.a.length) keyPages(L, out, fonts[0], fonts[1], "Answer key, " + it.year, meta.a.map(function (a) { return [a[0] + shift, a[1], a[2]]; }));
                    offset += it.count || 0;
                  });
                });
            });
          }, Promise.resolve()).then(function () { return out.save(); }); });
        });
      });
    });
  }
  function topicView(id) {
    var p = BY_ID[id];
    if (!p || p.kind !== "topical") { location.hash = "#/"; return; }
    var s = subj(p.subject), rows = topicRows(topicGroup(p)), name = baseName(p);
    var total = rows.reduce(function (a, r) { return a + (r.count || 0); }, 0), marks = rows.reduce(function (a, r) { return a + (r.marks || 0); }, 0);
    document.body.setAttribute("data-glow", p.subject.replace(/^ig-/, ""));
    app.innerHTML = '<main class="page"><div class="wrap topic-page"><a class="back" href="' + backTo(p) + '">' + I.back + ' Library</a>' +
      '<p class="label-caps eyebrow">' + esc(LEVEL_NAME[levelOf(s)] + " · " + s.name + " · " + groupName(s, p.component)) + '</p>' +
      '<h1 class="font-brand topic-title">' + esc(name) + '</h1><p class="lede">' + rows.length + (rows[0] && rows[0].tid ? (rows.length === 1 ? " year" : " years") : (rows.length === 1 ? " PDF" : " PDFs")) + (total ? " · " + total + " questions" : "") + (marks ? " · " + marks + " marks" : "") + '. Open one year, or tick several and download them as one PDF.</p>' +
      '<section class="panel topic-years"><div class="ty-bar"><label class="ty-check"><input type="checkbox" id="tyAll"> <span id="tyAllText">Select all</span></label>' +
        '<span class="ty-get"><select class="field" id="tyMode" aria-label="What to include"><option value="both">Questions and mark schemes</option><option value="q">Questions only</option><option value="m">Mark schemes only</option></select>' +
        '<button class="mini primary" id="tyGet" type="button" disabled>Download selected</button><button class="mini" id="tyPractise" type="button" hidden>Practise online</button></span></div>' +
      '<p class="st-error" id="tyErr" role="alert"></p><div id="tyGate"></div>' +
      rows.map(function (r, i) {
        return '<div class="ty-row"><label class="ty-check"><input type="checkbox" data-i="' + i + '"><b>' + esc(r.label) + '</b><span>' + [r.count ? r.count + (r.count === 1 ? " question" : " questions") : "", r.marks ? r.marks + " marks" : ""].filter(Boolean).join(" · ") + '</span></label><a class="mini" href="' + r.href + '">Open</a></div>';
      }).join("") + '</section></div></main>' + footer();
    window.scrollTo(0, 0);
    var boxes = [].slice.call(app.querySelectorAll(".ty-row input")), all = document.getElementById("tyAll"), get = document.getElementById("tyGet"), err = document.getElementById("tyErr");
    function picked() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return rows[+b.dataset.i]; }); }
    function sync() {
      var n = picked().length;
      get.disabled = !n; get.textContent = !n ? "Download selected" : n === 1 ? "Download " + picked()[0].label : "Download " + n + " years as one PDF";
      all.checked = n === boxes.length; all.indeterminate = n > 0 && n < boxes.length;
      document.getElementById("tyAllText").textContent = all.checked ? "Deselect all" : "Select all";
    }
    boxes.forEach(function (b) { b.addEventListener("change", sync); });
    var first = rows.filter(function (r) { return r.tid; })[0], prac = document.getElementById("tyPractise");
    if (first) fetch("/assets/pages/" + first.tid + ".json").then(function (x) { return x.json(); }).then(function (m) {
      if (Object.keys(m).some(function (y) { return m[y].p.indexOf("x") >= 0; })) prac.hidden = false;   // multiple choice topics only
    }).catch(function () {});
    prac.addEventListener("click", function () {
      var ys = picked().map(function (r) { return r.year; });
      location.hash = "#/practice/" + id + (ys.length ? "?y=" + ys.join(",") : "");
    });
    all.addEventListener("change", function () { boxes.forEach(function (b) { b.checked = all.checked; }); sync(); });
    get.addEventListener("click", function () {
      var list = picked(), label = get.textContent, mode = document.getElementById("tyMode").value;
      get.disabled = true; err.textContent = "";
      var maps = {};
      Promise.all([].concat(
        list.map(function (r) { return window.BE_auth ? window.BE_auth.signedUrl(r.path, fileUrl(r.path)) : fileUrl(r.path); }),
        list.filter(function (r) { return r.tid; }).map(function (r) {
          return fetch("/assets/pages/" + r.tid + ".json").then(function (x) { return x.ok ? x.json() : {}; }).then(function (m) { maps[r.tid] = m; });
        }),
        list.filter(function (r) { return r.tid; }).map(function (r) {   // which paper each question came from, for its label
          return fetch("/assets/jump/" + r.tid + "-" + r.year + ".json").then(function (x) { return x.ok ? x.json() : []; }).then(function (rows) { var o = {}; rows.forEach(function (q) { o[q[0]] = q[1]; }); r.srcs = o; });
        })))
        .then(function (urls) {
          var items = list.slice().sort(function (a, b) { return b.year - a.year; }).map(function (r) { return { url: urls[list.indexOf(r)], year: r.label, count: r.count, srcs: r.srcs, meta: r.tid && maps[r.tid] ? maps[r.tid][r.year] : null }; });
          var questions = list.reduce(function (a, r) { return a + (r.count || 0); }, 0), marks = list.reduce(function (a, r) { return a + (r.marks || 0); }, 0);
          var info = { cover: { title: name, subject: SUBJECT_LINE[p.subject] || s.name, kicker: { both: "TOPICAL PAST PAPERS", q: "TOPICAL QUESTIONS ONLY", m: "TOPICAL MARK SCHEMES ONLY" }[mode],
            fields: [["EXAM BOARD", "Cambridge"], ["SYLLABUS CODE", p.subject === "cs" ? "9608 and 9618" : s.code], ["PAPERS COVERED", groupName(s, p.component).replace(/\s*\(.*\)$/, "")],
              ["YEARS", yearsText(list.map(function (r) { return r.year; }))], ["QUESTIONS", questions + (marks && mode !== "m" ? " (" + marks + " marks)" : "")], ["CONTENTS", { both: "With mark schemes", q: "Questions only", m: "Mark schemes only" }[mode]]] } };
          return joinPdfs(items, mode, function (i) { get.textContent = "Preparing " + i + " of " + items.length + "…"; }, info);
        })
        .then(function (bytes) {
          var a = document.createElement("a"), url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
          a.href = url; a.download = name + " - " + list.map(function (r) { return r.label; }).join(", ") + { both: "", q: " (questions only)", m: " (mark schemes only)" }[mode] + ".pdf";
          document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        })
        .catch(function (e) {
          if (e && e.message === "login") { var g = document.getElementById("tyGate"); gateBox(g, function () { g.innerHTML = ""; get.click(); }); }
          else { console.error("join failed", e); err.textContent = "Those PDFs could not be joined just now. Check your connection and try again."; }
        })
        .then(function () { get.textContent = label; get.disabled = !picked().length; });
    });
  }

  function viewer(id, params) {
    var p = BY_ID[id];
    if (!p) { app.innerHTML = '<main class="page"><div class="wrap"><div class="panel empty"><h3>Paper not found</h3><p>This link does not match anything in the library.</p><p><a class="mini primary" href="#/">Back to the library</a></p></div></div></main>'; return; }
    var s = subj(p.subject);
    if (window.BE_auth && !window.BE_auth.allowed() && guestFor !== id) {
      lockedView(p, p.kind === "topical" ? p.name : "Paper " + paperNo(p), s.name + " " + p.code, backTo(p));
      return;
    }
    var backHref = p.kind === "topical" ? "#/topic/" + topicGroup(p)[0].id : backTo(p);
    var title, sub, body;
    var yrs = p.kind === "topical" ? (DATA.years || {})[p.id] || [] : [];
    var pick = yrs.filter(function (r) { return String(r[0]) === params.get("y"); })[0];
    if (p.kind === "topical") {
      var file = pick ? pick[1] : p.qp;
      title = p.name; sub = s.name + " " + p.code + " · Topical · " + groupName(s, p.component) + (pick ? " · " + pick[0] : p.years ? " · " + p.years : "");
      var yearBar = yrs.length > 1 ? '<div class="wrap year-bar"><span class="label-caps">Year</span><div class="seg year-seg" role="tablist" aria-label="Year">' +
        '<a role="tab" class="seg-a" href="#/view/' + p.id + '" aria-selected="' + !pick + '">All years</a>' +
        yrs.map(function (r) { return '<a role="tab" class="seg-a" href="#/view/' + p.id + '?y=' + r[0] + '" aria-selected="' + (pick === r) + '">' + r[0] + '</a>'; }).join("") + '</div></div>' : '';
      body = '<div class="viewer-body">' + pane("Questions with mark schemes", file, file.split("/").pop()) + '</div>';
    } else {
      var c = comp(s, p.component);
      title = "Paper " + paperNo(p) + (c ? " · " + c.title : "");
      sub = s.name + " " + p.code + " · " + SESSION[p.session] + " " + p.year;
      var show = params.get("show");
      var split = params.get("split") === "1" && p.ms;
      if (split) body = '<div class="viewer-body split">' + pane("Question paper", p.qp, p.qp.split("/").pop()) + pane(/UNOFFICIAL/.test(p.ms) ? "Mark scheme · UNOFFICIAL BeforeExams" : "Mark scheme", p.ms, p.ms.split("/").pop()) + '</div>';
      else if (show === "ms" && p.ms) body = '<div class="viewer-body">' + pane(/UNOFFICIAL/.test(p.ms) ? "Mark scheme · UNOFFICIAL BeforeExams" : "Mark scheme", p.ms, p.ms.split("/").pop()) + '</div>';
      else body = '<div class="viewer-body">' + pane("Question paper", p.qp, p.qp.split("/").pop()) + '</div>';
      var base = "#/view/" + p.id;
      var tabs = '<div class="seg" role="tablist" aria-label="Document">' +
        '<a role="tab" href="' + base + '" aria-selected="' + (!split && show !== "ms") + '" class="seg-a">Question paper</a>' +
        (p.ms ? '<a role="tab" href="' + base + '?show=ms" aria-selected="' + (!split && show === "ms") + '" class="seg-a">Mark scheme</a>' +
          '<a role="tab" href="' + base + '?split=1" aria-selected="' + Boolean(split) + '" class="seg-a">Side by side</a>' : "") + '</div>';
      var extras = (p.extra || []).map(function (u) { return '<a class="mini" href="' + fileUrl(u) + '" data-extra="' + esc(u) + '" target="_blank" rel="noopener">' + I.file.replace('width="22" height="22"', 'width="14" height="14"') + ' ' + esc(/UNOFFICIAL/.test(u) ? "Extra unofficial mark scheme" : u.split("/").pop()) + '</a>'; }).join("");
      body = '<div class="wrap" style="max-width:1600px;padding-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">' + tabs + extras + '</div>' + body;
    }
    var logLink = window.BE_auth && window.BE_auth.enabled ? '<a class="mini" href="#/account?log=' + p.id + '">Log my score</a>' : '';
    app.innerHTML = '<div class="viewer"><div class="viewer-bar"><div class="wrap"><div class="viewer-title"><a class="back" href="' + backHref + '">' + I.back + ' Library</a><b>' + esc(title) + '</b><small>' + esc(sub) + '</small>' + logLink + '<button class="mini report-btn" id="reportBtn" type="button">Report a mistake</button></div></div></div>' +
      (p.kind === "topical" ? yearBar + '<div class="jump wrap" id="jumpBar"></div>' : '') + '<p class="mobile-tip" style="margin-top:12px">On a phone, tap <b>Open</b> to read the PDF full screen.</p>' + body + '</div>';
    window.scrollTo(0, 0);
    document.getElementById("reportBtn").addEventListener("click", function () { window.BE_admin.report(id, title + ", " + sub); });
    var startPane = document.querySelector(".pane[data-path]");
    if (startPane && +params.get("page")) startPane.dataset.page = params.get("page");
    hydratePanes();
    if (p.kind === "topical") window.BE_find.jump(pick ? id + "-" + pick[0] : id, params.get("page"));
  }

  window.BE_openSubject = function (key) {
    var p = new URLSearchParams(); p.set("subject", key); store("be-last", p.toString());
    var sx = DATA && subj(key); if (sx) store("be-level", levelOf(sx));
    location.hash = "#/?" + p.toString();
    setTimeout(function () { var el = document.querySelector(".section-head"); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 78, behavior: "smooth" }); }, 60);
  };
  var wasLib = false, libHash = "", libScroll = 0;   // where the student was in the library, for coming back to the same spot
  function backTo(p) { return libHash || "#/?" + new URLSearchParams(store("be-last") || ("subject=" + p.subject)).toString(); }
  function render(e) {
    if (!DATA) return;
    var r = parse();
    var isLib = !/^\/(view|mock|notes|topic|practice)\/|^\/(about|account|admin|grades|worksheet|practice)$/.test(r.path), cameBack = isLib && !wasLib && location.hash === libHash;
    if (wasLib && !isLib) { libScroll = window.scrollY; if (e && e.oldURL) libHash = new URL(e.oldURL).hash; }
    wasLib = isLib;
    document.body.setAttribute("data-glow", (r.params.get("subject") || (r.path.match(/^\/notes\/([a-z-]+)/) || [])[1] || "site").replace(/^ig-/, ""));
    window.BE_study.stop();
    document.body.setAttribute("data-view", /^\/(view|mock)\//.test(r.path) ? "viewer" : (r.path === "/about" ? "about" : r.path === "/account" || r.path === "/admin" ? "account" : /^\/notes\//.test(r.path) ? "notes" : /^\/(topic|practice)\//.test(r.path) ? "topic" : r.path === "/grades" || r.path === "/worksheet" || r.path === "/practice" ? "grades" : "library"));
    var mk = r.path.match(/^\/mock\/([0-9a-f]{8})$/);
    if (mk) { window.BE_study.mock(app, mk[1]); return; }
    var m = r.path.match(/^\/view\/([0-9a-f]{8})$/);
    if (m) { viewer(m[1], r.params); return; }
    guestFor = null;
    var tp = r.path.match(/^\/topic\/([0-9a-f]{8})$/);
    if (tp) { topicView(tp[1]); return; }
    var pr = r.path.match(/^\/practice(?:\/([0-9a-f]{8}))?$/);
    if (pr) { window.BE_practice.view(app, pr[1] || null, r.params); return; }
    if (r.path === "/worksheet") { window.BE_worksheet.view(app, r.params); return; }
    var nm =r.path.match(/^\/notes\/([a-z-]+)\/([a-z0-9-]+)$/);
    if (nm) { notesView(nm[1], nm[2]); return; }
    if (r.path === "/about") { aboutView(); return; }
    if (r.path === "/account") { accountView(r.params); return; }
    if (r.path === "/admin") { window.BE_admin.view(app); return; }
    if (r.path === "/grades") { window.BE_grades.view(app, r.params); return; }
    if (r.path === "/" && !r.params.toString()) {
      var last = store("be-last");
      if (last) { history.replaceState(null, "", "#/?" + last); r = parse(); }
    }
    libraryView(r.params);
    if (cameBack) window.scrollTo({ top: libScroll, behavior: "instant" });
  }

  window.addEventListener("hashchange", render);
  window.BE_lib = {
    lock: function (p) { lockedView(p, "Paper " + paperNo(p), subj(p.subject).name + " " + p.code, window.BE_auth.user() ? "#/account" : "#/"); },
    guestOpen: function (id) { return guestFor === id; },
    baseName: baseName, topicGroup: topicGroup, topicRows: topicRows, fileUrl: fileUrl, icon: function (n) { return I[n]; },
    topicals: function () { return TOPICALS; }, groupName: groupName, loadPdfLib: loadPdfLib, gateBox: gateBox, shake: shake, toast: toast, makeCover: makeCover, yearsText: yearsText, drawLabel: drawLabel, sourceText: sourceText, stripLabels: stripLabels,
    esc: esc, subj: subj, levelOf: levelOf, paperNo: paperNo, SESSION: SESSION, footer: footer, render: render, store: store, pane: pane, hydratePanes: hydratePanes,
    data: function () { return DATA; }, papers: function () { return PAPERS; }, byId: function (id) { return BY_ID[id] || null; },
    itemLabel: function (p) { return p.kind === "topical" ? p.name : "Paper " + paperNo(p) + ", " + SESSION[p.session] + " " + p.year; }
  };
  if (window.BE_auth) window.BE_auth.onChange(function () {
    window.BE_study.load();
    window.BE_admin.check();
    if (/^#\/(view\/|account|mock\/|admin)/.test(location.hash)) render();
  });
  app.innerHTML = '<main class="page"><div class="wrap"><p class="lede">Loading the library…</p></div></main>';
  fetch("/assets/library.json").then(function (r) { return r.json(); }).then(function (d) { DATA = d; index(); render(); })
    .catch(function () { app.innerHTML = '<main class="page"><div class="wrap"><div class="panel empty"><h3>The library could not load</h3><p>Check your connection and refresh the page.</p></div></div></main>'; });
})();
