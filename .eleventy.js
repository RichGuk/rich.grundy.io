const fs = require('fs');
const path = require('path');
const htmlmin = require('html-minifier');
const { DateTime } = require('luxon');
const slugify = require('slugify');

const manifestPath = path.resolve(__dirname, 'dist', 'assets-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }));

const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require('@11ty/eleventy-plugin-rss');

const slugFilter = (str) => {
  return slugify(str, {
    remove: /[*+~.()'"!:@,]/g,
    replacement: '-',
    lower: true,
  });
};

module.exports = (eleventyConfig) => {
  const devMode = process.env.NODE_ENV !== 'production';

  const tagBlackList = new Set(['post', 'posts']);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addLayoutAlias('default', 'layouts/pages.njk');
  eleventyConfig.addLayoutAlias('pages', 'layouts/pages.njk');

  eleventyConfig
    .addPassthroughCopy({ 'src/assets/static': '/' })
    .addPassthroughCopy({ 'src/assets/vendor': 'vendor' });

  eleventyConfig.addShortcode('assetDigest', (name) => {
    if (!manifest[name]) {
      throw new Error(`The asset ${name} does not exist in ${manifestPath}`);
    }
    return manifest[name];
  });

  eleventyConfig.addFilter('slug', (str) => {
    return slugFilter(str);
  });

  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('dd LLL yyyy');
  });

  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-LL-dd');
  });

  eleventyConfig.addFilter('formatDate', (dateObj, format) => {
    return DateTime.fromJSDate(dateObj).toFormat(format);
  });

  eleventyConfig.addFilter('limit', (arr, limit) => {
    return arr.slice(0, limit);
  });

  eleventyConfig.addFilter('validTags', (tags) => {
    if (!tags) {
      return [];
    }
    return tags.filter((t) => t && !tagBlackList.has(t)).map((t) => slugFilter(t));
  });

  eleventyConfig.addCollection('tagList', function (collection) {
    let newTags = {};

    collection.getAll().forEach((item) => {
      if (item.data['tags']) {
        item.data['tags']
          .filter((t) => t && !tagBlackList.has(t))
          .forEach((tag) => {
            if (!newTags[tag]) {
              newTags[tag] = 0;
            }

            newTags[tag]++;
          });
      }
    });

    return Object.keys(newTags)
      .sort()
      .reduce((res, k) => {
        k = slugFilter(k);
        res[k] = newTags[k];
        return res;
      }, {});
  });

  // Reload the page if any JS/CSS files cause manifest.json update.
  eleventyConfig.setBrowserSyncConfig({ files: [manifestPath] });

  // Minify HTML in for the prod build.
  if (!devMode) {
    eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        let minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        });
        return minified;
      }
      return content;
    });
  }

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
    passthroughFileCopy: true,
  };
};
