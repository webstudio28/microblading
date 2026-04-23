module.exports = function (eleventyConfig) {
  // Allow access from phone/other devices on same WiFi + watch built CSS
  eleventyConfig.setServerOptions({
    showAllHosts: true,
    watch: ["_site/**/*.css"],
  });

  // Passthrough copy: src/assets → _site/assets
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  // Passthrough copy: tiny PHP API endpoint for cPanel
  eleventyConfig.addPassthroughCopy({ "src/api": "api" });

  // Watch data so navigation/content tweaks trigger rebuild
  eleventyConfig.addWatchTarget("src/_data");

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

