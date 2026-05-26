const fs = require("fs");
for (const file of ["_site/index.html", "_site/microblading/index.html"]) {
  const h = fs.readFileSync(file, "utf8");
  const m = h.match(/<section[^>]*id="[^"]*before-after[^"]*"[^>]*>/i) ||
    h.match(/<section[^>]*id="clients"[^>]*>/i);
  console.log(file, m ? m[0] : "not found");
}
