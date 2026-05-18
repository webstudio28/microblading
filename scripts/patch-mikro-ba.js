const fs = require("fs");
const p = require("path").join(__dirname, "../src/mikrobleiding.njk");
let s = fs.readFileSync(p, "utf8");

const replacement = `  {# ═══════════════════════════════════════════════
     2b. BEFORE / AFTER
  ═══════════════════════════════════════════════ #}
  {% set baClients = beforeAfter.microblading if beforeAfter and beforeAfter.microblading else [] %}
  {% set baSectionId = "lp-before-after" %}
  {% set baHeadingId = "lp-before-after-heading" %}
  {% set baEyebrow = "Резултати" %}
  {% set baTitle = "Преди / След" %}
  {% set baLead = "Реални резултати от микроблейдинг — преди и след процедурата." %}
  {% set baEyebrowI18n = "pages.mikrobleiding.beforeAfter.eyebrow" %}
  {% set baTitleI18n = "pages.mikrobleiding.beforeAfter.title" %}
  {% set baLeadI18n = "pages.mikrobleiding.beforeAfter.lead" %}
  {% include "sections/before-after-carousel.njk" %}

`;

s = s.replace(
  /  \{% if lpBeforeAfter[\s\S]*?  \{% endif %\}\n\n\n\n\n/,
  replacement + "\n"
);

s = s.replace(
  /\{# Before \/ after strip \+ lightbox #\}[\s\S]*?\{# Gallery carousel \+ lightbox #\}/,
  "{# Gallery carousel + lightbox #}"
);

fs.writeFileSync(p, s);
console.log("patched mikrobleiding.njk");
