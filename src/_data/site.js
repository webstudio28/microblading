const path = require("path");
const config = require(path.join(__dirname, "site.config.json"));

const siteUrl = (process.env.SITE_URL || config.seo?.siteUrl || "https://www.valyamatovska.bg").replace(/\/+$/, "");

module.exports = {
  ...config,
  seo: {
    ...config.seo,
    siteUrl,
  },
  currentYear: new Date().getFullYear(),
};

