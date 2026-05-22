module.exports = function (eleventyConfig) {
  // Allow access from phone/other devices on same WiFi.
  // Do not force a custom watch list here, otherwise live reload
  // can miss template/data updates until a manual refresh.
  eleventyConfig.setServerOptions({
    showAllHosts: true,
  });

  // Passthrough copy: src/assets → _site/assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/assets/images/favicon.png": "favicon.png" });
  eleventyConfig.addPassthroughCopy({ "src/assets/images/favicon.png": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({
    "src/assets/js/i18n.js": "assets/js/i18n.js",
    "src/assets/js/strip-scroll.js": "assets/js/strip-scroll.js",
    "src/assets/js/clients-strip.js": "assets/js/clients-strip.js",
  });
  // Watch data so navigation/content tweaks trigger rebuild
  eleventyConfig.addWatchTarget("src/_data");

  eleventyConfig.addNunjucksFilter("isVideoPath", function (src) {
    if (!src || typeof src !== "string") return false;
    return /\.mp4(\?|#|$)/i.test(src.trim());
  });

  eleventyConfig.addFilter("filterMicrobladingTestimonials", function (items) {
    if (!Array.isArray(items)) return [];
    const mbPattern = /микроблейдинг|microblading|phibrows/i;
    return items
      .map(function (item, index) {
        return Object.assign({}, item, { sourceIndex: index });
      })
      .filter(function (item) {
        const quote = item.quote || "";
        if (mbPattern.test(quote)) return true;
        if (/почистване/i.test(quote)) return false;
        if (/молив/i.test(quote) && /вежд/i.test(quote) && !/ламиниран/i.test(quote)) {
          return true;
        }
        if (/перманентно/i.test(quote) && /лицето/i.test(quote)) return true;
        return false;
      });
  });

  eleventyConfig.addGlobalData("buildDate", () => new Date().toISOString().slice(0, 10));
  eleventyConfig.addGlobalData("currentYear", () => new Date().getFullYear());

  eleventyConfig.addCollection("sitemap", function (collectionApi) {
    return collectionApi
      .getAll()
      .filter(function (item) {
        if (!item.url || item.data.sitemap === false) return false;
        if (!item.outputPath || !/\.html$/i.test(item.outputPath)) return false;
        const path = item.url.replace(/\/$/, "") || "/";
        if (path === "/sitemap.xml" || path === "/robots.txt") return false;
        return true;
      })
      .sort(function (a, b) {
        const rank = function (page) {
          if (page.url === "/" || page.url === "") return 0;
          if (page.url === "/mikrobleiding/") return 1;
          if (page.url === "/laminirane/") return 2;
          return 3;
        };
        return rank(a) - rank(b);
      });
  });

  // pathPrefix from env (for subfolder hosting)
  const pathPrefix = process.env.PATH_PREFIX || "/";

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    pathPrefix,
    templateFormats: ["njk", "html", "md"],
    htmlTemplateEngine: "njk",
  };
};

