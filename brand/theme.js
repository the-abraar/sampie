// Points every <use class="mark"> at the logo named by <html data-mark>.
// ?theme=noir&mark=h&tagline=… in the URL previews another palette/logo/tagline without editing files.
const params = new URLSearchParams(location.search);
const root = document.documentElement;
if (params.get("theme")) root.dataset.theme = params.get("theme");
if (params.get("mark")) root.dataset.mark = params.get("mark");
if (params.get("tagline")) for (const el of document.querySelectorAll(".tagline")) el.textContent = params.get("tagline");
for (const use of document.querySelectorAll("use.mark")) {
  use.setAttribute("href", `/brand/logos.svg#mark-${root.dataset.mark || "h"}`);
}
