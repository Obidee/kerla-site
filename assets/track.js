/* Kerla — ad measurement with UK consent: Google (Consent Mode v2), Meta Pixel and Pinterest Tag load only after "Accept" */
(function () {
  var AW = "AW-18528322684", LEAD = AW + "/P6SDCPTz06QdEPyI_4JF", KEY = "kerla-consent";
  /* fill these in once the Meta and Pinterest ad accounts exist; empty = that tag never loads */
  var META_PIXEL = "", PIN_TAG = "";
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

  /* Meta Pixel and Pinterest Tag: never loaded without consent, no advanced matching (no personal data sent) */
  var socialLoaded = false;
  function loadSocial() {
    if (socialLoaded) return; socialLoaded = true;
    if (META_PIXEL) {
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
      fbq("init", META_PIXEL); fbq("track", "PageView");
    }
    if (PIN_TAG) {
      !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
      pintrk("load", PIN_TAG); pintrk("page");
    }
  }
  if (granted === "granted") loadSocial();

  /* first-visit source (kept 90 days) so every enquiry shows where it came from */
  var SKEY = "kerla-src";
  function detectSource() {
    var q = new URLSearchParams(location.search), ref = document.referrer, host = "";
    try { host = ref ? new URL(ref).hostname.replace(/^www\./, "") : ""; } catch (e) {}
    if (q.get("gclid") || q.get("gbraid") || q.get("wbraid") || /cpc|ppc|paid/i.test(q.get("utm_medium") || "")) return "Google Ads";
    if (q.get("fbclid") && !q.get("utm_source")) return "Meta Ads";
    if (q.get("epik") && !q.get("utm_source")) return "Pinterest Ads";
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
  window.kerlaLead = function (how) {
    gtag("event", "conversion", { send_to: LEAD, value: 1.0, currency: "GBP", method: how });
    if (window.fbq) fbq("track", "Lead", { content_name: how });
    if (window.pintrk) pintrk("track", "lead", { lead_type: how });
  };
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
    if (v === "granted") { rememberSource(); loadSocial(); } else { try { localStorage.removeItem(SKEY); } catch (e) {} }
    var b = document.getElementById("consent"); if (b) b.remove();
  }
  /* lets anyone change their mind: clears the choice and reloads, so the bar shows again */
  window.kerlaResetConsent = function () { try { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); } catch (e) {} location.reload(); };
  if (!saved) document.addEventListener("DOMContentLoaded", function () {
    var b = document.createElement("div"); b.id = "consent"; b.setAttribute("role", "region"); b.setAttribute("aria-label", "Cookie choice");
    b.innerHTML = '<p>We use cookies to see which Google, Facebook, Instagram and Pinterest adverts bring people to Kerla. Is that OK? <a href="/privacy/">Privacy notice</a></p><div><button type="button" data-v="denied">No thanks</button><button type="button" data-v="granted">Accept</button></div>';
    b.addEventListener("click", function (e) { var v = e.target.getAttribute("data-v"); if (v) setConsent(v); });
    document.body.appendChild(b);
  });
})();
