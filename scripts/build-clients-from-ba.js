const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../src/assets/images/before-after");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpeg"));

const slugLabels = {
  microblading: "Микроблейдинг",
  "laminirane-migli-vejdi": "Ламиниране на мигли и вежди",
  "laminirane-vejdi-i-migli": "Ламиниране на вежди и мигли",
  "laminirane-i-boqdisvane-vejdi": "Ламиниране и боядисване на вежди",
};

const slugLabelsEn = {
  microblading: "Microblading",
  "laminirane-migli-vejdi": "Lash and brow lamination",
  "laminirane-vejdi-i-migli": "Brow and lash lamination",
  "laminirane-i-boqdisvane-vejdi": "Brow lamination and tinting",
};

const pairs = {};
for (const f of files) {
  const m = f.match(/^ba(\d+)-(before|after)-(.+)\.jpeg$/);
  if (!m) continue;
  const [, num, phase, slug] = m;
  const key = `${num}-${slug}`;
  if (!pairs[key]) pairs[key] = { num: +num, slug, before: null, after: null };
  pairs[key][phase] = f;
}

let out = [];
for (const key of Object.keys(pairs)) {
  const p = pairs[key];
  if (!p.before || !p.after) continue;
  const label = slugLabels[p.slug] || p.slug;
  out.push({
    id: `ba-${String(p.num).padStart(2, "0")}-${p.slug}`,
    name: label,
    services: [label],
    beforeImage: `/assets/images/before-after/${p.before}`,
    afterImage: `/assets/images/before-after/${p.after}`,
    _num: p.num,
    _slug: p.slug,
  });
}

out.sort((a, b) => {
  if (a._num !== b._num) return a._num - b._num;
  if (a._slug === "microblading") return -1;
  if (b._slug === "microblading") return 1;
  return a._slug.localeCompare(b._slug);
});

const en = out.map((o) => {
  const label = slugLabelsEn[o._slug] || o.name;
  return { name: label, services: [label] };
});

out.forEach((o, index) => {
  o.i18nIndex = index;
  delete o._num;
  delete o._slug;
});

fs.writeFileSync(
  path.join(__dirname, "../src/_data/clients.json"),
  JSON.stringify(out, null, 2) + "\n"
);

const enModule =
  "module.exports = " +
  JSON.stringify(en, null, 2) +
  ";\n";

fs.writeFileSync(path.join(__dirname, "../src/_data/i18n/en/clients.js"), enModule);

console.log(`Wrote ${out.length} before/after entries.`);
