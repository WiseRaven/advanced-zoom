# ADVANCED ZOOM

```shell
bower install advanced-zoom --save
```

A simple library for image zooming; as seen on
[Medium](https://medium.com/designing-medium/image-zoom-on-medium-24d146fc0c20).

This library is a fork of the [original jQuery plugin by
fat](https://github.com/fat/zoom.js). This version does not depend on jQuery.
Originally forked from [zoom-vanilla.js](https://github.com/spinningarrow/zoom-vanilla.js)

I added new feature for `video` and `picture` zooming that works like the image zooming.
Looking for demo and try all supports

### Demo
[http://heavybeard.github.io/advanced-zoom/dist/](http://heavybeard.github.io/advanced-zoom/dist/)

### How

1 - Link the advanced-zoom.js and advanced-zoom.css files to your site or application.

```html
<link href="asset/css/advanced-zoom.min.css" rel="stylesheet"><!-- inside <head> -->
<script src="asset/js/advanced-zoom.min.js"></script><!-- before </body> -->
```

2 - Add a `data-zoom="zoom"` attribute to the images or the videos you want to make zoomable. For example:

```html
<img src="asset/img/forest.jpg" data-zoom="zoom">
```

```html
<picture>
  <!--[if IE 9]><video style="display: none;"><![endif]-->
  <source srcset="asset/img/city.webp" type="image/webp">
  <!--[if IE 9]></video><![endif]-->
  <img src="asset/img/city.jpg" data-zoom="zoom">
</picture>
```

```html
<video data-zoom="zoom" width="320">
  <source src="asset/video/storm.webm" type="video/webm">
  <source src="asset/video/storm.ogv" type="video/ogv">
  <source src="asset/video/storm.mp4" type="video/mp4">
</video>
```

### Why

It's the best way to zoom an image or a video. It transitions/zooms in really smoothly, and then when you're done, scrolls away, [esc] keys away, clicks away… clean af.

If you hold your meta key (`⌘` or `Ctrl`) it will open in a new tab.
If you add the new data property `data-original="path/to/image"` it will open a different image on the new tab, for example the full size image.

```html
<img src="asset/img/city.jpg" data-zoom="zoom" data-original="asset/img/city.jpg">
```

### Where

advanced-zoom.js should (in theory) work in all modern browsers, in IE9 too. If not, create an issue! Thanks!

### Who

This version by [@heavybeard][], forked originally from [@spinningarrow](https://github.com/spinningarrow/zoom-vanilla.js).

Originally written by <a href="//twitter.com/fat">@fat</a>

[@heavybeard]: https://github.com/heavybeard
