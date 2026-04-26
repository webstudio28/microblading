module.exports = function (eleventyConfig) {
  // Allow access from phone/other devices on same WiFi.
  // Do not force a custom watch list here, otherwise live reload
  // can miss template/data updates until a manual refresh.
  eleventyConfig.setServerOptions({
    showAllHosts: true,
  });

  // Passthrough copy: src/assets → _site/assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  // Passthrough copy: tiny PHP API endpoint for cPanel
  eleventyConfig.addPassthroughCopy({ "src/api": "api" });

  // Watch data so navigation/content tweaks trigger rebuild
  eleventyConfig.addWatchTarget("src/_data");

  eleventyConfig.addNunjucksFilter("isVideoPath", function (src) {
    if (!src || typeof src !== "string") return false;
    return /\.mp4(\?|#|$)/i.test(src.trim());
  });

  // Useful for sitemaps/lastmod (if added later)
  eleventyConfig.addGlobalData("buildDate", () => new Date().toISOString().slice(0, 10));

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

