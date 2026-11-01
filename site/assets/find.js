/* jump to a question inside a topical */
(function () {
  function esc(s) { return window.BE_lib.esc(s); }

  function setPage(pane, page) {
    pane.dataset.page = page;
    var f = pane.querySelector("iframe"), hash = "#page=" + page + "&toolbar=1&navpanes=0";
    if (f && f.getAttribute("src")) {   // the browser's PDF viewer ignores a changed link, so it is replaced; the file itself comes from cache
      var next = f.cloneNode(false);
      next.src = f.src.split("#")[0] + hash;
      f.replaceWith(next);
    }
    pane.querySelectorAll("[data-open]").forEach(function (a) { if (a.getAttribute("href") !== "#") a.href = a.href.split("#")[0] + "#page=" + page; });
  }

  function jump(id, page) {
    var bar = document.getElementById("jumpBar"), pane = document.querySelector(".pane[data-path]");
    if (!bar || !pane) return;
    fetch("/assets/jump/" + id + ".json").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (rows) {
      if (!rows.length || !document.body.contains(bar)) return;
      var at = 0;
      rows.forEach(function (r, i) { if (+page && r[2] <= +page) at = i; });
      bar.innerHTML = '<button class="mini" type="button" id="jumpPrev">Previous</button><select class="field" id="jumpSel" aria-label="Jump to question">' +
        rows.map(function (r, i) { return '<option value="' + i + '">Q' + r[0] + ' · ' + esc(r[1].replace(/ Q(\d+)$/, " question $1")) + '</option>'; }).join("") +
        '</select><button class="mini" type="button" id="jumpNext">Next</button>';
      var sel = document.getElementById("jumpSel"), prev = document.getElementById("jumpPrev"), next = document.getElementById("jumpNext");
      function go(i, move) {
        at = Math.max(0, Math.min(rows.length - 1, i));
        sel.value = at; prev.disabled = at === 0; next.disabled = at === rows.length - 1;
        if (move) setPage(pane, rows[at][2]);
      }
      go(at, false);
      sel.addEventListener("change", function () { go(+sel.value, true); });
      prev.addEventListener("click", function () { go(at - 1, true); });
      next.addEventListener("click", function () { go(at + 1, true); });
    }).catch(function () {});
  }

  window.BE_find = { jump: jump };
})();
