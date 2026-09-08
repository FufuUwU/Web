// meow!
console.log("Hey! The fuck are you in the console for?");

fetch("/assets/ascii/yuri.ascii")
  .then((r) => r.text())
  .then(console.log)
  .catch(console.error);

function loadArt() {
  fetch("/arch.ascii")
    .then(function (r) {
      return r.ok ? r.text() : "";
    })
    .then(function (t) {
      if (!t) return;
      var lines = t.replace(/\r/g, "").split("\n");
      if (lines[0] && lines[0].trim().charAt(0) === "{") lines.shift();
      lines = lines.map(function (l) {
        return l.replace(/\$\{c\d\}/g, "");
      });
      while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
      archLines = lines;
    })
    .catch(function () {});
}

function openNav() {
  document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
}

/* ---- Vanta NET background, coloured from the active Catppuccin flavour ----
   The net's colours are never written literally here: they're read back off
   the CSS custom properties that css/themes/*.css define for the current
   html[data-flavor], so the background follows the theme switcher
   (js/flavors.js) for free and stays correct if a palette is ever edited.

   Vanta bakes options.color into the dot material and into its
   additive/subtractive blending choice at init time, so setOptions() would
   only repaint the lines and leave the dots on the old theme. A flavour
   change therefore tears the instance down and rebuilds it. */
(function vantaTheme() {
  var el = document.getElementById("background") || document.body;
  if (typeof VANTA === "undefined" || !VANTA.NET || !el) return;

  var root = document.documentElement;
  var instance = null;
  var applied = "";

  // "#cba6f7" -> 0xcba6f7, "245, 194, 231" -> 0xf5c2e7 (themes use both forms)
  function toHex(value, fallback) {
    var v = String(value || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(v)) return parseInt(v.slice(1), 16);

    var parts = v.split(",");
    if (parts.length === 3) {
      var rgb = [];
      for (var i = 0; i < 3; i++) {
        var n = parseInt(parts[i], 10);
        if (isNaN(n)) return fallback;
        rgb.push(Math.max(0, Math.min(255, n)));
      }
      return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
    }
    return fallback;
  }

  function themeColors() {
    var css = getComputedStyle(root);
    return {
      // --accent-rgb is the "live" accent: the flavour's pink by default, but
      // discord.js overrides it from the presence card's colours on /socials.
      color: toHex(css.getPropertyValue("--accent-rgb"), 0xf5c2e7),
      // Only feeds Vanta's light-vs-dark blending decision — backgroundAlpha 0
      // keeps the canvas transparent so body's --page-gradient still shows.
      background: toHex(css.getPropertyValue("--base"), 0x1e1e2e),
    };
  }

  function render() {
    var c = themeColors();
    var key = c.color + "/" + c.background;
    if (key === applied) return; // nothing colour-related actually moved
    applied = key;

    if (instance) instance.destroy();
    instance = VANTA.NET({
      el: el,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: c.color,
      backgroundColor: c.background,
      backgroundAlpha: 0,
    });
  }

  render();

  // flavors.js only flips [data-flavor] on <html>; discord.js writes
  // --accent-rgb into that same element's inline style. Watch both. The
  // early-out in render() matters here: heatmap.js also writes root styles on
  // window resize, and that must not restart the animation.
  new MutationObserver(render).observe(root, {
    attributes: true,
    attributeFilter: ["data-flavor", "style"],
  });
})();