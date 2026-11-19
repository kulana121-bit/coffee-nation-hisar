/* Big Mugs Hisar — site behaviour. Content and prices live in site-config.js. */
(function () {
  "use strict";
  document.body.classList.remove("no-js");

  var BIZ = window.CN_BUSINESS || {};
  var MENU = window.CN_MENU || [];
  var CATS = window.CN_CATEGORIES || ["All"];
  var APPROVE = window.CN_APPROVALS || {};
  var FORM = window.CN_FORM || {};
  var TESTIMONIALS = window.CN_TESTIMONIALS || [];
  var WA = String(BIZ.whatsapp || "").replace(/\D/g, "");
  var TZ = "Asia/Kolkata";
  var MAX_QTY = 20;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function rupees(n) { return "\u20B9" + Number(n).toLocaleString("en-IN"); }
  function waUrl(text) { return "https://wa.me/" + WA + (text ? "?text=" + encodeURIComponent(text) : ""); }
  /* Opens WhatsApp in a new tab; if a pop-up blocker stops it, opens it in this tab instead. */
  function openWA(text) {
    var url = waUrl(text), w = null;
    try { w = window.open(url, "_blank"); } catch (e) { w = null; }
    if (w) { try { w.opener = null; } catch (e) {} } else { window.location.href = url; }
    return url;
  }
  var live = $("#live");
  function announce(msg) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 30); }
  if (location.search.indexOf("debug") > -1 || /localhost|127\.0\.0\.1/.test(location.hostname)) {
    if (!APPROVE.prices) console.info("[Big Mugs] DEMO prices in use — owner approval pending (see OWNER-APPROVAL.md).");
  }

  /* ---------- Business details: one source of truth ---------- */
  var placeQ = "query=" + encodeURIComponent(BIZ.name + " " + BIZ.city) + (BIZ.googlePlaceId ? "&query_place_id=" + BIZ.googlePlaceId : "");
  var HREF = {
    tel: "tel:" + BIZ.phoneE164,
    mailto: "mailto:" + BIZ.email,
    whatsapp: waUrl(""),
    instagram: BIZ.instagram,
    directions: "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(BIZ.name + " " + BIZ.city) + (BIZ.googlePlaceId ? "&destination_place_id=" + BIZ.googlePlaceId : ""),
    maps: "https://www.google.com/maps/search/?api=1&" + placeQ
  };
  $$("[data-biz]").forEach(function (n) {
    var k = n.getAttribute("data-biz"), v = BIZ[k];
    if (k === "floorNote") { n.textContent = v || ""; n.hidden = !v; return; }
    if (v) n.textContent = v;
  });
  $$("[data-biz-href]").forEach(function (n) { var h = HREF[n.getAttribute("data-biz-href")]; if (h) n.href = h; });
  var R = BIZ.rating || {};
  $$("[data-rating]").forEach(function (n) { n.hidden = !R.show; });
  $$("[data-rv]").forEach(function (n) { n.textContent = R.value; });
  $$("[data-rc]").forEach(function (n) { n.textContent = R.count; });
  $$("[data-ra]").forEach(function (n) { n.textContent = R.asOf; });
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Nav + drawer ---------- */
  var nav = $("#nav"), drawer = $("#drawer"), tog = $("#navToggle"), mainEl = $("#main");
  function solid() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  function setDrawer(open, returnFocus) {
    drawer.classList.toggle("is-open", open);
    drawer.inert = !open;
    tog.setAttribute("aria-expanded", String(open));
    tog.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mainEl.inert = open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $("#drawerClose").focus(); else if (returnFocus !== false) tog.focus();
  }
  tog.addEventListener("click", function () { setDrawer(true); });
  $("#drawerClose").addEventListener("click", function () { setDrawer(false); });
  $$("a", drawer).forEach(function (a) { a.addEventListener("click", function () { if (drawer.classList.contains("is-open")) setDrawer(false, false); }); });
  drawer.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setDrawer(false);
    if (e.key === "Tab") {
      var f = $$("a, button", drawer), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", function (m) { if (m.matches && drawer.classList.contains("is-open")) setDrawer(false, false); });

  /* ---------- Order state ---------- */
  var byId = {};
  MENU.forEach(function (m) { byId[m.id] = m; });
  function orderable(m) { return m && !m.note && typeof m.price === "number" && m.price > 0; }
  var order = {}; // id -> qty
  var STORE = "cn_order_v1";
  try {
    var saved = JSON.parse(localStorage.getItem(STORE) || "{}");
    Object.keys(saved).forEach(function (id) {
      var q = parseInt(saved[id], 10);
      if (orderable(byId[id]) && q > 0) order[id] = Math.min(q, MAX_QTY);
    });
  } catch (e) { order = {}; }
  function persist() { try { localStorage.setItem(STORE, JSON.stringify(order)); } catch (e) {} }
  function lines() { return MENU.filter(function (m) { return order[m.id] > 0; }).map(function (m) { return { item: m, qty: order[m.id], total: m.price * order[m.id] }; }); }
  function totals() { var c = 0, t = 0; lines().forEach(function (l) { c += l.qty; t += l.total; }); return { count: c, total: t }; }
  function setQty(id, q, how) {
    var m = byId[id]; if (!orderable(m)) return;
    q = Math.max(0, Math.min(MAX_QTY, q | 0));
    if (q) order[id] = q; else delete order[id];
    persist(); renderTray(); syncControls();
    var t = totals();
    if (how === "add") announce("Added " + m.name + ". " + t.count + (t.count === 1 ? " item" : " items") + ", estimated " + rupees(t.total) + ".");
    else if (q === 0) announce(m.name + " removed. " + (t.count ? t.count + " items, estimated " + rupees(t.total) + "." : "Your order is empty."));
    else announce(m.name + ": " + q + ". Estimated total " + rupees(t.total) + ".");
  }

  /* Add button that turns into a − qty + stepper once the item is in the order */
  function control(item) { var c = el("span", "ctl"); c.setAttribute("data-id", item.id); renderCtl(c); return c; }
  function renderCtl(c, focusWhat) {
    var item = byId[c.getAttribute("data-id")], q = order[item.id] || 0;
    c.innerHTML = "";
    if (!q) {
      var a = el("button", "add", "+ Add");
      a.type = "button";
      a.setAttribute("aria-label", "Add " + item.name + ", " + rupees(item.price) + ", to your order");
      a.addEventListener("click", function () { setQty(item.id, 1, "add"); refocus(c, item.id, "[data-plus]"); });
      c.appendChild(a);
      if (focusWhat) a.focus();
      return;
    }
    var s = el("span", "step"), minus = el("button", "", "\u2212"), plus = el("button", "", "+"), out = el("output", "", String(q));
    minus.type = plus.type = "button";
    minus.setAttribute("aria-label", q === 1 ? "Remove " + item.name : "One less " + item.name);
    plus.setAttribute("aria-label", "One more " + item.name);
    plus.setAttribute("data-plus", "");
    out.setAttribute("aria-label", q + " " + item.name + " in your order");
    if (q >= MAX_QTY) plus.disabled = true;
    minus.addEventListener("click", function () { setQty(item.id, q - 1); refocus(c, item.id, "[data-minus]", true); });
    plus.addEventListener("click", function () { setQty(item.id, q + 1); refocus(c, item.id, "[data-plus]"); });
    minus.setAttribute("data-minus", "");
    s.appendChild(minus); s.appendChild(out); s.appendChild(plus);
    c.appendChild(s);
  }
  /* Keep keyboard focus on the same control after the order re-renders */
  function refocus(c, id, sel, minus) {
    var host = c.isConnected ? c : (tBody && !tBody.hidden ? tList.querySelector('.ctl[data-id="' + id + '"]') : null);
    var n = host ? (host.querySelector(sel) || host.querySelector(".add") || host.querySelector("[data-minus]")) : null;
    if (!n && minus) n = tList.querySelector("button") || tTog;
    if (n) n.focus();
  }
  function syncControls() { $$(".ctl").forEach(function (c) { renderCtl(c); }); }

  /* ---------- Menu ---------- */
  function priceTag(item) {
    if (orderable(item)) return el("span", "tag", rupees(item.price));
    return el("span", "tag tag--tbc", "Price to be confirmed");
  }
  function row(item) {
    var li = el("li", "mr");
    if (item.note) {
      li.className = "mr mr--note";
      var d = el("div");
      d.appendChild(el("h4", "mr__name", item.name));
      var p = el("p", "", item.note); p.style.marginTop = "4px"; d.appendChild(p);
      li.appendChild(d);
      var a = el("a", "tlink", "Ask on WhatsApp");
      a.href = waUrl("Hi Big Mugs, what " + item.name.toLowerCase() + " do you have today, and what are the prices?");
      a.target = "_blank"; a.rel = "noopener";
      a.setAttribute("aria-label", "Ask about today's " + item.name.toLowerCase() + " on WhatsApp (opens in a new tab)");
      li.appendChild(a);
      return li;
    }
    var line = el("div", "mr__line");
    line.appendChild(el("h4", "mr__name", item.name));
    line.appendChild(el("span", "mr__dots"));
    line.appendChild(priceTag(item));
    li.appendChild(line);
    var sub = el("p", "mr__sub");
    if (item.desc) sub.appendChild(el("span", "", item.desc));
    if (item.bestseller && APPROVE.bestsellers) sub.appendChild(el("span", "bmark", "Bestseller"));
    li.appendChild(sub);
    if (orderable(item)) { var act = el("div", "mr__act"); act.appendChild(control(item)); li.appendChild(act); }
    return li;
  }
  var tabsEl = $("#menuTabs"), grid = $("#menuGrid");
  CATS.forEach(function (c, i) {
    var t = el("button", "tab", c);
    t.type = "button"; t.id = "tab-" + i;
    t.setAttribute("role", "tab"); t.setAttribute("aria-controls", "menuGrid");
    t.setAttribute("aria-selected", String(i === 0)); t.tabIndex = i === 0 ? 0 : -1;
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
      t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1;
      if (k === i) {
        if (focus) t.focus({ preventScroll: true });
        /* keep the chosen chip visible inside the scrolling tab row, without moving the page */
        var l = t.offsetLeft - tabsEl.offsetLeft, r = l + t.offsetWidth;
        if (l < tabsEl.scrollLeft) tabsEl.scrollLeft = l - 8;
        else if (r > tabsEl.scrollLeft + tabsEl.clientWidth) tabsEl.scrollLeft = r - tabsEl.clientWidth + 8;
      }
    });
    grid.setAttribute("aria-labelledby", "tab-" + i);
    grid.innerHTML = "";
    CATS.slice(1).filter(function (c) { return i === 0 || c === CATS[i]; }).forEach(function (c) {
      var items = MENU.filter(function (m) { return m.cat === c; });
      if (!items.length) return;
      var g = el("div", "mgroup"), ul = el("ul");
      g.appendChild(el("h3", "", c));
      items.forEach(function (item) { ul.appendChild(row(item)); });
      g.appendChild(ul);
      grid.appendChild(g);
    });
    if (!reduce) { grid.classList.remove("is-fading"); void grid.offsetWidth; grid.classList.add("is-fading"); }
  }
  select(0, false);

  /* ---------- Spotlight: every orderable dish with a photo ---------- */
  var PHOTOS = {
    cappuccino: { base: "menu-cappuccino", alt: "Cappuccino with heart latte art" },
    espresso: { base: "menu-espresso", alt: "Espresso pouring from a portafilter" },
    coldcoffee: { base: "menu-coldcoffee", alt: "A tall glass of cold coffee" },
    pasta: { base: "menu-pasta", alt: "White sauce penne pasta" },
    sandwich: { base: "menu-sandwich", alt: "Grilled sandwich, cut in half" },
    fries: { base: "menu-fries", alt: "Peri-peri fries in a basket" },
    brownie: { base: "menu-brownie", alt: "Brownie with a scoop of ice cream" }
  };
  function picture(ph, eager) {
    var p = document.createElement("picture"), dir = "assets/img/", sizes = "(max-width: 760px) 100vw, 58vw";
    ["avif", "webp"].forEach(function (fmt) {
      var s = document.createElement("source");
      s.type = "image/" + fmt; s.sizes = sizes;
      s.srcset = dir + ph.base + "-640." + fmt + " 640w, " + dir + ph.base + "-1200." + fmt + " 1200w";
      p.appendChild(s);
    });
    var img = document.createElement("img");
    img.src = dir + ph.base + "-1200.webp"; img.alt = ph.alt; img.width = 1200; img.height = 960; img.decoding = "async";
    if (!eager) img.loading = "lazy";
    p.appendChild(img);
    return p;
  }
  var spot = $("#spotlight"), spotList = $("#spotList");
  var spotItems = MENU.filter(function (m) { return orderable(m) && m.photo && PHOTOS[m.photo]; });
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  spot.style.setProperty("--n", spotItems.length);
  $("#spotCount").innerHTML = "<b>01</b> <span>/ " + pad(spotItems.length) + "</span>";
  var spotEls = spotItems.map(function (item, i) {
    var li = el("li", "spot__item");
    var fig = el("figure", "spot__media");
    fig.appendChild(picture(PHOTOS[item.photo], false));
    var copy = el("div", "spot__copy");
    copy.appendChild(el("p", "eyebrow", pad(i + 1) + " · " + item.cat));
    copy.appendChild(el("h3", "spot__name", item.name));
    if (item.bestseller && APPROVE.bestsellers) copy.appendChild(el("p", "bmark", "Bestseller"));
    if (item.desc) copy.appendChild(el("p", "spot__desc", item.desc));
    var act = el("div", "spot__act");
    act.appendChild(priceTag(item));
    act.appendChild(control(item));
    copy.appendChild(act);
    li.appendChild(fig); li.appendChild(copy);
    spotList.appendChild(li);
    return { li: li, fig: fig, copy: copy };
  });
  var spotRail = $("#spotRail"), spotNum = $("#spotCount b"), spotMQ = window.matchMedia("(prefers-reduced-motion: reduce), (max-height: 560px)"), spotActive = -1;
  function spotSetActive(a) {
    if (a === spotActive) return;
    spotActive = a;
    spotEls.forEach(function (s, i) {
      var on = a < 0 || i === a;
      s.li.inert = !on;
      if (on) s.li.removeAttribute("aria-hidden"); else s.li.setAttribute("aria-hidden", "true");
    });
    if (a >= 0) spotNum.textContent = pad(a + 1);
  }

  /* ---------- Order tray ---------- */
  var tray = $("#tray"), tList = $("#trayList"), tBody = $("#trayBody"), tTog = $("#trayToggle"), tStatus = $("#trayStatus");
  function setTray(open) { tBody.hidden = !open; tTog.setAttribute("aria-expanded", String(open)); }
  tTog.addEventListener("click", function () { setTray(tBody.hidden); });
  tray.addEventListener("keydown", function (e) { if (e.key === "Escape" && !tBody.hidden) { setTray(false); tTog.focus(); } });
  function renderTray() {
    var ls = lines(), t = totals();
    tList.innerHTML = "";
    ls.forEach(function (l) {
      var m = l.item, li = el("li"), nm = el("div", "nm");
      nm.appendChild(el("b", "", m.name));
      nm.appendChild(el("span", "", l.qty + " \u00D7 " + rupees(m.price) + " = " + rupees(l.total)));
      var c = control(m);
      var x = el("button", "x", "\u00D7");
      x.type = "button"; x.setAttribute("aria-label", "Remove " + m.name + " from your order");
      x.addEventListener("click", function () { setQty(m.id, 0); var f = tList.querySelector("button") || tTog; f.focus(); });
      li.appendChild(nm); li.appendChild(c); li.appendChild(x);
      tList.appendChild(li);
    });
    tray.hidden = t.count === 0;
    document.body.classList.toggle("has-order", t.count > 0);
    if (!t.count) setTray(false);
    $("#trayCount").textContent = "Your order \u00B7 " + t.count + (t.count === 1 ? " item" : " items");
    $("#trayTotalBar").textContent = rupees(t.total);
    $("#trayTotal").textContent = rupees(t.total);
    tStatus.textContent = "";
  }
  function orderMessage() {
    var ls = lines(), t = totals();
    var type = ($("input[name=otype]:checked") || {}).value || "Dine-in";
    var name = $("#o-name").value.trim().slice(0, 60);
    var out = ["Hi Big Mugs! I'd like to place an order from your website.", ""];
    out.push("Order type: " + type);
    if (name) out.push("Name: " + name);
    out.push("");
    ls.forEach(function (l, i) { out.push((i + 1) + ". " + l.item.name + " \u00D7 " + l.qty + " = " + rupees(l.total) + " (" + rupees(l.item.price) + " each)"); });
    out.push("");
    out.push("Items: " + t.count);
    out.push("Estimated total: " + rupees(t.total));
    out.push("");
    out.push("I understand website prices are indicative. Please confirm my order and the final total.");
    return out.join("\n");
  }
  $("#traySend").addEventListener("click", function () {
    if (!totals().count) return;
    var url = openWA(orderMessage());
    tStatus.innerHTML = "";
    tStatus.appendChild(document.createTextNode("WhatsApp opened with your order. Press send there. Your order is confirmed only when the cafe replies. "));
    var a = el("a", "", "Open WhatsApp again"); a.href = url; a.target = "_blank"; a.rel = "noopener"; a.style.color = "var(--cream)";
    tStatus.appendChild(a);
  });
  $("#trayClear").addEventListener("click", function () { order = {}; persist(); renderTray(); syncControls(); announce("Your order is cleared."); tTog.focus(); });
  renderTray();

  /* ---------- Shared form helpers ---------- */
  function setErr(input, msg) {
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    var e = document.getElementById(input.id + "-e"); if (e) e.textContent = msg || "";
    return !msg;
  }
  function digits(v) { return v.replace(/[\s().-]/g, ""); }
  function validPhone(v) {
    var d = digits(v.trim());
    if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(d)) return false;
    return true;
  }
  function nowIST() {
    var parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    return { date: o.year + "-" + o.month + "-" + o.day, mins: (+o.hour) * 60 + (+o.minute) };
  }
  function addDays(iso, n) { var p = iso.split("-"), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n)); return d.toISOString().slice(0, 10); }
  function fmtDate(v) {
    var p = v.split("-"), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()] + ", " + d.getUTCDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()] + " " + d.getUTCFullYear();
  }
  function toMins(hhmm) { var p = hhmm.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmtTime(m) { var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ":" + (mm < 10 ? "0" : "") + mm + " " + (h < 12 ? "AM" : "PM"); }

  /* ---------- Reservation (WhatsApp request, never a confirmed booking) ---------- */
  var rf = $("#resForm"), rDate = $("#r-date"), rTime = $("#r-time"), rGuests = $("#r-guests");
  var OPEN = toMins(BIZ.opens || "09:00"), LAST = toMins(BIZ.lastReservation || "21:30"), LEAD = 30;
  var today = nowIST().date;
  rDate.min = today; rDate.max = addDays(today, 60);
  for (var g = 1; g <= 12; g++) { var o = el("option", "", g + (g === 1 ? " guest" : " guests")); o.value = String(g); if (g === 2) o.selected = true; rGuests.appendChild(o); }
  var big = el("option", "", "More than 12"); big.value = "13+"; rGuests.appendChild(big);
  function fillTimes() {
    var keep = rTime.value, n = nowIST(), isToday = rDate.value === n.date, count = 0;
    rTime.innerHTML = "";
    var ph = el("option", "", "Choose a time"); ph.value = ""; rTime.appendChild(ph);
    for (var m = OPEN; m <= LAST; m += 30) {
      if (isToday && m < n.mins + LEAD) continue;
      var opt = el("option", "", fmtTime(m)); opt.value = String(m); rTime.appendChild(opt); count++;
      if (opt.value === keep) opt.selected = true;
    }
    if (isToday && !count) { ph.textContent = "No more times today"; }
  }
  rDate.addEventListener("change", function () { fillTimes(); setErr(rDate, ""); });
  fillTimes();
  rf.addEventListener("submit", function (e) {
    e.preventDefault();
    var st = $("#resStatus"), ok = true, first = null, n = nowIST();
    function chk(inp, msg) { if (!setErr(inp, msg)) { ok = false; first = first || inp; } }
    var name = rf.name.value.trim(), phone = rf.phone.value.trim(), date = rDate.value, time = rTime.value, guests = rGuests.value;
    chk(rf.name, name.length < 2 ? "Please enter your name." : "");
    chk(rf.phone, !validPhone(phone) ? "Enter a 10-digit Indian mobile number, with or without +91." : "");
    chk(rDate, !date ? "Choose a date." : date < n.date ? "Choose today or a later date." : date > rDate.max ? "Choose a date within the next 60 days." : "");
    var tm = time ? +time : -1;
    chk(rTime, !time ? (date === n.date && rTime.options.length < 2 ? "No times left today. Please choose another date." : "Choose a time.") : (tm < OPEN || tm > LAST) ? "Choose a time between " + fmtTime(OPEN) + " and " + fmtTime(LAST) + "." : (date === n.date && tm < n.mins + LEAD) ? "That time has passed. Choose a later time." : "");
    chk(rGuests, !guests ? "Choose the number of guests." : "");
    if (!ok) { st.className = "status bad"; st.textContent = "Please fix the highlighted fields."; first.focus(); return; }
    var msg = "Hi Big Mugs! I'd like to request a table.\n\nName: " + name + "\nMobile: " + phone + "\nDate: " + fmtDate(date) + "\nTime: " + fmtTime(tm) + "\nGuests: " + (guests === "13+" ? "More than 12" : guests) + (rf.note.value.trim() ? "\nNote: " + rf.note.value.trim().slice(0, 300) : "") + "\n\nPlease let me know if this table is available.";
    var url = openWA(msg);
    st.className = "status ok"; st.innerHTML = "";
    st.appendChild(document.createTextNode("Your request is ready in WhatsApp. Press send there. This is not a booking yet: your table is held only when the cafe replies to confirm. "));
    var a = el("a", "", "Open WhatsApp again"); a.href = url; a.target = "_blank"; a.rel = "noopener"; st.appendChild(a);
  });
  [rf.name, rf.phone].forEach(function (i) { i.addEventListener("input", function () { if (i.getAttribute("aria-invalid") === "true") setErr(i, ""); }); });
  rTime.addEventListener("change", function () { setErr(rTime, ""); });

  /* ---------- Contact form (serverless endpoint) ---------- */
  var cf = $("#ctForm"), cSubmit = $("#ctSubmit"), cStatus = $("#ctStatus"), startedAt = Date.now(), tsWidget = null;
  if (FORM.turnstileSiteKey) {
    window.cnTurnstileReady = function () {
      var box = $("#ctTurnstile"); box.hidden = false;
      tsWidget = window.turnstile.render(box, { sitekey: FORM.turnstileSiteKey, theme: "light", appearance: "interaction-only" });
    };
    var ts = document.createElement("script");
    ts.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=cnTurnstileReady";
    ts.async = true; ts.defer = true; document.head.appendChild(ts);
  }
  function fallbackLinks(node) {
    node.appendChild(document.createTextNode(" You can reach the cafe on "));
    var w = el("a", "", "WhatsApp"); w.href = HREF.whatsapp; w.target = "_blank"; w.rel = "noopener"; node.appendChild(w);
    node.appendChild(document.createTextNode(" or call "));
    var t = el("a", "", BIZ.phoneDisplay); t.href = HREF.tel; node.appendChild(t);
    node.appendChild(document.createTextNode("."));
  }
  function busy(on) {
    cSubmit.disabled = on; cSubmit.setAttribute("aria-busy", String(on));
    cSubmit.innerHTML = on ? '<span class="spin" aria-hidden="true"></span><span class="btn__label">Sending…</span>' : '<span class="btn__label">Send message</span>';
  }
  cf.addEventListener("submit", function (e) {
    e.preventDefault();
    if (cSubmit.disabled) return;
    var ok = true, first = null;
    function chk(inp, msg) { if (!setErr(inp, msg)) { ok = false; first = first || inp; } }
    var data = {
      name: cf.name.value.trim(), email: cf.email.value.trim(), phone: cf.phone.value.trim(),
      topic: cf.topic.value, message: cf.message.value.trim(), website: cf.website.value,
      startedAt: startedAt, page: location.pathname
    };
    chk(cf.name, data.name.length < 2 ? "Please enter your name." : "");
    chk(cf.email, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email) ? "Enter a valid email address so the cafe can reply." : "");
    chk(cf.phone, data.phone && !validPhone(data.phone) ? "Enter a 10-digit Indian mobile number, or leave it empty." : "");
    chk(cf.message, data.message.length < 10 ? "Please write a little more (at least 10 characters)." : "");
    if (!ok) { cStatus.className = "status bad"; cStatus.textContent = "Please fix the highlighted fields."; first.focus(); return; }
    if (FORM.turnstileSiteKey) {
      data.turnstileToken = tsWidget != null && window.turnstile ? window.turnstile.getResponse(tsWidget) : "";
      if (!data.turnstileToken) { cStatus.className = "status bad"; cStatus.textContent = "Please complete the security check above, then send again."; return; }
    }
    if (!FORM.endpoint) { cStatus.className = "status bad"; cStatus.textContent = "Online messages aren't switched on yet."; fallbackLinks(cStatus); return; }
    busy(true);
    cStatus.className = "status"; cStatus.textContent = "Sending your message…";
    var ctrl = "AbortController" in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    fetch(FORM.endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data), signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (j) { return { status: res.status, ok: res.ok, j: j }; });
      })
      .then(function (r) {
        clearTimeout(timer); busy(false);
        if (r.ok && r.j && r.j.ok === true) {
          cStatus.className = "status ok";
          cStatus.textContent = "Thank you, " + data.name.split(" ")[0] + ". Your message has been sent to the cafe. They'll reply to " + data.email + ".";
          cf.reset(); startedAt = Date.now();
          $$("[aria-invalid]", cf).forEach(function (i) { i.setAttribute("aria-invalid", "false"); });
          if (tsWidget != null && window.turnstile) window.turnstile.reset(tsWidget);
          cStatus.setAttribute("tabindex", "-1"); cStatus.focus();
          return;
        }
        var code = r.j && r.j.error;
        cStatus.className = "status bad";
        cStatus.textContent = code === "not_configured" ? "Sorry, online messages aren't switched on yet. Your message was not sent."
          : code === "rate_limited" ? "Too many messages from this connection. Please wait a few minutes. Your message was not sent."
          : code === "validation" ? (r.j.message || "Please check the form.") + " Your message was not sent."
          : code === "spam_check" ? "The security check didn't pass. Please try again. Your message was not sent."
          : "Sorry, your message couldn't be sent right now.";
        fallbackLinks(cStatus);
        if (tsWidget != null && window.turnstile) window.turnstile.reset(tsWidget);
        cStatus.setAttribute("tabindex", "-1"); cStatus.focus();
      })
      .catch(function () {
        clearTimeout(timer); busy(false);
        cStatus.className = "status bad";
        cStatus.textContent = "Sorry, your message couldn't be sent. Check your connection and try again.";
        fallbackLinks(cStatus);
        cStatus.setAttribute("tabindex", "-1"); cStatus.focus();
      });
  });
  [cf.name, cf.email, cf.phone, cf.message].forEach(function (i) { i.addEventListener("input", function () { if (i.getAttribute("aria-invalid") === "true") setErr(i, ""); }); });

  /* ---------- Map ---------- */
  $("#mapLoad").addEventListener("click", function () {
    var fr = document.createElement("iframe");
    fr.src = "https://www.google.com/maps?q=" + BIZ.lat + "," + BIZ.lng + "&z=17&output=embed";
    fr.title = "Interactive map of Big Mugs, Hisar";
    fr.loading = "lazy";
    fr.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    var box = $("#mapBox"); box.innerHTML = ""; box.appendChild(fr);
    var btn = this; btn.nextElementSibling && btn.nextElementSibling.remove(); btn.remove();
    fr.setAttribute("tabindex", "0"); fr.focus();
  });

  /* ---------- Testimonials (real, permitted quotes only) ---------- */
  if (TESTIMONIALS.length) {
    var q = $("#quotes"); q.hidden = false;
    TESTIMONIALS.forEach(function (t) {
      var fg = el("figure"); fg.appendChild(el("blockquote", "", "\u201C" + t.quote + "\u201D")); fg.appendChild(el("figcaption", "small", t.name));
      q.appendChild(fg);
    });
  }

  /* ---------- Lightbox ---------- */
  var gBtns = $$("#gal button"), lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + gBtns.length) % gBtns.length;
    var src = gBtns[cur].querySelector("img"), img = new Image();
    img.src = src.getAttribute("data-full") || src.src; img.alt = src.alt; img.width = src.width; img.height = src.height;
    lbImg.innerHTML = ""; lbImg.appendChild(img);
    lbCap.textContent = src.alt + " (" + (cur + 1) + " of " + gBtns.length + ")";
  }
  function closeLb() { lb.hidden = true; mainEl.inert = false; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  gBtns.forEach(function (b, i) { b.addEventListener("click", function () { lastFocus = b; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $(".lb__close").focus(); }); });
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

  /* ---------- Reveal ---------- */
  var rv = $$(".rv");
  if (reduce || !("IntersectionObserver" in window)) rv.forEach(function (x) { x.classList.add("is-in"); });
  else {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } }); }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    rv.forEach(function (x) { io.observe(x); });
  }

  /* ---------- Hero parallax + exploded cappuccino (unchanged choreography) ---------- */
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
