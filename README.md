[![Netlify Status](https://api.netlify.com/api/v1/badges/32ae3b7b-8cba-4304-b606-baa3279e0789/deploy-status)](https://app.netlify.com/sites/clever-johnson-732c2f/deploys)

# mare-portfolio

**[https://www.marijamiletic.com.hr/](https://www.marijamiletic.com.hr/)**

Static site - graphic designer portfolio. Built with [eleventy](https://www.11ty.dev/).

## Install & run

Project requires `node 14^`, once that is satisfied you can install dependencies and run it using the following commands: 
```
npm install
npm start
```

## Dev notes
This section documents the tools and practices used to implement this website.

### CSS & JS 
All custom CSS styles are minified and inlined using [clean-css](https://www.11ty.dev/docs/quicktips/inline-css/). Website only needs a couple of rules so it is much faster to embed them. 3rd party CSS stylesheets are included conditionally since they are needed on the portfolio page only. Similar approach was taken with custom JS scripts as well. Eleventy docs has a [quick tips](https://www.11ty.dev/docs/quicktips/) section that documents this.

### Layout
The **Pancake stack** layout was achieved with a [single line](https://web.dev/one-line-layouts/).

### Image optimization
Since this webiste includes an image gallery, optimizing images was key to getting a high performance score and fast loading times. [Image](https://www.11ty.dev/docs/plugins/image/) plugin was key here - it was used to create several versions of the same image source, varying by type (WEBP, AVIF, JPG) and size (depending on screen size). 

### Gallery
[Justified Gallery](https://miromannino.github.io/Justified-Gallery/) was used to achieve the masonry layout without too much trouble. Then [lightGallery](https://www.lightgalleryjs.com/) was used on top of it as a lightbox. While these libraries add some weight to the app, they also include performance tricks (like lazy loading) that would have required significant dev time if we wanted to build this from scratch.

## Deployment
Website gets built and deployed automatically on each push to `master` via Netlify GitHub app.
