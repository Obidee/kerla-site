/* Kerla — Google Ads measurement with UK consent (Consent Mode v2) */
(function () {
  var AW = "AW-18528322684", LEAD = AW + "/P6SDCPTz06QdEPyI_4JF", KEY = "kerla-consent";
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var granted = saved === "granted" ? "granted" : "denied";
  gtag("consent", "default", { ad_storage: granted, ad_user_data: granted, ad_personalization: granted, analytics_storage: granted, wait_for_update: 500 });
  gtag("set", "ads_data_redaction", granted === "denied");
  gtag("set", "url_passthrough", true);
  gtag("js", new Date());
  gtag("config", AW);
  var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + AW;
  document.head.appendChild(s);

  /* first-visit source (kept 90 days) so every enquiry shows where it came from */
  var SKEY = "kerla-src";
  function detectSource() {
    var q = new URLSearchParams(location.search), ref = document.referrer, host = "";
    try { host = ref ? new URL(ref).hostname.replace(/^www\./, "") : ""; } catch (e) {}
    if (q.get("gclid") || q.get("gbraid") || q.get("wbraid") || /cpc|ppc|paid/i.test(q.get("utm_medium") || "")) return "Google Ads";
    if (q.get("utm_source")) return q.get("utm_source") + (q.get("utm_medium") ? " / " + q.get("utm_medium") : "");
    if (!host || host === location.hostname.replace(/^www\./, "")) return "Direct";
    if (/google\./.test(host)) return "Google (organic search or Maps)";
    if (/instagram\.com|l\.instagram/.test(host)) return "Instagram";
    if (/facebook\.com|fb\.me/.test(host)) return "Facebook";
    if (/bing\.com/.test(host)) return "Bing";
    return "Referral: " + host;
  }
  var firstSeen = { source: detectSource(), landing: location.pathname + location.search.slice(0, 120), t: Date.now() };
  function rememberSource() {
    try {
    var saved2 = JSON.parse(localStorage.getItem(SKEY) || "null");
    var now = Date.now(), fresh = detectSource();
    if (!saved2 || now - saved2.t > 90 * 864e5 || (fresh !== "Direct" && saved2.source === "Direct")) {
      localStorage.setItem(SKEY, JSON.stringify(firstSeen));
    }
    } catch (e) {}
  }
  if (granted === "granted") rememberSource(); /* only stored after cookie consent */
  window.kerlaSource = function () {
    try { var v = JSON.parse(localStorage.getItem(SKEY) || "null"); if (v) return v; } catch (e) {}
    return firstSeen;
  };

  /* one call for every kind of enquiry: form, email link, Instagram link */
  window.kerlaLead = function (how) { gtag("event", "conversion", { send_to: LEAD, value: 1.0, currency: "GBP", method: how }); };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href");
    if (/^mailto:/i.test(h)) kerlaLead("email");
    else if (/instagram\.com\/kerla\.studio/i.test(h)) kerlaLead("instagram");
    else if (/wa\.me\/|api\.whatsapp\.com/i.test(h)) kerlaLead("whatsapp");
  }, true);

  /* small consent bar */
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    gtag("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
    gtag("set", "ads_data_redaction", v === "denied");
    if (v === "granted") rememberSource(); else { try { localStorage.removeItem(SKEY); } catch (e) {} }
    var b = document.getElementById("consent"); if (b) b.remove();
  }
  if (!saved) document.addEventListener("DOMContentLoaded", function () {
    var b = document.createElement("div"); b.id = "consent"; b.setAttribute("role", "region"); b.setAttribute("aria-label", "Cookie choice");
    b.innerHTML = '<p>We use cookies to see which adverts bring people to Kerla. Is that OK?</p><div><button type="button" data-v="denied">No thanks</button><button type="button" data-v="granted">Accept</button></div>';
    b.addEventListener("click", function (e) { var v = e.target.getAttribute("data-v"); if (v) setConsent(v); });
    document.body.appendChild(b);
  });
})();
