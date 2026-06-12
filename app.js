/* ============================================================
   LUCA RIESER — Portfolio · App-Logik
   Intro-Shuffle · Blenden-Cursor · Galerie-Modi · Lightbox
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));

  /* ---------- Daten ---------- */
  const srcOf = (album, file) => encodeURI(album.folder + "/" + file);
  const coverOf = (album) => srcOf(album, album.cover || album.photos[0]);

  const ALL = [];
  ALBUMS.forEach(function (a) {
    a.photos.forEach(function (f) {
      ALL.push({ album: a, file: f, src: srcOf(a, f) });
    });
  });

  function shuffle(arr) {
    const r = arr.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  const seeded = (n) => ((n * 9301 + 49297) % 233280) / 233280;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Zustand ---------- */
  let currentAlbum = "all";
  let currentMode = "grid";
  let stackIdx = 0;
  let stackBusy = false;
  let dragMoved = 0;

  /* ---------- Texte & Links ---------- */
  function initTexts() {
    $("#heroTag").textContent = SITE.tagline;
    $("#footName").textContent = "© " + SITE.year + " " + SITE.name;
    ["#heroYt", "#ytLink", "#footYt", "#socYt"].forEach(function (id) {
      const el = $(id);
      if (el) el.href = SITE.youtube;
    });
    [["#socIg", SITE.instagram], ["#footIg", SITE.instagram],
     ["#socLi", SITE.linkedin], ["#footLi", SITE.linkedin]].forEach(function (pair) {
      const el = $(pair[0]);
      if (el && pair[1]) el.href = pair[1];
    });
    if (SITE.portrait) $("#contactImg").src = encodeURI(SITE.portrait);
    // Hero-Titel in animierbare Buchstaben zerlegen
    const h = $("#heroTitle");
    const text = h.textContent;
    h.textContent = "";
    let d = 0;
    text.split("").forEach(function (ch) {
      const span = document.createElement("span");
      if (ch === " ") {
        span.className = "sp";
      } else {
        span.className = "ch";
        span.textContent = ch;
        span.style.transitionDelay = (d * 45) + "ms";
        d++;
      }
      h.appendChild(span);
    });
  }

  /* ---------- Intro: Foto-Shuffle ---------- */
  function runIntro() {
    const intro = $("#intro");
    const img = $("#introImg");
    const counter = $("#introCount");
    let seen = false;
    try { seen = sessionStorage.getItem("introSeen") === "1"; } catch (e) { /* file:// Einschränkung */ }

    function reveal() {
      document.body.classList.add("ready");
      document.body.style.overflow = "";
    }
    document.body.style.overflow = "hidden"; // kein Scrollen während des Intros

    if (reduceMotion) {
      intro.classList.add("done", "hidden");
      $("#heroImg").src = coverOf(ALBUMS[0]);
      reveal();
      return;
    }

    const pool = shuffle(ALL.map(function (p) { return p.src; }));
    const maxShots = seen ? 9 : Math.min(pool.length, 26);
    const loaded = [];
    pool.forEach(function (src) {
      const im = new Image();
      im.onload = function () { loaded.push(src); };
      im.src = src;
    });

    let shots = 0;
    let delay = 160;
    let ended = false;
    const startedAt = Date.now();

    const vid = $("#introVid");

    function end() {
      if (ended) return;
      ended = true;
      if (vid) { try { vid.pause(); } catch (e) {} }
      try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
      // Letztes Bild wird zum Hero-Hintergrund (nahtloser Übergang)
      $("#heroImg").src = img.src || coverOf(ALBUMS[0]);
      intro.classList.add("expand");
      setTimeout(function () {
        intro.classList.add("done");
        reveal();
      }, 750);
      setTimeout(function () { intro.classList.add("hidden"); }, 1800);
    }

    function tick() {
      if (ended) return;
      if (loaded.length === 0) {
        // Noch nichts geladen — kurz warten, aber nie ewig blockieren
        if (Date.now() - startedAt > 6000) { img.src = pool[0]; end(); return; }
        setTimeout(tick, 100);
        return;
      }
      img.src = loaded[shots % loaded.length];
      counter.textContent = String(shots + 1).padStart(2, "0");
      shots++;
      if (shots >= maxShots && loaded.length > 3) { end(); return; }
      if (shots >= maxShots + 10) { end(); return; }
      delay = Math.max(48, delay * 0.91); // wird immer schneller
      setTimeout(tick, delay);
    }

    intro.addEventListener("click", end);

    function startShuffle() {
      if (ended) return;
      if (vid && vid.style.display !== "none") {
        vid.classList.remove("show");
        setTimeout(function () { vid.pause(); vid.style.display = "none"; }, 600);
      }
      setTimeout(tick, 150);
    }

    if (!seen && SITE.introVideo && vid) {
      // Auftakt: animiertes Logo-Video, danach der Foto-Shuffle
      let vidDone = false;
      const videoFinished = function () {
        if (vidDone) return;
        vidDone = true;
        startShuffle();
      };
      vid.src = encodeURI(SITE.introVideo);
      vid.style.display = "block";
      vid.addEventListener("canplay", function () { vid.classList.add("show"); });
      vid.addEventListener("ended", videoFinished);
      vid.addEventListener("error", videoFinished);
      const playPromise = vid.play();
      if (playPromise && playPromise.catch) playPromise.catch(videoFinished);
      setTimeout(videoFinished, 2000);  // Logo nur kurz: nach 2s direkt zum Shuffle
      setTimeout(end, 12000);           // absolute Sicherheitsgrenze
    } else {
      setTimeout(tick, 200);
      setTimeout(end, 12000); // absolute Sicherheitsgrenze
    }
  }

  /* ---------- Blenden-Cursor ---------- */
  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const cur = $("#cursor");
    const label = $(".cur-label", cur);
    const flash = $("#shutterFlash");
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add("on");
    });
    document.addEventListener("mouseleave", function () { cur.classList.remove("on"); });

    (function loop() {
      x += (tx - x) * 0.35;
      y += (ty - y) * 0.35;
      cur.style.transform = "translate(" + x + "px," + y + "px)";
      requestAnimationFrame(loop);
    })();

    const HOVERABLE = "a, button, [data-cursor], .ph, .album-card, .stack-card, .chip";
    document.addEventListener("mouseover", function (e) {
      const t = e.target.closest(HOVERABLE);
      if (t) {
        cur.classList.add("open");
        const labelled = t.closest("[data-cursor]");
        label.textContent = labelled ? labelled.getAttribute("data-cursor") : "Ansehen";
      } else {
        cur.classList.remove("open");
      }
    });

    document.addEventListener("mousedown", function (e) {
      cur.classList.add("snap");
      // Shutter-Blitz bei Klick auf ein Foto
      if (e.target.closest(".ph, .stack-card, .album-card")) {
        flash.classList.remove("fire");
        void flash.offsetWidth;
        flash.classList.add("fire");
      }
    });
    document.addEventListener("mouseup", function () { cur.classList.remove("snap"); });
  }

  /* ---------- Scroll-Reveal ---------- */
  function initReveal() {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    $$(".reveal, .album-card").forEach(function (el) { io.observe(el); });
  }

  /* ---------- Alben ---------- */
  function renderAlbums() {
    const grid = $("#albumGrid");
    grid.innerHTML = ALBUMS.map(function (a, i) {
      return '<article class="album-card" data-album="' + a.id + '" data-cursor="Öffnen" style="transition-delay:' + (i * 0.12) + 's">' +
        '<img src="' + coverOf(a) + '" alt="' + a.title + '" loading="lazy" decoding="async">' +
        '<div class="ac-shade"></div>' +
        '<span class="ac-arrow">→</span>' +
        '<div class="ac-info">' +
          '<span class="ac-country">' + a.country + '</span>' +
          '<h3>' + a.title + '</h3>' +
          '<div class="ac-meta"><span>' + (a.description || "") + '</span><span>' + a.photos.length + ' Fotos</span></div>' +
        '</div>' +
      '</article>';
    }).join("");

    grid.addEventListener("click", function (e) {
      const card = e.target.closest(".album-card");
      if (!card) return;
      setAlbum(card.getAttribute("data-album"));
      $("#galerie").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Galerie: Filter-Chips ---------- */
  function renderChips() {
    const bar = $("#chipBar");
    let html = '<button class="chip" data-album="all" data-cursor="Alle">Alle Orte</button>';
    ALBUMS.forEach(function (a) {
      html += '<button class="chip" data-album="' + a.id + '" data-cursor="' + a.title + '">' + a.title + '</button>';
    });
    bar.innerHTML = html;
    bar.addEventListener("click", function (e) {
      const chip = e.target.closest(".chip");
      if (chip) setAlbum(chip.getAttribute("data-album"));
    });
  }

  function setAlbum(id, animate) {
    currentAlbum = id;
    stackIdx = 0;
    $$(".chip").forEach(function (c) {
      c.classList.toggle("active", c.getAttribute("data-album") === id);
    });
    switchView(animate !== false);
  }

  /* Wechsel mit Mini-Shuffle wie beim Intro */
  function switchView(animate) {
    if (animate) { transitionGallery(renderGallery); } else { renderGallery(); }
  }

  let transToken = 0;
  function transitionGallery(then) {
    const items = photosFor();
    if (reduceMotion || items.length === 0) { then(); return; }
    const token = ++transToken;
    const g = $("#gallery");
    g.innerHTML = '<div class="gal-shuffle"><img alt=""><span class="gs-count"></span></div>';
    const img = $(".gal-shuffle img", g);
    const cnt = $(".gs-count", g);
    const pool = shuffle(items.map(function (p) { return p.src; }));
    const total = Math.min(pool.length, 9);
    let i = 0, delay = 110;
    (function t() {
      if (token !== transToken) return; // neuer Wechsel hat übernommen
      img.src = pool[i % pool.length];
      cnt.textContent = String(i + 1).padStart(2, "0");
      i++;
      if (i >= total) { then(); return; }
      delay = Math.max(50, delay * 0.87); // beschleunigt wie das Intro
      setTimeout(t, delay);
    })();
  }

  function photosFor() {
    if (currentAlbum === "all") return ALL;
    return ALL.filter(function (p) { return p.album.id === currentAlbum; });
  }

  /* ---------- Galerie: Ansichts-Modi ---------- */
  function initModes() {
    const bar = $("#modeBar");
    bar.addEventListener("click", function (e) {
      const btn = e.target.closest(".mode-btn");
      if (!btn) return;
      if (btn.getAttribute("data-mode") === currentMode) return;
      currentMode = btn.getAttribute("data-mode");
      $$(".mode-btn").forEach(function (b) { b.classList.toggle("active", b === btn); });
      stackIdx = 0;
      switchView(true);
    });
    $('.mode-btn[data-mode="grid"]').classList.add("active");
  }

  function phHtml(p, i) {
    return '<div class="ph" data-i="' + i + '" data-cursor="Ansehen" style="animation-delay:' + Math.min(i * 0.05, 0.9).toFixed(2) + 's">' +
      '<img src="' + p.src + '" alt="' + p.album.title + ' — Foto ' + (i + 1) + '" loading="lazy" decoding="async">' +
      '<span class="ph-tag">' + p.album.title + ' · ' + String(i + 1).padStart(2, "0") + '</span>' +
    '</div>';
  }

  function renderGallery() {
    const g = $("#gallery");
    const items = photosFor();
    const albumObj = ALBUMS.find(function (a) { return a.id === currentAlbum; });
    const sub = currentAlbum === "all"
      ? items.length + " Fotos · alle Länder & Städte"
      : items.length + " Fotos · " + (albumObj ? albumObj.title : "");
    $("#galSub").textContent = sub;
    if (items.length === 0) { g.innerHTML = '<p class="film-hint">Noch keine Fotos in diesem Album.</p>'; return; }

    if (currentMode === "grid") {
      g.innerHTML = '<div class="gal-grid">' + items.map(phHtml).join("") + '</div>';
    } else if (currentMode === "mosaic") {
      g.innerHTML = '<div class="gal-mosaic">' + items.map(phHtml).join("") + '</div>';
    } else if (currentMode === "film") {
      g.innerHTML = '<div class="gal-film">' + items.map(phHtml).join("") + '</div>' +
        '<p class="film-hint">← ziehen oder scrollen →</p>';
      enableDrag($(".gal-film", g));
    } else if (currentMode === "stack") {
      g.innerHTML = '<div class="gal-stack" id="stackWrap"></div>' +
        '<div class="stack-ui">' +
          '<button class="stack-btn" id="stPrev" data-cursor="Zurück" aria-label="Vorheriges">‹</button>' +
          '<span class="stack-count" id="stCount"></span>' +
          '<button class="stack-btn" id="stNext" data-cursor="Weiter" aria-label="Nächstes">›</button>' +
        '</div>';
      layoutStack(items);
      $("#stNext").addEventListener("click", function () { stackNext(items); });
      $("#stPrev").addEventListener("click", function () { stackPrev(items); });
    }
  }

  /* ---------- Stapel-Modus ---------- */
  function stackTransform(k, idx) {
    const rot = k === 0 ? 0 : (seeded(idx + 7) * 10 - 5);
    return "translate(" + (k * 7) + "px," + (k * -11) + "px) rotate(" + rot.toFixed(2) + "deg) scale(" + (1 - k * 0.045).toFixed(3) + ")";
  }

  function layoutStack(items) {
    const wrap = $("#stackWrap");
    if (!wrap) return;
    wrap.innerHTML = "";
    const visible = Math.min(5, items.length);
    for (let k = visible - 1; k >= 0; k--) {
      const idx = (stackIdx + k) % items.length;
      const card = document.createElement("div");
      card.className = "stack-card";
      card.setAttribute("data-i", idx);
      card.setAttribute("data-cursor", "Ansehen");
      card.style.transform = stackTransform(k, idx);
      card.style.zIndex = String(20 - k);
      const im = document.createElement("img");
      im.src = items[idx].src;
      im.alt = items[idx].album.title;
      im.decoding = "async";
      card.appendChild(im);
      wrap.appendChild(card);
    }
    const count = $("#stCount");
    if (count) count.textContent = String(stackIdx + 1).padStart(2, "0") + " / " + items.length;
  }

  function stackNext(items) {
    if (stackBusy) return;
    stackBusy = true;
    const wrap = $("#stackWrap");
    const cards = wrap ? $$(".stack-card", wrap) : [];
    const top = wrap ? wrap.lastElementChild : null; // oberste Karte (k=0 wird zuletzt angehängt)
    if (top) top.classList.add("out");
    // Alle anderen Karten gleiten eine Position nach vorne
    cards.forEach(function (c, j) {
      if (c === top) return;
      const k = cards.length - 1 - j;       // aktuelle Tiefe
      c.style.transform = stackTransform(k - 1, parseInt(c.getAttribute("data-i"), 10));
    });
    setTimeout(function () {
      stackIdx = (stackIdx + 1) % items.length;
      layoutStack(items);
      stackBusy = false;
    }, reduceMotion ? 0 : 450);
  }

  function stackPrev(items) {
    if (stackBusy) return;
    stackBusy = true;
    stackIdx = (stackIdx - 1 + items.length) % items.length;
    layoutStack(items);
    // Neue oberste Karte fliegt von links herein
    const wrap = $("#stackWrap");
    const top = wrap ? wrap.lastElementChild : null;
    if (top && !reduceMotion) {
      top.classList.add("in-start");
      void top.offsetWidth;
      top.classList.remove("in-start");
    }
    setTimeout(function () { stackBusy = false; }, reduceMotion ? 0 : 450);
  }

  /* ---------- Filmstreifen: Ziehen mit der Maus ---------- */
  function enableDrag(el) {
    if (!el) return;
    let down = false, startX = 0, startScroll = 0;
    el.addEventListener("pointerdown", function (e) {
      e.preventDefault(); // verhindert natives Bild-Ziehen
      down = true;
      dragMoved = 0;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.classList.add("dragging");
    });
    el.addEventListener("pointermove", function (e) {
      if (!down) return;
      const dx = e.clientX - startX;
      dragMoved = Math.max(dragMoved, Math.abs(dx));
      el.scrollLeft = startScroll - dx;
    });
    function up() { down = false; el.classList.remove("dragging"); }
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("mouseleave", up);
    // Mausrad: vertikal scrollen bewegt den Filmstreifen horizontal
    el.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  /* ---------- Lightbox ---------- */
  let lbItems = [], lbIdx = 0;

  function initLightbox() {
    const lb = $("#lightbox");
    const img = $("#lbImg");

    function show() {
      const p = lbItems[lbIdx];
      if (!p) return;
      img.classList.remove("show");
      const pre = new Image();
      pre.onload = pre.onerror = function () {
        img.src = p.src;
        requestAnimationFrame(function () { img.classList.add("show"); });
      };
      pre.src = p.src;
      $("#lbCaption").textContent = p.album.title + " — " + (lbIdx + 1) + " / " + lbItems.length;
      // Nachbarn vorladen
      [lbIdx + 1, lbIdx - 1].forEach(function (n) {
        const q = lbItems[(n + lbItems.length) % lbItems.length];
        if (q) { const pl = new Image(); pl.src = q.src; }
      });
    }

    window.openLightbox = function (i, items) {
      lbItems = items;
      lbIdx = i;
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      show();
    };

    function close() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    function next() { lbIdx = (lbIdx + 1) % lbItems.length; show(); }
    function prev() { lbIdx = (lbIdx - 1 + lbItems.length) % lbItems.length; show(); }

    $(".lb-close").addEventListener("click", close);
    $(".lb-next").addEventListener("click", next);
    $(".lb-prev").addEventListener("click", prev);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });
  }

  /* ---------- Galerie-Klicks (Lightbox öffnen) ---------- */
  function initGalleryClicks() {
    $("#gallery").addEventListener("click", function (e) {
      if (dragMoved > 8) { dragMoved = 0; return; } // war ein Zieh-Vorgang, kein Klick
      const items = photosFor();
      const card = e.target.closest(".stack-card");
      if (card) {
        window.openLightbox(parseInt(card.getAttribute("data-i"), 10), items);
        return;
      }
      const ph = e.target.closest(".ph");
      if (ph) {
        window.openLightbox(parseInt(ph.getAttribute("data-i"), 10), items);
      }
    });
  }

  /* ---------- Kontaktformular (Formspree, mit mailto-Notfalllösung) ---------- */
  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = $("#cfName").value.trim();
      const mail = $("#cfMail").value.trim();
      const subj = $("#cfSubject").value.trim();
      const msg = $("#cfMsg").value.trim();
      const note = $("#formNote");
      const btn = $("#cfSubmit");
      if (!name || !mail || !msg) {
        note.textContent = "Bitte Name, E-Mail und Nachricht ausfüllen.";
        note.style.color = "var(--accent)";
        return;
      }

      function mailtoFallback() {
        const subject = "Anfrage über die Website" + (subj ? " — " + subj : "");
        const body = "Hallo Luca\n\n" + msg + "\n\n—\n" + name + "\n" + mail;
        window.location.href = "mailto:" + SITE.email +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        note.textContent = "Direkter Versand nicht möglich — deine E-Mail-App öffnet sich stattdessen.";
        note.style.color = "";
      }

      if (!SITE.formspree || !window.fetch) { mailtoFallback(); return; }

      btn.disabled = true;
      btn.textContent = "Wird gesendet …";
      note.textContent = "";
      note.style.color = "";

      fetch(SITE.formspree, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (res) {
        btn.disabled = false;
        btn.textContent = "Anfrage senden";
        if (res.ok) {
          form.reset();
          note.textContent = "Danke! Deine Anfrage ist unterwegs — ich melde mich bald.";
          note.style.color = "var(--accent)";
        } else {
          mailtoFallback();
        }
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = "Anfrage senden";
        mailtoFallback();
      });
    });
  }

  /* ---------- Start ---------- */
  function init() {
    initTexts();
    renderAlbums();
    renderChips();
    initModes();
    setAlbum("all", false);
    initCursor();
    initLightbox();
    initGalleryClicks();
    initContactForm();
    initReveal();
    $("#heroImg").src = coverOf(ALBUMS[Math.floor(Math.random() * ALBUMS.length)]);
    runIntro();
  }

  try {
    init();
  } catch (err) {
    // Notfall: Seite trotzdem anzeigen statt schwarzem Bildschirm
    document.body.classList.add("ready");
    const intro = document.getElementById("intro");
    if (intro) { intro.classList.add("done", "hidden"); }
    console.error("Fehler beim Initialisieren:", err);
  }
})();
