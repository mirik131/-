/* Навигация, появление, наклон, формы, vCard, админ-флаги */
(function () {
  "use strict";
  var T1 = window.T1 || { content: {}, admin: {} };

  /* подстановка контента */
  document.querySelectorAll("[data-t1]").forEach(function (el) {
    var v = T1.content[el.getAttribute("data-t1")];
    if (typeof v === "string") el.textContent = v;
  });
  document.querySelectorAll("[data-t1-href]").forEach(function (el) {
    var v = T1.content[el.getAttribute("data-t1-href")];
    if (typeof v === "string") el.href = v;
  });

  /* админ-флаги: скрываемые блоки */
  if (!T1.admin.showForm2) { var f2 = document.getElementById("form2block"); if (f2) f2.style.display = "none"; }
  if (!T1.admin.showQr) { var q = document.getElementById("qrblock"); if (q) q.style.display = "none"; }
  if (!T1.admin.showCta) { document.querySelectorAll("[data-cta]").forEach(function (el) { el.style.display = "none"; }); }

  /* бургер */
  var burger = document.getElementById("burger");
  var links = document.getElementById("navlinks");
  if (burger && links) burger.addEventListener("click", function () { links.classList.toggle("open"); });

  /* появление при скролле */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".rv").forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 90 + "ms";
    io.observe(el);
  });

  /* наклон карточек */
  document.querySelectorAll(".tilt").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = "perspective(800px) rotateY(" + (x * 7) + "deg) rotateX(" + (-y * 7) + "deg) translateY(-4px)";
    });
    card.addEventListener("pointerleave", function () { card.style.transform = ""; });
  });

  /* тост */
  var toastT = null;
  window.t1toast = function (msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("show"); }, 2600);
  };

  /* формы -> localStorage (на WP заменить на CF7/FluentForms) */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (inp) {
        var bad = !inp.value.trim() || (inp.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
        inp.classList.toggle("err", bad);
        if (bad) ok = false;
      });
      if (!ok) { window.t1toast("Проверьте подсвеченные поля"); return; }
      var data = { form: form.getAttribute("data-lead"), at: new Date().toISOString() };
      form.querySelectorAll("input, textarea, select").forEach(function (inp) {
        if (inp.name) data[inp.name] = inp.value;
      });
      try {
        var arr = JSON.parse(localStorage.getItem("t1leads") || "[]");
        arr.push(data);
        localStorage.setItem("t1leads", JSON.stringify(arr));
      } catch (err) {}
      var box = form.querySelector(".form-ok");
      if (box) box.classList.add("show");
      form.querySelectorAll("input, textarea").forEach(function (inp) { inp.value = ""; });
      window.t1toast("Отправлено! Мы свяжемся с вами.");
    });
  });

  /* сохранить контакт — настоящий .vcf */
  document.querySelectorAll("[data-vcard]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var c = T1.content;
      var vcf = ["BEGIN:VCARD", "VERSION:3.0",
        "FN:" + c.name, "TITLE:" + c.role,
        "EMAIL:" + c.email, "TEL;TYPE=CELL:" + c.phone, "URL:" + c.site,
        "END:VCARD"].join("\r\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard;charset=utf-8" }));
      a.download = "contact.vcf";
      document.body.appendChild(a); a.click(); a.remove();
      window.t1toast("Контакт сохранён в файл");
    });
  });

  /* QR: свой файл assets/qr.png, иначе заглушка */
  var qr = document.getElementById("qrimg");
  if (qr) {
    qr.addEventListener("error", function h() {
      qr.removeEventListener("error", h);
      qr.src = "assets/qr-placeholder.svg";
    });
  }
})();
