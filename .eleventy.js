const CleanCSS = require('clean-css');
const Image = require('@11ty/eleventy-img');
const { minify } = require('terser');
const path = require('path');

/**
 * Generates a readable image file name.
 * @param {*} id
 * @param {*} src
 * @param {*} width
 * @param {*} format
 * @param {*} options
 * @returns
 */
function getImageFilename(id, src, width, format, options) {
  const extension = path.extname(src);
  const name = path.basename(src, extension);

  // id is hash based, this gives us readable file names
  return `${name}-${width}w.${format}`;
}

function createResponsiveImageGenerator(widths) {
  return async function getResponsiveImage(src, alt, sizes = '100vw', htmlClass = '') {
    let metadata = await Image(src, {
      widths,
      formats: ['avif', 'webp', 'jpeg'],
      outputDir: './_site/images/optimized/',
      urlPath: '/images/optimized/',
      filenameFormat: getImageFilename,
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: 'lazy',
      decoding: 'async',
      class: htmlClass,
    };

    // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
    return Image.generateHTML(metadata, imageAttributes, {
      whitespaceMode: 'inline',
    });
  };
}

/**
 * Returns a link styled as a button.
 * @param {*} text
 * @param {*} htmlClass
 * @param {*} href
 * @returns
 */
function buttonShortcode(text, href, htmlClass = '') {
  return `<a class="button ${htmlClass}" href="${href}">${text}</a>`;
}

const thumbnailShortcode = createResponsiveImageGenerator([760]);

/**
 * Generates markup required for lightGallery to use picture elements with responsive images.
 * @param {*} mainSrc
 * @param {*} alt
 * @returns
 */
async function galleryItemShortcode(mainSrc, alt, caption = '') {
  const thumbnail = await thumbnailShortcode(mainSrc, alt, null, 'gallery__image');
  const stats = await Image(mainSrc, {
    widths: [760, 1120],
    formats: ['webp', 'jpeg'],
    outputDir: './_site/images/optimized/',
    urlPath: '/images/optimized/',
    filenameFormat: getImageFilename,
  });

  const srcSetWebp = stats.webp.map(({ srcset }) => srcset).join(', ');
  const dataSourcesWebp = { srcset: srcSetWebp, type: 'image/webp' };

  const srcSetJpg = stats.jpeg.map(({ srcset }) => srcset).join(', ');
  const dataSourcesJpeg = { srcset: srcSetJpg, type: 'image/jpeg' };

  const srcSet = JSON.stringify([dataSourcesWebp, dataSourcesJpeg]);

  return `<a data-sub-html="<p>${caption}</p>" data-src="${stats.jpeg[0].url}" data-sources='${srcSet}'>${thumbnail}</a>`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('images');

  /* gallery - lightbox */
  eleventyConfig.addPassthroughCopy({
    './node_modules/lightgallery/css/lightgallery-bundle.min.css': 'lib/lightgallery.css',
    './node_modules/lightgallery/lightgallery.min.js': 'lib/lightgallery.js',
    './node_modules/lightgallery/plugins/fullscreen/lg-fullscreen.min.js': 'lib/fs.js',
    './node_modules/lightgallery/plugins/zoom/lg-zoom.min.js': 'lib/zoom.js',
    './node_modules/lightgallery/images/loading.gif': 'images/loading.gif',
    './node_modules/lightgallery/fonts/lg.ttf': 'fonts/lg.ttf',
    './node_modules/lightgallery/fonts/lg.woff': 'fonts/lg.woff',
  });

  /* gallery - masonry */
  eleventyConfig.addPassthroughCopy({
    './node_modules/justifiedGallery/dist/css/justifiedGallery.min.css': 'lib/justifiedGallery.css',
    './node_modules/justifiedGallery/dist/js/jquery.justifiedGallery.min.js':
      'lib/justifiedGallery.js',
  });

  // add a template shortcode to replace image references with optimized ones
  eleventyConfig.addNunjucksAsyncShortcode(
    'image',
    createResponsiveImageGenerator([320, 760, 1120])
  );
  eleventyConfig.addNunjucksAsyncShortcode('thumb', thumbnailShortcode);
  eleventyConfig.addNunjucksAsyncShortcode('gallery', galleryItemShortcode);

  eleventyConfig.addNunjucksShortcode('button', buttonShortcode);

  // inline css
  eleventyConfig.addFilter('cssmin', function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // inline js
  eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (code, callback) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error('Terser error: ', err);
      // Fail gracefully.
      callback(null, code);
    }
  });

  return {
    dir: {
      includes: '../_includes',
      data: '../_data',
      input: 'pages',
      output: '_site',
    },
  };
};
