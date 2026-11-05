/* grade calculator: Cambridge's published thresholds for each exam series, weighted the way Cambridge weights them */
(function () {
  var data = null;
  function L() { return window.BE_lib; }
  function esc(s) { return L().esc(s); }
  function load() { return data ? Promise.resolve(data) : fetch("/assets/grades.json").then(function (r) { return r.json(); }).then(function (d) { return (data = d); }); }

  function label(key, series, o) {
    var full = Math.max.apply(null, series.options.map(function (x) { return x.max; }));
    var papers = o.comps.map(function (c) { return c.charAt(0); }).join(", ");
    var kind = /^ig-/.test(key) ? (o.th.A != null ? "Extended" : "Core") : (o.max === full ? "A Level" : "AS Level");
    return kind + " · Papers " + papers + " (" + o.comps.join(", ") + ")";
  }
  function gradeFor(th, mark) {
    var best = "U";
    Object.keys(th).forEach(function (g) { if (mark >= th[g] && (best === "U" || th[g] > th[best])) best = g; });
    return best;
  }

  function view(app, params) {
    app.innerHTML = '<main class="page"><div class="wrap"><p class="lede">Loading the grade thresholds…</p></div></main>';
    load().then(function (d) {
      var keys = Object.keys(d), key = d[params.get("subject")] ? params.get("subject") : keys[0];
      app.innerHTML = '<main class="page"><div class="wrap grades">' +
        '<p class="label-caps eyebrow">Grade calculator</p><h1 class="hero">What grade would these marks get?</h1>' +
        '<p class="lede">Pick your subject, the exam series and the papers you sat, then type your marks. We use Cambridge&rsquo;s official grade thresholds for that series.</p>' +
        '<section class="panel st-box"><div class="gc-pick">' +
          '<label><span>Subject</span><select class="field" id="gcSubject">' + keys.map(function (k) { var s = L().subj(k); return '<option value="' + k + '"' + (k === key ? " selected" : "") + '>' + esc((s ? (/^ig-/.test(k) ? "IGCSE " : "A Level ") + s.name : k) + " " + d[k].code) + '</option>'; }).join("") + '</select></label>' +
          '<label><span>Exam series</span><select class="field" id="gcSeries"></select></label>' +
          '<label class="gc-wide"><span>Papers you sat</span><select class="field" id="gcOption"></select></label>' +
        '</div><div id="gcMarks" class="gc-marks"></div></section>' +
        '<section class="panel st-box gc-result" id="gcResult" aria-live="polite"></section>' +
        '<p class="st-note">This is an estimate. Thresholds change every series, and your final grade comes from Cambridge. Thresholds are from Cambridge International&rsquo;s published grade threshold tables.</p>' +
        '</div></main>' + L().footer();
      window.scrollTo(0, 0);
      var subj = document.getElementById("gcSubject"), ser = document.getElementById("gcSeries"), opt = document.getElementById("gcOption"), marks = document.getElementById("gcMarks"), out = document.getElementById("gcResult");
      function series() { return d[subj.value].series[+ser.value]; }
      function option() { return series().options[+opt.value]; }
      function fillSeries() {
        ser.innerHTML = d[subj.value].series.map(function (s, i) { return '<option value="' + i + '">' + esc(s.name) + '</option>'; }).join("");
        document.body.setAttribute("data-glow", subj.value.replace(/^ig-/, ""));
        fillOptions();
      }
      function fillOptions() {
        var s = series(), list = s.options.map(function (o, i) { return { i: i, text: label(subj.value, s, o) }; }).sort(function (a, b) { return (/^(Core|AS)/.test(a.text) - /^(Core|AS)/.test(b.text)) || a.text.localeCompare(b.text, undefined, { numeric: true }); });   // full routes first
        opt.innerHTML = list.map(function (x) { return '<option value="' + x.i + '">' + esc(x.text) + '</option>'; }).join("");
        fillMarks();
      }
      function fillMarks() {
        var s = series(), o = option();
        marks.innerHTML = o.comps.map(function (c, i) {
          return '<label><span>Paper ' + c.charAt(0) + ' <small>(' + c + ')</small></span><span class="gc-in"><input class="field" type="number" inputmode="decimal" min="0" max="' + s.comps[c].max + '" step="1" data-i="' + i + '" placeholder="0"><small>/ ' + s.comps[c].max + '</small></span></label>';
        }).join("");
        marks.querySelectorAll("input").forEach(function (inp) {
          inp.addEventListener("input", calc);
          inp.addEventListener("change", function () { if (inp.value === "") return; inp.value = Math.max(0, Math.min(+inp.max, Math.round(+inp.value))); calc(); });   // keep marks between 0 and the paper's total
        });
        calc();
      }
      function calc() {
        var s = series(), o = option(), raw = [].map.call(marks.querySelectorAll("input"), function (inp, i) { return Math.max(0, Math.min(s.comps[o.comps[i]].max, +inp.value || 0)); });
        var filled = [].some.call(marks.querySelectorAll("input"), function (inp) { return inp.value !== ""; });
        var total = raw.reduce(function (a, r, i) { return a + r * o.w[i]; }, 0), g = gradeFor(o.th, Math.round(total));
        var order = Object.keys(o.th).sort(function (a, b) { return o.th[a] - o.th[b]; }), next = order.filter(function (x) { return o.th[x] > Math.round(total); })[0];
        var at = Math.round(total), pct = function (v) { return Math.min(100, v / o.max * 100); };
        out.innerHTML = '<div class="gc-head"><div class="gc-badge' + (filled ? '' : ' empty') + '"><b>' + (filled ? g : "?") + '</b><span>grade</span></div><div class="gc-sum">' +
            '<span class="label-caps">Estimated grade · ' + esc(s.name) + '</span>' +
            '<p class="gc-line">' + (filled ? 'Weighted mark <b>' + at + '</b> out of ' + o.max + (next ? '. <b>' + (o.th[next] - at) + '</b> more weighted marks for <b>' + next + '</b>.' : '. Top grade reached.') : 'Type your marks to see your grade.') + '</p></div></div>' +
          '<div class="gc-scale" aria-hidden="true"><div class="gc-track"><i style="width:' + (filled ? pct(at) : 0) + '%"></i></div>' +
            order.map(function (x) { return '<span class="gc-tick' + (x === g && filled ? ' hit' : '') + '" style="left:' + pct(o.th[x]) + '%"><b>' + x + '</b><small>' + o.th[x] + '</small></span>'; }).join("") +
            (filled ? '<span class="gc-you" style="left:' + pct(at) + '%">You</span>' : '') + '</div>' +
          '<div class="gc-papers">' + o.comps.map(function (c, i) {
            var cm = s.comps[c], pg = gradeFor(cm.th, raw[i]);
            return '<div class="gc-paper"><div class="gc-pt"><b>Paper ' + c.charAt(0) + '</b><span>' + (filled ? raw[i] + ' / ' + cm.max : '– / ' + cm.max) + '</span><em>' + (filled ? (pg === "U" ? "U" : pg) : "") + '</em></div><div class="gc-pbar"><i style="width:' + (raw[i] / cm.max * 100) + '%"></i></div></div>';
          }).join("") + '</div>';
      }
      subj.addEventListener("change", fillSeries); ser.addEventListener("change", fillOptions); opt.addEventListener("change", fillMarks);
      fillSeries();
    }).catch(function () { app.innerHTML = '<main class="page"><div class="wrap"><div class="panel empty"><h3>The grade thresholds could not load</h3><p>Check your connection and refresh the page.</p></div></div></main>'; });
  }
  window.BE_grades = { view: view };
})();
