// Tiny static server: the logo sprite (<use href="/brand/logos.svg#…">) needs http, not file://.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".pdf": "application/pdf" };

export function serve(port = 4321) {
  return http.createServer(async (req, res) => {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path.endsWith("/")) path += "index.html";
    const file = normalize(join(root, path));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) return res.writeHead(403).end();
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  }).listen(port);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve();
  console.log("Card:        http://localhost:4321/card/\nBrand sheet: http://localhost:4321/brand/\nPreview another look: add ?theme=forest&mark=h");
}
