const fs = require("fs");

function uniqueClientIds(html) {
  return [
    ...new Set(
      [...html.matchAll(/data-client-id="([^"]+)"/g)].map((m) => m[1])
    ),
  ];
}

const mikro = fs.readFileSync("_site/mikrobleiding/index.html", "utf8");
const lam = fs.readFileSync("_site/laminirane/index.html", "utf8");
const home = fs.readFileSync("_site/index.html", "utf8");

console.log("mikro", uniqueClientIds(mikro).length);
console.log("lam", uniqueClientIds(lam).length);
console.log("home", uniqueClientIds(home).length);
