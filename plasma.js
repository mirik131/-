/* Плазма-прожилки: тонкие белые нити на чёрном, высокое разрешение */
(function () {
  var cv = document.getElementById("plasma");
  if (!cv) return;
  var ctx = cv.getContext("2d");
  var W, H, SH, img;
  var SW = 300;
  var small = document.createElement("canvas");
  var sctx = small.getContext("2d", { willReadFrequently: true });
  function resize() {
    W = cv.width = innerWidth;
    H = cv.height = innerHeight;
    SH = Math.max(80, Math.round(SW * H / W));
    small.width = SW; small.height = SH;
    img = sctx.createImageData(SW, SH);
  }
  resize();
  addEventListener("resize", resize);

  var perm = new Uint8Array(512);
  (function () {
    var p = [], s = 1337, i, j, t;
    for (i = 0; i < 256; i++) p[i] = i;
    function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; }
    for (i = 255; i > 0; i--) { j = (rnd() * (i + 1)) | 0; t = p[i]; p[i] = p[j]; p[j] = t; }
    for (i = 0; i < 512; i++) perm[i] = p[i & 255];
  })();
  function fade(t) { return t * t * (3 - 2 * t); }
  function n2(x, y) {
    var X = Math.floor(x), Y = Math.floor(y);
    var xf = x - X, yf = y - Y;
    var a = perm[(perm[X & 255] + Y) & 255] / 255;
    var b = perm[(perm[(X + 1) & 255] + Y) & 255] / 255;
    var c = perm[(perm[X & 255] + Y + 1) & 255] / 255;
    var d = perm[(perm[(X + 1) & 255] + Y + 1) & 255] / 255;
    var u = fade(xf), v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, oct) {
    var a = 0, amp = 0.5, f = 1, i;
    for (i = 0; i < oct; i++) { a += amp * n2(x * f, y * f); f *= 2.03; amp *= 0.5; }
    return a;
  }

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = Math.random() * 100;
  function frame() {
    t += 0.0035;
    var d = img.data, sc = 2.2, ar = W / H, x, y, idx;
    for (y = 0; y < SH; y++) {
      var ny = y / SH * sc;
      for (x = 0; x < SW; x++) {
        var nx = x / SW * sc * (ar > 1 ? ar : 1);
        var qx = fbm(nx + 5.2 + t * 0.12, ny + 1.3, 2);
        var qy = fbm(nx + 1.7, ny + 9.1 - t * 0.1, 2);
        var n = fbm(nx + 2.6 * (qx - 0.5) + t * 0.08, ny + 2.6 * (qy - 0.5), 3);
        var r = 1 - Math.abs(n * 2 - 1);
        r = Math.pow(r * r, 10);
        var core = Math.min(1, r * 1.1);
        var glow = fbm(nx * 0.7 - t * 0.04, ny * 0.7, 2) * 4;
        idx = (y * SW + x) * 4;
        var v = Math.min(255, core * 255 + glow);
        d[idx] = v; d[idx + 1] = v; d[idx + 2] = v; d[idx + 3] = 255;
      }
    }
    sctx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(small, 0, 0, W, H);
    if (!reduced) requestAnimationFrame(frame);
  }
  frame();
})();
