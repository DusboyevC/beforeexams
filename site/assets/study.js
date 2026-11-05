/* BeforeExams study tracker: profile, exam dates, scores and timed mock tests.
   Data lives in Supabase (see supabase_setup.sql). Row level security keeps each student's rows private. */
(function () {
  "use strict";
  var S = { uid: null, profile: null, dates: [], scores: [], loaded: false, missing: false, failed: false, editing: false };
  var loading = null, clock = null;
  var KIND = { paper: "Past paper", topical: "Topical", mock: "Mock test" };
  var SESSIONS = ["Feb/Mar", "May/Jun", "Oct/Nov"];

  function L() { return window.BE_lib; }
  function esc(s) { return L().esc(s); }
  function db(t) { return window.BE_auth.db(t); }
  function pct(r) { return Math.round(r.marks / r.total * 100); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()); }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function day(s) { return new Date(s + "T00:00:00"); }
  function daysTo(s) { return Math.ceil((day(s) - day(today())) / 864e5); }
  function nice(s) { return day(s).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  function subjectName(key) { var x = L().subj(key); return x ? (x.level === "ig" ? "IGCSE " : "A Level ") + x.name : key; }
  function average(list) { return list.length ? Math.round(list.reduce(function (a, r) { return a + r.marks / r.total * 100; }, 0) / list.length) : null; }

  /* ---------- data ---------- */
  function reset() { S.profile = null; S.dates = []; S.scores = []; S.loaded = false; S.missing = false; S.failed = false; S.editing = false; loading = null; }
  function load() {
    var u = window.BE_auth && window.BE_auth.user();
    if (!u) { reset(); S.uid = null; return Promise.resolve(); }
    if (S.uid !== u.id) { reset(); S.uid = u.id; }
    if (S.loaded) return Promise.resolve();
    if (loading) return loading;
    loading = Promise.all([
      db("profiles").select("*").eq("id", u.id).maybeSingle(),
      db("exam_dates").select("*").order("exam_date"),
      db("scores").select("*").order("taken_on", { ascending: false }).order("created_at", { ascending: false }).limit(2000)
    ]).then(function (r) {
      var bad = r[0].error || r[1].error || r[2].error;
      if (bad) {
        if (/42P01|PGRST20[0-9]/.test(bad.code || "")) S.missing = true; else S.failed = true;
        loading = null; return;
      }
      S.profile = r[0].data; S.dates = r[1].data || []; S.scores = r[2].data || []; S.loaded = true; loading = null;
      saveLevel();
      if (document.body.getAttribute("data-view") === "library") L().render();
    }, function () { S.failed = true; loading = null; });
    return loading;
  }
  /* the level picked in the library goes on the account, so nobody has to choose it twice */
  function saveLevel() {
    var lv = L().store("be-level");
    if ((S.profile && S.profile.level) || (lv !== "ig" && lv !== "al")) return;
    db("profiles").upsert({ id: S.uid, level: lv, updated_at: new Date().toISOString() }).select().single().then(function (r) { if (!r.error) S.profile = r.data; });
  }
  function myExams() { return S.dates.filter(function (d) { return daysTo(d.exam_date) >= 0; }); }

  /* ---------- pieces ---------- */
  function statStrip() {
    var n = S.scores.length, next = myExams()[0];
    return '<div class="strip">' +
      '<div class="panel tile"><b>' + n + '</b><span>scores logged</span></div>' +
      '<div class="panel tile"><b>' + (n ? average(S.scores) + "%" : "–") + '</b><span>average score</span></div>' +
      '<div class="panel tile"><b>' + streak() + '</b><span>day streak</span></div>' +
      '<div class="tile tile-pop"><b>' + (next ? daysTo(next.exam_date) : "–") + '</b><span>' + (next ? "days to " + esc(subjectName(next.subject)) : "no exam date yet") + '</span></div></div>';
  }
  function streak() {
    var seen = {}, n = 0, d = new Date();
    S.scores.forEach(function (r) { seen[r.taken_on] = 1; });
    var key = function () { return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()); };
    if (!seen[key()]) d.setDate(d.getDate() - 1);
    while (seen[key()]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function heatmap() {
    var counts = {}, weeks = 18, d = new Date(), cells = "";
    S.scores.forEach(function (r) { counts[r.taken_on] = (counts[r.taken_on] || 0) + 1; });
    d.setDate(d.getDate() - d.getDay() - (weeks - 1) * 7);
    for (var w = 0; w < weeks; w++) {
      cells += '<div class="heat-week">';
      for (var i = 0; i < 7; i++) {
        var k = d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()), c = counts[k] || 0, later = k > today();
        cells += '<span class="heat-cell' + (later ? " later" : "") + '" data-n="' + Math.min(c, 4) + '"' + (later ? "" : ' data-tip="' + nice(k) + ": " + c + (c === 1 ? " score" : " scores") + '"') + '></span>';
        d.setDate(d.getDate() + 1);
      }
      cells += "</div>";
    }
    return '<section class="panel st-box"><h2>Activity</h2><p class="st-note">Each square is a day. Darker green means more scores logged.</p><div class="heat">' + cells + "</div></section>";
  }
  function lineChart(rows, target) {
    var W = 320, H = 120, l = 30, r = 10, t = 10, b = 16, list = rows.slice(-20);
    var x = function (i) { return list.length < 2 ? (l + W - r) / 2 : l + i * (W - l - r) / (list.length - 1); };
    var y = function (v) { return t + (100 - v) * (H - t - b) / 100; };
    var grid = [0, 50, 100].map(function (v) { return '<line class="ch-grid" x1="' + l + '" x2="' + (W - r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="ch-axis" x="' + (l - 6) + '" y="' + (y(v) + 3.5) + '" text-anchor="end">' + v + "</text>"; }).join("");
    var goal = target ? '<line class="ch-target" x1="' + l + '" x2="' + (W - r) + '" y1="' + y(target) + '" y2="' + y(target) + '"/>' : "";
    var path = list.map(function (p, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(pct(p)).toFixed(1); }).join(" ");
    var dots = list.map(function (p, i) {
      return '<circle class="ch-dot" cx="' + x(i).toFixed(1) + '" cy="' + y(pct(p)).toFixed(1) + '" r="4"/>' +
        '<circle class="ch-hit" cx="' + x(i).toFixed(1) + '" cy="' + y(pct(p)).toFixed(1) + '" r="13" tabindex="0" data-tip="' + esc(p.label) + ": " + pct(p) + "% on " + nice(p.taken_on) + '"/>';
    }).join("");
    return '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Score percentage over time, ' + list.length + ' scores">' + grid + goal +
      (list.length > 1 ? '<path class="ch-line" d="' + path + '"/>' : "") + dots + "</svg>";
  }
  function isPractice(r) { return /\(online practice\)$/.test(r.label || ""); }
  /* multiple choice practice: per topic accuracy, rounds and best score, then the latest rounds */
  function practiceParts(r) {   // "Topic · 2025, 2026 (online practice)" -> [topic, years]; older rounds have no years
    var t = (r.label || "").replace(/ \(online practice\)$/, ""), i = t.lastIndexOf(" · ");
    return i > 0 ? [t.slice(0, i), t.slice(i + 3)] : [t, ""];
  }
  function practiceSection() {
    var rows = S.scores.filter(isPractice);
    if (!rows.length) return "";
    var topics = {}, order = [];
    rows.forEach(function (r) {   // newest first, as the scores are loaded
      var k = r.item_id || r.label;
      if (!topics[k]) { topics[k] = { id: r.item_id, name: practiceParts(r)[0], subject: r.subject, rounds: [] }; order.push(k); }
      topics[k].rounds.push(r);
    });
    var cards = order.map(function (k) {
      var t = topics[k], right = 0, total = 0, best = 0;
      t.rounds.forEach(function (r) { right += +r.marks; total += +r.total; best = Math.max(best, pct(r)); });
      var acc = total ? Math.round(right / total * 100) : 0, latest = t.rounds[0];
      var ys = []; t.rounds.forEach(function (r) { (practiceParts(r)[1].match(/\d{4}/g) || []).forEach(function (y) { if (ys.indexOf(+y) < 0) ys.push(+y); }); }); ys.sort();
      return '<div class="pc-topic"><div class="pc-head"><div><b>' + esc(t.name) + '</b><small>' + esc(subjectName(t.subject)) + (ys.length ? ' · years practised: ' + (ys.length > 2 && ys[ys.length - 1] - ys[0] === ys.length - 1 ? ys[0] + ' – ' + ys[ys.length - 1] : ys.join(", ")) : '') + '</small></div>' +
        (t.id && L().byId(t.id) ? '<a class="mini" href="#/practice/' + t.id + '">Practise again</a>' : '') + '</div>' +
        '<div class="pc-bar"><i style="width:' + acc + '%"></i></div>' +
        '<div class="pc-figs"><span><b>' + acc + '%</b> correct overall</span><span><b>' + right + '/' + total + '</b> questions</span><span><b>' + t.rounds.length + '</b> ' + (t.rounds.length === 1 ? "round" : "rounds") + '</span><span>best <b>' + best + '%</b></span><span>latest <b>' + latest.marks + '/' + latest.total + '</b></span></div></div>';
    }).join("");
    var recent = rows.slice(0, 8).map(function (r) {
      var parts = practiceParts(r);
      return '<tr><td>' + esc(parts[0]) + '</td><td>' + esc(parts[1] || "–") + '</td><td>' + esc(nice(r.taken_on)) + '</td><td><b>' + r.marks + '/' + r.total + '</b></td><td>' + pct(r) + '%</td></tr>';
    }).join("");
    return '<section class="panel st-box"><h2>Multiple choice practice</h2><p class="st-note">Every practice round you finish or save early, topic by topic.</p><div class="pc-topics">' + cards + '</div>' +
      '<h3 class="pc-h">Latest rounds</h3><div class="table-wrap"><table class="tbl"><thead><tr><th>Topic</th><th>Years</th><th>Date</th><th>Correct</th><th>Score</th></tr></thead><tbody>' + recent + '</tbody></table></div></section>';
  }
  function subjectCard(key) {
    var rows = S.scores.filter(function (r) { return r.subject === key && !isPractice(r); }).slice().reverse();
    var target = S.profile && S.profile.target_percent;
    var head = '<h3>' + esc(subjectName(key)) + "</h3>";
    if (!rows.length) return '<div class="panel st-subject">' + head + '<p class="st-note">No scores yet. Log one below, or start a mock test.</p></div>';
    var last = rows[rows.length - 1], recent = average(rows.slice(-3)), before = rows.length > 3 ? average(rows.slice(-6, -3)) : null;
    var change = before === null ? "" : (recent - before >= 0 ? "+" : "−") + Math.abs(recent - before) + " points on your 3 before";
    var topics = {};
    rows.forEach(function (r) { if (r.topic) (topics[r.topic] = topics[r.topic] || []).push(r); });
    var weak = Object.keys(topics).map(function (k) { return { name: k, avg: average(topics[k]) }; }).sort(function (a, b) { return a.avg - b.avg; }).slice(0, 3);
    var timed = rows.filter(function (r) { return r.minutes; });
    var pace = timed.length ? timed.reduce(function (a, r) { return a + r.minutes / r.total; }, 0) / timed.length : null;
    return '<div class="panel st-subject">' + head +
      '<div class="st-figs"><div><b>' + average(rows) + '%</b><span>average</span></div><div><b>' + pct(last) + '%</b><span>latest</span></div><div><b>' + rows.length + '</b><span>scores</span></div>' +
      (pace ? '<div><b>' + pace.toFixed(1) + '</b><span>min per mark</span></div>' : "") + "</div>" +
      (change ? '<p class="st-note">Last 3 scores: ' + change + "</p>" : "") + lineChart(rows, target) +
      (target ? '<p class="st-note">Dashed line: your ' + target + "% target</p>" : "") +
      (weak.length ? '<div class="st-weak"><p class="st-label">Topics to work on</p>' + weak.map(function (w) {
        return '<div class="st-bar"><span>' + esc(w.name) + '</span><i><u style="width:' + w.avg + '%"></u></i><b>' + w.avg + "%</b></div>";
      }).join("") + "</div>" : "") + "</div>";
  }
  function subjectOptions(selected) {
    var mine = (S.profile && S.profile.subjects) || [], all = L().data().subjects.slice().sort(function (a, b) { return (mine.indexOf(b.key) >= 0) - (mine.indexOf(a.key) >= 0); });
    return all.map(function (x) { return '<option value="' + x.key + '"' + (x.key === selected ? " selected" : "") + ">" + esc(subjectName(x.key)) + "</option>"; }).join("");
  }
  function setupForm() {
    var p = S.profile || {}, lv = S.draftLevel || p.level || "ig", chosen = S.draftSubjects || p.subjects || [];
    var list = L().data().subjects.filter(function (x) { return L().levelOf(x) === lv; });
    var y = new Date().getFullYear(), times = [];
    [y, y + 1, y + 2].forEach(function (yy) { SESSIONS.forEach(function (s) { times.push(s + " " + yy); }); });
    return '<section class="panel st-box" id="setup"><h2>' + (S.profile ? "Your study plan" : "Set up your study plan") + '</h2><p class="st-note">This puts your subjects first and sets your progress targets. You can change it any time.</p>' +
      '<form id="setupForm"><p class="st-label">Level</p><div class="seg" role="group" aria-label="Level">' +
      '<button type="button" data-lv="ig" aria-selected="' + (lv === "ig") + '">IGCSE</button><button type="button" data-lv="al" aria-selected="' + (lv === "al") + '">AS &amp; A Level</button></div>' +
      '<p class="st-label">Subjects</p><div class="chips">' + list.map(function (x) {
        return '<button type="button" class="chip" data-sub="' + x.key + '" aria-pressed="' + (chosen.indexOf(x.key) >= 0) + '">' + esc(x.name) + "</button>";
      }).join("") + '</div><div class="st-row">' +
      '<label><span>Exam session</span><select class="field st-field" name="session"><option value="">Not sure yet</option>' + times.map(function (t) { return "<option" + (t === p.exam_session ? " selected" : "") + ">" + t + "</option>"; }).join("") + "</select></label>" +
      '<label><span>Target score (%)</span><input class="field st-field" name="target" type="number" min="1" max="100" value="' + (p.target_percent || "") + '" placeholder="80"></label></div>' +
      '<p class="st-error" id="setupErr" role="alert"></p><div class="st-actions"><button class="mini primary" type="submit">Save study plan</button>' +
      (S.profile ? '<button class="mini" type="button" id="setupCancel">Cancel</button>' : '<button class="mini" type="button" id="setupSkip">Skip for now</button>') + "</div></form></section>";
  }
  function examSection() {
    var list = myExams();
    return '<section class="panel st-box"><h2>Your exam dates</h2>' +
      (list.length ? '<ul class="st-list">' + list.map(function (d) {
        var n = daysTo(d.exam_date);
        return '<li><b class="st-days">' + (n === 0 ? "Today" : n + (n === 1 ? " day" : " days")) + '</b><span class="st-main">' + esc(subjectName(d.subject)) + (d.paper ? " · " + esc(d.paper) : "") + "<small>" + nice(d.exam_date) + '</small></span><button class="st-del" type="button" data-del-date="' + d.id + '" aria-label="Delete this exam date">Delete</button></li>';
      }).join("") + "</ul>" : '<p class="st-note">Add your real exam dates from your timetable and the countdown will use them.</p>') +
      '<form id="dateForm" class="st-row"><label><span>Subject</span><select class="field st-field" name="subject">' + subjectOptions() + '</select></label>' +
      '<label><span>Paper</span><input class="field st-field" name="paper" maxlength="40" placeholder="Paper 4"></label>' +
      '<label><span>Date</span><input class="field st-field" name="date" type="date" min="' + today() + '" required></label>' +
      '<button class="mini primary" type="submit">Add date</button></form><p class="st-error" id="dateErr" role="alert"></p></section>';
  }
  function logSection(item) {
    var subject = item ? item.subject : "", label = item ? L().itemLabel(item) : "", total = item && item.kind === "paper" ? timing(item)[1] : "";
    var s = L().subj(subject) || L().data().subjects[0];
    return '<section class="panel st-box" id="log"><h2>Log a score</h2><form id="logForm"><div class="st-row">' +
      '<label><span>Subject</span><select class="field st-field" name="subject">' + subjectOptions(subject) + '</select></label>' +
      '<label><span>Type</span><select class="field st-field" name="kind"><option value="paper"' + (item && item.kind === "paper" ? " selected" : "") + '>Past paper</option><option value="topical"' + (item && item.kind === "topical" ? " selected" : "") + '>Topical</option></select></label>' +
      '<label><span>Topic (for topicals)</span><select class="field st-field" name="topic" id="logTopic"><option value="">None</option>' + topicOptions(s, item) + "</select></label></div>" +
      '<div class="st-row"><label class="st-grow"><span>What did you do?</span><input class="field st-field" name="label" maxlength="120" required placeholder="Paper 42, May/Jun 2023" value="' + esc(label) + '"></label>' +
      '<label><span>Marks</span><input class="field st-field" name="marks" type="number" min="0" step="0.5" required></label>' +
      '<label><span>Out of</span><input class="field st-field" name="total" type="number" min="1" step="0.5" required value="' + total + '"></label>' +
      '<label><span>Date</span><input class="field st-field" name="date" type="date" max="' + today() + '" value="' + today() + '" required></label></div>' +
      '<p class="st-error" id="logErr" role="alert"></p><button class="mini primary" type="submit">Save score</button></form></section>';
  }
  function topicOptions(s, item) {
    var pick = item && item.kind === "topical" ? String(item.topic) : "";
    return (s.topics || []).map(function (t) { return '<option value="' + esc(t.name) + '"' + (t.code === pick ? " selected" : "") + ">" + esc(t.name) + "</option>"; }).join("");
  }
  function mockSection() {
    var mine = (S.profile && S.profile.subjects) || [];
    return '<section class="panel st-box"><h2>Take a mock test</h2><p class="st-note">A real past paper under timed conditions, then mark it with the mark scheme. Your score saves here.</p>' +
      '<form id="mockForm" class="st-row"><label class="st-grow"><span>Subject</span><select class="field st-field" name="subject">' + subjectOptions(mine[0]) + '</select></label>' +
      '<button class="mini primary" type="submit">Pick an unseen paper</button></form><p class="st-error" id="mockErr" role="alert"></p></section>';
  }
  function historySection() {
    if (!S.scores.length) return "";
    return '<section class="panel st-box"><h2>Score history</h2><div class="table-wrap"><table class="tbl"><thead><tr><th>Date</th><th>What</th><th>Type</th><th>Score</th><th><span class="sr-only">Delete</span></th></tr></thead><tbody>' +
      S.scores.slice(0, 30).map(function (r) {
        return "<tr><td>" + nice(r.taken_on) + "</td><td>" + esc(r.label) + "<small>" + esc(subjectName(r.subject)) + "</small></td><td>" + KIND[r.kind] + "</td><td><b>" + pct(r) + "%</b> " + r.marks + "/" + r.total + '</td><td><button class="st-del" type="button" data-del-score="' + r.id + '" aria-label="Delete this score">Delete</button></td></tr>';
      }).join("") + "</tbody></table></div></section>";
  }

  /* ---------- account page ---------- */
  function account(app, params) {
    var u = window.BE_auth.user();
    var name = (u.user_metadata && u.user_metadata.name) || u.email.split("@")[0];
    var joined = u.created_at ? new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
    var goal = S.profile && (S.profile.exam_session || S.profile.target_percent);
    var card = '<p class="label-caps eyebrow">Your account</p><section class="panel account-card"><span class="account-big">' + esc(name.trim().charAt(0).toUpperCase()) + '</span><div class="account-who"><h1 class="font-brand">' + esc(name) + "</h1><p>" + esc(u.email) + "</p>" +
      (joined ? '<p class="account-since">Member since ' + esc(joined) + (goal ? " · " + esc([S.profile.exam_session, S.profile.target_percent ? "Target " + S.profile.target_percent + "%" : ""].filter(Boolean).join(" · ")) : "") + "</p>" : "") + '</div>' +
      '<div class="st-actions"><button class="mini" id="editPlan" type="button">Edit study plan</button><button class="mini account-out" id="accountOut" type="button">Log out</button></div></section>';
    var body;
    if (!S.loaded) {
      if (S.missing) body = '<div class="panel empty"><h3>The study tracker is not switched on yet</h3><p>It needs its database tables in Supabase. Your account is safe.</p></div>';
      else if (S.failed) body = '<div class="panel empty"><h3>Your study data could not load</h3><p>Check your connection and try again.</p><p><button class="mini primary" id="retry" type="button">Try again</button></p></div>';
      else { body = '<p class="lede">Loading your study plan…</p>'; load().then(function () { if (/^#\/account/.test(location.hash)) L().render(); }); }
    } else {
      var skipped = L().store("be-setup-skip") === S.uid;
      var showSetup = S.editing || (!(S.profile && S.profile.subjects && S.profile.subjects.length) && !skipped);
      var item = params.get("log") ? L().byId(params.get("log")) : null;
      var keys = ((S.profile && S.profile.subjects) || []).slice();
      S.scores.forEach(function (r) { if (keys.indexOf(r.subject) < 0) keys.push(r.subject); });
      keys = keys.filter(function (k) { return S.scores.some(function (r) { return r.subject === k && !isPractice(r); }) || ((S.profile && S.profile.subjects) || []).indexOf(k) >= 0; });
      body = (showSetup ? setupForm() : "") + statStrip() + examSection() + practiceSection() + mockSection() + logSection(item) +
        (keys.length ? '<div class="st-subjects">' + keys.map(subjectCard).join("") + "</div>" : "") + heatmap() + historySection();
    }
    app.innerHTML = '<main class="page"><div class="wrap account-page">' + card + body + '</div></main><div class="st-tip" id="stTip" hidden></div>' + L().footer();
    bindAccount(app, params);
    if (params.get("log")) { var f = document.getElementById("log"); if (f) f.scrollIntoView({ block: "center" }); }
  }
  function refresh() { var y = scrollY; L().render(); window.scrollTo(0, y); }
  function bindAccount(app, params) {
    var on = function (id, ev, fn) { var el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on("accountOut", "click", function () { window.BE_auth.signOut().then(function () { reset(); location.hash = "#/"; }); });
    on("editPlan", "click", function () { S.editing = true; S.draftLevel = null; S.draftSubjects = null; refresh(); var el = document.getElementById("setup"); if (el) el.scrollIntoView({ block: "center" }); });
    on("retry", "click", function () { S.failed = false; L().render(); });
    on("setupCancel", "click", function () { S.editing = false; refresh(); });
    on("setupSkip", "click", function () { L().store("be-setup-skip", S.uid); refresh(); });
    var chosen = function () { return [].map.call(app.querySelectorAll('[data-sub][aria-pressed="true"]'), function (b) { return b.dataset.sub; }); };
    app.querySelectorAll("[data-lv]").forEach(function (b) { b.addEventListener("click", function () { S.draftLevel = b.dataset.lv; S.draftSubjects = []; S.editing = true; refresh(); }); });
    app.querySelectorAll("[data-sub]").forEach(function (b) { b.addEventListener("click", function () { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); }); });
    on("setupForm", "submit", function (e) {
      e.preventDefault();
      var f = e.target, target = f.target.value ? Number(f.target.value) : null, err = document.getElementById("setupErr");
      var lv = (app.querySelector('[data-lv][aria-selected="true"]') || {}).dataset.lv, subs = chosen();
      if (!subs.length) { err.textContent = "Choose at least one subject."; return; }
      if (target !== null && (target < 1 || target > 100)) { err.textContent = "Enter a target from 1 to 100."; return; }
      var row = { id: S.uid, level: lv, subjects: subs, exam_session: f.session.value || null, target_percent: target, updated_at: new Date().toISOString() };
      db("profiles").upsert(row).select().single().then(function (r) {
        if (r.error) { console.error("Study plan save failed", r.error); err.textContent = "That could not be saved. Try again. (" + [r.error.code, r.error.message].filter(Boolean).join(": ") + ")"; return; }
        S.profile = r.data; S.editing = false; S.draftLevel = null; S.draftSubjects = null; L().store("be-level", lv); L().store("be-last", ""); refresh(); L().toast("Study plan saved");
      });
    });
    on("dateForm", "submit", function (e) {
      e.preventDefault();
      var f = e.target, err = document.getElementById("dateErr");
      if (!f.date.value) { err.textContent = "Choose a date."; return; }
      db("exam_dates").insert({ subject: f.subject.value, paper: f.paper.value.trim() || null, exam_date: f.date.value }).select().single().then(function (r) {
        if (r.error) { err.textContent = "That could not be saved. Try again."; return; }
        S.dates.push(r.data); S.dates.sort(function (a, b) { return a.exam_date < b.exam_date ? -1 : 1; }); refresh(); L().toast("Exam date added");
      });
    });
    var logF = document.getElementById("logForm");
    if (logF) logF.subject.addEventListener("change", function () { document.getElementById("logTopic").innerHTML = '<option value="">None</option>' + topicOptions(L().subj(logF.subject.value)); });
    on("logForm", "submit", function (e) {
      e.preventDefault();
      var f = e.target, err = document.getElementById("logErr"), marks = Number(f.marks.value), total = Number(f.total.value);
      if (!f.label.value.trim()) { err.textContent = "Say what you did, such as Paper 42."; return; }
      if (f.marks.value === "" || !(total > 0)) { err.textContent = "Enter your marks and the total."; return; }
      if (marks > total) { err.textContent = "Marks cannot be more than the total."; return; }
      db("scores").insert({ subject: f.subject.value, kind: f.kind.value, item_id: params.get("log") || null, label: f.label.value.trim(), topic: f.kind.value === "topical" && f.topic.value ? f.topic.value : null, marks: marks, total: total, taken_on: f.date.value }).select().single().then(function (r) {
        if (r.error) { err.textContent = "That could not be saved. Try again."; return; }
        S.scores.unshift(r.data); S.scores.sort(function (a, b) { return a.taken_on < b.taken_on ? 1 : a.taken_on > b.taken_on ? -1 : 0; });
        history.replaceState(null, "", "#/account"); refresh(); L().toast("Score saved");
      });
    });
    on("mockForm", "submit", function (e) {
      e.preventDefault();
      var key = e.target.subject.value, done = {};
      S.scores.forEach(function (r) { if (r.item_id) done[r.item_id] = 1; });
      var pool = L().papers().filter(function (p) { return p.subject === key && !done[p.id]; });
      if (!pool.length) { document.getElementById("mockErr").textContent = "You have done every paper for this subject."; return; }
      location.hash = "#/mock/" + pool[Math.floor(Math.random() * pool.length)].id;
    });
    app.querySelectorAll("[data-del-score]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!window.confirm("Delete this score?")) return;
        db("scores").delete().eq("id", b.dataset.delScore).then(function (r) { if (r.error) return; S.scores = S.scores.filter(function (x) { return x.id !== b.dataset.delScore; }); refresh(); });
      });
    });
    app.querySelectorAll("[data-del-date]").forEach(function (b) {
      b.addEventListener("click", function () {
        db("exam_dates").delete().eq("id", b.dataset.delDate).then(function (r) { if (r.error) return; S.dates = S.dates.filter(function (x) { return x.id !== b.dataset.delDate; }); refresh(); });
      });
    });
    if (app.dataset.tips) return;
    app.dataset.tips = "1";
    var show = function (e) {
      var tip = document.getElementById("stTip");
      if (!tip) return;
      var t = e.target.closest && e.target.closest("[data-tip]");
      if (!t) { tip.hidden = true; return; }
      var r = t.getBoundingClientRect();
      tip.textContent = t.getAttribute("data-tip"); tip.hidden = false;
      tip.style.left = Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, r.left + r.width / 2 - tip.offsetWidth / 2)) + "px";
      tip.style.top = Math.max(8, r.top - tip.offsetHeight - 8) + "px";
    };
    app.addEventListener("mouseover", show); app.addEventListener("focusin", show);
  }

  /* ---------- mock tests ---------- */
  var SCIENCE = { 1: [45, 40], 2: [45, 40], 3: [75, 80], 4: [75, 80], 5: [75, 40], 6: [60, 40] };
  var ALEVEL = { 1: [75, 40], 2: [75, 60], 3: [120, 40], 4: [120, 100], 5: [75, 30] };
  var TIMES = { "0625": SCIENCE, "0620": SCIENCE, "0610": SCIENCE, "0478": { 1: [105, 75], 2: [105, 75] },
    "9702": ALEVEL, "9701": ALEVEL, "9700": ALEVEL, "9709": { 1: [110, 75], 2: [75, 50], 3: [110, 75], 4: [75, 50], 5: [75, 50], 6: [75, 50] },
    "9618": { 1: [90, 75], 2: [120, 75], 3: [90, 75], 4: [150, 75] }, "9608": { 1: [90, 75], 2: [120, 75], 3: [90, 75], 4: [120, 75] } };
  function timing(p) {
    if (p.code === "0580") return (p.year >= 2025 ? { 1: [90, 80], 2: [120, 100], 3: [90, 80], 4: [120, 100] } : { 1: [60, 56], 2: [90, 70], 3: [120, 104], 4: [150, 130] })[p.component] || [90, 80];
    return (TIMES[p.code] || {})[p.component] || [90, 75];
  }
  function stopClock() { if (clock) { clearInterval(clock); clock = null; } }
  function running() { try { return JSON.parse(localStorage.getItem("be-mock")); } catch (e) { return null; } }
  function clearMock() { L().store("be-mock", ""); }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ":" + two(m) : m) + ":" + two(s % 60); }
  function paperTitle(p) { return subjectName(p.subject) + " · Paper " + L().paperNo(p) + " · " + L().SESSION[p.session] + " " + p.year; }
  function mock(app, id) {
    stopClock();
    var p = L().byId(id), m = running();
    if (!p || p.kind !== "paper") { app.innerHTML = '<main class="page"><div class="wrap"><div class="panel empty"><h3>Paper not found</h3><p><a class="mini primary" href="#/account">Back to your account</a></p></div></div></main>'; return; }
    window.scrollTo(0, 0);
    if (!window.BE_auth.allowed() && !L().guestOpen(id)) { L().lock(p); return; }
    var home = window.BE_auth.user() ? "#/account" : "#/";
    if (m && m.id === id) { if (m.ended) marking(app, p, m); else runMock(app, p, m); return; }
    var t = timing(p);
    app.innerHTML = '<main class="page"><div class="wrap account-page"><p class="label-caps eyebrow">Mock test</p><section class="panel st-box"><h1 class="font-brand mock-title">' + esc(paperTitle(p)) + '</h1>' +
      '<ul class="st-rules"><li>Close your notes and clear your desk, like the real exam.</li><li>The timer keeps running if you refresh this page.</li><li>When you finish, the mark scheme opens so you can mark your own work.</li></ul>' +
      (m ? '<p class="st-error">Starting this will end your other unfinished mock test.</p>' : "") +
      '<form id="startForm" class="st-row"><label><span>Time (minutes)</span><input class="field st-field" name="minutes" type="number" min="1" max="300" value="' + t[0] + '" required></label>' +
      '<button class="mini primary" type="submit">Start mock test</button><a class="mini" href="' + home + '">Not now</a></form><p class="st-note">Older papers can have different timings. Follow the front cover of the paper if it differs.</p></section></main>' + L().footer();
    document.getElementById("startForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var mins = Number(e.target.minutes.value) || t[0], now = Date.now();
      var rec = { id: id, start: now, end: now + mins * 6e4 };
      L().store("be-mock", JSON.stringify(rec)); runMock(app, p, rec);
    });
  }
  function runMock(app, p, m) {
    app.innerHTML = '<div class="viewer"><div class="mock-bar"><div class="wrap"><b>' + esc(paperTitle(p)) + '</b><span class="mock-time" id="mockTime" role="timer"></span><button class="mini primary" id="mockEnd" type="button">Finish and mark</button></div></div>' +
      '<div class="viewer-body">' + L().pane("Question paper", p.qp, p.qp.split("/").pop()) + "</div></div>";
    L().hydratePanes();
    var finish = function () { stopClock(); m.ended = Math.min(Date.now(), m.end); L().store("be-mock", JSON.stringify(m)); marking(app, p, m); };
    document.getElementById("mockEnd").addEventListener("click", function () { if (window.confirm("Finish the mock test and see the mark scheme?")) finish(); });
    var el = document.getElementById("mockTime");
    var tick = function () {
      var left = (m.end - Date.now()) / 1000;
      el.textContent = fmt(left); el.classList.toggle("low", left <= 300);
      if (left <= 0) finish();
    };
    tick(); clock = setInterval(tick, 500);
  }
  function marking(app, p, m) {
    var mins = Math.max(1, Math.round((m.ended - m.start) / 6e4)), guest = !window.BE_auth.user();
    app.innerHTML = '<div class="viewer"><div class="mock-bar"><div class="wrap"><b>Mark your paper</b><span class="st-note">Time used: ' + mins + ' min</span></div></div>' +
      '<div class="wrap mock-mark"><form id="markForm" class="st-row"><label><span>Your marks</span><input class="field st-field" name="marks" type="number" min="0" step="0.5" required value="' + (m.marks === undefined ? "" : m.marks) + '"></label>' +
      '<label><span>Out of</span><input class="field st-field" name="total" type="number" min="1" step="0.5" required value="' + (m.total || timing(p)[1]) + '"></label><button class="mini primary" type="submit">Save score</button><button class="mini" type="button" id="markSkip">Discard</button></form><p class="st-error" id="markErr" role="alert"></p>' +
      (guest ? '<p class="st-note">A free account keeps this score and shows your progress over time.</p>' : "") + '</div>' +
      '<div class="viewer-body' + (p.ms ? " split" : "") + '">' + L().pane("Question paper", p.qp, p.qp.split("/").pop()) + (p.ms ? L().pane("Mark scheme", p.ms, p.ms.split("/").pop()) : "") + "</div></div>";
    L().hydratePanes();
    document.getElementById("markSkip").addEventListener("click", function () { if (window.confirm("Discard this mock test without saving?")) { clearMock(); location.hash = guest ? "#/" : "#/account"; } });
    function save(marks, total) {
      db("scores").insert({ subject: p.subject, kind: "mock", item_id: p.id, label: "Paper " + L().paperNo(p) + ", " + L().SESSION[p.session] + " " + p.year, marks: marks, total: total, minutes: mins, taken_on: today() }).select().single().then(function (r) {
        if (r.error) { document.getElementById("markErr").textContent = S.missing ? "The study tracker is not switched on yet." : "That could not be saved. Try again."; return; }
        S.scores.unshift(r.data); clearMock(); location.hash = "#/account";
      });
    }
    document.getElementById("markForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, marks = Number(f.marks.value), total = Number(f.total.value), err = document.getElementById("markErr");
      if (f.marks.value === "" || !(total > 0)) { err.textContent = "Enter your marks and the total."; return; }
      if (marks > total) { err.textContent = "Marks cannot be more than the total."; return; }
      if (window.BE_auth.user()) { save(marks, total); return; }
      m.marks = marks; m.total = total; L().store("be-mock", JSON.stringify(m));   // kept if the account takes a while
      window.BE_auth.open(function () { save(marks, total); }, "Create a free account to save your score of " + marks + "/" + total + " and see your progress.", "up");
    });
  }

  window.BE_study = {
    account: account, mock: mock, load: load, stop: stopClock, reset: reset,
    profile: function () { return S.profile; },
    nextExam: function () { var d = myExams()[0]; return d ? { days: daysTo(d.exam_date), name: subjectName(d.subject) } : null; }
  };
})();
