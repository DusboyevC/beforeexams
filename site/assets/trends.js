/* trends tab: how often each topic and question type appears, year by year */
(function () {
  var TAG = { up: "▲ Rising", down: "▼ Falling", "new": "New", gone: "Not seen lately", "": "Steady" };
  var cache = {};
  function esc(s) { return window.BE_lib.esc(s); }
  function pct(r, i, totals) { return totals[i] ? r.counts[i] / totals[i] * 100 : null; }
  function fmt(v) { return (Math.round(v * 10) / 10).toFixed(1) + "%"; }
  function pts(c) { return (c > 0 ? "+" : "") + c.toFixed(1) + " pts"; }

  function spark(r, totals) {
    var v = r.counts.map(function (_, i) { return pct(r, i, totals); });
    var max = Math.max.apply(null, v.concat(1)), line = [];
    v.forEach(function (x, i) { if (x !== null) line.push((i / (v.length - 1) * 76 + 2).toFixed(1) + "," + (20 - x / max * 18).toFixed(1)); });
    return '<svg class="tr-spark" width="80" height="22" viewBox="0 0 80 22" aria-hidden="true"><polyline points="' + line.join(" ") + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
  }

  function chart(box, r, totals, years, unit) {
    var W = Math.max(280, box.clientWidth), H = 220, L = 38, R = 20, T = 12, B = 26;
    var v = r.counts.map(function (_, i) { return pct(r, i, totals); });
    var top = Math.max.apply(null, v.concat(1));
    var step = [1, 2, 5, 10, 20, 25, 50].filter(function (s) { return top / s <= 5; })[0] || 100;
    top = Math.ceil(top / step) * step;
    function X(i) { return L + i / (years.length - 1) * (W - L - R); }
    function Y(x) { return T + (1 - x / top) * (H - T - B); }
    var grid = "", line = "", dots = "", labels = "";
    for (var g = 0; g <= top + 1e-9; g += step) grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" class="tr-grid"/><text x="' + (L - 6) + '" y="' + (Y(g) + 4) + '" text-anchor="end" class="tr-ax">' + g + '%</text>';
    var every = W < 460 ? 2 : 1;
    years.forEach(function (y, i) {
      if ((years.length - 1 - i) % every === 0) labels += '<text x="' + X(i) + '" y="' + (H - 7) + '" text-anchor="middle" class="tr-ax">' + y + '</text>';
      if (v[i] === null) return;
      line += (line ? "L" : "M") + X(i).toFixed(1) + " " + Y(v[i]).toFixed(1);
      dots += '<circle cx="' + X(i) + '" cy="' + Y(v[i]) + '" r="4" class="tr-dot"/>';
    });
    box.innerHTML = '<svg width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(r.name) + ', share of ' + unit + ' per year">' + grid + labels +
      '<path d="' + line + '" class="tr-line"/>' + dots + '<line class="tr-cross" y1="' + T + '" y2="' + (H - B) + '" hidden/></svg><div class="ad-tip tr-tip" hidden></div>';
    var cross = box.querySelector(".tr-cross"), tip = box.querySelector(".tr-tip");
    function move(e) {
      var b = box.getBoundingClientRect(), x = (e.touches ? e.touches[0].clientX : e.clientX) - b.left;
      var i = Math.round((x - L) / (W - L - R) * (years.length - 1));
      i = Math.min(years.length - 1, Math.max(0, i));
      cross.removeAttribute("hidden"); cross.setAttribute("x1", X(i)); cross.setAttribute("x2", X(i));
      tip.hidden = false;
      tip.textContent = years[i] + ": " + (v[i] === null ? "no papers" : fmt(v[i]) + " (" + r.counts[i] + " of " + totals[i] + " " + unit + ")");
      tip.style.left = Math.min(Math.max(0, X(i) - tip.offsetWidth / 2), W - tip.offsetWidth) + "px";
    }
    function leave() { cross.setAttribute("hidden", ""); tip.hidden = true; }
    box.addEventListener("mousemove", move);
    box.addEventListener("touchstart", move, { passive: true });
    box.addEventListener("mouseleave", leave);
  }

  function table(rows, label, nowHead, chosen) {
    return '<div class="table-wrap"><table class="tbl tr-table"><thead><tr><th>' + label + '</th><th>' + nowHead + '</th><th>Change</th><th>Status</th><th>By year</th></tr></thead><tbody>' +
      rows.map(function (r, i) {
        return '<tr' + (i === chosen ? ' class="on"' : '') + '><td><button type="button" class="tr-pick" data-i="' + i + '" aria-pressed="' + (i === chosen) + '">' + esc(r.name) + '</button></td><td>' + fmt(r.now) + '</td><td>' + pts(r.change) + '</td><td>' + TAG[r.tag] + '</td><td>__S' + i + '__</td></tr>';
      }).join("") + '</tbody></table></div>';
  }

  function moves(g, a, b) {
    function list(tag, sign) {
      var x = g.topics.filter(function (r) { return r.tag === tag; }).sort(function (p, q) { return sign * (q.change - p.change); }).slice(0, 5);
      return x.length ? '<ul class="tr-moves">' + x.map(function (r) { return '<li><span>' + esc(r.name) + '</span><b>' + pts(r.change) + '</b></li>'; }).join("") + '</ul>' : '<p class="st-note">No clear change between ' + b + ' and ' + a + '.</p>';
    }
    return '<div class="tr-two"><section class="panel st-box"><h2>▲ Asked more</h2>' + list("up", 1) + '</section><section class="panel st-box"><h2>▼ Asked less</h2>' + list("down", -1) + '</section></div>';
  }

  function block(el, rows, totals, years, unit, title, label, nowHead) {
    var chosen = 0;
    var first = rows.reduce(function (best, r, i) { return best < 0 && (r.tag === "up" || r.tag === "new") ? i : best; }, -1);
    if (first >= 0) chosen = first;
    function draw() {
      var html = table(rows, label, nowHead, chosen);
      rows.forEach(function (r, i) { html = html.replace("__S" + i + "__", spark(r, totals)); });
      el.innerHTML = '<h2>' + esc(title) + '</h2><p class="st-note">' + esc(rows[chosen].name) + ', share of ' + unit + ' each year. Pick any row to see it here.</p><div class="tr-chart"></div>' + html;
      chart(el.querySelector(".tr-chart"), rows[chosen], totals, years, unit);
      el.querySelectorAll(".tr-pick").forEach(function (b) { b.addEventListener("click", function () { chosen = +b.dataset.i; draw(); }); });
    }
    draw();
  }

  function show(el, d, gi) {
    var g = d.groups[gi], ys = d.years, n = ys.length;
    var a = ys[n - 3] + "–" + ys[n - 1], b = ys[n - 6] + "–" + ys[n - 4];
    el.innerHTML = '<div class="chips">' + d.groups.map(function (x, i) { return '<button class="chip" data-g="' + i + '" aria-pressed="' + (i === gi) + '">' + esc(x.name) + '</button>'; }).join("") + '</div>' +
      moves(g, a, b) +
      '<section class="panel st-box" id="trTopics"></section>' +
      (g.types.length ? '<section class="panel st-box" id="trTypes"></section>' : '<p class="st-note">Question types aren&rsquo;t shown here' + (g.hits && g.hits.some(Boolean) ? ', because multiple choice questions have no command words.' : ' yet.') + '</p>') +
      '<section class="panel st-box"><h2>How to read this</h2><ul class="static-list"><li>The share is how many of a year&rsquo;s questions touch a topic. One question can count for several topics, so shares can add up to more than 100%.</li>' +
      '<li>Change compares ' + a + ' with ' + b + ', in percentage points. Rising or Falling appears only when the change is too big to be chance.</li>' +
      '<li>' + ys[n - 1] + ' only includes the exam series released so far. A New topic can simply mean Cambridge changed the syllabus.</li>' +
      '<li>Question types count command words such as Explain or Calculate in the papers.</li><li>Trends show the past, not what comes next, so keep revising the whole syllabus.</li></ul></section>';
    block(el.querySelector("#trTopics"), g.topics, g.totals, ys, "questions", "Topics", "Topic", a);
    if (g.types.length) block(el.querySelector("#trTypes"), g.types, g.hits, ys, "command words", "Question types", "Type", a);
    el.querySelectorAll("[data-g]").forEach(function (c) { c.addEventListener("click", function () { show(el, d, +c.dataset.g); }); });
  }

  function mount(s) {
    var el = document.getElementById("trendsBox");
    if (!el) return;
    (cache[s.key] || (cache[s.key] = fetch("/assets/trends/" + s.key + ".json").then(function (r) { if (!r.ok) throw 0; return r.json(); }))).then(function (d) {
      if (document.getElementById("trendsBox") === el) show(el, d, 0);
    }).catch(function () {
      delete cache[s.key];
      el.innerHTML = '<div class="panel empty"><h3>Trends couldn&rsquo;t load</h3><p>Check your connection and refresh the page.</p></div>';
    });
  }
  window.BE_trends = { mount: mount };
})();
