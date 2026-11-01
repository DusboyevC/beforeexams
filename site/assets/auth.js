/* BeforeExams accounts.
   Papers and topical PDFs open only for signed-in users. Everything else (menus, names, revision notes) is open.
   After a password sign-in the session lasts 10 days, then the password is asked again.
   Until SUPABASE_URL and SUPABASE_ANON_KEY are set in config.js, the lock is off and the site behaves as before. */
(function () {
  "use strict";
  var URL_ = window.SUPABASE_URL || "", KEY = window.SUPABASE_ANON_KEY || "", SIGNER = window.PDF_SIGNER || "";
  var TEN_DAYS = 10 * 24 * 3600 * 1000;
  var enabled = Boolean(URL_ && KEY);
  var emailLink = (location.hash.match(/type=(recovery|signup)/) || [])[1] || "";   // arrived from a confirm or reset email
  var GATE_DAYS = 15;   // logged-in students enter the site password this often
  var client = null, user = null, session = null, listeners = [], pendingAfterLogin = null, guestPw = "";
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function emit() { listeners.forEach(function (f) { try { f(user); } catch (e) {} }); renderAccount(); }

  var ready = new Promise(function (resolve) {
    if (!enabled) { resolve(); return; }
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
    s.onload = function () {
      client = window.supabase.createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true } });
      client.auth.getSession().then(function (r) {
        session = r.data.session; user = session ? session.user : null;
        if (user && emailLink) store("be-pw-at", String(Date.now()));
        var at = +store("be-pw-at") || 0;
        if (user && Date.now() - at > TEN_DAYS) {      // the 10-day password rule
          return client.auth.signOut().then(function () { session = null; user = null; });
        }
      }).then(function () {
        client.auth.onAuthStateChange(function (ev, s2) { session = s2; user = s2 ? s2.user : null; emit(); });
        emit(); resolve();
        if (emailLink === "recovery" && user) { open(null, "Choose a new password for your account."); setTab("new"); }
      }, function () { resolve(); });
    };
    s.onerror = function () { resolve(); };
    document.head.appendChild(s);
  });

  /* ---------- modal ---------- */
  var modal = null, tab = "in", codeEmail = "", codeKind = "signup";
  function open(after, reason) {
    if (!enabled) { if (after) after(); return; }
    pendingAfterLogin = after || null;
    if (!modal) build();
    modal.querySelector(".auth-reason").textContent = reason || "Log in to see the site password only once every 15 days, take mock tests and track your scores. Revision notes stay free for everyone.";
    setTab("in");
    modal.hidden = false; document.body.classList.add("auth-open");
    setTimeout(function () { var f = modal.querySelector("input:not([hidden])"); if (f) f.focus(); }, 30);
  }
  function close() { if (modal) { modal.hidden = true; document.body.classList.remove("auth-open"); } }
  function showPw(on) {
    var eye = modal.querySelector(".auth-eye");
    modal.querySelector(".auth-pw input").type = on ? "text" : "password";
    eye.setAttribute("aria-pressed", String(on));
    eye.setAttribute("aria-label", on ? "Hide password" : "Show password");
  }
  function setTab(t) {
    tab = t; showPw(false);
    modal.querySelectorAll("[data-tab]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.tab === t)); });
    modal.querySelector(".auth-name").hidden = t !== "up";
    modal.querySelector(".auth-gate").hidden = t !== "up";
    modal.querySelector(".auth-mail").hidden = t === "new" || t === "code";
    modal.querySelector(".auth-tabs").hidden = t === "new" || t === "code";
    modal.querySelector(".auth-pw").hidden = t === "reset" || t === "code";
    modal.querySelector(".auth-code").hidden = t !== "code";
    modal.querySelector(".auth-resend").hidden = t !== "code";
    modal.querySelector(".auth-submit").textContent = { "in": "Log in", up: "Create account", "new": "Save new password", reset: "Send code", code: "Verify code" }[t];
    modal.querySelector(".auth-forgot").hidden = t !== "in";
    modal.querySelector(".auth-msg").textContent = "";
    modal.querySelector(".auth-pw input").setAttribute("autocomplete", t === "in" ? "current-password" : "new-password");
  }
  function msg(text, ok) {
    if (!ok && (!text || text === "{}")) text = "We could not send your email just now. Try again in a minute.";
    var m = modal.querySelector(".auth-msg"); m.textContent = text; m.className = "auth-msg" + (ok ? " ok" : "");
  }
  /* the boxes only show what is in the one real input, so autofill, paste and screen readers keep working */
  function drawCode() {
    var input = modal.querySelector(".auth-code input"), box = modal.querySelector(".code-boxes"), v = input.value;
    var html = "";
    for (var i = 0, n = Math.max(6, v.length); i < n; i++) html += '<i' + (i === v.length ? ' class="on"' : '') + '>' + (v.charAt(i) || "") + '</i>';
    box.innerHTML = html;
  }
  function codeState(name) {
    var box = modal.querySelector(".code-boxes");
    box.classList.remove("bad", "good");
    if (name) { void box.offsetWidth; box.classList.add(name); }
  }
  function askCode(email, kind) {
    codeEmail = email; codeKind = kind; modal.querySelector(".auth-code input").value = "";
    codeState(""); drawCode();
    setTab("code"); msg("We sent a code to " + email + ". Check your spam folder if it is not there.", true);
    modal.querySelector(".auth-code input").focus();
  }
  function sendCode() {
    return codeKind === "recovery" ? client.auth.resetPasswordForEmail(codeEmail) : client.auth.resend({ type: "signup", email: codeEmail });
  }
  function build() {
    modal = document.createElement("div");
    modal.className = "auth-overlay"; modal.hidden = true;
    modal.innerHTML =
      '<div class="auth-card panel" role="dialog" aria-modal="true" aria-labelledby="authTitle">' +
        '<button class="auth-x" type="button" aria-label="Close">×</button>' +
        '<p class="label-caps eyebrow" style="margin:0">BeforeExams account</p>' +
        '<h2 class="font-brand auth-title" id="authTitle">Open every paper</h2>' +
        '<p class="auth-reason"></p>' +
        '<div class="seg auth-tabs" role="tablist"><button role="tab" data-tab="in">Log in</button><button role="tab" data-tab="up">Create account</button></div>' +
        '<form class="auth-form" novalidate>' +
          '<label class="auth-field auth-name"><span>Your name</span><input class="field" name="name" autocomplete="name" maxlength="60"></label>' +
          '<label class="auth-field auth-mail"><span>Email</span><input class="field" name="email" type="email" autocomplete="email" required></label>' +
          '<div class="auth-field auth-pw"><label for="authPw">Password</label><div class="auth-pw-box"><input class="field" id="authPw" name="password" type="password" minlength="8" required>' +
            '<button class="auth-eye" type="button" aria-label="Show password" aria-pressed="false"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path class="auth-eye-off" d="M4 4l16 16"/></svg></button></div></div>' +
          '<label class="auth-field auth-gate"><span>Site password</span><input class="field" name="gate" type="password" autocomplete="off"></label>' +
          '<label class="auth-field auth-code"><span>Code from your email</span><span class="code-wrap"><input name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="8" spellcheck="false"><span class="code-boxes" aria-hidden="true"></span></span></label>' +
          '<p class="auth-msg" role="status" aria-live="polite"></p>' +
          '<button class="mini primary auth-submit" type="submit">Log in</button>' +
          '<button class="auth-link auth-forgot" type="button">Forgot your password?</button>' +
          '<button class="auth-link auth-resend" type="button">Send a new code</button>' +
        '</form>' +
        '<p class="auth-small">You stay logged in on this device for 10 days, then we ask for your password once more.</p>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    modal.querySelector(".auth-x").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
    modal.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { setTab(b.dataset.tab); }); });
    modal.querySelector(".auth-forgot").addEventListener("click", function () { setTab("reset"); });
    modal.querySelector(".auth-eye").addEventListener("click", function () { showPw(modal.querySelector(".auth-pw input").type === "password"); });
    modal.querySelector(".auth-code input").addEventListener("input", function (e) {
      var input = e.target, whole = !e.inputType || e.inputType === "insertFromPaste";   // pasted or filled in by the phone
      input.value = input.value.replace(/\D/g, "").slice(0, 8);
      codeState(""); drawCode();
      if ((input.value.length === 8 || (whole && input.value.length >= 6)) && !modal.querySelector(".auth-submit").disabled) input.form.requestSubmit();
    });
    modal.querySelector(".auth-resend").addEventListener("click", function () {
      sendCode().then(function (r) { if (r.error) msg(r.error.message); else msg("New code sent to " + codeEmail + ".", true); });
    });
    modal.querySelector(".auth-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, email = f.email.value.trim(), pw = f.password.value, name = f.name.value.trim();
      var code = f.code.value.trim();
      if (tab === "code" && !/^\d{6,8}$/.test(code)) { msg("Enter the code from your email."); return; }
      if (tab !== "new" && tab !== "code" && !/^\S+@\S+\.\S+$/.test(email)) { msg("Enter a valid email address."); return; }
      if (tab !== "reset" && tab !== "code" && pw.length < 8) { msg("Passwords are at least 8 characters."); return; }
      var btn = modal.querySelector(".auth-submit"); btn.disabled = true;
      var done = function () { btn.disabled = false; };
      ready.then(function () {
        if (!client) { msg("Accounts are not available right now. Try again in a minute."); done(); return; }
        if (tab === "reset") {
          client.auth.resetPasswordForEmail(email).then(function (r) {
            done(); if (r.error) msg(r.error.message); else askCode(email, "recovery");
          });
          return;
        }
        if (tab === "code") {
          client.auth.verifyOtp({ email: codeEmail, token: code, type: codeKind }).then(function (r) {
            done();
            if (r.error) { codeState("bad"); msg("That code is wrong or has expired. Check it, or send a new one."); return; }
            store("be-pw-at", String(Date.now()));
            session = r.data.session; user = r.data.user; emit();
            if (codeKind === "recovery") { setTab("new"); msg("Choose a new password.", true); return; }
            codeState("good"); msg("Verified", true); btn.disabled = true;
            setTimeout(function () {
              btn.disabled = false; codeState(""); close();
              var after = pendingAfterLogin; pendingAfterLogin = null;
              if (after) after(); else location.hash = "#/account";
            }, 650);
          });
          return;
        }
        if (tab === "new") {
          client.auth.updateUser({ password: pw }).then(function (r) {
            done(); if (r.error) { msg(r.error.message); return; }
            store("be-pw-at", String(Date.now())); emailLink = ""; close();
            var after = pendingAfterLogin; pendingAfterLogin = null; if (after) after();
          });
          return;
        }
        var gate = tab === "up" ? checkPassword(f.gate.value) : Promise.resolve(true);
        gate.then(function (ok) {
          if (!ok) throw new Error("gate");
          if (tab === "up") store("be-gate-at", String(Date.now()));
          return tab === "up"
            ? client.auth.signUp({ email: email, password: pw, options: { data: { name: name } } })
            : client.auth.signInWithPassword({ email: email, password: pw });
        }).then(function (r) {
          done();
          if (r.error && r.error.message === "Email not confirmed") {
            codeEmail = email; codeKind = "signup";
            sendCode().then(function () { askCode(email, "signup"); });
            return;
          }
          if (r.error) { msg(r.error.message === "Invalid login credentials" ? "That email and password don't match. Try again or reset your password." : r.error.message); return; }
          if (tab === "up" && !r.data.session) {
            if (r.data.user && r.data.user.identities && !r.data.user.identities.length) { setTab("in"); msg("This email already has an account. Log in instead."); return; }
            askCode(email, "signup"); return;
          }
          store("be-pw-at", String(Date.now()));
          session = r.data.session; user = r.data.user; emit(); close();
          var after = pendingAfterLogin; pendingAfterLogin = null; if (after) after();
        }).catch(function (e) {
          done();
          msg(e.message === "gate" ? "That site password is not right." : "We could not check that just now. Try again in a minute.");
        });
      });
    });
  }

  /* ---------- header account button ---------- */
  function renderAccount() {
    var host = document.getElementById("accountSlot");
    if (!host || !enabled) return;
    if (user) {
      var nm = (user.user_metadata && user.user_metadata.name) || user.email;
      host.innerHTML = '<a class="account-avatar" href="#/account" aria-label="Your account" title="Your account">' + esc(String(nm).trim().charAt(0).toUpperCase()) + '</a>';
    } else {
      host.innerHTML = '<button class="nav-link account-btn" type="button" aria-label="Log in or sign up">Log in<span class="account-more"> / Sign up</span></button>';
      host.firstChild.addEventListener("click", function () { open(null, "Log in to see the site password only once every 15 days, take mock tests and track your scores."); });
    }
  }

  /* ---------- PDF links ---------- */
  function signedUrl(path, direct) {
    if (!enabled || !SIGNER) return Promise.resolve(direct);
    return ready.then(function () {
      if (!session && !guestPw) throw new Error("login");
      var headers = session ? { Authorization: "Bearer " + session.access_token } : { "X-Access-Password": guestPw };
      return fetch(SIGNER + "?path=" + encodeURIComponent(path), { headers: headers })
        .then(function (r) { if (r.status === 401) throw new Error("login"); if (!r.ok) throw new Error("denied"); return r.json(); })
        .then(function (j) { return j.url; });
    });
  }
  /* the site password is checked on the papers host, so it never appears in this code */
  function checkPassword(pw) {
    return fetch(SIGNER + "?check=1", { headers: { "X-Access-Password": pw } }).then(function (r) {
      if (r.status === 200) return true;
      if (r.status === 403) return false;
      throw new Error("unavailable");
    });
  }
  function gateOk() { return Date.now() - (+store("be-gate-at") || 0) < GATE_DAYS * 864e5; }

  window.BE_auth = {
    enabled: enabled,
    ready: ready,
    user: function () { return user; },
    allowed: function () { return !enabled || (Boolean(user) && gateOk()); },
    checkPassword: checkPassword,
    passGate: function (pw) { if (user) store("be-gate-at", String(Date.now())); else guestPw = pw; },
    open: open,
    signOut: function () { store("be-pw-at", null); store("be-gate-at", null); return client.auth.signOut(); },
    db: function (table) { return client.from(table); },
    rpc: function (name, args) { return client.rpc(name, args); },
    onChange: function (f) { listeners.push(f); },
    signedUrl: signedUrl
  };
  document.addEventListener("DOMContentLoaded", renderAccount);
  renderAccount();
})();
