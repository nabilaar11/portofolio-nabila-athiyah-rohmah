/* ============================================================
   MAIN.JS — renders window.PORTFOLIO into the DOM
   ============================================================ */
(function () {
  "use strict";

  var DATA = window.PORTFOLIO || {};
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */
  function escapeHTML(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function imgWithFallback(src, alt, className) {
    var img = el("img", {
      src: src,
      alt: alt,
      loading: "lazy",
      class: className || "",
    });
    img.addEventListener("error", function () {
      var label = (src || "").split("/").pop() || "image";
      var placeholder = el("div", {
        class: "img-fallback",
        "aria-label": alt || label,
      });
      placeholder.textContent = label;
      if (img.parentNode) img.parentNode.replaceChild(placeholder, img);
    });
    return img;
  }

  /* ----------------------------------------------------------
     SOCIAL ICONS (inline SVG)
     ---------------------------------------------------------- */
  var ICONS = {
    LinkedIn:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.44v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.72C24 .77 23.2 0 22.22 0z"/></svg>',
    Instagram:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>',
    GitHub:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.21.08 1.85 1.24 1.85 1.24 1.08 1.84 2.83 1.3 3.52 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.42.36.8 1.08.8 2.18v3.24c0 .32.21.69.82.58A12 12 0 0 0 12 .3z"/></svg>',
  };

  /* ----------------------------------------------------------
     RENDER: IDENTITY (sidebar)
     ---------------------------------------------------------- */
  function renderIdentity() {
    var root = document.getElementById("profile-root");
    if (!root || !DATA.profile) return;
    var p = DATA.profile;

    var avatarImg = el("img", {
      class: "avatar",
      src: p.photo || "",
      alt: p.name || "Profile photo",
      width: "168",
      height: "168",
      loading: "eager",
    });
    avatarImg.addEventListener("error", function () {
      var fallback = el("div", {
        class: "avatar avatar--fallback",
        "aria-label": p.name || "Profile",
      });
      fallback.textContent = "NR";
      if (avatarImg.parentNode) avatarImg.parentNode.replaceChild(fallback, avatarImg);
    });
    root.appendChild(avatarImg);

    root.appendChild(el("h1", { class: "hero-name", text: p.name || "" }));

    if (p.roles && p.roles.length) {
      var pills = el("div", { class: "role-pills" });
      p.roles.forEach(function (r) {
        pills.appendChild(el("span", { class: "pill", text: r }));
      });
      root.appendChild(pills);
    }

    if (p.tagline) {
      root.appendChild(el("p", { class: "tagline", text: p.tagline }));
    }

    // CV dropdown
    if (DATA.cv && DATA.cv.length) {
      var menu = el("div", { class: "cv-menu", role: "region", "aria-label": "Download CV" });
      var btn = el(
        "button",
        {
          class: "btn btn--primary",
          type: "button",
          "aria-expanded": "false",
          "aria-haspopup": "true",
          text: "Download CV",
        }
      );
      var list = el("ul", { class: "cv-menu__list", role: "menu" });
      DATA.cv.forEach(function (item) {
        var li = el("li", { role: "none" });
        var a = el(
          "a",
          {
            class: "cv-menu__item",
            href: item.file,
            download: "",
            role: "menuitem",
            text: item.label,
          }
        );
        li.appendChild(a);
        list.appendChild(li);
      });
      menu.appendChild(btn);
      menu.appendChild(list);
      root.appendChild(menu);
      setupDropdown(menu, btn, list);
    }

    // Socials
    if (DATA.social && DATA.social.length) {
      var socials = el("div", { class: "socials" });
      DATA.social.forEach(function (s) {
        var a = el("a", {
          class: "social-btn",
          href: s.url,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": s.name,
          title: s.name,
        });
        a.innerHTML = ICONS[s.name] || "";
        socials.appendChild(a);
      });
      root.appendChild(socials);
    }
  }

  function setupDropdown(menu, btn, list) {
    function open() {
      menu.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-expanded", "true");
      list.classList.add("is-open");
      var first = list.querySelector(".cv-menu__item");
      if (first) first.focus();
    }
    function close() {
      menu.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-expanded", "false");
      list.classList.remove("is-open");
    }
    function isOpen() {
      return menu.getAttribute("aria-expanded") === "true";
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      isOpen() ? close() : open();
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        open();
      }
    });
    list.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(list.querySelectorAll(".cv-menu__item"));
      var idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      } else if (e.key === "Escape") {
        close();
        btn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (isOpen() && !menu.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        close();
        btn.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     RENDER: NAV
     ---------------------------------------------------------- */
  function renderNav() {
    var nav = document.getElementById("nav");
    if (!nav) return;
  var items = [
  { href: "#about-root", label: "About" },
  { href: "#experience-root", label: "Experience" },
  { href: "#projects-root", label: "Projects" },
  { href: "#gallery-root", label: "Gallery" },
  { href: "#articles-root", label: "Articles" },
];       
    var ul = el("ul", { class: "nav__list" });
    items.forEach(function (it) {
      var li = el("li");
      var a = el("a", { class: "nav__link", href: it.href, text: it.label });
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);
  }

  /* ----------------------------------------------------------
     RENDER: ABOUT
     ---------------------------------------------------------- */
  function renderAbout() {
    var root = document.getElementById("about-root");
    if (!root || !DATA.profile) return;
    var p = DATA.profile;

    root.appendChild(
      el("h2", { class: "section__title", id: "about-title", text: "About" })
    );

    var text = el("div", { class: "about-text reveal" });
    (p.summary || []).forEach(function (para) {
      text.appendChild(el("p", { text: para }));
    });
    root.appendChild(text);

    if (p.highlights && p.highlights.length) {
      var chipWrap = el("div", {
        class: "chip-wrap reveal",
        style: "margin-top: 24px; display: flex; flex-wrap: wrap; gap: 8px;",
      });
      p.highlights.forEach(function (h) {
        chipWrap.appendChild(el("span", { class: "chip", text: h }));
      });
      root.appendChild(chipWrap);
    }

    // Role Evidence strip
    if (DATA.roleKeys && DATA.experience) {
      var strip = el("div", {
        class: "reveal",
        style: "margin-top: 32px;",
      });
      strip.appendChild(
        el("p", {
          style:
            "font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700; color: var(--muted); margin-bottom: 12px;",
          text: "Role Evidence",
        })
      );
      var evidenceWrap = el("div", {
        style: "display: flex; flex-wrap: wrap; gap: 8px;",
      });
      DATA.roleKeys.forEach(function (rk) {
        var count = DATA.experience.filter(function (e) {
          return e.scores && e.scores[rk.key] >= 4;
        }).length;
        evidenceWrap.appendChild(
          el("span", {
            class: "chip",
            text: rk.label + " · " + count,
            title: count + " experiences score ≥ 4 for this role",
          })
        );
      });
      strip.appendChild(evidenceWrap);
      root.appendChild(strip);
    }
  }

  /* ----------------------------------------------------------
     RENDER: EXPERIENCE
     ---------------------------------------------------------- */
  function renderExperience() {
    var root = document.getElementById("experience-root");
    if (!root || !DATA.experience) return;

    root.appendChild(
      el("h2", {
        class: "section__title",
        id: "experience-title",
        text: "Experience",
      })
    );

    // Filter chips
    var filterWrap = el("div", {
      class: "reveal",
      style: "display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;",
    });
    var allChip = el("button", {
      class: "chip chip--filter is-active",
      type: "button",
      "data-role": "ALL",
      text: "All",
    });
    filterWrap.appendChild(allChip);
    DATA.roleKeys.forEach(function (rk) {
      filterWrap.appendChild(
        el("button", {
          class: "chip chip--filter",
          type: "button",
          "data-role": rk.key,
          text: rk.label,
        })
      );
    });
    root.appendChild(filterWrap);

    root.appendChild(
      el("p", {
        class: "legend",
        text: "Relevance is a self-assessed 1-5 score of how directly each experience evidences a career path.",
      })
    );

    var list = el("div", { style: "margin-top: 24px;" });

    // Original order index for stable sort
    var originalOrder = DATA.experience.map(function (_, i) {
      return i;
    });

    DATA.experience.forEach(function (exp, idx) {
      var card = renderExpCard(exp, idx);
      list.appendChild(card);
    });
    root.appendChild(list);

    // Filter handlers
    var cards = Array.prototype.slice.call(list.querySelectorAll(".exp-card"));
    var roleLabelMap = {};
    DATA.roleKeys.forEach(function (rk) {
      roleLabelMap[rk.key] = rk.label;
    });

    function applyFilter(key) {
      cards.forEach(function (card) {
        card.classList.remove("is-dimmed");
        var existing = card.querySelector(".fit-badge");
        if (existing) existing.remove();
      });

      if (key === "ALL") {
        // restore original order
        cards
          .sort(function (a, b) {
            return Number(a.dataset.idx) - Number(b.dataset.idx);
          })
          .forEach(function (c) {
            list.appendChild(c);
          });
        return;
      }

      // sort by role score desc (stable)
      var sorted = cards.slice().sort(function (a, b) {
        var sa = Number(a.dataset["score" + key] || 0);
        var sb = Number(b.dataset["score" + key] || 0);
        if (sb !== sa) return sb - sa;
        return Number(a.dataset.idx) - Number(b.dataset.idx);
      });
      sorted.forEach(function (c) {
        var sc = Number(c.dataset["score" + key] || 0);
        if (sc <= 2) c.classList.add("is-dimmed");
        // add fit badge
        var badge = el("span", {
          class: "fit-badge",
          text: "Fit " + sc + "/5",
        });
        c.appendChild(badge);
        list.appendChild(c);
      });
    }

    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip--filter");
      if (!btn) return;
      filterWrap.querySelectorAll(".chip--filter").forEach(function (c) {
        c.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      applyFilter(btn.dataset.role);
    });
  }

  function renderExpCard(exp, idx) {
    var card = el("article", {
      class: "exp-card reveal",
      "data-idx": String(idx),
    });
    // attach role scores as data attributes
    if (exp.scores) {
      Object.keys(exp.scores).forEach(function (k) {
        card.setAttribute("data-score" + k, String(exp.scores[k]));
      });
    }

    var head = el("div", { class: "exp-card__head" });
    head.appendChild(el("h3", { text: exp.title }));
    if (exp.tag) head.appendChild(el("span", { class: "exp-card__tag", text: exp.tag }));
    card.appendChild(head);

    var metaParts = [];
    if (exp.org) metaParts.push("<strong>" + escapeHTML(exp.org) + "</strong>");
    if (exp.location) metaParts.push(escapeHTML(exp.location));
    if (exp.period) metaParts.push(escapeHTML(exp.period));
    var meta = el("p", { class: "exp-card__meta", html: metaParts.join(" · ") });
    card.appendChild(meta);

    if (exp.description) {
      card.appendChild(el("p", { class: "exp-card__desc", text: exp.description }));
    }

    // Score matrix
    if (exp.scores && DATA.roleKeys) {
      var grid = el("div", { class: "score-grid" });
      DATA.roleKeys.forEach(function (rk) {
        var score = exp.scores[rk.key] || 0;
        var pct = (score / 5) * 100;
        var row = el("div", {
          class: "score-row",
          tabindex: "0",
          "data-role": rk.label + " — " + score + "/5",
        });
        row.appendChild(el("span", { class: "score-value", text: rk.key }));
        var bar = el("div", { class: "score-bar" });
        var fill = el("div", { class: "score-bar__fill" });
        fill.style.setProperty("--score", String(pct));
        bar.appendChild(fill);
        row.appendChild(bar);
        row.appendChild(el("span", { class: "score-value", text: score + "/5" }));
        grid.appendChild(row);
      });
      card.appendChild(grid);
    }

    // Skill pills
    if (exp.skills && exp.skills.length) {
      var skills = el("div", { style: "margin-top: 8px;" });
      exp.skills.forEach(function (s) {
        skills.appendChild(el("span", { class: "skill-pill", text: s }));
      });
      card.appendChild(skills);
    }

    return card;
  }

  /* ----------------------------------------------------------
     RENDER: PROJECTS
     ---------------------------------------------------------- */
  function renderProjects() {
    var root = document.getElementById("projects-root");
    if (!root || !DATA.projects) return;
    root.appendChild(
      el("h2", { class: "section__title", id: "projects-title", text: "Projects" })
    );
    var wrap = el("div");
    DATA.projects.forEach(function (p) {
      var card = el("a", {
        class: "project-card reveal",
        href: p.link || "#",
        target: "_blank",
        rel: "noopener noreferrer",
      });
      card.appendChild(el("h3", { text: p.title }));
      var metaParts = [];
      if (p.org) metaParts.push(p.org);
      if (p.year) metaParts.push(p.year);
      if (p.place) metaParts.push(p.place);
      if (metaParts.length) {
        card.appendChild(el("p", { class: "project-card__meta", text: metaParts.join(" · ") }));
      }
      if (p.program) {
        card.appendChild(
          el("p", {
            style: "font-size: 12.5px; color: var(--muted); margin-bottom: 10px; font-style: italic;",
            text: p.program,
          })
        );
      }
      if (p.description) card.appendChild(el("p", { text: p.description }));

      if (p.photos && p.photos.length) {
        var photos = el("div", { class: "project-card__photos" });
        p.photos.slice(0, 3).forEach(function (src, i) {
          photos.appendChild(imgWithFallback(src, p.title + " photo " + (i + 1), ""));
        });
        card.appendChild(photos);
      }

      card.appendChild(
        el("span", { class: "project-card__link", text: "View proof ↗" })
      );
      wrap.appendChild(card);
    });
    root.appendChild(wrap);
  }

  /* ----------------------------------------------------------
     RENDER: GALLERY + LIGHTBOX
     ---------------------------------------------------------- */
  var lightboxState = { items: [], index: 0, lastFocus: null };

  function renderGallery() {
    var root = document.getElementById("gallery-root");
    if (!root || !DATA.gallery) return;
    root.appendChild(
      el("h2", { class: "section__title", id: "gallery-title", text: "Gallery" })
    );

    // Category filter
    var filterWrap = el("div", {
      class: "reveal",
      style: "display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px;",
    });
    var allChip = el("button", {
      class: "chip chip--filter is-active",
      type: "button",
      "data-cat": "ALL",
      text: "All",
    });
    filterWrap.appendChild(allChip);
    DATA.gallery.forEach(function (g) {
      filterWrap.appendChild(
        el("button", {
          class: "chip chip--filter",
          type: "button",
          "data-cat": g.id,
          text: g.title,
        })
      );
    });
    root.appendChild(filterWrap);

    var wrap = el("div");
    DATA.gallery.forEach(function (g) {
      var group = el("div", { class: "gallery-group reveal", "data-cat": g.id });
      group.appendChild(el("h3", { text: g.title }));
      if (g.caption && g.caption !== "TODO") {
        group.appendChild(el("p", { class: "gallery-caption", text: g.caption }));
      }
      var grid = el("div", { class: "gallery-grid" });
      (g.photos || []).forEach(function (src, i) {
        var btn = el("button", {
          class: "gallery-item",
          type: "button",
          "aria-label": "Open " + g.title + " photo " + (i + 1),
        });
        btn.appendChild(imgWithFallback(src, g.title + " photo " + (i + 1), ""));
        btn.addEventListener("click", function () {
          openLightbox(g.photos.slice(), i);
        });
        grid.appendChild(btn);
      });
      group.appendChild(grid);
      wrap.appendChild(group);
    });
    root.appendChild(wrap);

    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip--filter");
      if (!btn) return;
      filterWrap.querySelectorAll(".chip--filter").forEach(function (c) {
        c.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      var cat = btn.dataset.cat;
      wrap.querySelectorAll(".gallery-group").forEach(function (grp) {
        grp.style.display = cat === "ALL" || grp.dataset.cat === cat ? "" : "none";
      });
    });
  }

  function openLightbox(items, index) {
    var lb = document.getElementById("lightbox");
    if (!lb) return;
    lightboxState.items = items;
    lightboxState.index = index;
    lightboxState.lastFocus = document.activeElement;
    lb.hidden = false;
    requestAnimationFrame(function () {
      lb.classList.add("is-open");
    });
    updateLightbox();
    document.body.style.overflow = "hidden";
    var closeBtn = lb.querySelector(".lightbox__close");
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", lightboxKeydown);
    lb.addEventListener("click", lightboxClick);
  }

  function updateLightbox() {
    var lb = document.getElementById("lightbox");
    var img = lb.querySelector(".lightbox__img");
    var items = lightboxState.items;
    if (!items.length) return;
    var src = items[lightboxState.index];
    img.src = src;
    img.alt = "Photo " + (lightboxState.index + 1) + " of " + items.length;
  }

  function closeLightbox() {
    var lb = document.getElementById("lightbox");
    if (!lb) return;
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", lightboxKeydown);
    lb.removeEventListener("click", lightboxClick);
    setTimeout(function () {
      lb.hidden = true;
    }, 200);
    if (lightboxState.lastFocus && lightboxState.lastFocus.focus) {
      lightboxState.lastFocus.focus();
    }
  }

  function lightboxKeydown(e) {
    var lb = document.getElementById("lightbox");
    if (!lb || lb.hidden) return;
    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      lightboxState.index = (lightboxState.index + 1) % lightboxState.items.length;
      updateLightbox();
    } else if (e.key === "ArrowLeft") {
      lightboxState.index =
        (lightboxState.index - 1 + lightboxState.items.length) % lightboxState.items.length;
      updateLightbox();
    } else if (e.key === "Tab") {
      // simple focus trap
      var focusables = lb.querySelectorAll("button");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function lightboxClick(e) {
    var lb = document.getElementById("lightbox");
    if (e.target === lb) {
      closeLightbox();
    } else if (e.target.classList.contains("lightbox__close")) {
      closeLightbox();
    } else if (e.target.classList.contains("lightbox__prev")) {
      lightboxState.index =
        (lightboxState.index - 1 + lightboxState.items.length) % lightboxState.items.length;
      updateLightbox();
    } else if (e.target.classList.contains("lightbox__next")) {
      lightboxState.index = (lightboxState.index + 1) % lightboxState.items.length;
      updateLightbox();
    }
  }

  /* ----------------------------------------------------------
     RENDER: CERTIFICATIONS
     ---------------------------------------------------------- */
  function renderCertifications() {
    var root = document.getElementById("cert-root");
    if (!root || !DATA.certifications) return;
    root.appendChild(
      el("h2", { class: "section__title", id: "cert-title", text: "Certifications" })
    );
    var grid = el("div", { class: "cert-grid" });
    DATA.certifications.forEach(function (c) {
      var card = el("figure", { class: "cert-card reveal" });
      card.appendChild(imgWithFallback(c.image, c.name, ""));
      card.appendChild(el("figcaption", { text: c.caption || c.name }));
      grid.appendChild(card);
    });
    root.appendChild(grid);
  }

  /* ----------------------------------------------------------
     RENDER: ARTICLES
     ---------------------------------------------------------- */
  function renderArticles() {
    var root = document.getElementById("articles-root");
    if (!root || !DATA.articles) return;
    root.appendChild(
      el("h2", {
        class: "section__title",
        id: "articles-title",
        text: "Research & Articles",
      })
    );
    var wrap = el("div");
    DATA.articles.forEach(function (a) {
      var row = el("a", {
        class: "article-row reveal",
        href: a.url,
        target: "_blank",
        rel: "noopener noreferrer",
      });
      row.appendChild(el("span", { class: "badge", text: a.type }));
      row.appendChild(el("h3", { text: a.title }));
      row.appendChild(el("span", { text: a.source }));
      wrap.appendChild(row);
    });
    root.appendChild(wrap);
  }

  /* ----------------------------------------------------------
     RENDER: CONTACT
     ---------------------------------------------------------- */
  function renderContact() {
    var root = document.getElementById("contact-root");
    if (!root) return;
    root.appendChild(el("h2", { text: "Let's connect" }));
    root.appendChild(
      el("p", {
        text: "Open to entry-level opportunities in Corporate Affairs, Corporate Communications, Public Affairs, Public Relations, Government Relations, and CSR & Sustainability.",
      })
    );
    if (DATA.social && DATA.social.length) {
      var wrap = el("div");
      DATA.social.forEach(function (s) {
        var a = el("a", {
          class: "contact__btn",
          href: s.url,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": s.name,
          title: s.name,
        });
        a.innerHTML = ICONS[s.name] || "";
        wrap.appendChild(a);
      });
      root.appendChild(wrap);
    }
    var foot = el("footer");
    foot.appendChild(
      el("p", {
        text: "Built by Nabila with vanilla HTML, CSS and JS · © " + new Date().getFullYear(),
      })
    );
    root.appendChild(foot);
  }
     /* ----------------------------------------------------------
     RENDER: SIDEBAR FOOT (Built by only)
     ---------------------------------------------------------- */
  function renderSidebarFoot() {
    var foot = document.getElementById("sidebar-foot");
    if (!foot) return;

    var footText = document.createElement("p");
    footText.className = "sidebar-foot__text";
    footText.textContent = "Built by Nabila with vanilla HTML, CSS and JS · © " + new Date().getFullYear();
    foot.appendChild(footText);
  }

  /* ----------------------------------------------------------
     SCROLL-SPY + REVEAL + SPOTLIGHT
     ---------------------------------------------------------- */
  function setupScrollSpy() {
    var links = document.querySelectorAll(".nav__link");
    var sections = Array.prototype.slice.call(links).map(function (l) {
      return document.querySelector(l.getAttribute("href"));
    });
    if (!sections.length) return;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = "#" + entry.target.id;
            links.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === id);
            });
          }
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach(function (s) {
      if (s) observer.observe(s);
    });
  }

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reducedMotion) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 30, 240) + "ms";
      observer.observe(el);
    });
  }

  function setupSpotlight() {
    if (reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var spot = document.getElementById("spotlight");
    if (!spot) return;
    var raf = null;
    document.addEventListener("mousemove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        spot.style.transform = "translate(" + (e.clientX - 300) + "px," + (e.clientY - 300) + "px)";
        spot.classList.add("is-active");
        raf = null;
      });
    });
    document.addEventListener("mouseleave", function () {
      spot.classList.remove("is-active");
    });
  }

  function setupSmoothScroll() {
    if (reducedMotion) return;
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ----------------------------------------------------------
     BOOT
     ---------------------------------------------------------- */
  function boot() {
    try {
      renderIdentity();
      renderNav();
      renderSidebarFoot(); 
      renderAbout();
      renderExperience();
      renderProjects();
      renderGallery();
      renderCertifications();
      renderArticles();
      renderContact();
      setupScrollSpy();
      setupReveal();
      setupSpotlight();
      setupSmoothScroll();
    } catch (err) {
      console.error("[portfolio] boot error:", err);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
