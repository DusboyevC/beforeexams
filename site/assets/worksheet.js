/* worksheet maker: any topics and years of one subject in one PDF, shuffled or in order, numbered from 1.
   Multiple choice questions are cut out one by one; written questions keep their pages and get new numbers. */
(function () {
  var A4 = [595.28, 841.89], GREEN = [0.18, 0.49, 0.36], MAX_PDFS = 40;
  var maps = {};
  function L() { return window.BE_lib; }
  function esc(s) { return L().esc(s); }
  function map(tid) { return maps[tid] = maps[tid] || fetch("/assets/pages/" + tid + ".json").then(function (r) { return r.ok ? r.json() : {}; }); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var MODES = { both: "Questions and mark schemes", q: "Questions only", m: "Mark schemes only" };

  /* topics of a subject, one entry per topic (its year ranges joined) */
  function topicsOf(key) {
    var lib = L(), seen = {}, out = [];
    lib.topicals().forEach(function (t) {
      if (t.subject !== key) return;
      var g = lib.topicGroup(t), id = g[0].id;
      if (seen[id]) return;
      seen[id] = 1;
      out.push({ id: id, component: t.component, topic: t.topic, name: lib.baseName(t), rows: lib.topicRows(g) });
    });
    return out.sort(function (a, b) { return a.component - b.component || String(a.topic).localeCompare(String(b.topic), undefined, { numeric: true }) || a.name.localeCompare(b.name); });
  }

  /* the questions inside one year PDF */
  function unitsOf(row, meta, jump) {
    var units = [];
    if (meta.p.indexOf("x") >= 0) {
      var k = 0;
      for (var i = 0; i < meta.p.length; i++) {
        if (meta.p.charAt(i) !== "x") continue;
        var top = 804;
        (meta.s[i] || []).forEach(function (y) {
          var a = meta.a[k++] || [], b = y + 14;
          var old = ((meta.l || {})[i] || []).filter(function (l) { return /QUESTION/.test(l[1]) && l[0] > b && l[0] < top; })[0];   // its small label inside the cut
          units.push({ mcq: true, row: row, page: i, top: top, bottom: b, ly: old ? old[0] : null, answer: a[2] || "-", src: a[1] || "" });
          top = y - 32;
        });
      }
      return units;
    }
    jump.forEach(function (r, n) {
      var start = r[2] - 1, end = n + 1 < jump.length ? jump[n + 1][2] - 2 : meta.p.length - 1, pages = [];
      for (var i = start; i <= end; i++) if ("qm".indexOf(meta.p.charAt(i)) >= 0) pages.push(i);
      units.push({ mcq: false, row: row, pages: pages, src: r[1], meta: meta });
    });
    return units;
  }

  function label(page, fonts, y, n, kind, src) { L().drawLabel(window.PDFLib, page, fonts.reg, fonts.bold, y, n, kind, src); }
  /* the same cover as the topicals; a worksheet with several topics lists them on the next page */
  function cover(out, fonts, info) {
    var P = window.PDFLib;
    return L().makeCover(P, out, { series: "WORKSHEET", kicker: "WORKSHEET · " + MODES[info.mode].toUpperCase(), title: info.topics.length === 1 ? info.topics[0].replace(/^\S+\s+/, "") : info.topics.length + " topics, mixed",
      subject: info.subjectLine, fields: [["EXAM BOARD", "Cambridge"], ["SYLLABUS CODE", info.code], ["PAPERS COVERED", info.papers], ["YEARS", info.years], ["QUESTIONS", String(info.count)], ["ORDER", info.shuffled ? "Shuffled" : "By topic"]],
      footer: "Name ________________________     Date ____________     Score ______ / " + info.count }).then(function () {
      if (info.topics.length < 2) return;
      var page = out.addPage(A4), y = 780;
      page.drawText("Topics in this worksheet", { x: 48, y: y, size: 15, font: fonts.bold, color: P.rgb(0.1, 0.1, 0.1) }); y -= 30;
      info.topics.forEach(function (t) { if (y < 50) { page = out.addPage(A4); y = 790; } page.drawText(t, { x: 48, y: y, size: 10.5, font: fonts.reg, color: P.rgb(0.2, 0.2, 0.2) }); y -= 18; });
    });
  }

  function build(units, info, step) {
    var docs = {};
    return L().loadPdfLib().then(function (P) {
      return P.PDFDocument.create().then(function (out) {
        return Promise.all([out.embedFont(P.StandardFonts.Helvetica), out.embedFont(P.StandardFonts.HelveticaBold)]).then(function (f) {
          var fonts = { reg: f[0], bold: f[1] }, page = null, y = 0, key = [];
          var urls = [];
          units.forEach(function (u) { if (urls.indexOf(u.row.url) < 0) urls.push(u.row.url); });
          return cover(out, fonts, info).then(function () { return urls.reduce(function (c, u, i) {
            return c.then(function () {
              step("Loading " + (i + 1) + " of " + urls.length + " PDFs…");
              return fetch(u).then(function (r) { if (!r.ok) throw new Error("fetch"); return r.arrayBuffer(); }).then(function (b) { return P.PDFDocument.load(b); }).then(function (d) { docs[u] = d; });
            });
          }, Promise.resolve()).then(function () {
            step("Putting " + units.length + " questions together…");
            return units.reduce(function (c, u, idx) {
              var n = idx + 1;
              return c.then(function () {
                var src = docs[u.row.url];
                if (u.mcq) {
                  if (info.mode === "m") { key.push([n, u.src, u.answer]); return; }
                  return out.embedPage(src.getPage(u.page), { left: 0, bottom: u.bottom, right: A4[0], top: u.top }).then(function (emb) {
                    var h = u.top - u.bottom, inside = u.ly != null, need = h + (inside ? 6 : 22) + (info.mode === "both" ? 18 : 0);
                    if (!page || y - need < 30) { page = out.addPage(A4); y = A4[1] - 34; }
                    if (!inside) { label(page, fonts, y - 14, n, "q", u.src); y -= 20; }
                    page.drawPage(emb, { x: 0, y: y - h, width: A4[0], height: h });
                    if (inside) label(page, fonts, y - h + (u.ly - u.bottom), n, "q", u.src);   // written over the old small label
                    y -= h + 4;
                    if (info.mode === "both") { L().drawLabel(P, page, fonts.reg, fonts.bold, y - 14, n, "m", "", u.answer); y -= 20; }
                    y -= 10;
                  });
                }
                page = null;   // written questions start on their own pages
                var keep = u.pages.filter(function (i) { var k = u.meta.p.charAt(i); return info.mode === "both" || (info.mode === "q" ? k === "q" : k === "m"); });
                return out.copyPages(src, keep).then(function (pages) {
                  pages.forEach(function (pg, j) {
                    out.addPage(pg);
                    (u.meta.l[keep[j]] || []).forEach(function (l) {
                      label(pg, fonts, l[0], n, (/MARK SCHEME/.test(l[1]) ? "m" : "q") + (/cont/.test(l[1]) ? "+" : ""), u.src);
                    });
                  });
                });
              });
            }, Promise.resolve()).then(function () {
              if (key.length) {
                var kp = null, ky = 0;
                key.forEach(function (k, i) {
                  if (!kp || ky < 50) { kp = out.addPage(A4); kp.drawText("Answer key" + (i ? " (continued)" : ""), { x: 40, y: 790, size: 14, font: fonts.bold }); ky = 758; }
                  kp.drawText("Q" + k[0], { x: 40, y: ky, size: 10, font: fonts.bold }); kp.drawText(k[2], { x: 92, y: ky, size: 10, font: fonts.bold });
                  kp.drawText(k[1], { x: 124, y: ky, size: 9, font: fonts.reg, color: P.rgb(0.42, 0.42, 0.42) }); ky -= 17;
                });
              }
              return out.save();
            });
          }); });
        });
      });
    });
  }

  var MCQ_SUBJECTS = ["ig-biology", "ig-chemistry", "ig-physics", "biology", "chemistry", "physics"];
  /* practise = true shows the same picker for online multiple choice practice: multiple choice topics only, no PDF options */
  function view(app, params, practise) {
    var lib = L(), subjects = lib.data().subjects.filter(function (s) { return topicsOf(s.key).length && (!practise || MCQ_SUBJECTS.indexOf(s.key) >= 0); });
    var last = (lib.store("be-last") || "").match(/subject=([a-z-]+)/), has = function (k) { return subjects.some(function (s) { return s.key === k; }); };
    var key = has(params.get("subject")) ? params.get("subject") : last && has(last[1]) ? last[1] : subjects[0].key;
    document.body.setAttribute("data-glow", key.replace(/^ig-/, ""));
    app.innerHTML = '<main class="page"><div class="wrap ws">' +
      '<p class="label-caps eyebrow">' + (practise ? "Multiple choice practice" : "Worksheet maker") + '</p>' +
      '<h1 class="hero">' + (practise ? "Practise multiple choice online." : "Make your own worksheet.") + '</h1>' +
      '<p class="lede">' + (practise ? 'Pick topics and years, then answer the questions on screen. Each answer is marked straight away and you get your score at the end.' : 'Pick topics and years, then choose what goes in. You get one PDF, numbered from 1, ready to print or share.') + '</p>' +
      '<section class="panel st-box"><div class="ws-step"><span class="ws-n">1</span><h2>Subject</h2></div>' +
        '<select class="field ws-subject" id="wsSubject">' + subjects.map(function (s) { return '<option value="' + s.key + '"' + (s.key === key ? " selected" : "") + '>' + esc((lib.levelOf(s) === "ig" ? "IGCSE " : "A Level ") + s.name + " " + s.code) + '</option>'; }).join("") + '</select></section>' +
      '<section class="panel st-box"><div class="ws-step"><span class="ws-n">2</span><h2>Topics</h2><span class="ws-count" id="wsTopicCount"></span></div><div id="wsTopics"></div></section>' +
      '<section class="panel st-box"><div class="ws-step"><span class="ws-n">3</span><h2>Years</h2><button class="auth-link" id="wsAllYears" type="button">Select all</button></div><div class="ws-years" id="wsYears"></div></section>' +
      '<section class="panel st-box"><div class="ws-step"><span class="ws-n">4</span><h2>' + (practise ? "How many questions" : "What goes in") + '</h2></div><div class="ws-opts' + (practise ? ' ws-one' : '') + '">' +
        (practise ? '' : '<label><span>Contents</span><select class="field" id="wsMode"><option value="both">Questions and mark schemes</option><option value="q">Questions only</option><option value="m">Mark schemes only</option></select></label>' +
        '<label><span>Order</span><select class="field" id="wsOrder"><option value="shuffle">Shuffled</option><option value="order">By topic, newest year first</option></select></label>') +
        '<label><span>' + (practise ? "Questions" : "How many questions") + ' <small id="wsMax"></small></span><span class="ws-num"><input class="field" id="wsCount" type="number" inputmode="numeric" min="1" step="1" value="20" placeholder="All"><button class="mini" id="wsAll" type="button">All</button></span></label>' +
      '</div></section>' +
      '<div id="wsGate"></div><section class="panel ws-go"><div><b id="wsSummary">Pick at least one topic.</b><p class="st-note" id="wsStatus"></p><p class="st-error" id="wsErr" role="alert"></p></div>' +
        '<div class="ws-btns">' + (practise ? '<button class="mini primary" id="wsPractise" type="button" disabled>Start practice</button><button id="wsMake" type="button" hidden></button>' :
          '<button class="mini" id="wsPractise" type="button" hidden>Practise online</button><button class="mini primary" id="wsMake" type="button" disabled>Make worksheet PDF</button>') + '</div></section>' +
      '</div></main>' + lib.footer();
    window.scrollTo(0, 0);

    var topics = [], chosen = {}, years = {}, mcq = {};
    var $ = function (id) { return document.getElementById(id); };
    function isMcq(t) { var f = t.rows.filter(function (x) { return x.tid; })[0]; return f ? map(f.tid).then(function (m) { return Object.keys(m).some(function (y) { return m[y].p.indexOf("x") >= 0; }); }) : Promise.resolve(false); }
    function drawTopics() {
      topics = topicsOf(key); chosen = {}; years = {};
      var groups = [];
      topics.forEach(function (t) { var g = groups[groups.length - 1]; if (!g || g.component !== t.component) groups.push(g = { component: t.component, items: [] }); g.items.push(t); });
      if (practise) {   // only papers whose questions are multiple choice
        $("wsTopics").innerHTML = '<p class="st-note">Finding the multiple choice topics…</p>';
        var want = key;
        Promise.all(groups.map(function (g) { return isMcq(g.items[0]); })).then(function (v) {
          if (want !== key) return;
          groups = groups.filter(function (g, i) { return v[i]; });
          topics = [].concat.apply([], groups.map(function (g) { return g.items; }));
          drawGroups(groups);
        });
        return;
      }
      drawGroups(groups);
    }
    function drawGroups(groups) {
      var s = lib.subj(key);
      $("wsTopics").innerHTML = groups.map(function (g) {
        return '<div class="ws-group"><div class="ws-ghead"><b>' + esc(lib.groupName(s, g.component)) + '</b><button class="auth-link" type="button" data-all="' + g.component + '">Select all</button></div><div class="ws-list">' +
          g.items.map(function (t) {
            var q = t.rows.reduce(function (a, r) { return a + (r.count || 0); }, 0);
            return '<label class="ws-topic"><input type="checkbox" value="' + t.id + '" data-c="' + g.component + '"><span><b>' + esc(t.topic) + '</b> ' + esc(t.name) + '</span><small>' + q + '</small></label>';
          }).join("") + '</div></div>';
      }).join("");
      $("wsTopics").querySelectorAll("input").forEach(function (b) { b.addEventListener("change", function () { if (b.checked) chosen[b.value] = 1; else delete chosen[b.value]; sync(); }); });
      $("wsTopics").querySelectorAll("[data-all]").forEach(function (b) {
        b.addEventListener("click", function () {
          var boxes = [].slice.call($("wsTopics").querySelectorAll('input[data-c="' + b.dataset.all + '"]')), on = !boxes.every(function (x) { return x.checked; });
          boxes.forEach(function (x) { x.checked = on; if (on) chosen[x.value] = 1; else delete chosen[x.value]; });
          sync();
        });
      });
      var saved = {};   // the picks from last time on this subject survive a refresh
      try { saved = JSON.parse(lib.store(stateKey()) || "{}"); } catch (e) {}
      (saved.t || []).forEach(function (id) { var b = $("wsTopics").querySelector('input[value="' + id + '"]'); if (b) { b.checked = true; chosen[id] = 1; } });
      years = saved.y || {};
      sync();
    }
    function stateKey() { return "be-ws-" + (practise ? "p-" : "") + key; }
    function count(max) { var v = Math.floor(+$("wsCount").value); return v >= 1 ? Math.min(v, max) : 0; }   // 0 means all
    function picked() { return topics.filter(function (t) { return chosen[t.id]; }); }
    function rows() {
      var out = [];
      picked().forEach(function (t) { t.rows.forEach(function (r) { if (r.tid && years[r.year] !== false) out.push(r); }); });
      return out;
    }
    function sync() {
      var ys = {};
      picked().forEach(function (t) { t.rows.forEach(function (r) { if (r.tid) ys[r.year] = 1; }); });
      var list = Object.keys(ys).map(Number).sort(function (a, b) { return b - a; });
      $("wsYears").innerHTML = list.length ? list.map(function (y) { return '<button type="button" class="chip" data-y="' + y + '" aria-pressed="' + (years[y] !== false) + '">' + y + '</button>'; }).join("") : '<p class="st-note">Pick a topic first.</p>';
      $("wsYears").querySelectorAll("[data-y]").forEach(function (b) { b.addEventListener("click", function () { years[b.dataset.y] = years[b.dataset.y] === false; sync(); }); });
      var allOn = list.every(function (y) { return years[y] !== false; });
      $("wsAllYears").textContent = allOn ? "Deselect all" : "Select all"; $("wsAllYears").hidden = !list.length;
      $("wsTopics").querySelectorAll("[data-all]").forEach(function (b) {
        var boxes = [].slice.call($("wsTopics").querySelectorAll('input[data-c="' + b.dataset.all + '"]'));
        b.textContent = boxes.every(function (x) { return x.checked; }) ? "Deselect all" : "Select all";
      });
      var r = rows(), q = r.reduce(function (a, x) { return a + (x.count || 0); }, 0), want = count(q);
      $("wsCount").max = q || ""; $("wsMax").textContent = q ? "(1 to " + q + ")" : "";
      $("wsTopicCount").textContent = picked().length ? picked().length + " picked" : "";
      $("wsSummary").textContent = !picked().length ? "Pick at least one topic." : !r.length ? "Pick at least one year." : (want && want < q ? want + " of " + q : q) + " questions from " + picked().length + (picked().length === 1 ? " topic" : " topics");
      $("wsMake").disabled = !r.length;
      if (practise) $("wsPractise").disabled = !r.length;
      $("wsErr").textContent = r.length > MAX_PDFS ? "That is " + r.length + " year PDFs. Pick up to " + MAX_PDFS + " at once, with fewer topics or years." : "";
      if (r.length > MAX_PDFS) $("wsMake").disabled = true;
      lib.store(stateKey(), JSON.stringify({ t: Object.keys(chosen), y: years }));
      if (!practise) Promise.all(picked().map(isMcq)).then(function (v) { $("wsPractise").hidden = !v.some(Boolean); });
    }
    $("wsSubject").addEventListener("change", function () { key = $("wsSubject").value; document.body.setAttribute("data-glow", key.replace(/^ig-/, "")); drawTopics(); });
    $("wsAllYears").addEventListener("click", function () {
      var ys = {}; picked().forEach(function (t) { t.rows.forEach(function (r) { if (r.tid) ys[r.year] = 1; }); });
      var allOn = Object.keys(ys).every(function (y) { return years[y] !== false; });
      years = {}; if (allOn) Object.keys(ys).forEach(function (y) { years[y] = false; });
      sync();
    });
    $("wsCount").addEventListener("input", sync);
    $("wsCount").addEventListener("change", function () { var max = +$("wsCount").max; if (max && +$("wsCount").value > max) $("wsCount").value = max; if ($("wsCount").value !== "" && +$("wsCount").value < 1) $("wsCount").value = 1; sync(); });
    $("wsAll").addEventListener("click", function () { $("wsCount").value = ""; sync(); });
    $("wsPractise").addEventListener("click", function () {
      var ys = Object.keys(years).length ? rows().map(function (r) { return r.year; }).filter(function (y, i, a) { return a.indexOf(y) === i; }) : [];
      location.hash = "#/practice?t=" + picked().map(function (t) { return t.id; }).join(",") + (ys.length ? "&y=" + ys.join(",") : "") + "&n=" + (count(Infinity) || 500);
    });
    $("wsMake").addEventListener("click", function () {
      var list = rows(), mode = $("wsMode").value, shuffled = $("wsOrder").value === "shuffle", want = count(Infinity), btn = $("wsMake");
      btn.disabled = true; $("wsErr").textContent = "";
      var status = function (t) { $("wsStatus").textContent = t; };
      status("Getting the questions ready…");
      Promise.all(list.map(function (r) {
        return Promise.all([
          window.BE_auth ? window.BE_auth.signedUrl(r.path, lib.fileUrl(r.path)) : lib.fileUrl(r.path),
          map(r.tid),
          fetch("/assets/jump/" + r.tid + "-" + r.year + ".json").then(function (x) { return x.ok ? x.json() : []; })
        ]).then(function (v) { r.url = v[0]; return unitsOf(r, v[1][r.year] || { p: "", s: {}, a: [], l: {} }, v[2]); });
      })).then(function (lists) {
        var units = [].concat.apply([], lists);
        if (shuffled) shuffle(units);
        if (want) units = units.slice(0, want);
        var s = lib.subj(key), ys = list.map(function (r) { return r.year; }).filter(function (y, i, a) { return a.indexOf(y) === i; }).sort(function (a, b) { return b - a; });
        var comps = picked().map(function (t) { return t.component; }).filter(function (c, i, a) { return a.indexOf(c) === i; }).sort();
        var info = { subjectLine: (lib.levelOf(s) === "ig" ? "IGCSE " : "A-Level ") + s.name, code: key === "cs" ? "9608 and 9618" : s.code,
          papers: comps.length > 2 ? comps.length + " papers" : comps.map(function (c) { return lib.groupName(s, c).replace(/\s*\(.*\)$/, ""); }).join(", "), count: units.length, mode: mode, shuffled: shuffled,
          years: lib.yearsText(ys), topics: picked().map(function (t) { return t.topic + "  " + t.name; }) };
        return build(units, info, status).then(function (bytes) {
          var a = document.createElement("a"), url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
          a.href = url; a.download = "Worksheet - " + s.name + " - " + units.length + " questions" + { both: "", q: " (questions only)", m: " (mark schemes only)" }[mode] + ".pdf";
          document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
          status("Done. Your worksheet has " + units.length + " questions.");
        });
      }).catch(function (e) {
        status("");
        if (e && e.message === "login") { var g = $("wsGate"); g.className = "panel st-box"; lib.gateBox(g, function () { g.innerHTML = ""; g.className = ""; $("wsMake").click(); }); g.scrollIntoView({ block: "center" }); }
        else $("wsErr").textContent = "The worksheet could not be made just now. Check your connection and try again.";
      }).then(function () { btn.disabled = !rows().length; });
    });
    drawTopics();
  }
  window.BE_worksheet = { view: view };
})();
