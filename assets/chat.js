/* Kerla — guided website chatbot (no AI, no server). Answers common questions and
   collects enquiries, which are sent to hello@kerla.co.uk through FormSubmit. */
(function () {
  var EMAIL = "hello@kerla.co.uk", WA = "447460839878";
  var BASE = (document.currentScript && document.currentScript.src || "").replace(/assets\/chat\.js.*$/, "");
  var SITE = BASE || "/";
  var WA_LINK = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi Kerla, I'd like to ask about a shoot. ");

  var BUDGETS = ["Under £500", "£500–£1,000", "£1,000–£1,750", "£1,750–£2,750", "£2,750+", "Not sure yet"];
  var FOUND = ["Google search", "Google Maps", "Instagram", "A venue or supplier", "Friend, family or past client", "Wedding directory", "Other"];
  var TYPES = ["Wedding", "Portrait session", "Family or milestone", "Corporate or commercial", "Event", "Film", "Something else"];

  var MAIN = [
    ["Wedding", "wedding"], ["Portrait session", "portrait"], ["Family or milestone", "family"],
    ["Corporate or event", "corporate"], ["See all prices", "prices"], ["Check my date", "enquire"],
    ["Where do you cover?", "areas"], ["How does booking work?", "book"], ["Talk to Obi", "human"]
  ];

  var NODES = {
    start: { say: ["Hi, I'm Kerla's assistant. I can answer quick questions, share prices or check your date.", "What are you planning?"], opts: MAIN },
    wedding: { say: ["Congratulations! Our wedding packages:", "• Essentials, up to 5 hours, from £950\n• Full Day, up to 10 hours, from £1,650\n• Photo + Film, from £2,750\n• Film only, from £1,350", "Add-ons: second photographer from £350, pre-wedding shoot from £200."],
      opts: [["Check my date", "enquire:Wedding"], ["What's included?", "included"], ["How does booking work?", "book"], ["See wedding work", "link:wedding-photographer-hastings/"], ["Back to start", "start"]] },
    included: { say: ["Every wedding comes with edited images in a private online gallery to share and download: 300+ for Essentials, 600+ for Full Day.", "You get a sneak peek within a week, the full gallery in 6–8 weeks and highlight films in 8–10 weeks."],
      opts: [["Check my date", "enquire:Wedding"], ["Back to start", "start"]] },
    portrait: { say: ["Portrait sessions are 1 hour at one location or in the studio, with 15 edited images, from £150.", "Your gallery arrives within 2 weeks."],
      opts: [["Book a session", "enquire:Portrait session"], ["See portrait work", "link:portrait-photographer-hastings/"], ["Back to start", "start"]] },
    family: { say: ["Family and milestone sessions (maternity, newborn, birthdays, generations together) are 1 hour at home, outdoors or in the studio, with 25 edited images, from £250.", "Your gallery arrives within 2 weeks."],
      opts: [["Book a session", "enquire:Family or milestone"], ["See family work", "link:family-photographer-hastings/"], ["Back to start", "start"]] },
    corporate: { say: ["Headshots are £110 for one person, or £265 for a team of up to 4 at your office, then £55 per extra person.", "Event coverage is £265 for 2 hours, £445 for a half day or £805 for a full day. Brand and commercial shoots start from £445 for a half day.", "These are photography-only prices. Event film is quoted separately.", "Full details: kerla.co.uk/corporate-photographer-hastings/"],
      opts: [["Get a quote", "enquire:Corporate or commercial"], ["Back to start", "start"]] },
    prices: { say: ["Our starting prices:", "• Weddings: Essentials £950 · Full Day £1,650 · Photo + Film £2,750 · Film only £1,350\n• Portrait sessions from £150\n• Family and milestone sessions from £250\n• Headshots from £110 (teams from £265)\n• Events from £265 for 2 hours"],
      opts: [["Check my date", "enquire"], ["How does booking work?", "book"], ["Back to start", "start"]] },
    book: { say: ["A 25% non-refundable deposit secures a wedding date, and the balance is due 4 weeks before.", "Portrait, family and event sessions are paid when booked. Travel is free within 30 miles of Hastings, then 45p a mile."],
      opts: [["Check my date", "enquire"], ["Back to start", "start"]] },
    areas: { say: ["We're based in Hastings, East Sussex, and regularly shoot in Eastbourne, Brighton, Tunbridge Wells, across Sussex, Kent, Surrey and London.", "We also travel anywhere in the UK and abroad."],
      opts: [["Check my date", "enquire"], ["Back to start", "start"]] },
    human: { say: ["Happy to put you straight through to Obi:"], links: true,
      opts: [["Leave my details instead", "enquire"], ["Back to start", "start"]] },
    fallback: { say: ["I'm a simple assistant, so I may not have understood that.", "Pick an option below, or leave your details and Obi will answer personally within 24 hours."],
      opts: [["Leave my details", "enquire"], ["Talk to Obi", "human"], ["Back to start", "start"]] }
  };

  /* typed messages → a topic */
  function route(t) {
    t = t.toLowerCase();
    if (/(price|cost|how much|£|quote|package|rate)/.test(t)) {
      if (/wedding|elope|film|video/.test(t)) return "wedding";
      if (/family|newborn|maternity|baby|birthday|kids/.test(t)) return "family";
      if (/headshot|corporate|event|business|brand/.test(t)) return "corporate";
      if (/portrait/.test(t)) return "portrait";
      return "prices";
    }
    if (/(available|availability|free on|my date|check.*date|book (a|my)|booking)/.test(t)) return "enquire";
    if (/(deposit|pay|balance|instal)/.test(t)) return "book";
    if (/(wedding|bride|groom|elope|engage|film|video)/.test(t)) return "wedding";
    if (/(portrait|headshot|solo|graduation)/.test(t)) return /headshot/.test(t) ? "corporate" : "portrait";
    if (/(family|newborn|maternity|baby|birthday|kids|children)/.test(t)) return "family";
    if (/(corporate|business|event|brand|commercial|conference|party)/.test(t)) return "corporate";
    if (/(where|travel|area|cover|london|brighton|eastbourne|kent|surrey|sussex|tunbridge|abroad|far)/.test(t)) return "areas";
    if (/(include|deliver|how long|gallery|images|photos do)/.test(t)) return "included";
    if (/(human|person|obi|call|speak|talk|whatsapp|phone|email|instagram)/.test(t)) return "human";
    if (/^(hi|hello|hey|hiya|good (morning|afternoon|evening))\b/.test(t)) return "start";
    return "fallback";
  }

  var el = {}, open = false, started = false, flow = null;

  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function build() {
    if (document.getElementById("kchat")) return;
    var launcher = h("button", "kchat-launch"); launcher.id = "kchat-launch"; launcher.type = "button";
    launcher.setAttribute("aria-label", "Chat with Kerla"); launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm3 6.5a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01zm5 0a1.5 1.5 0 1 0 0 .01z"/></svg><span>Chat with us</span>';
    var teaser = h("button", "kchat-teaser", "Hi! Planning a shoot? I can share prices or check your date."); teaser.type = "button"; teaser.hidden = true;

    var panel = h("div", "kchat"); panel.id = "kchat"; panel.hidden = true;
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Chat with Kerla");
    panel.innerHTML =
      '<div class="kchat-head"><img src="' + SITE + 'favicon.svg" alt="" width="34" height="34"><div><b>Kerla</b><small>Replies within 24 hours</small></div>' +
      '<button type="button" class="kchat-x" aria-label="Close chat">×</button></div>' +
      '<div class="kchat-log" aria-live="polite"></div>' +
      '<div class="kchat-opts"></div>' +
      '<form class="kchat-in" autocomplete="on"><input type="text" aria-label="Type your message" placeholder="Type a question…"><button type="submit" aria-label="Send">➤</button></form>';
    document.body.appendChild(teaser); document.body.appendChild(launcher); document.body.appendChild(panel);
    el = { launcher: launcher, teaser: teaser, panel: panel, log: panel.querySelector(".kchat-log"), opts: panel.querySelector(".kchat-opts"), form: panel.querySelector(".kchat-in"), input: panel.querySelector(".kchat-in input") };

    launcher.addEventListener("click", function () { toggle(!open); });
    teaser.addEventListener("click", function () { toggle(true); });
    panel.querySelector(".kchat-x").addEventListener("click", function () { toggle(false); });
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
    el.form.addEventListener("submit", function (e) { e.preventDefault(); var v = el.input.value.trim(); if (!v) return; el.input.value = ""; typed(v); });

    var seen = false; try { seen = sessionStorage.getItem("kchat-teased") === "1"; } catch (e) {}
    if (!seen) setTimeout(function () { if (!open) { el.teaser.hidden = false; try { sessionStorage.setItem("kchat-teased", "1"); } catch (e) {} } }, 15000);
  }

  function toggle(v) {
    open = v; el.panel.hidden = !v; el.teaser.hidden = true;
    el.launcher.setAttribute("aria-expanded", String(v)); el.launcher.classList.toggle("is-open", v);
    document.documentElement.classList.toggle("kchat-open", v);
    if (v) { if (!started) { started = true; go("start"); } setTimeout(function () { el.input.focus({ preventScroll: true }); }, 50); }
    else el.launcher.focus({ preventScroll: true });
  }

  function bubble(text, who) {
    var b = h("div", "kchat-msg " + (who || "bot"));
    String(text).split("\n").forEach(function (line, i) { if (i) b.appendChild(document.createElement("br")); b.appendChild(document.createTextNode(line)); });
    el.log.appendChild(b); el.log.scrollTop = el.log.scrollHeight; return b;
  }
  function say(lines, done) {
    var i = 0;
    (function next() {
      if (i >= lines.length) return done && done();
      var t = h("div", "kchat-msg bot typing", "…"); el.log.appendChild(t); el.log.scrollTop = el.log.scrollHeight;
      setTimeout(function () { t.remove(); bubble(lines[i++]); next(); }, 350 + Math.min(lines[i].length * 6, 650));
    })();
  }
  function options(list) {
    el.opts.innerHTML = "";
    list.forEach(function (o) {
      var b = h("button", "kchat-opt", o[0]); b.type = "button";
      b.addEventListener("click", function () { bubble(o[0], "me"); pick(o[1]); });
      el.opts.appendChild(b);
    });
  }
  function contactLinks() {
    var w = h("div", "kchat-msg bot links");
    [["WhatsApp 07460 839878", WA_LINK], ["Email " + EMAIL, "mailto:" + EMAIL], ["Instagram @kerla.studio", "https://instagram.com/kerla.studio"]].forEach(function (l) {
      var a = h("a", "", l[0]); a.href = l[1]; if (!/^mailto/.test(l[1])) { a.target = "_blank"; a.rel = "noopener"; } w.appendChild(a);
    });
    el.log.appendChild(w); el.log.scrollTop = el.log.scrollHeight;
  }

  function pick(id) {
    if (id.indexOf("link:") === 0) { location.href = SITE + id.slice(5); return; }
    if (id.indexOf("enquire") === 0) { startEnquiry(id.split(":")[1]); return; }
    go(id);
  }
  function go(id) {
    flow = null; el.opts.innerHTML = "";
    var n = NODES[id] || NODES.fallback;
    say(n.say, function () { if (n.links) contactLinks(); options(n.opts); });
  }
  function typed(v) {
    bubble(v, "me");
    if (flow) return flow.answer(v);
    var r = route(v);
    if (r === "enquire") startEnquiry(); else go(r);
  }

  /* ---------- enquiry flow ---------- */
  function startEnquiry(type) {
    var data = { shoot: type || "", date: "", dateRaw: "", venue: "", budget: "", name: "", email: "", found: "" };
    var steps = [
      { key: "shoot", skip: function () { return !!data.shoot; }, ask: "Lovely. What would you like photographed or filmed?", choices: TYPES },
      { key: "date", ask: "What's the date? Pick it below, or tap \"Not sure yet\".", date: true, choices: ["Not sure yet"] },
      { key: "venue", ask: "Where will it be? A venue name or town is perfect.", text: true, choices: ["Not decided yet"] },
      { key: "budget", ask: "Roughly what budget do you have in mind?", choices: BUDGETS },
      { key: "name", ask: "Thanks! What's your name?", text: true },
      { key: "email", ask: "And the best email address for Obi to reply to?", text: true, email: true },
      { key: "found", ask: "Last one: how did you find us?", choices: FOUND }
    ];
    var i = -1;
    function next() {
      i++;
      while (i < steps.length && steps[i].skip && steps[i].skip()) i++;
      if (i >= steps.length) return confirm();
      var s = steps[i];
      el.opts.innerHTML = "";
      say([s.ask], function () {
        if (s.date) {
          var d = h("div", "kchat-date"); var inp = h("input"); inp.type = "date"; inp.setAttribute("aria-label", "Date");
          var t = new Date(); inp.min = t.toISOString().slice(0, 10);
          var ok = h("button", "kchat-opt", "Use this date"); ok.type = "button";
          ok.addEventListener("click", function () { if (!inp.value) { inp.focus(); return; } var nice = new Date(inp.value + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); bubble(nice, "me"); data.dateRaw = inp.value; data.date = nice; next(); });
          d.appendChild(inp); d.appendChild(ok); el.opts.appendChild(d);
        }
        (s.choices || []).forEach(function (c) {
          var b = h("button", "kchat-opt", c); b.type = "button";
          b.addEventListener("click", function () { bubble(c, "me"); data[s.key] = c; next(); });
          el.opts.appendChild(b);
        });
        if (s.text || s.email) { el.input.placeholder = s.email ? "you@example.com" : "Type here…"; el.input.type = s.email ? "email" : "text"; el.input.focus({ preventScroll: true }); }
      });
    }
    flow = {
      answer: function (v) {
        var s = steps[i]; if (!s) return;
        if (s.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { say(["That email doesn't look quite right. Could you check it?"]); return; }
        if (s.date) { data.date = v; }
        else data[s.key] = v;
        el.input.placeholder = "Type a question…"; el.input.type = "text";
        next();
      }
    };
    function confirm() {
      el.opts.innerHTML = "";
      var first = data.name.split(" ")[0];
      say(["Here's what I'll send to Obi, " + first + ":", data.shoot + "\nDate: " + (data.date || "Not sure yet") + "\nWhere: " + (data.venue || "Not set") + "\nBudget: " + data.budget + "\nEmail: " + data.email], function () {
        var send = h("button", "kchat-opt primary", "Send my enquiry"); send.type = "button";
        var edit = h("button", "kchat-opt", "Start again"); edit.type = "button";
        send.addEventListener("click", function () { bubble("Send my enquiry", "me"); submit(); });
        edit.addEventListener("click", function () { bubble("Start again", "me"); startEnquiry(); });
        el.opts.appendChild(send); el.opts.appendChild(edit);
      });
    }
    function submit() {
      el.opts.innerHTML = "";
      flow = null;
      var src = (window.kerlaSource && window.kerlaSource()) || {};
      var first = data.name.split(" ")[0];
      var body = {
        name: data.name, email: data.email, shoot: data.shoot, date: data.date || "Not sure yet", venue: data.venue || "Not set",
        budget: data.budget, found_us: data.found, message: "Sent from the website chatbot", first_visit_source: src.source || "Direct", landing_page: src.landing || "",
        _subject: "Chatbot enquiry: " + data.shoot + " — " + data.name + (data.dateRaw ? " — " + data.date : ""), _replyto: data.email, _template: "table",
        _autoresponse: "Hi " + first + ",\n\nThank you for getting in touch with Kerla about your " + data.shoot.toLowerCase() + (data.dateRaw ? " on " + data.date : "") + ". Your enquiry has arrived safely, and Obi will reply personally within 24 hours, usually sooner.\n\nIn the meantime, you can see recent work at https://kerla.co.uk or on Instagram at @kerla.studio. If it is urgent, message us on WhatsApp: https://wa.me/" + WA + "\n\nSpeak soon,\nKerla\nPhotography and film, Hastings, East Sussex\nhello@kerla.co.uk"
      };
      var typing = h("div", "kchat-msg bot typing", "Sending…"); el.log.appendChild(typing);
      fetch("https://formsubmit.co/ajax/" + EMAIL, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return r.ok && String(j.success) !== "false"; }); })
        .catch(function () { return false; })
        .then(function (ok) {
          typing.remove();
          if (ok) {
            if (window.kerlaLead) kerlaLead("chatbot");
            say(["Thank you, " + first + "! Your enquiry is with Obi, who'll reply to " + data.email + " within 24 hours.", "We've also emailed you a copy. Anything else I can help with?"], function () { options([["See all prices", "prices"], ["Talk to Obi", "human"], ["Back to start", "start"]]); });
          } else {
            say(["Sorry, that didn't send. Please message Obi directly and he'll reply within 24 hours:"], function () { contactLinks(); options([["Back to start", "start"]]); });
          }
        });
    }
    next();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
