import shortcodes from "./utils/shortcodes.js";
import filters from "./utils/filters.js";
import collections from "./utils/collections.js";
import transforms from "./utils/transforms.js";

import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginRss from "@11ty/eleventy-plugin-rss";

// import UpgradeHelper from "@11ty/eleventy-upgrade-help";

export default async (eleventyConfig) => {
  // eleventyConfig.addPlugin(UpgradeHelper);
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addLayoutAlias("default", "layouts/pages.njk");
  eleventyConfig.addLayoutAlias("pages", "layouts/pages.njk");

  eleventyConfig
    .addPassthroughCopy({ "src/assets/images": "/assets/images" })
    .addPassthroughCopy({ "src/assets/icons": "/assets/icons" })
    .addPassthroughCopy({ "src/assets/vendor": "vendor" })
    .addPassthroughCopy({ "src/public": "/" });

  eleventyConfig.setServerOptions({
    watch: ["./dist/assets/css", "./dist/assets/js"],
    domDiff: false,
    liveReload: true,
  });

  Object.keys(shortcodes).forEach((name) => {
    eleventyConfig.addShortcode(name, shortcodes[name]);
  });

  Object.keys(filters).forEach((name) => {
    eleventyConfig.addFilter(name, filters[name]);
  });

  Object.keys(collections).forEach((name) => {
    eleventyConfig.addCollection(name, collections[name]);
  });

  Object.keys(transforms).forEach((name) => {
    eleventyConfig.addTransform(name, transforms[name]);
  });

  eleventyConfig.setUseGitIgnore(false);

  return {
    dir: {
      input: "src",
      output: "dist",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
