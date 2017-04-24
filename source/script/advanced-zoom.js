/**
 * ADVANCED ZOOM
 * @description Zoom on img, picture and video source like Medium
 * @see http://heavybeard.github.io/advanced-zoom/dist/
 */

+ function () {
    "use strict";

    /** Global functions */
    var scrollHandlerFn,
        clickHandlerFn,
        keyHandlerFn,
        touchStartFn,
        touchMoveFn;


    /**
     * OFFSET
     * @description Find the position of the element
     * @see http://youmightnotneedjquery.com/#offset
     * @param DOM element The element
     * @return object offset The real position top and left
     */
    function realOffset(element) {
        var rect = element.getBoundingClientRect();

        return {
            top: rect.top + window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
            left: rect.left + window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0
        };
    }


    /**
     * SET TRANSFOR MSTYLE
     * @description Set transform style
     * @param DOM element The element to style
     * @param string styleValue The value of transform style
     */
    function setTransformStyle(element, styleValue) {
        element.style.webkitTransform = styleValue;
        element.style.msTransform = styleValue;
        element.style.transform = styleValue;
    }

    /**
     * ADD EVENT TRANSITION NED
     * @description Add event on transition end
     * @param DOM element The element to style
     * @param string styleValue The value of transform style
     */
    function addEventTransitionEnd(element, callback) {
        if (!('transition' in document.body.style)) /** fallback */
            return callback;
        element.addEventListener('transitionend', callback);
        element.addEventListener('webkitTransitionEnd', callback);
    }


    /**
     * ADVANCEDZOOMSERVICE
     * @description Create the AdvancedZoomService object
     */
    function AdvancedZoomService() {
        this._activeAdvancedZoom = this._initialScrollPosition = this._initialTouchPosition = this._touchMoveListener = null;
        this._window = window;
        this._document = document;
        this._body = document.body;
    }

    /**
     * ADVANCEDZOOMSERVICE LISTEN
     * @description Add _advancedZoom on clicked data-zoom DOM element
     */
    AdvancedZoomService.prototype.listen = function () {
        document.body.addEventListener('click', function (event) {
            if (event.target.getAttribute('data-zoom') === 'zoom')
                this._advancedZoom(event);
        }.bind(this));
    };

    /**
     * ADVANCEDZOOMSERVICE _ADVANCEDZOOM
     * @description Add the _advancedZoom
     * @param object e The Event object
     * @return For stopping
     */
    AdvancedZoomService.prototype._advancedZoom = function (e) {
        var target = e.target;

        /** STOP _ADVANCEDZOOM */
        /** if is not IMG or VIDEO tag */
        if (!target || target.tagName !== 'IMG' && target.tagName !== 'VIDEO' && target.tagName !== 'PICTURE')
            return;
        /** if another media is opened */
        if (this._body.classList.contains('zoom-overlay-open'))
            return;
        /** if meta or ctrl key is pressed, than open custom source*/
        if (e.metaKey || e.ctrlKey)
            return window.open((e.target.getAttribute('data-zoom-original') || e.target.currentSrc || e.target.src), '_blank');
        /** if width is bigger than viewport width */
        if (target.width >= (window.innerWidth - AdvancedZoom.OFFSET))
            return;

        /** START _ADVANCEDZOOM */
        this._activeAdvancedZoomClose(true);
        this._activeAdvancedZoom = new AdvancedZoom(target);
        this._activeAdvancedZoom.advancedZoomMedia(target.tagName);
        /** Add current functions to global functions on element event listener */
        scrollHandlerFn = this._scrollHandler.bind(this);
        clickHandlerFn = this._clickHandler.bind(this);
        keyHandlerFn = this._keyHandler.bind(this);
        touchStartFn = this._touchStart.bind(this);
        this._window.addEventListener('scroll', scrollHandlerFn);
        this._document.addEventListener('click', clickHandlerFn);
        this._document.addEventListener('keyup', keyHandlerFn);
        this._document.addEventListener('touchstart', touchStartFn);

        e.stopPropagation();
    };

    /**
     * ADVANCEDZOOMSERVICE _ACTIVEADVANCEDZOOMCLOSE
     * @description Reset the _advancedZoom
     * @param bool forceDispose Set true for completely remove
     * @return For stopping
     */
    AdvancedZoomService.prototype._activeAdvancedZoomClose = function (forceDispose) {
        /** Stop closing if _advancedZoom is not active */
        if (!this._activeAdvancedZoom)
            return;

        /** Force the remove */
        if (forceDispose)
            this._activeAdvancedZoom.dispose();
        else
            this._activeAdvancedZoom.close();

        /** Remove current functions to global functions on element event listener */
        this._window.removeEventListener('scroll', scrollHandlerFn);
        this._document.removeEventListener('click', clickHandlerFn);
        this._document.removeEventListener('keyup', keyHandlerFn);
        this._document.removeEventListener('touchstart', touchStartFn);
        this._activeAdvancedZoom = null;
    };

    /**
     * ADVANCEDZOOMSERVICE _SCROLLHANDLER
     * @description Close zoom on scroll
     * @param object e The Event object
     */
    AdvancedZoomService.prototype._scrollHandler = function (e) {
        var deltaY;

        if (this._initialScrollPosition === null)
            this._initialScrollPosition = window.pageYOffset;

        deltaY = this._initialScrollPosition - window.pageYOffset;

        if (Math.abs(deltaY) >= 40)
            this._activeAdvancedZoomClose();
    };

    /**
     * ADVANCEDZOOMSERVICE _KEYHANDLER
     * @description Close zoom on Escape key press
     * @param object e The Event object
     */
    AdvancedZoomService.prototype._keyHandler = function (e) {
        if (e.keyCode == 27)
            this._activeAdvancedZoomClose();
    };

    /**
     * ADVANCEDZOOMSERVICE _CLICKHANLDER
     * @description Close zoom on click
     * @param object e The Event object
     */
    AdvancedZoomService.prototype._clickHandler = function (e) {
        e.stopPropagation();
        e.preventDefault();
        this._activeAdvancedZoomClose();
    };

    /**
     * ADVANCEDZOOMSERVICE _TOUCHSTART
     * @description Add touchmove event listen
     * @param object e The Event object
     */
    AdvancedZoomService.prototype._touchStart = function (e) {
        this._initialTouchPosition = e.touches[0].pageY;
        touchMoveFn = this._touchMove.bind(this);
        e.target.addEventListener('touchmove', touchMoveFn);
    };

    /**
     * ADVANCEDZOOMSERVICE _TOUCHMOVE
     * @description Close zoom on touch move
     * @param object e The Event object
     */
    AdvancedZoomService.prototype._touchMove = function (e) {
        if (Math.abs(e.touches[0].pageY - this._initialTouchPosition) > 10) {
            this._activeAdvancedZoomClose();
            e.target.removeEventListener('touchmove', touchMoveFn);
        }
    };


    /**
     * ADVANCEDZOOM
     * @description The AdvancedZoom object
     * @param DOM media The media element
     */
    function AdvancedZoom(media) {
        this._fullHeight = this._fullWidth = this._overlay = this._targetMediaWrap = null;
        this._targetMedia = media;
        this._body = document.body;
    }

    /** AdvancedZoom constants */
    AdvancedZoom.OFFSET = 80;
    AdvancedZoom._MAX_WIDTH = 2560;
    AdvancedZoom._MAX_HEIGHT = 4096;

    /**
     * ADVANCEDZOOM ADVANCEDZOOMEDIA
     * @description Crete DOM for zoommed media
     * @param string tagName The tag name
     */
    AdvancedZoom.prototype.advancedZoomMedia = function (tagName) {
        var target = this._targetMedia;
        var src = target.getAttribute('data-zoom-original') || target.currentSrc || target.src;

        target.classList.add('zoom-media-loading');

        /** AdvancedZoom an IMG */
        if (tagName === 'IMG' || tagName === 'PICTURE') {
            var img = document.createElement('img');

            img.onload = function () {
                this._fullHeight = Number(img.height);
                this._fullWidth = Number(img.width);
                this._advancedZoomOriginal();
                target.classList.remove('zoom-media-loading');
                target.removeAttribute('data-zoom-original');
            }.bind(this);

            /** Set new source in overlay and target image */
            img.src = src;

            /** AdvancedZoom a VIDEO */
        }
        else if (tagName === 'VIDEO') {
            var video = document.createElement('video');
            var source = document.createElement('source');
            var _this = this;

            video.appendChild(source);
            video.addEventListener('canplay', function () {
                _this._fullHeight = Number(video.videoHeight);
                _this._fullWidth = Number(video.videoWidth);
                _this._advancedZoomOriginal();
                _this._targetMedia.play();
                _this._targetMedia.classList.remove('zoom-media-loading');
            }, false);

            /** Set new source in overlay and target video */
            source.src = src;
        }

        /** Set new source in target media */
        target.src = src;
    };

    /**
     * ADVANCEDZOOM _ADVANCEDZOOMORIGINAL
     * @description Create zoom DOM
     */
    AdvancedZoom.prototype._advancedZoomOriginal = function () {
        /** Media and Media Wrap */
        this._targetMediaWrap = document.createElement('div');
        this._targetMediaWrap.className = 'zoom-media-wrap';
        this._targetMedia.parentNode.insertBefore(this._targetMediaWrap, this._targetMedia);
        this._targetMediaWrap.appendChild(this._targetMedia);
        this._targetMedia.classList.add('zoom-media');
        this._targetMedia.setAttribute('data-zoom', 'zoom-out');

        /** Overlay */
        this._overlay = document.createElement('div');
        this._overlay.className = 'zoom-overlay';
        document.body.appendChild(this._overlay);

        /** Style Media DOM */
        this._calculateAdvancedZoom();
        this._triggerAnimation();
    };

    /**
     * ADVANCEDZOOM _CALCULATEADVANCEDZOOM
     * @description Calcualate the scale zoom
     */
    AdvancedZoom.prototype._calculateAdvancedZoom = function () {
        /** Repaint */
        this._targetMedia.offsetWidth; // jshint ignore:line

        var originalFullMediaWidth = this._fullWidth;
        var originalFullMediaHeight = this._fullHeight;
        var scrollTop = window.pageYOffset;
        var maxScaleFactor = originalFullMediaWidth / (this._targetMedia.width || this._targetMedia.videoWidth);
        var viewportHeight = (window.innerHeight - AdvancedZoom.OFFSET);
        var viewportWidth = (window.innerWidth - AdvancedZoom.OFFSET);
        var mediaAspectRatio = originalFullMediaWidth / originalFullMediaHeight;
        var viewportAspectRatio = viewportWidth / viewportHeight;

        if (originalFullMediaWidth < viewportWidth && originalFullMediaHeight < viewportHeight)
            this._mediaScaleFactor = maxScaleFactor;
        else if (mediaAspectRatio < viewportAspectRatio)
            this._mediaScaleFactor = (viewportHeight / originalFullMediaHeight) * maxScaleFactor;
        else
            this._mediaScaleFactor = (viewportWidth / originalFullMediaWidth) * maxScaleFactor;
    };

    /**
     * ADVANCEDZOOM _TRIGGERANIMATION
     * @description Assign styles
     */
    AdvancedZoom.prototype._triggerAnimation = function () {
        /** Repaint */
        this._targetMedia.offsetWidth; // jshint ignore:line

        var mediaOffset = realOffset(this._targetMedia),
            scrollTop = window.pageYOffset;
        var viewportY = scrollTop + (window.innerHeight / 2),
            viewportX = (window.innerWidth / 2),
            mediaCenterY = mediaOffset.top + ((this._targetMedia.height || this._targetMedia.offsetHeight) / 2),
            mediaCenterX = mediaOffset.left + ((this._targetMedia.width || this._targetMedia.offsetWidth) / 2);

        /** Assign style */
        this._translateY = Math.round(viewportY - mediaCenterY);
        this._translateX = Math.round(viewportX - mediaCenterX);

        var mediaTransform = 'scale(' + this._mediaScaleFactor + ')',
            mediaWrapTransform = 'translate(' + this._translateX + 'px, ' + this._translateY + 'px) translateZ(0)';

        /** Media and MediaWrap Transforms */
        setTransformStyle(this._targetMedia, mediaTransform);
        setTransformStyle(this._targetMediaWrap, mediaWrapTransform);
        /** Body */
        this._body.classList.add('zoom-overlay-open');
    };

    /**
     * ADVANCEDZOOM CLOSE
     * @description Close the zoom element
     */
    AdvancedZoom.prototype.close = function () {
        /** Remove class */
        this._body.classList.remove('zoom-overlay-open');
        this._body.classList.add('zoom-overlay-transitioning');

        /** Remove transform styles */
        setTransformStyle(this._targetMedia, '');
        setTransformStyle(this._targetMediaWrap, '');

        /** Dispose the zoom object on close() end */
        addEventTransitionEnd(this._targetMedia, this.dispose.bind(this));
    };

    /**
     * ADVANCEDZOOM DISPOSE
     * @description Reset all
     */
    AdvancedZoom.prototype.dispose = function () {
        /** If zoommed elements exist reset all */
        if (this._targetMediaWrap && this._targetMediaWrap.parentNode) {
            this._targetMedia.classList.remove('zoom-media');
            this._targetMedia.setAttribute('data-zoom', 'zoom');
            this._targetMediaWrap.parentNode.replaceChild(this._targetMedia, this._targetMediaWrap);
            this._overlay.parentNode.removeChild(this._overlay);
            this._body.classList.remove('zoom-overlay-transitioning');

            /** Play video if 'always' is set */
            if (this._targetMedia.tagName === 'VIDEO' && this._targetMedia.getAttribute('data-zoom-play') === 'always')
                this._targetMedia.play();
        }
    };

    /** START ADVANCEDZOOM SERVICE LISTENING */
    new AdvancedZoomService().listen();

}(); // jshint ignore:line
