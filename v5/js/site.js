/* Coffee Nation Hisar — front-end behaviour.
 * Business and menu data live in js/site-data.js. No secrets belong here.
 */
(function () {
  "use strict";

  var CFG = window.COFFEE_NATION;
  if (!CFG) {
    if (window.console) console.error("Coffee Nation site data failed to load.");
    return;
  }

  var site = CFG.site;
  var menu = CFG.menu;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function absolute(url) {
    if (/^https?:\/\//i.test(url)) return url;
    if (window.location && /^https?:$/.test(window.location.protocol)) {
      return new URL(url, window.location.href).href;
    }
    return url;
  }
  function openWA(text) {
    var url = "https://wa.me/" + site.whatsappNumber + "?text=" + encodeURIComponent(text);
    var popup = window.open(url, "_blank", "noopener,noreferrer");
    return !!popup;
  }
  function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

  /* Metadata: keep canonical/social URLs correct once the domain is configured. */
  (function metadata() {
    var canonical = $("#canonicalUrl");
    var ogUrl = $('meta[property="og:url"]');
    var ogImage = $('meta[property="og:image"]');
    var twImage = $('meta[name="twitter:image"]');
    var base = site.siteUrl || (window.location && /^https?:$/.test(window.location.protocol) ? window.location.origin + "/" : "");
    if (canonical && base) canonical.href = base;
    if (ogUrl && base) ogUrl.content = base;
    if (ogImage && base) ogImage.content = absolute("cn-social-preview.jpg");
    if (twImage && base) twImage.content = absolute("cn-social-preview.jpg");
  })();

  /* Nav */
  var nav = $("#nav"), drawer = $("#drawer"), tog = $("#navToggle");
  var drawerOpen = false, drawerReturnFocus = null;
  function solid() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  function setDrawer(open) {
    if (open === drawerOpen) return;
    drawerOpen = open;
    if (open) drawerReturnFocus = document.activeElement;
    drawer.classList.toggle("is-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if ("inert" in drawer) drawer.inert = !open;
    tog.setAttribute("aria-expanded", String(open));
    tog.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $("#drawerClose").focus();
    else if (drawerReturnFocus && drawerReturnFocus.focus) drawerReturnFocus.focus();
  }
  tog.addEventListener("click", function () { setDrawer(!drawerOpen); });
  $("#drawerClose").addEventListener("click", function () { setDrawer(false); });
  $$("a", drawer).forEach(function (a) {
    a.addEventListener("click", function () { if (drawerOpen) setDrawer(false); });
  });
  drawer.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); setDrawer(false); }
    if (e.key === "Tab") {
      var f = $$("a, button", drawer), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Menu */
  var photos = {};
  $$("#menuPhotos img").forEach(function (i) { photos[i.getAttribute("data-key")] = i; });
  var items = menu.items;
  var itemById = {};
  items.forEach(function (item) { itemById[item.id] = item; });
  var dishes = items.filter(function (m) { return !m.note && m.price != null; });

  function priceTag(item) {
    if (item.price != null) {
      var tag = el("span", "tag", money(item.price));
      tag.setAttribute("aria-label", "Indicative price " + money(item.price) + "; café confirms the final price");
      tag.title = "Indicative price — the café confirms the final price";
      return tag;
    }
    return el("span", "tag tag--pending", item.priceLabel || "Price to be confirmed");
  }

  function addBtn(item, cls, label) {
    var b = el("button", cls, label);
    b.type = "button";
    b.setAttribute("aria-label", "Add " + item.name + " to your order");
    b.addEventListener("click", function () { add(item); });
    return b;
  }

  function row(item) {
    var li = el("li", item.note ? "mr mr--note" : "mr");
    if (item.note) {
      var noteLine = el("div", "mr__line");
      noteLine.appendChild(el("h4", "mr__name", item.name));
      noteLine.appendChild(el("span", "mr__dots"));
      noteLine.appendChild(el("span", "tag tag--pending", item.priceLabel || "Price to be confirmed"));
      li.appendChild(noteLine);
      li.appendChild(el("p", "mr__sub", item.note));
      return li;
    }
    var line = el("div", "mr__line");
    line.appendChild(el("h4", "mr__name", item.name));
    line.appendChild(el("span", "mr__dots"));
    line.appendChild(priceTag(item));
    li.appendChild(line);
    var sub = el("p", "mr__sub");
    if (item.description) sub.appendChild(el("span", "", item.description));
    if (item.ownerApprovedBestseller) sub.appendChild(el("span", "bmark", "Bestseller"));
    li.appendChild(sub);
    li.appendChild(addBtn(item, "mr__add", "+"));
    return li;
  }

  var cats = menu.categories;
  var tabsEl = $("#menuTabs"), grid = $("#menuGrid");
  cats.forEach(function (c, i) {
    var t = el("button", "tab", c);
    t.type = "button";
    t.id = "tab-" + i;
    t.setAttribute("role", "tab");
    t.setAttribute("aria-controls", "menuGrid");
    t.setAttribute("aria-selected", i === 0 ? "true" : "false");
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener("click", function () { select(i, false); });
    tabsEl.appendChild(t);
  });
  tabsEl.addEventListener("keydown", function (e) {
    var tabs = $$(".tab", tabsEl), i = tabs.indexOf(document.activeElement), n = tabs.length;
    if (i < 0) return;
    var j = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (j > -1) { e.preventDefault(); select(j, true); }
  });
  function select(i, focus) {
    $$(".tab", tabsEl).forEach(function (t, k) {
      var on = k === i;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    grid.setAttribute("aria-labelledby", "tab-" + i);
    grid.innerHTML = "";
    cats.slice(1).filter(function (c) { return i === 0 || c === cats[i]; }).forEach(function (c) {
      var groupItems = items.filter(function (m) { return m.category === c; });
      if (!groupItems.length) return;
      var g = el("div", "mgroup"), ul = el("ul");
      g.appendChild(el("h3", "", c));
      groupItems.forEach(function (item) { ul.appendChild(row(item)); });
      g.appendChild(ul);
      grid.appendChild(g);
    });
    grid.classList.remove("is-fading");
    void grid.offsetWidth;
    grid.classList.add("is-fading");
  }
  select(0, false);

  /* Spotlight: items with an authentic, matching photo. */
  var spot = $("#spotlight"), spotList = $("#spotList");
  var spotItems = dishes.filter(function (m) { return m.photo && photos[m.photo]; });
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  spot.style.setProperty("--n", spotItems.length);
  $("#spotCount").innerHTML = "<b>01</b> <span>/ " + pad(spotItems.length) + "</span>";
  var spotEls = spotItems.map(function (item, i) {
    var li = el("li", "spot__item");
    var fig = el("figure", "spot__media"), img = photos[item.photo];
    if (i === 0) img.removeAttribute("loading");
    fig.appendChild(img);
    var copy = el("div", "spot__copy");
    copy.appendChild(el("p", "eyebrow", pad(i + 1) + " · " + item.category));
    copy.appendChild(el("h3", "spot__name", item.name));
    if (item.ownerApprovedBestseller) copy.appendChild(el("p", "bmark", "Bestseller"));
    if (item.description) copy.appendChild(el("p", "spot__desc", item.description));
    var act = el("div", "spot__act");
    act.appendChild(priceTag(item));
    act.appendChild(addBtn(item, "btn", "Add to order"));
    copy.appendChild(act);
    li.appendChild(fig);
    li.appendChild(copy);
    spotList.appendChild(li);
    return { li: li, fig: fig, copy: copy };
  });
  var spotRail = $("#spotRail"), spotNum = $("#spotCount b");
  var spotMQ = window.matchMedia("(prefers-reduced-motion: reduce), (max-height: 560px)"), spotActive = -1;
  function spotSetActive(a) {
    if (a === spotActive) return;
    spotActive = a;
    spotEls.forEach(function (s, i) {
      var on = a < 0 || i === a;
      s.li.inert = !on;
      if (on) s.li.removeAttribute("aria-hidden");
      else s.li.setAttribute("aria-hidden", "true");
    });
    if (a >= 0) spotNum.textContent = pad(a + 1);
  }

  /* Order tray */
  var order = {}, tray = $("#tray"), tList = $("#trayList");
  var tBody = $("#trayBody"), tTog = $("#trayToggle"), tTotal = $("#trayTotal"), tAnnounce = $("#trayAnnounce");
  var MAX_QTY = 20;
  var orderFocusAfterRender = null;
  function setTray(open) {
    tBody.hidden = !open;
    tTog.setAttribute("aria-expanded", open ? "true" : "false");
  }
  tTog.addEventListener("click", function () { setTray(tBody.hidden); });
  function announce(message) { if (tAnnounce) tAnnounce.textContent = message; }
  function add(item) {
    if (!item || item.price == null || item.note) return;
    var next = (order[item.id] || 0) + 1;
    if (next > MAX_QTY) { announce("Maximum quantity for " + item.name + " is " + MAX_QTY + "."); return; }
    order[item.id] = next;
    orderFocusAfterRender = null;
    renderTray();
    setTray(true);
    announce(item.name + " added. " + next + " in your order.");
  }
  function changeQty(id, delta) {
    if (!order[id]) return;
    var item = itemById[id];
    var next = order[id] + delta;
    if (next > MAX_QTY) { announce("Maximum quantity for " + item.name + " is " + MAX_QTY + "."); return; }
    if (next < 1) delete order[id];
    else order[id] = next;
    orderFocusAfterRender = { id: id, action: delta < 0 ? "minus" : "plus" };
    renderTray();
    announce(item.name + (next < 1 ? " removed." : " quantity " + next + "."));
  }
  function renderTray() {
    var ids = Object.keys(order), count = 0, total = 0;
    tList.innerHTML = "";
    ids.forEach(function (id) {
      var item = itemById[id];
      if (!item) return;
      var qty = order[id], lineTotal = qty * item.price;
      count += qty;
      total += lineTotal;
      var li = el("li", "tray__line");
      var copy = el("div", "tray__line-copy");
      copy.appendChild(el("span", "tray__name", item.name));
      copy.appendChild(el("span", "tray__unit", qty + " × " + money(item.price) + " = " + money(lineTotal)));
      li.appendChild(copy);
      var controls = el("div", "tray__controls");
      var minus = el("button", "qty", "−");
      var plus = el("button", "qty", "+");
      var remove = el("button", "tray__remove", "Remove");
      minus.type = plus.type = remove.type = "button";
      minus.dataset.id = plus.dataset.id = id;
      minus.setAttribute("aria-label", "One less " + item.name);
      plus.setAttribute("aria-label", "One more " + item.name);
      remove.setAttribute("aria-label", "Remove " + item.name + " from order");
      minus.dataset.action = "minus";
      plus.dataset.action = "plus";
      minus.addEventListener("click", function () { changeQty(id, -1); });
      plus.addEventListener("click", function () { changeQty(id, 1); });
      remove.addEventListener("click", function () {
        delete order[id];
        orderFocusAfterRender = null;
        renderTray();
        announce(item.name + " removed from your order.");
      });
      controls.appendChild(minus);
      controls.appendChild(el("span", "tray__qty", String(qty)));
      controls.appendChild(plus);
      controls.appendChild(remove);
      li.appendChild(controls);
      tList.appendChild(li);
    });
    tray.hidden = count === 0;
    $("#trayCount").textContent = "Your order · " + count + (count === 1 ? " item" : " items");
    tTotal.textContent = "Estimated total: " + money(total);
    tTotal.setAttribute("aria-label", "Estimated order total " + money(total));
    if (count === 0) {
      setTray(false);
      tAnnounce.textContent = "";
    }
    if (orderFocusAfterRender) {
      var selector = '[data-id="' + orderFocusAfterRender.id + '"][data-action="' + orderFocusAfterRender.action + '"]';
      var nextButton = tList.querySelector(selector);
      if (nextButton) nextButton.focus();
      orderFocusAfterRender = null;
    }
  }
  $("#traySend").addEventListener("click", function () {
    var ids = Object.keys(order);
    if (!ids.length) return;
    var opened = false;
    var total = 0;
    var lines = ids.map(function (id) {
      var item = itemById[id], qty = order[id], lineTotal = qty * item.price;
      total += lineTotal;
      return "- " + item.name + " — " + qty + " × " + money(item.price) + " = " + money(lineTotal);
    });
    opened = openWA(
      "Hi Coffee Nation, I'd like to order:\n" +
      lines.join("\n") +
      "\n\nEstimated total: " + money(total) +
      "\n\nName:\nPickup / dine-in:\n\nPlease confirm availability, final prices and the final total. I understand the final order is confirmed by the café."
    );
    announce(opened
      ? "WhatsApp opened with your order. Send the message there; the café confirms the final order."
      : "Could not open WhatsApp. Allow pop-ups or call the café to order.");
  });
  renderTray();

  /* Shared form helpers */
  function setErr(input, msg) {
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    var errorNode = document.getElementById(input.id + "-e");
    if (errorNode) errorNode.textContent = msg || "";
    return !msg;
  }
  function cleanPhone(v) { return v.replace(/[\s()-]/g, "").replace(/^\+91/, "").replace(/^0/, ""); }
  function validPhone(v) { return /^[6-9]\d{9}$/.test(cleanPhone(v)) && /^(\+91)?[\d\s()-]+$/.test(v.trim()); }
  function validEmail(v) {
    var parts = v.split("@");
    if (parts.length !== 2) return false;
    var local = parts[0], domain = parts[1];
    if (!local || local.length > 64 || /^\.|\.$|\.\./.test(local)) return false;
    if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
    var labels = domain.split(".");
    if (labels.length < 2) return false;
    return labels.every(function (label) {
      return label.length > 0 && label.length <= 63 && /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label);
    });
  }
  function nowHHMM() {
    var d = new Date();
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function maxDate() {
    var d = new Date();
    d.setDate(d.getDate() + 180);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function today() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function fmtDate(v) {
    var p = v.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] + ", " + d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
  }
  function fmtTime(v) {
    var p = v.split(":"), h = +p[0];
    return (h % 12 || 12) + ":" + p[1] + " " + (h < 12 ? "AM" : "PM");
  }
  function setStatus(node, type, message) {
    node.className = "status " + (type || "");
    node.textContent = message;
    if (type === "bad") node.setAttribute("role", "alert");
    else node.setAttribute("role", "status");
  }

  /* Reservation enquiry via WhatsApp — never a confirmed booking. */
  var rDate = $("#r-date");
  rDate.min = today();
  rDate.max = maxDate();
  $("#resForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, st = $("#resStatus"), ok = true, first = null;
    function field(n) { return f.elements.namedItem(n); }
    function chk(inp, msg) { if (!setErr(inp, msg)) { ok = false; first = first || inp; } }
    var name = field("name").value.trim(), phone = field("phone").value.trim(), date = field("date").value;
    var time = field("time").value, g = field("guests").value, note = field("note").value.trim();
    var minute = time ? Number(time.split(":")[1]) : 0;
    chk(field("name"), name.length < 2 ? "Please enter your name." : name.length > 80 ? "Please keep your name under 80 characters." : "");
    chk(field("phone"), !validPhone(phone) ? "Enter a 10-digit Indian mobile number, with or without +91." : "");
    chk(field("date"), !date ? "Choose a date." : date < today() ? "Choose today or a later date." : date > maxDate() ? "Please choose a date within the next 180 days." : "");
    chk(field("time"), !time ? "Choose a time." : time < "09:00" || time > "21:30" ? "Choose a time between 9:00 AM and 9:30 PM." : minute % 15 !== 0 ? "Choose a 15-minute time slot." : date === today() && time <= nowHHMM() ? "Choose a later time today, or another date." : "");
    chk(field("guests"), !/^\d+$/.test(g) || +g < 1 || +g > 20 ? "Guests must be between 1 and 20." : "");
    chk(field("note"), note.length > 300 ? "Please keep your note under 300 characters." : "");
    if (!ok) { setStatus(st, "bad", "Please fix the highlighted fields."); first.focus(); return; }
    var opened = openWA(
      "Hi Coffee Nation, I'd like to enquire about a table.\n" +
      "Name: " + name + "\n" +
      "Phone: " + phone + "\n" +
      "Preferred date: " + fmtDate(date) + "\n" +
      "Preferred time: " + fmtTime(time) + "\n" +
      "Guests: " + g + (note ? "\nNote: " + note : "") +
      "\n\nPlease let me know whether the table is available. I understand the booking is not confirmed until the café replies."
    );
    if (!opened) {
      setStatus(st, "bad", "Could not open WhatsApp. Allow pop-ups, or call the café to enquire.");
      return;
    }
    setStatus(st, "ok", "Enquiry opened in WhatsApp. Send the message there; your table is not confirmed until the café replies.");
    f.reset();
    rDate.min = today();
    rDate.max = maxDate();
  });

  /* Contact form — serverless submission, no mailto and no secrets in the browser. */
  var ctForm = $("#ctForm");
  var startedAt = Date.now();
  var turnstileReady = false;

  function loadTurnstile() {
    var key = CFG.contact.turnstileSiteKey;
    if (!key) return;
    var widget = $("#turnstileWidget");
    if (!widget) return;
    var s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = function () {
      if (!window.turnstile) return;
      window.turnstile.render(widget, {
        sitekey: key,
        callback: function (token) {
          var hidden = $("#cfToken");
          if (hidden) hidden.value = token;
          turnstileReady = true;
        },
        "error-callback": function () { turnstileReady = false; }
      });
    };
    document.head.appendChild(s);
  }
  loadTurnstile();

  ctForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, st = $("#ctStatus"), btn = $("#ctSubmit"), ok = true, first = null;
    function field(n) { return f.elements.namedItem(n); }
    function chk(inp, msg) { if (!setErr(inp, msg)) { ok = false; first = first || inp; } }
    var name = field("name").value.trim(), reach = field("reach").value.trim(), msg = field("message").value.trim();
    chk(field("name"), name.length < 2 ? "Please enter your name." : name.length > 80 ? "Please keep your name under 80 characters." : "");
    chk(field("reach"), !validEmail(reach) && !validPhone(reach) ? "Enter a valid email or a 10-digit Indian mobile number." : "");
    chk(field("message"), msg.length < 10 ? "Please write at least 10 characters." : msg.length > 2000 ? "Please keep your message under 2,000 characters." : "");
    if (!ok) { setStatus(st, "bad", "Please fix the highlighted fields."); first.focus(); return; }

    btn.disabled = true;
    btn.setAttribute("aria-busy", "true");
    f.setAttribute("aria-busy", "true");
    btn.textContent = "Sending…";
    setStatus(st, "", "");

    var payload = {
      name: name,
      reach: reach,
      message: msg,
      website: f.website ? f.website.value : "",
      elapsedMs: Date.now() - startedAt,
      cfToken: $("#cfToken") ? $("#cfToken").value : ""
    };

    fetch(CFG.contact.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          if (!response.ok || !data.ok) {
            var error = new Error(data.message || "The message could not be sent.");
            error.code = data.code;
            throw error;
          }
          setStatus(st, "ok", "Thanks — your message was sent. We'll reply as soon as we can.");
          f.reset();
          startedAt = Date.now();
          if (window.turnstile && $("#turnstileWidget")) window.turnstile.reset();
        });
      })
      .catch(function (err) {
        var message = "We couldn't send your message right now. Please try again or call the café.";
        if (err && err.code === "CONFIGURATION") {
          message = "The contact form is not configured yet. Please call the café or use email.";
        }
        setStatus(st, "bad", message);
      })
      .then(function () {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
        f.removeAttribute("aria-busy");
        btn.textContent = "Send message";
      });
  });

  /* Map */
  $("#mapLoad").addEventListener("click", function () {
    var fr = document.createElement("iframe");
    fr.src = site.mapsEmbedUrl;
    fr.title = "Interactive map of Coffee Nation, Hisar";
    fr.loading = "lazy";
    fr.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    var box = $("#mapBox");
    box.innerHTML = "";
    box.appendChild(fr);
    this.remove();
  });

  /* Testimonials — empty unless real, permitted quotes are added. */
  if (window.TESTIMONIALS && window.TESTIMONIALS.length) {
    var q = $("#quotes");
    q.hidden = false;
    window.TESTIMONIALS.forEach(function (t) {
      var fg = el("figure");
      fg.appendChild(el("blockquote", "", "“" + t.quote + "”"));
      fg.appendChild(el("figcaption", "small", t.name));
      q.appendChild(fg);
    });
  }

  /* Lightbox */
  var gBtns = $$("#gal button"), lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + gBtns.length) % gBtns.length;
    var source = gBtns[cur].querySelector("img");
    var img = source.cloneNode(true);
    img.removeAttribute("loading");
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    lbImg.innerHTML = "";
    lbImg.appendChild(img);
    lbCap.textContent = img.alt + " (" + (cur + 1) + " of " + gBtns.length + ")";
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  gBtns.forEach(function (b, i) {
    b.addEventListener("click", function () {
      lastFocus = b;
      show(i);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      $(".lb__close").focus();
    });
  });
  $(".lb__close").addEventListener("click", closeLb);
  $(".lb__prev").addEventListener("click", function () { show(cur - 1); });
  $(".lb__next").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
    else if (e.key === "Tab") {
      var f = $$(".lb__btn", lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Reveal */
  var rv = $$(".rv");
  if (reduce || !("IntersectionObserver" in window)) rv.forEach(function (x) { x.classList.add("is-in"); });
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (x) { io.observe(x); });
  }

        /* Hero parallax + exploded cappuccino */
        var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
        var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
        var lerp = function (a, b, t) { return a + (b - a) * t; };
        var hero = $(".hero"), heroImg = $(".hero__img"), heroCopy = $(".hero__copy");
        var ex = $(".explode"), glow = $(".glow", ex), title = $(".explode__title", ex), end = $(".explode__end", ex);
        var spec = {
          saucer: { w: 1.25, ar: 1, a: 0.27, e: 0.35, dx: 0, rot: 40, tilt: 64, s: 1.02, side: "left" },
          cup: { w: 1, ar: 587 / 892, a: 0, e: 0.09, dx: 0.1, rot: -4, tilt: 0, s: 1.0, side: "right" },
          espresso: { w: 0.74, ar: 548 / 1044, a: -0.2, e: -0.16, dx: 0, rot: 5, tilt: 0, s: 1.05, side: "left" },
          foam: { w: 0.68, ar: 409 / 733, a: -0.24, e: -0.39, dx: 0, rot: -7, tilt: 0, s: 1.06, side: "right" }
        };
        var keys = ["foam", "espresso", "cup", "saucer"], layers = {}, callouts = {};
        $$(".layer", ex).forEach(function (x) { layers[x.getAttribute("data-layer")] = x; });
        $$(".callout", ex).forEach(function (x) { callouts[x.getAttribute("data-for")] = x; });
        var vw, vh, W, S, cx, cy, mobile;
        function layout() {
          vw = document.documentElement.clientWidth; vh = window.innerHeight; mobile = vw < 700;
          W = mobile ? Math.min(vw * 0.44, vh * 0.3) : Math.min(vw * 0.32, vh * 0.34, 420);
          S = Math.min(vh * 0.74, W * 2.9);
          cx = mobile ? vw * 0.36 : vw * 0.5; cy = vh * 0.55;
          glow.style.setProperty("--cx", cx + "px");
          keys.forEach(function (k) {
            var sp = spec[k], c = callouts[k], side = mobile ? "right" : sp.side;
            layers[k].style.width = W * sp.w + "px";
            c.classList.toggle("callout--left", side === "left"); c.dataset.side = side;
            var halfW = k === "cup" ? W * 0.5 : (W * sp.w) / 2, gap = mobile ? 4 : 18;
            if (side === "right") {
              c.style.left = cx + W * sp.dx + halfW + gap + "px"; c.style.right = "auto";
              c.style.maxWidth = mobile ? Math.max(110, vw - (cx + W * sp.dx + halfW + gap) - 10) + "px" : "";
            } else { c.style.right = vw - (cx - halfW - gap) + "px"; c.style.left = "auto"; c.style.maxWidth = ""; }
          });
        }
        function renderExplode() {
          var r = ex.getBoundingClientRect();
          if (r.bottom < -50 || r.top > vh + 50) return;
          var p = reduce ? 0.5 : clamp(-r.top / (r.height - vh), 0, 1);
          var e = smooth(0.08, 0.4, p) * (1 - smooth(0.66, 0.9, p));
          keys.forEach(function (k, i) {
            var sp = spec[k], y = lerp(sp.a * W, sp.e * S, e), h = W * sp.w * sp.ar, s = lerp(1, sp.s, e);
            var tf = "translate3d(" + (cx + W * sp.dx - (W * sp.w) / 2) + "px," + (cy + y - h / 2) + "px,0) scale(" + s + ")";
            if (sp.tilt) tf += " rotateX(" + sp.tilt + "deg)";
            layers[k].style.transform = tf + " rotate(" + sp.rot * e + "deg)";
            var c = callouts[k], o = reduce ? 1 : smooth(0.3 + i * 0.04, 0.42 + i * 0.04, p) * (1 - smooth(0.6, 0.68, p));
            c.style.opacity = o; c.style.top = cy + sp.e * S + "px";
            c.style.transform = "translate3d(" + (c.dataset.side === "left" ? -1 : 1) * (1 - o) * 16 + "px,-50%,0)";
          });
          glow.style.opacity = 0.4 + e * 0.6;
          glow.style.transform = "translate(-50%,-50%) scale(" + (0.9 + e * 0.25) + ")";
          var to = reduce ? 1 : 1 - smooth(0.06, 0.2, p);
          title.style.opacity = to; title.style.transform = "translateY(" + (1 - to) * -30 + "px)";
          var eo = reduce ? 0 : smooth(0.86, 0.96, p);
          end.style.opacity = eo; end.style.transform = "translateY(" + (1 - eo) * 30 + "px)";
        }
        function renderSpot() {
          if (!spotEls.length) return;
          if (spotMQ.matches) { spotSetActive(-1); return; }
          var r = spot.getBoundingClientRect();
          if (r.bottom < -50 || r.top > vh + 50) return;
          var n = spotEls.length, p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1), f = p * (n - 1);
          spotEls.forEach(function (s, i) {
            var d = clamp(f - i, -1, 1), o = 1 - smooth(0.18, 0.82, Math.abs(d));
            s.li.style.opacity = o > 0.001 ? 1 : 0;
            s.li.style.visibility = o > 0.001 ? "visible" : "hidden";
            s.fig.style.opacity = o;
            s.fig.style.transform = "scale(" + (1 - 0.05 * d) + ")";
            s.copy.style.opacity = 1 - smooth(0.08, 0.42, Math.abs(d));
            s.copy.style.transform = "translate3d(0," + d * -28 + "px,0)";
          });
          spotRail.style.transform = "scaleX(" + (n > 1 ? p : 1) + ")";
          spotSetActive(clamp(Math.round(f), 0, n - 1));
        }
        var ticking = false, lastW = 0;
        function render() {
          ticking = false; solid();
          if (!reduce) {
            var hr = hero.getBoundingClientRect();
            if (hr.bottom > 0) {
              var t = clamp(-hr.top / hr.height, 0, 1);
              heroImg.style.transform = "translate3d(0," + t * hr.height * 0.25 + "px,0) scale(" + (1.06 + t * 0.14) + ")";
              heroCopy.style.opacity = 1 - smooth(0, 0.6, t);
              heroCopy.style.transform = "translate3d(0," + t * -80 + "px,0)";
            }
          }
          renderExplode();
          renderSpot();
        }
        if (spotMQ.addEventListener) spotMQ.addEventListener("change", function () { spotActive = -2; render(); });
        window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(render); } }, { passive: true });
        window.addEventListener("resize", function () {
          var w = document.documentElement.clientWidth;
          if (w === lastW && Math.abs(window.innerHeight - vh) < 120) return;
          lastW = w; layout(); render();
        });
        window.addEventListener("load", function () { layout(); render(); });
        layout(); lastW = vw; render();
      })();
