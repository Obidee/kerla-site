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

  /* one call for every kind of enquiry: form, email link, Instagram link */
  window.kerlaLead = function (how) { gtag("event", "conversion", { send_to: LEAD, value: 1.0, currency: "GBP", method: how }); };
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href");
    if (/^mailto:/i.test(h)) kerlaLead("email");
    else if (/instagram\.com\/kerla\.studio/i.test(h)) kerlaLead("instagram");
  }, true);

  /* small consent bar */
  function setConsent(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    gtag("consent", "update", { ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v });
    gtag("set", "ads_data_redaction", v === "denied");
    var b = document.getElementById("consent"); if (b) b.remove();
  }
  if (!saved) document.addEventListener("DOMContentLoaded", function () {
    var b = document.createElement("div"); b.id = "consent"; b.setAttribute("role", "region"); b.setAttribute("aria-label", "Cookie choice");
    b.innerHTML = '<p>We use cookies to see which adverts bring people to Kerla. Is that OK?</p><div><button type="button" data-v="denied">No thanks</button><button type="button" data-v="granted">Accept</button></div>';
    b.addEventListener("click", function (e) { var v = e.target.getAttribute("data-v"); if (v) setConsent(v); });
    document.body.appendChild(b);
  });
})();
