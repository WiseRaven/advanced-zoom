// advanced-zoom - 1.0.0 (http://heavybeard.github.io/advanced-zoom/dist/)
+function() {
    "use strict";
    var scrollHandlerFn, clickHandlerFn, keyHandlerFn, touchStartFn, touchMoveFn;
    function realOffset(element) {
        var rect = element.getBoundingClientRect();
        return {
            top: rect.top + document.body.scrollTop,
            left: rect.left + document.body.scrollLeft
        };
    }
    function setTransformStyle(element, styleValue) {
        element.style.webkitTransform = styleValue;
        element.style.msTransform = styleValue;
        element.style.transform = styleValue;
    }
    function addEventTransitionEnd(element, callback) {
        if (!("transition" in document.body.style)) return callback;
        element.addEventListener("transitionend", callback);
        element.addEventListener("webkitTransitionEnd", callback);
    }
    function AdvancedZoomService() {
        this._activeAdvancedZoom = this._initialScrollPosition = this._initialTouchPosition = this._touchMoveListener = null;
        this._window = window;
        this._document = document;
        this._body = document.body;
    }
    AdvancedZoomService.prototype.listen = function() {
        document.body.addEventListener("click", function(event) {
            if (event.target.getAttribute("data-zoom") === "zoom") this._advancedZoom(event);
        }.bind(this));
    };
    AdvancedZoomService.prototype._advancedZoom = function(e) {
        var target = e.target;
        if (!target || target.tagName !== "IMG" && target.tagName !== "VIDEO" && target.tagName !== "PICTURE") return;
        if (this._body.classList.contains("zoom-overlay-open")) return;
        if (e.metaKey || e.ctrlKey) return window.open(e.target.getAttribute("data-zoom-original") || e.target.currentSrc || e.target.src, "_blank");
        if (target.width >= window.innerWidth - AdvancedZoom.OFFSET) return;
        this._activeAdvancedZoomClose(true);
        this._activeAdvancedZoom = new AdvancedZoom(target);
        this._activeAdvancedZoom.advancedZoomMedia(target.tagName);
        scrollHandlerFn = this._scrollHandler.bind(this);
        clickHandlerFn = this._clickHandler.bind(this);
        keyHandlerFn = this._keyHandler.bind(this);
        touchStartFn = this._touchStart.bind(this);
        this._window.addEventListener("scroll", scrollHandlerFn);
        this._document.addEventListener("click", clickHandlerFn);
        this._document.addEventListener("keyup", keyHandlerFn);
        this._document.addEventListener("touchstart", touchStartFn);
        e.stopPropagation();
    };
    AdvancedZoomService.prototype._activeAdvancedZoomClose = function(forceDispose) {
        if (!this._activeAdvancedZoom) return;
        if (forceDispose) this._activeAdvancedZoom.dispose(); else this._activeAdvancedZoom.close();
        this._window.removeEventListener("scroll", scrollHandlerFn);
        this._document.removeEventListener("click", clickHandlerFn);
        this._document.removeEventListener("keyup", keyHandlerFn);
        this._document.removeEventListener("touchstart", touchStartFn);
        this._activeAdvancedZoom = null;
    };
    AdvancedZoomService.prototype._scrollHandler = function(e) {
        var deltaY;
        if (this._initialScrollPosition === null) this._initialScrollPosition = window.scrollY;
        deltaY = this._initialScrollPosition - window.scrollY;
        if (Math.abs(deltaY) >= 40) this._activeAdvancedZoomClose();
    };
    AdvancedZoomService.prototype._keyHandler = function(e) {
        if (e.keyCode == 27) this._activeAdvancedZoomClose();
    };
    AdvancedZoomService.prototype._clickHandler = function(e) {
        e.stopPropagation();
        e.preventDefault();
        this._activeAdvancedZoomClose();
    };
    AdvancedZoomService.prototype._touchStart = function(e) {
        this._initialTouchPosition = e.touches[0].pageY;
        touchMoveFn = this._touchMove.bind(this);
        e.target.addEventListener("touchmove", touchMoveFn);
    };
    AdvancedZoomService.prototype._touchMove = function(e) {
        if (Math.abs(e.touches[0].pageY - this._initialTouchPosition) > 10) {
            this._activeAdvancedZoomClose();
            e.target.removeEventListener("touchmove", touchMoveFn);
        }
    };
    function AdvancedZoom(media) {
        this._fullHeight = this._fullWidth = this._overlay = this._targetMediaWrap = null;
        this._targetMedia = media;
        this._body = document.body;
    }
    AdvancedZoom.OFFSET = 80;
    AdvancedZoom._MAX_WIDTH = 2560;
    AdvancedZoom._MAX_HEIGHT = 4096;
    AdvancedZoom.prototype.advancedZoomMedia = function(tagName) {
        var target = this._targetMedia;
        var src = target.getAttribute("data-zoom-original") || target.currentSrc || target.src;
        target.classList.add("zoom-media-loading");
        if (tagName === "IMG" || tagName === "PICTURE") {
            var img = document.createElement("img");
            img.onload = function() {
                this._fullHeight = Number(img.height);
                this._fullWidth = Number(img.width);
                this._advancedZoomOriginal();
                target.classList.remove("zoom-media-loading");
                target.removeAttribute("data-zoom-original");
            }.bind(this);
            img.src = src;
        } else if (tagName === "VIDEO") {
            var video = document.createElement("video");
            var source = document.createElement("source");
            var _this = this;
            video.appendChild(source);
            video.addEventListener("canplay", function() {
                _this._fullHeight = Number(video.videoHeight);
                _this._fullWidth = Number(video.videoWidth);
                _this._advancedZoomOriginal();
                _this._targetMedia.play();
                _this._targetMedia.classList.remove("zoom-media-loading");
            }, false);
            source.src = src;
        }
        target.src = src;
    };
    AdvancedZoom.prototype._advancedZoomOriginal = function() {
        this._targetMediaWrap = document.createElement("div");
        this._targetMediaWrap.className = "zoom-media-wrap";
        this._targetMedia.parentNode.insertBefore(this._targetMediaWrap, this._targetMedia);
        this._targetMediaWrap.appendChild(this._targetMedia);
        this._targetMedia.classList.add("zoom-media");
        this._targetMedia.setAttribute("data-zoom", "zoom-out");
        this._overlay = document.createElement("div");
        this._overlay.className = "zoom-overlay";
        document.body.appendChild(this._overlay);
        this._calculateAdvancedZoom();
        this._triggerAnimation();
    };
    AdvancedZoom.prototype._calculateAdvancedZoom = function() {
        this._targetMedia.offsetWidth;
        var originalFullMediaWidth = this._fullWidth;
        var originalFullMediaHeight = this._fullHeight;
        var scrollTop = window.scrollY;
        var maxScaleFactor = originalFullMediaWidth / (this._targetMedia.width || this._targetMedia.videoWidth);
        var viewportHeight = window.innerHeight - AdvancedZoom.OFFSET;
        var viewportWidth = window.innerWidth - AdvancedZoom.OFFSET;
        var mediaAspectRatio = originalFullMediaWidth / originalFullMediaHeight;
        var viewportAspectRatio = viewportWidth / viewportHeight;
        if (originalFullMediaWidth < viewportWidth && originalFullMediaHeight < viewportHeight) this._mediaScaleFactor = maxScaleFactor; else if (mediaAspectRatio < viewportAspectRatio) this._mediaScaleFactor = viewportHeight / originalFullMediaHeight * maxScaleFactor; else this._mediaScaleFactor = viewportWidth / originalFullMediaWidth * maxScaleFactor;
    };
    AdvancedZoom.prototype._triggerAnimation = function() {
        this._targetMedia.offsetWidth;
        var mediaOffset = realOffset(this._targetMedia), scrollTop = window.scrollY;
        var viewportY = scrollTop + window.innerHeight / 2, viewportX = window.innerWidth / 2, mediaCenterY = mediaOffset.top + (this._targetMedia.height || this._targetMedia.offsetHeight) / 2, mediaCenterX = mediaOffset.left + (this._targetMedia.width || this._targetMedia.offsetWidth) / 2;
        this._translateY = Math.round(viewportY - mediaCenterY);
        this._translateX = Math.round(viewportX - mediaCenterX);
        var mediaTransform = "scale(" + this._mediaScaleFactor + ")", mediaWrapTransform = "translate(" + this._translateX + "px, " + this._translateY + "px) translateZ(0)";
        setTransformStyle(this._targetMedia, mediaTransform);
        setTransformStyle(this._targetMediaWrap, mediaWrapTransform);
        this._body.classList.add("zoom-overlay-open");
    };
    AdvancedZoom.prototype.close = function() {
        this._body.classList.remove("zoom-overlay-open");
        this._body.classList.add("zoom-overlay-transitioning");
        setTransformStyle(this._targetMedia, "");
        setTransformStyle(this._targetMediaWrap, "");
        addEventTransitionEnd(this._targetMedia, this.dispose.bind(this));
    };
    AdvancedZoom.prototype.dispose = function() {
        if (this._targetMediaWrap && this._targetMediaWrap.parentNode) {
            this._targetMedia.classList.remove("zoom-media");
            this._targetMedia.setAttribute("data-zoom", "zoom");
            this._targetMediaWrap.parentNode.replaceChild(this._targetMedia, this._targetMediaWrap);
            this._overlay.parentNode.removeChild(this._overlay);
            this._body.classList.remove("zoom-overlay-transitioning");
            if (this._targetMedia.tagName === "VIDEO" && this._targetMedia.getAttribute("data-zoom-play") === "always") this._targetMedia.play();
        }
    };
    new AdvancedZoomService().listen();
}();
