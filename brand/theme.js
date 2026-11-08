// Points every <use class="mark"> at the logo named by <html data-mark>.
// ?theme=forest&mark=h in the URL previews another palette/logo without editing files.
const params = new URLSearchParams(location.search);
const root = document.documentElement;
if (params.get("theme")) root.dataset.theme = params.get("theme");
if (params.get("mark")) root.dataset.mark = params.get("mark");
for (const use of document.querySelectorAll("use.mark")) {
  use.setAttribute("href", `/brand/logos.svg#mark-${root.dataset.mark || "helix"}`);
}
