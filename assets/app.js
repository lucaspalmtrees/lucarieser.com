/* ============================================================
   LUCA RIESER — Portfolio · Logik
   Liest alles aus assets/photos.js (SITE & ALBUMS).
   ============================================================ */
(function () {
  "use strict";

  const $ = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function pad2(n) { return String(n).padStart(2, "0"); }
  // Web-Version (verkleinert, Unterordner "web") mit Rückfall aufs Original
  function orig(album, file) { return encodeURI(album.folder + "/" + file); }
  function src(album, file) { return encodeURI(album.folder + "/web/" + file); }
  const FALLBACK = ' onerror="if(this.dataset.orig&&this.src.indexOf(this.dataset.orig)<0){this.src=this.dataset.orig}"';
  function webPath(path) {
    const i = path.lastIndexOf("/");
    return encodeURI(path.slice(0, i) + "/web" + path.slice(i));
  }
  // "L1013280-2-2.jpg" -> "L1013280"
  function frameNo(file) {
    const base = file.replace(/\.[^.]+$/, "");
    const m = base.match(/^[A-Za-z]*\d+/);
    return m ? m[0] : base;
  }
  function listJoin(arr) {
    if (arr.length < 2) return arr.join("");
    return arr.slice(0, -1).join(", ") + " und " + arr[arr.length - 1];
  }

  /* ---------- Fotos aufbereiten ---------- */
  // Pro Album: Reihenfolge = featured zuerst, dann der Rest.
  ALBUMS.forEach(function (a) {
    const featured = (a.featured && a.featured.length ? a.featured : a.photos.slice(0, 6))
      .filter(function (f) { return a.photos.indexOf(f) !== -1; });
    const rest = a.photos.filter(function (f) { return featured.indexOf(f) === -1; });
    a._featured = featured;
    a._rest = rest;
    a._items = featured.concat(rest).map(function (f) {
      return { album: a, file: f, src: src(a, f), orig: orig(a, f), id: frameNo(f) };
    });
  });
  const TOTAL = ALBUMS.reduce(function (n, a) { return n + a.photos.length; }, 0);

  function photoBtn(item, idx, opts) {
    opts = opts || {};
    const alt = item.album.title + ", Bild " + item.id;
    return '<button type="button" class="ph" data-album="' + esc(item.album.id) + '" data-idx="' + idx + '" aria-label="Bild gross ansehen: ' + esc(item.id) + '">' +
      '<img src="' + item.src + '" data-orig="' + item.orig + '"' + FALLBACK + ' alt="' + esc(alt) + '"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">' +
      '</button>';
  }

  /* ---------- Texte & Links ---------- */
  function initTexts() {
    $("#introText").textContent = SITE.intro + " Fotografiert in " +
      listJoin(ALBUMS.map(function (a) { return a.title; })) + ".";
    $("#aboutText").textContent = SITE.about || "";
    $("#footName").textContent = "© " + SITE.year + " " + SITE.name;

    $$(".js-yt").forEach(function (a) { a.href = SITE.youtube; });
    $$(".js-ig").forEach(function (a) { a.href = SITE.instagram; });
    $$(".js-li").forEach(function (a) { a.href = SITE.linkedin; });

    const p = $("#portrait");
    p.onerror = function () { p.onerror = null; p.src = encodeURI(SITE.portrait); };
    p.src = webPath(SITE.portrait);
    $("#portraitCap").textContent = frameNo(SITE.portrait.split("/").pop());
  }

  /* ---------- Einstiegsbild ---------- */
  function renderHero() {
    const h = SITE.hero || {};
    const album = ALBUMS.find(function (a) { return a.id === h.album; }) || ALBUMS[0];
    let idx = album._items.findIndex(function (it) { return it.file === h.photo; });
    if (idx < 0) idx = 0;
    const item = album._items[idx];
    $("#hero").innerHTML = photoBtn(item, idx, { eager: true }) +
      '<figcaption class="cap"><span>' + esc(album.title) + '</span><span>' + esc(item.id) + '</span></figcaption>';
  }

  /* ---------- Serienliste ---------- */
  function renderIndex() {
    $("#serienCount").textContent = ALBUMS.length + " Serien · " + TOTAL + " Bilder";
    $("#indexList").innerHTML = ALBUMS.map(function (a, i) {
      const cover = a.photos.indexOf(a.cover) !== -1 ? a.cover : a._featured[0];
      return '<li><a class="index-row grid" href="#' + esc(a.id) + '">' +
        '<span class="num">' + pad2(i + 1) + '</span>' +
        '<span class="name">' + esc(a.title) + '</span>' +
        '<span class="desc">' + esc(a.description || "") + '</span>' +
        '<span class="count">' + a.photos.length + '</span>' +
        '<img class="pv" src="' + src(a, cover) + '" data-orig="' + orig(a, cover) + '"' + FALLBACK + ' alt="" loading="lazy" decoding="async">' +
        '</a></li>';
    }).join("");
  }

  /* ---------- Serien ---------- */
  // Mobile Anordnung: erstes Bild randlos, dann links / rechts versetzt / breit
  const MOBILE = ["m-left", "m-right", "m-wide"];

  function renderSeries() {
    $("#series").innerHTML = ALBUMS.map(function (a, i) {
      const n = a.photos.length;
      const feat = a._items.slice(0, a._featured.length).map(function (it, k) {
        const m = k === 0 ? "m-full" : MOBILE[(k - 1) % 3];
        return '<figure class="fade f' + (k % 6) + ' ' + m + '">' + photoBtn(it, k) +
          '<figcaption class="cap"><span>' + esc(it.id) + '</span></figcaption></figure>';
      }).join("");
      const rest = a._items.slice(a._featured.length);
      const more = rest.length ?
        '<div class="more-bar wrap"><button type="button" class="more-btn" aria-expanded="false" aria-controls="all-' + esc(a.id) + '">Alle ' + n + ' Bilder zeigen</button></div>' +
        '<div class="all wrap" id="all-' + esc(a.id) + '" hidden>' +
        rest.map(function (it, k) {
          const idx = a._featured.length + k;
          return '<figure>' + photoBtn(it, idx) + '<figcaption class="cap"><span>' + esc(it.id) + '</span></figcaption></figure>';
        }).join("") +
        '</div>' : "";
      return '<section class="serie" id="' + esc(a.id) + '" aria-labelledby="h-' + esc(a.id) + '">' +
        '<div class="serie-head grid wrap fade">' +
        '<span class="num">' + pad2(i + 1) + '</span>' +
        '<h2 id="h-' + esc(a.id) + '">' + esc(a.title) + '</h2>' +
        '<p>' + esc(a.description || "") + ' ' + n + ' Bilder.</p>' +
        '</div>' +
        '<div class="sg grid wrap pat-' + (i % 3) + '">' + feat + '</div>' +
        more +
        '</section>';
    }).join("");

    // Hochformate erkennen, damit sie nicht überlang werden
    $("#series").addEventListener("load", function (e) {
      const im = e.target;
      if (im.tagName === "IMG" && im.naturalHeight > im.naturalWidth) {
        const fig = im.closest("figure");
        if (fig) fig.classList.add("is-tall");
      }
    }, true);

    $$(".more-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const box = document.getElementById(btn.getAttribute("aria-controls"));
        const open = box.hasAttribute("hidden");
        box.toggleAttribute("hidden", !open);
        btn.setAttribute("aria-expanded", String(open));
        const n = box.closest(".serie").querySelectorAll(".ph").length;
        btn.textContent = open ? "Weniger zeigen" : "Alle " + n + " Bilder zeigen";
        if (!open) btn.closest(".serie").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- Bildansicht ---------- */
  const lb = { el: null, img: null, album: null, idx: 0, last: null };

  function lbShow() {
    const items = lb.album._items;
    const it = items[lb.idx];
    lb.img.classList.remove("show");
    lb.img.onerror = function () { lb.img.onerror = null; lb.img.src = it.orig; };
    lb.img.src = it.src;
    lb.img.alt = it.album.title + ", Bild " + it.id;
    void lb.img.offsetWidth;
    lb.img.classList.add("show");
    $("#lbMeta").textContent = it.album.title + " · " + it.id;
    $("#lbCount").textContent = (lb.idx + 1) + " / " + items.length;
    // Nachbarn vorladen
    [1, -1].forEach(function (d) {
      const n = items[(lb.idx + d + items.length) % items.length];
      const im = new Image(); im.src = n.src;
    });
  }
  function lbOpen(albumId, idx, trigger) {
    lb.album = ALBUMS.find(function (a) { return a.id === albumId; });
    if (!lb.album) return;
    lb.idx = idx;
    lb.last = trigger || null;
    lb.el.hidden = false;
    document.body.classList.add("lb-open");
    lbShow();
    $("#lbClose").focus();
  }
  function lbClose() {
    lb.el.hidden = true;
    document.body.classList.remove("lb-open");
    if (lb.last) lb.last.focus();
  }
  function lbStep(d) {
    const n = lb.album._items.length;
    lb.idx = (lb.idx + d + n) % n;
    lbShow();
  }

  function initLightbox() {
    lb.el = $("#lightbox");
    lb.img = $("#lbImg");

    document.addEventListener("click", function (e) {
      const b = e.target.closest(".ph");
      if (!b) return;
      lbOpen(b.dataset.album, parseInt(b.dataset.idx, 10), b);
    });
    $("#lbClose").addEventListener("click", lbClose);
    $("#lbPrev").addEventListener("click", function () { lbStep(-1); });
    $("#lbNext").addEventListener("click", function () { lbStep(1); });
    $("#lbStage").addEventListener("click", function (e) { if (e.target === e.currentTarget) lbClose(); });

    lb.el.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); lbStep(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); lbStep(1); }
      else if (e.key === "Escape") { e.preventDefault(); lbClose(); }
      else if (e.key === "Tab") {
        // Fokus in der Bildansicht halten
        const f = $$("button", lb.el);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Wischen auf dem Handy
    let x0 = null, y0 = null;
    const stage = $("#lbStage");
    stage.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) lbStep(dx < 0 ? 1 : -1);
      x0 = y0 = null;
    });
  }

  /* ---------- Kontaktformular (Formspree) ---------- */
  function initForm() {
    const form = $("#contactForm");
    const note = $("#formNote");
    const btn = $("#cfSubmit");
    const label = btn.textContent;

    function setNote(text, err) {
      note.textContent = text;
      note.classList.toggle("err", !!err);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const fields = { name: $("#cfName"), mail: $("#cfMail"), msg: $("#cfMsg") };
      let bad = null;
      Object.keys(fields).forEach(function (k) {
        const el = fields[k];
        const ok = el.value.trim() !== "" && (k !== "mail" || /^\S+@\S+\.\S+$/.test(el.value.trim()));
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && !bad) bad = el;
      });
      if (bad) { setNote("Bitte Name, eine gültige E-Mail und eine Nachricht eintragen.", true); bad.focus(); return; }

      function failed() {
        setNote("Das Senden hat nicht geklappt. Bitte versuch es später nochmals oder schreib mir auf Instagram.", true);
      }

      if (!SITE.formspree || !window.fetch) { failed(); return; }

      btn.disabled = true;
      btn.textContent = "Wird gesendet …";
      setNote("");

      const data = new FormData(form);
      data.append("_subject", "Anfrage über lucarieser.com");

      fetch(SITE.formspree, { method: "POST", headers: { "Accept": "application/json" }, body: data })
        .then(function (res) {
          btn.disabled = false;
          btn.textContent = label;
          if (res.ok) {
            form.reset();
            setNote("Danke, deine Nachricht ist angekommen. Ich melde mich bald.");
          } else {
            failed();
          }
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = label;
          failed();
        });
    });
  }

  /* ---------- Start ---------- */
  initTexts();
  renderHero();
  renderIndex();
  renderSeries();
  initLightbox();
  initForm();

  // Direktlinks wie lucarieser.com/#hongkong: Bilder davor zuerst laden,
  // damit sich nichts mehr verschiebt, dann ohne Animation hinspringen.
  if (location.hash) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) {
      const jump = function () { t.scrollIntoView({ behavior: "instant", block: "start" }); };
      const before = $$("main img").filter(function (im) {
        return im.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING;
      });
      before.forEach(function (im) { im.loading = "eager"; });
      jump();
      Promise.all(before.map(function (im) {
        return im.complete ? null : new Promise(function (r) { im.addEventListener("load", r); im.addEventListener("error", r); });
      })).then(jump);
    }
  }
})();
