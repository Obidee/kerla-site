/* Kerla — floating WhatsApp button (click-to-chat) */
(function () {
  var NUM = "447460839878";
  var MSG = "Hi Kerla, I'd like to ask about a shoot. ";
  function add() {
    if (document.getElementById("wa-chat")) return;
    var a = document.createElement("a");
    a.id = "wa-chat";
    a.href = "https://wa.me/" + NUM + "?text=" + encodeURIComponent(MSG);
    a.target = "_blank"; a.rel = "noopener";
    a.setAttribute("aria-label", "Message Kerla on WhatsApp");
    a.innerHTML = '<svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2a13.2 13.2 0 0 0 6.6 1.7c7.2 0 13-5.7 13-12.8C29 8.7 23.2 3 16 3zm0 23.3c-2.1 0-4.1-.6-5.8-1.6l-.4-.3-3.8 1.2 1.2-3.7-.3-.4a10.4 10.4 0 0 1-1.7-5.7C5.2 10 10 5.3 16 5.3S26.8 10 26.8 15.8 22 26.3 16 26.3zm5.9-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.2-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.8 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg><span>WhatsApp us</span>';
    document.body.appendChild(a);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();
