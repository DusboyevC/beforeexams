/* owner-only admin page and the visit counter. The server decides who can read the numbers. */
(function () {
  var auth = window.BE_auth;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function n(x) { return Number(x || 0).toLocaleString(); }
  function dayLabel(d) { return new Date(d + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }

  /* one visit per browser session, one visitor per browser per day. Local testing is not counted */
  function logVisit() {
    if (!auth || !auth.enabled || !/netlify\.app$/.test(location.hostname)) return;
    try {
      if (sessionStorage.getItem("be-visit")) return;
      sessionStorage.setItem("be-visit", "1");
    } catch (e) {}
    var today = new Date().toISOString().slice(0, 10), fresh = store("be-seen-day") !== today;
    store("be-seen-day", today);
    auth.ready.then(function () { return auth.rpc("be_log_visit", { new_visitor: fresh }); }).catch(function () {});
  }

  function check() {
    var link = document.getElementById("adminLink");
    if (!link || !auth || !auth.enabled) return;
    if (!auth.user()) { link.hidden = true; return; }
    auth.rpc("be_is_admin").then(function (r) { link.hidden = r.data !== true; });
  }

  function chart(days) {
    var max = Math.max.apply(null, days.map(function (d) { return Math.max(d.visits, d.visitors); }).concat(1));
    function bar(v, cls) { return '<i class="' + cls + '" style="height:' + (v ? Math.max(2, v / max * 100) : 0) + '%"></i>'; }
    var last = days.length - 1, step = Math.ceil(days.length / 6);
    var bars = days.map(function (d) {
      var tip = dayLabel(d.day) + ": " + n(d.visits) + " visits, " + n(d.visitors) + " visitors";
      return '<div class="sn-col" tabindex="0" aria-label="' + tip + '" data-tip="' + tip + '">' + bar(d.visits, "v") + bar(d.visitors, "u") + '</div>';
    }).join("");
    var axis = days.map(function (d, i) {
      return '<span>' + (i === last ? "Today" : i % step === 0 && last - i >= step ? dayLabel(d.day) : "") + '</span>';
    }).join("");
    return '<div class="sn-legend"><span class="v">Visits</span><span class="u">Visitors</span></div>' +
      '<div class="sn-chart"><span class="sn-max">' + n(max) + '</span><div class="sn-bars">' + bars + '</div><div class="sn-tip" id="snTip" hidden></div></div>' +
      '<div class="sn-axis">' + axis + '</div>';
  }

  function tile(v, label) { return '<div class="panel stat"><b>' + v + '</b><span>' + label + '</span></div>'; }

  function page(app, s, reports) {
    var days = (s.days || []).filter(function (d) { return !s.first_day || d.day >= s.first_day; });
    var since = s.first_day ? "Counting since " + dayLabel(s.first_day) + "." : "No visits counted yet.";
    app.innerHTML = '<main class="page"><div class="wrap about admin">' +
      '<p class="label-caps eyebrow">Admin</p><h1 class="hero">Site numbers</h1>' +
      '<h2 class="explain-title">Accounts</h2><div class="stats">' +
        tile(n(s.accounts), "registered") + tile(n(s.new7), "new in 7 days") + tile(n(s.new30), "new in 30 days") + tile(n(s.active7), "signed in, 7 days") + '</div>' +
      '<p class="st-note">' + n(s.igcse) + ' IGCSE and ' + n(s.alevel) + ' A Level students have set their level. ' + n(s.unconfirmed) + ' sign-ups never confirmed their code.</p>' +
      '<h2 class="explain-title">Visits</h2><div class="stats">' +
        tile(n(s.today), "visits today") + tile(n(s.visitors_today), "visitors today") + tile(n(s.visits7), "visits, 7 days") + tile(n(s.visits), "visits in total") + '</div>' +
      (days.length ? '<section class="panel st-box"><h2>Visits and visitors per day</h2>' + chart(days) +
        '<details class="sn-table"><summary>Show as a table</summary><div class="table-wrap"><table class="tbl"><thead><tr><th>Day</th><th>Visits</th><th>Visitors</th></tr></thead><tbody>' +
        days.slice().reverse().map(function (d) { return '<tr><td>' + dayLabel(d.day) + '</td><td>' + n(d.visits) + '</td><td>' + n(d.visitors) + '</td></tr>'; }).join("") +
        '</tbody></table></div></details></section>' : '') +
      '<p class="st-note">' + since + ' A visit is one browser session. A visitor is one browser per day, in Tashkent time.</p>' +
      reportsBox(reports) + '</div></main>' + window.BE_lib.footer();
    window.scrollTo(0, 0);
    var tip = document.getElementById("snTip");
    if (!tip) return;
    var box = tip.parentNode;
    function show(e) {
      var c = e.target.closest && e.target.closest(".sn-col");
      if (!c) { tip.hidden = true; return; }
      tip.textContent = c.getAttribute("data-tip");
      tip.hidden = false;
      var r = c.getBoundingClientRect(), b = box.getBoundingClientRect();
      tip.style.left = Math.min(Math.max(0, r.left - b.left + r.width / 2 - tip.offsetWidth / 2), b.width - tip.offsetWidth) + "px";
    }
    box.addEventListener("mouseover", show);
    box.addEventListener("focusin", show);
    box.addEventListener("mouseleave", function () { tip.hidden = true; });
  }

  function esc(s) { return window.BE_lib.esc(s || ""); }
  function reportsBox(list) {
    return '<h2 class="explain-title">Mistake reports</h2><section class="panel st-box"><h2>' + (list.length ? n(list.length) + ' waiting' : 'Nothing waiting') + '</h2>' +
      list.map(function (r) {
        return '<div class="sn-report"><div><a href="#/view/' + esc(r.item_id) + '">' + esc(r.title) + '</a><p>' + esc(r.kind) + (r.question ? ', question ' + esc(r.question) : '') + ' · ' + dayLabel(r.created_at.slice(0, 10)) + '</p>' + (r.note ? '<p>' + esc(r.note) + '</p>' : '') + '</div>' +
          '<button class="mini" type="button" data-done="' + r.id + '">Mark done</button></div>';
      }).join("") + '</section>';
  }

  /* the report form opened from any paper or topical */
  function report(id, title) {
    if (document.getElementById("reportWrap")) return;
    var back = document.activeElement, wrap = document.createElement("div");
    wrap.id = "reportWrap"; wrap.className = "auth-overlay";
    wrap.innerHTML = '<form class="panel report-box" role="dialog" aria-modal="true" aria-labelledby="reportTitle"><h2 id="reportTitle">Report a mistake</h2><p class="st-note">' + esc(title) + '</p>' +
      '<label for="repKind">What is wrong?</label><select class="field" id="repKind"><option>Wrong topic</option><option>Wrong or missing answer</option><option>Question cut off or unreadable</option><option>Something else</option></select>' +
      '<label for="repQ">Question number, if you know it</label><input class="field" id="repQ" maxlength="20" inputmode="numeric" autocomplete="off">' +
      '<label for="repNote">Anything else? (optional)</label><textarea class="field" id="repNote" maxlength="500"></textarea>' +
      '<p class="st-error" id="repErr" role="alert"></p><div class="report-actions"><button class="mini" type="button" id="repCancel">Cancel</button><button class="mini primary" type="submit" id="repSend">Send report</button></div></form>';
    document.body.appendChild(wrap);
    function close() { wrap.remove(); document.removeEventListener("keydown", key); if (back && back.focus) back.focus(); }
    function key(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", key);
    wrap.addEventListener("mousedown", function (e) { if (e.target === wrap) close(); });
    document.getElementById("repCancel").addEventListener("click", close);
    document.getElementById("repKind").focus();
    wrap.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var send = document.getElementById("repSend"), err = document.getElementById("repErr");
      send.disabled = true; err.textContent = "";
      auth.rpc("be_report", { item: id, item_title: title, report_kind: document.getElementById("repKind").value, q: document.getElementById("repQ").value.trim(), msg: document.getElementById("repNote").value.trim() }).then(function (r) {
        if (r.error) throw r.error;
        wrap.querySelector("form").innerHTML = '<h2>Thank you</h2><p class="st-note">Your report was sent. We check every one.</p><div class="report-actions"><button class="mini primary" type="button" id="repClose">Close</button></div>';
        document.getElementById("repClose").addEventListener("click", close);
        document.getElementById("repClose").focus();
      }).catch(function () { send.disabled = false; err.textContent = "That didn't send. Check your connection and try again."; });
    });
  }

  function view(app) {
    function deny() { app.innerHTML = '<main class="page"><div class="wrap account-page"><div class="panel empty"><h3>This page isn&rsquo;t available</h3><p><a class="mini" href="#/">Back to the library</a></p></div></div></main>' + window.BE_lib.footer(); }
    if (!auth || !auth.user()) { deny(); return; }
    app.innerHTML = '<main class="page"><div class="wrap"><p class="lede">Loading…</p></div></main>';
    Promise.all([auth.rpc("be_admin_stats"), auth.rpc("be_admin_reports")]).then(function (r) {
      if (r[0].error || !r[0].data) { deny(); return; }
      page(app, r[0].data, r[1].data || []);
      app.querySelectorAll("[data-done]").forEach(function (b) {
        b.addEventListener("click", function () {
          b.disabled = true;
          auth.rpc("be_report_done", { report: +b.dataset.done }).then(function (x) { if (x.error) b.disabled = false; else view(app); });
        });
      });
    }, deny);
  }

  window.BE_admin = { view: view, check: check, report: report };
  logVisit();
  check();
})();
