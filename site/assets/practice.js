/* online multiple choice practice: each question is cut from the year PDFs with its answer line hidden */
(function () {
  var pdfjs = null, docs = {};
  function L() { return window.BE_lib; }
  function esc(s) { return L().esc(s); }
  function loadPdfjs() {
    return pdfjs = pdfjs || new Promise(function (ok, fail) {
      var s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      s.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; ok(window.pdfjsLib); };
      s.onerror = function () { pdfjs = null; fail(new Error("lib")); };
      document.head.appendChild(s);
    });
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* every multiple choice question on the "x" pages of a year PDF: the page, the area above its answer line, the answer */
  function questionsOf(meta, url) {
    var out = [], k = 0;
    for (var i = 0; i < meta.p.length; i++) {
      if (meta.p.charAt(i) !== "x") continue;
      var top = 830;
      (meta.s[i] || []).forEach(function (y) {
        var a = meta.a[k++], b = y + 15;
        var old = ((meta.l || {})[i] || []).filter(function (l) { return /QUESTION/.test(l[1]) && l[0] > b && l[0] < top; })[0];   // the small printed label, hidden in the picture
        if (a && /^[A-D]$/.test(a[2])) out.push({ url: url, page: i + 1, top: top, bottom: b, ly: old ? old[0] : null, answer: a[2], src: a[1] });
        top = y - 3;
      });
    }
    return out;
  }
  function draw(q, box) {
    return loadPdfjs().then(function (lib) {
      docs[q.url] = docs[q.url] || lib.getDocument(q.url).promise;
      return docs[q.url];
    }).then(function (doc) { return doc.getPage(q.page); }).then(function (page) {
      var scale = Math.min(2.4, Math.max(1.2, (box.clientWidth * (window.devicePixelRatio || 1)) / 595));
      var vp = page.getViewport({ scale: scale }), full = document.createElement("canvas");
      full.width = vp.width; full.height = vp.height;
      return page.render({ canvasContext: full.getContext("2d"), viewport: vp }).promise.then(function () {
        var y0 = (842 - q.top) * scale, h = Math.max(40, (q.top - q.bottom) * scale), c = document.createElement("canvas");
        c.width = vp.width; c.height = h;
        var ctx = c.getContext("2d");
        ctx.drawImage(full, 0, y0, vp.width, h, 0, 0, vp.width, h);
        if (q.ly != null) { ctx.fillStyle = "#fff"; ctx.fillRect(10 * scale, (q.top - q.ly - 14.5) * scale, 380 * scale, 17 * scale); }
        c.className = "pr-img"; box.innerHTML = ""; box.appendChild(c);
      });
    });
  }

  function view(app, id, params) {
    var lib = L(), ids = id ? [id] : (params.get("t") || "").split(",").filter(function (x) { return lib.byId(x); }), p = lib.byId(ids[0]);
    if (!p) { window.BE_worksheet.view(app, params, true); return; }
    var name = ids.length > 1 ? "Mixed practice, " + ids.length + " topics" : lib.baseName(p);
    var rows = [].concat.apply([], ids.map(function (x) { return lib.topicRows(lib.topicGroup(lib.byId(x))); }));
    var back = id ? "#/topic/" + id : "#/practice?subject=" + p.subject;
    var want = (params.get("y") || "").split(",").filter(Boolean);
    var picked = rows.filter(function (r) { return r.tid && (!want.length || want.indexOf(String(r.year)) >= 0); });
    var yearsLabel = lib.yearsText(picked.map(function (r) { return r.year; }).filter(function (y, i, a) { return a.indexOf(y) === i; })).replace(/^\[|\]$/g, "");   // saved with the score
    document.body.setAttribute("data-glow", p.subject.replace(/^ig-/, ""));
    app.innerHTML = '<main class="page"><div class="wrap practice"><a class="back" href="' + back + '">' + lib.icon("back") + ' ' + esc(id ? name : "Back to picking topics") + '</a>' +
      '<div id="prBox"><p class="lede">Getting the questions ready…</p></div></div></main>' + lib.footer();
    window.scrollTo(0, 0);
    var box = document.getElementById("prBox");
    var maps = {};
    Promise.all(picked.map(function (r) {
      return Promise.all([
        window.BE_auth ? window.BE_auth.signedUrl(r.path, lib.fileUrl(r.path)) : lib.fileUrl(r.path),
        maps[r.tid] || (maps[r.tid] = fetch("/assets/pages/" + r.tid + ".json").then(function (x) { return x.json(); }))
      ]).then(function (v) { return questionsOf(v[1][r.year] || { p: "", s: {}, a: [] }, v[0]); });
    })).then(function (lists) {
      var all = shuffle([].concat.apply([], lists));
      if (!all.length) { box.innerHTML = '<div class="panel empty"><h3>No multiple choice questions here</h3><p>Practice works on multiple choice topics. Pick another topic or year.</p></div>'; return; }
      start(all.slice(0, Math.min(all.length, +params.get("n") || 20)), all.length);
    }).catch(function (e) {
      if (e && e.message === "login") { box.innerHTML = '<section class="panel st-box"></section>'; lib.gateBox(box.firstChild, function () { lib.render(); }); return; }
      box.innerHTML = '<div class="panel empty"><h3>The questions could not load</h3><p>Check your connection and try again.</p></div>';
    });

    function start(qs, pool) {
      var at = 0, right = 0, wrong = [], answered = 0, began = Date.now();
      function show() {
        var q = qs[at];
        box.innerHTML = '<div class="pr-top"><span class="label-caps">Question ' + (at + 1) + ' of ' + qs.length + '</span><span class="pr-score">' + right + ' correct</span><button class="mini pr-stop" id="prStop" type="button">Finish and save</button></div>' +
          '<div class="pr-bar"><i style="width:' + (at / qs.length * 100) + '%"></i></div>' +
          '<section class="panel pr-card">' + (L().sourceText(q.src) ? '<p class="pr-src">' + esc(L().sourceText(q.src)) + '</p>' : '') + '<div class="pr-q" id="prQ"><p class="lede">Loading…</p></div>' +
          '<div class="pr-opts">' + "ABCD".split("").map(function (o) { return '<button type="button" class="pr-opt" data-o="' + o + '">' + o + '</button>'; }).join("") + '</div>' +
          '<p class="pr-msg" id="prMsg" role="status"></p><p class="pr-keys">Tip: press A, B, C or D on your keyboard, then Enter.</p><div class="pr-next"><span class="pr-src">' + esc(q.src) + '</span><button class="mini primary" id="prNext" type="button" hidden>' + (at + 1 < qs.length ? "Next question" : "See my score") + '</button></div></section>';
        draw(q, document.getElementById("prQ")).catch(function () { document.getElementById("prQ").innerHTML = '<p class="st-error">This question could not be shown.</p>'; });
        box.querySelectorAll(".pr-opt").forEach(function (b) {
          b.addEventListener("click", function () {
            if (box.querySelector(".pr-opt[disabled]")) return;
            var ok = b.dataset.o === q.answer;
            answered++;
            if (ok) right++; else wrong.push(q);
            box.querySelectorAll(".pr-opt").forEach(function (x) { x.disabled = true; if (x.dataset.o === q.answer) x.classList.add("good"); });
            if (!ok) { b.classList.add("bad"); lib.shake(b); }
            document.getElementById("prMsg").textContent = ok ? "Correct." : "Not quite. The answer is " + q.answer + ".";
            document.getElementById("prMsg").className = "pr-msg " + (ok ? "ok" : "no");
            box.querySelector(".pr-score").textContent = right + " correct";
            var n = document.getElementById("prNext"); n.hidden = false; n.focus();
          });
        });
        document.getElementById("prNext").addEventListener("click", function () { at++; if (at < qs.length) show(); else done(); });
        document.getElementById("prStop").addEventListener("click", function () {
          if (!answered) { location.hash = back; return; }
          if (window.confirm("Finish now and save your score for the " + answered + (answered === 1 ? " question" : " questions") + " you answered?")) done();
        });
      }
      /* keyboard: A to D answers, Enter goes on */
      document.addEventListener("keydown", function key(e) {
        if (!document.body.contains(box) || !box.querySelector(".pr-opt")) { if (!document.body.contains(box)) document.removeEventListener("keydown", key); return; }
        if (e.ctrlKey || e.metaKey || e.altKey || /input|select|textarea/i.test(e.target.tagName)) return;
        var k = e.key.toUpperCase(), b = box.querySelector('.pr-opt[data-o="' + k + '"]:not([disabled])'), n = document.getElementById("prNext");
        if (b) { e.preventDefault(); b.click(); }
        else if (e.key === "Enter" && n && !n.hidden && document.activeElement !== n) { e.preventDefault(); n.click(); }
      });
      function done() {
        if (!answered) { lib.render(); return; }   // stopped before answering anything: nothing to score
        var total = answered, pct = Math.round(right / total * 100), mins = Math.max(1, Math.round((Date.now() - began) / 6e4));
        box.innerHTML = '<section class="panel pr-done"><div class="pr-ring" style="--p:' + pct + '"><b>' + pct + '%</b></div><div><h2>' + right + ' out of ' + total + ' correct</h2>' +
          '<p class="st-note">' + mins + ' min · ' + esc(name) + (total < qs.length ? ' · finished early, ' + total + ' of ' + qs.length + ' answered' : pool > qs.length ? ' · ' + qs.length + ' of ' + pool + ' questions, picked at random' : '') + '</p>' +
          '<p class="pr-saved" id="prSaved"></p><div class="pr-actions"><button class="mini primary" id="prAgain" type="button">Practise again</button><a class="mini" href="' + back + '">' + (id ? "Back to the topic" : "Pick other topics") + '</a></div></div></section>' +
          (wrong.length ? '<h3 class="pr-h">Questions to look at again</h3>' + wrong.map(function (q, i) { return '<section class="panel pr-card"><div class="pr-q" data-w="' + i + '"></div><p class="pr-msg no">Answer: ' + q.answer + ' · ' + esc(q.src) + '</p></section>'; }).join("") : '');
        document.getElementById("prAgain").addEventListener("click", function () { lib.render(); });
        box.querySelectorAll("[data-w]").forEach(function (el) { draw(wrong[+el.dataset.w], el); });
        var u = window.BE_auth && window.BE_auth.user();
        if (u) window.BE_auth.db("scores").insert({ subject: p.subject, kind: "topical", item_id: ids[0], label: name + " · " + yearsLabel + " (online practice)", marks: right, total: total, minutes: mins, taken_on: new Date().toISOString().slice(0, 10) })
          .then(function (r) { document.getElementById("prSaved").textContent = r.error ? "" : "Saved to your account."; window.BE_study.reset(); });
        window.scrollTo(0, 0);
      }
      show();
    }
  }
  window.BE_practice = { view: view };
})();
