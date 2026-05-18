const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../src/mikrobleiding.njk");
let s = fs.readFileSync(file, "utf8");

const startRe =
  /  \{# ═+\r?\n     2b\. BEFORE \/ AFTER \(mini\)/;
const endRe =
  /  \{# ═+\r?\n     3\. BENEFITS \/ PAIN POINTS/;

const startMatch = s.match(startRe);
const endMatch = s.match(endRe);
const start = startMatch ? startMatch.index : -1;
const end = endMatch ? endMatch.index : -1;
if (start < 0 || end < 0) {
  console.error("markers not found", { start, end });
  process.exit(1);
}

const replacement = `  {# ═══════════════════════════════════════════════\r
     2b. BEFORE / AFTER\r
  ═══════════════════════════════════════════════ #}\r
  {% set baClients = beforeAfter.microblading if beforeAfter and beforeAfter.microblading else [] %}
  {% set baSectionId = "lp-before-after" %}
  {% set baHeadingId = "lp-before-after-heading" %}
  {% set baEyebrow = "Резултати" %}
  {% set baTitle = "Преди / След" %}
  {% set baLead = "Ако веждите ви не подчертават лицето ви, цялото излъчване страда." %}
  {% set baEyebrowI18n = "pages.mikrobleiding.beforeAfter.eyebrow" %}
  {% set baTitleI18n = "pages.mikrobleiding.beforeAfter.title" %}
  {% set baLeadI18n = "pages.mikrobleiding.beforeAfter.lead" %}
  {% include "sections/before-after-carousel.njk" %}\r
\r
\r
`;

fs.writeFileSync(file, s.slice(0, start) + replacement + s.slice(end));
console.log("patched mikrobleiding before/after carousel");
