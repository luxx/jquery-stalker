/**
 * https://github.com/luxx/jquery-stalker
 * Apache 2.0 licence
 *
 * Stalker is a cool jQuery transition effect plugin - when scrolled past, it attaches specified element to the top of
 * the screen. As you scroll past it becomes fixed, and when you scroll back beyond the element, it goes back to normal
 * positioning.
 *
 * Usage:
 *    jQuery("#stalker").stalker();
 *
 * https://github.com/luxx/jquery-stalker
 *
 * Originally part of the AJS library http://docs.atlassian.com/aui/latest/AUI/js/atlassian/jquery/, it has since been
 * deprecated: https://ecosystem.atlassian.net/browse/AUI-676. AJS dependency removed and released to github by Lane LaRue.
 * AJS and all modifications are licenced Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
 *
 */

jQuery.fn.stalker = function (){

    function getBrowserVersionAsInt() {
        return parseInt(jQuery.browser.version.replace(/\.*/g,"").substring(0,3), 10);
    }

    /* In firefox 3.5 and below all block level elements need to have overflow: auto css property when fixed positioned
       to avoid flickering when scrolling. */
    function needToApplyFlickerFix () {
        var browserVersion = jQuery.browser.version.replace(/\.*/g,"").substring(0,3);
        return jQuery.browser.mozilla && browserVersion < 192;
    }

    return function () {

        var $win, /* jQuery wrapped window */
            $doc, /* jQuery wrapped document */
            $stalker, /* Element that will follow user scroll (Stalk) */
            $transitionElems, /* Elements preceding stalker */
            offsetY, /* offset top position of stalker */
            placeholder, /* A div inserted as placeholder for stalker */
            lastScrollPosY, /* Position last scrolled to */
            stalkerHeight, /* Height of stalker */
            isInitialized, /* Flag if control is initialized (onscroll) */
            selector, /* Selector for stalker */
            isSupported = !(jQuery.browser.msie && jQuery.browser.version < 7 || (!jQuery.os.mac && getBrowserVersionAsInt() < 191));


        function initialize() {

            $stalker = jQuery(selector),
            offsetY = $stalker.offset().top,
            $transitionElems = $stalker.prevAll(":visible");

            // need to set overflow to hidden for correct height in IE.

            function setStalkerHeight () {
                $stalker.css("overflow", "hidden");
                stalkerHeight = $stalker.height();
                $stalker.css("overflow", "");
            }

            // create a placeholder as our stalker bar is now fixed
            function createPlaceholder () {
                placeholder = jQuery("<div />")
                    .addClass("stalker-placeholder")
                    .css({visibility:"hidden", height: stalkerHeight})
                    .insertBefore($stalker);
            }

            function setPlaceholderHeight () {
                if (!$stalker.hasClass("detached")) {
                    placeholder.height($stalker.height());
                } else {
                    placeholder.height($stalker.removeClass("detached").height());
                    $stalker.addClass("detached");
                }
            }

            setStalkerHeight();
            createPlaceholder();
            setPlaceholderHeight();

            // set calculated fixed (or absolute) position
            $stalker.css(getInactiveProperties());

            // custom event to reset stalker placeholde r height
            $stalker.bind("stalkerHeightUpdated", setPlaceholderHeight);
            $stalker.bind("positionChanged", setStalkerPosition);

            if (needToApplyFlickerFix()) {
                $stalker.addClass("fix-ff35-flicker");
            }

            isInitialized = true;
        }

        function getInactiveProperties () {
        if (jQuery.os.windows || jQuery.os.linux) {
            return {
                position: "absolute",
                top: offsetY
            };
        } else {
            return {
                position: "fixed",
                top: offsetY - $win.scrollTop()
            };
        }
    }

        function setStalkerPosition () {
            function getOpacitySetting() {
                var opacityTarget = 1 - $win.scrollTop() / offsetY;
                if (opacityTarget > 1) {
                    return "";
                } else if (opacityTarget < 0) {
                    return 0;
                } else {
                    return opacityTarget;
                }
            }

            if (!isInitialized) {
                initialize();
            }

            $transitionElems.css("opacity", getOpacitySetting());

            if (offsetY <= $win.scrollTop()){
                if (!$stalker.hasClass("detached")) {
                    $stalker.css({top:0, position: "fixed"})
                        .addClass("detached");
                }
            } else {
                $stalker.css(getInactiveProperties())
                    .removeClass("detached");
            }
            lastScrollPosY = $win.scrollTop();
        }

        function offsetPageScrolling() {

            function setScrollPostion(scrollTarget) {
                var docHeight = jQuery.getDocHeight(),
                    scrollPos;
                if (scrollTarget >= 0 && scrollTarget <= docHeight) {
                    scrollPos = scrollTarget;
                } else if (scrollTarget >= $win.scrollTop()) {
                    scrollPos = docHeight;
                } else if (scrollTarget < 0) {
                    scrollPos = 0;
                }
                $win.scrollTop(scrollPos);
            }

            function pageUp() {

                if (!isInitialized) {
                    initialize();
                }

                var scrollTarget = jQuery(window).scrollTop() - jQuery(window).height();

                setScrollPostion(scrollTarget + stalkerHeight);
            }

            function pageDown() {



                if (!isInitialized) {
                    initialize();
                }

                var scrollTarget = jQuery(window).scrollTop() + jQuery(window).height();

                setScrollPostion(scrollTarget - stalkerHeight);
            }

            jQuery(function () {
                $doc.bind('keydown keypress keyup', "pagedown", function (e) {

                    if (e.type === "keydown") {
                        pageDown();
                    }
                    e.preventDefault();
                });

                $doc.bind('keydown keypress keyup', "pageup", function (e) {
                    if (e.type === "keydown") {
                        pageUp();
                    }
                    e.preventDefault();
                });

                $doc.bind('keydown keypress keyup', "space", function (e) {
                    if (e.type === "keydown") {
                        pageDown();
                    }
                    e.preventDefault();
                });

                $doc.bind('keydown keypress keyup', "shift+space", function (e) {
                    if (e.type === "keydown") {
                        pageUp();
                    }
                    e.preventDefault();
                });
            });
        }

//        function containDropdownsInWindow () {
//            $doc.bind("showLayer", function (e, type, obj) {
//
//                var stalkerOffset,
//                    targetHeight;
//
//                if (!isInitialized) {
//                   initialize();
//                }
//
//                if (type === "dropdown" && obj.$.parents(selector).length !== -1) {
//                    stalkerOffset = ($stalker.hasClass("detached") ? 0 : $stalker.offset().top);
//                    targetHeight = jQuery(window).height() - $stalker.height() - stalkerOffset;
//                    if (targetHeight <= parseInt(obj.$.attr("scrollHeight"), 10)) {
//                        AJS.containDropdown.containHeight(obj, targetHeight);
//                    } else {
//                        AJS.containDropdown.releaseContainment(obj);
//                    }
//                    obj.reset();
//
//                    /* In firefox 3.5 and below (except on mac) we need to set the stalker to overflow auto to prevent flickering bug when
//                     * scrolling. This has the affect that when a dropdown is opened it overflows the stalker causing scroll bars to
//                     * appear. To prevent this we need to expand the stalker height to its scroll height */
//                    if (needToApplyFlickerFix()) {
//                        $stalker.height($stalker.attr("scrollHeight"));
//                    }
//                }
//            })
//            .bind("hideLayer", function () {
//                if (needToApplyFlickerFix()) {
//                    $stalker.height("");
//                }
//            });
//        }

        if (!isSupported) {
            return;
        }

        $win = jQuery(window);
        $doc = jQuery(document);
        selector = this.selector;

        offsetPageScrolling();
//        containDropdownsInWindow();

        // we may need to update the height of the stalker placeholder, a click event could have caused changes to stalker
        // height. This should probably be on all events but leaving at click for now for performance reasons.
        $doc.click(function (e) {
            if (jQuery(e.target).parents(selector).length !== 0 && !isInitialized) {
                initialize();
            }
        });

        $doc.bind("showLayer", function(e, type) {
            if ($transitionElems) {
                $transitionElems.css("opacity", "");
            }
            // firefox needs to reset the stalker position
            if (jQuery.browser.mozilla && type === "popup") {
                setStalkerPosition();
            }
        });

        // offsets perm links, and any anchor's, scroll position so they are offset under ops bar
        jQuery(".stalker-placeholder, " + this.selector).offsetAnchors();

        $win.scroll(setStalkerPosition)
            .resize(function () {
                if ($stalker) {
                    $stalker.trigger("stalkerHeightUpdated");
                }
            });

        $doc.mouseup(function () {
            if (lastScrollPosY && $win.scrollTop() === lastScrollPosY) {
                $transitionElems.css("opacity", "   ");
            }
        });

        return this;
    };

}();