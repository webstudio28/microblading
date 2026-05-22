const path = require("path");
const fs = require("fs");

function loadOptimizedManifest() {
  const manifestPath = path.join(__dirname, "src", "_data", "optimized-images.json");
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return { images: {} };
  }
}

function assetKeyFromSrc(src) {
  if (!src || typeof src !== "string") return "";
  return src.replace(/^\/assets\//, "").replace(/^\//, "");
}

function getVariants(manifest, src, maxWidth) {
  const key = assetKeyFromSrc(src);
  let list = manifest.images[key];
  if (!list || !list.length) return null;
  list = [...list].sort((a, b) => a.width - b.width);
  if (maxWidth > 0) {
    list = list.filter((v) => v.width <= maxWidth);
    if (!list.length) {
      list = manifest.images[key].slice(-1);
    }
  }
  return list;
}

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

  const optimizedManifest = loadOptimizedManifest();

  eleventyConfig.addFilter("imgPicture", (src, maxWidth) => {
    const list = getVariants(optimizedManifest, src, Number(maxWidth) || 0);
    if (!list || !list.length) return null;
    const largest = list[list.length - 1];
    const srcset = list.map((v) => `${v.url} ${v.width}w`).join(", ");
    return {
      srcset,
      fallback: largest.url,
      width: largest.width,
      height: largest.height,
    };
  });

  eleventyConfig.addFilter("imgSrcset", (src, maxWidth) => {
    const list = getVariants(optimizedManifest, src, Number(maxWidth) || 0);
    if (!list || !list.length) return src;
    return list.map((v) => `${v.url} ${v.width}w`).join(", ");
  });

  eleventyConfig.addFilter("optImg", (src, maxWidth) => {
    const list = getVariants(optimizedManifest, src, Number(maxWidth) || 520);
    if (!list || !list.length) return src;
    return list[list.length - 1].url;
  });

  eleventyConfig.addFilter("optGalleryUrl", (src) => {
    const list = getVariants(optimizedManifest, src, 1200);
    if (!list || !list.length) return src;
    return list[list.length - 1].url;
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

