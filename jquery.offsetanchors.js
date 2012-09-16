/**
 * Offsets the scroll position of anchor links by the height of the element specified in the jQuery selector. This is a
 * singleton and can only be initialised once.
 *
 * Usage:
 *   jQuery("#stalker").offsetAnchors();
 *
 * licence Apache 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
jQuery.fn.offsetAnchors = function () {

    var currentTargetName, isClick, offsetScroll, offsetElemSelector = this.selector;

    offsetScroll = function() {
        var targetElemName, targetScroll,  targetElemOffset, offsetElem, offsetElemHeight, offsetElemY, targetElem;

            targetElemName = window.location.href.replace(/.*#(.*)/,"$1");

            if (targetElemName === currentTargetName && !isClick) {
                return;
            }

            if (!/\w+/.test(targetElemName)) {
                return;
            }

            offsetElem = jQuery(offsetElemSelector);
            offsetElemHeight = offsetElem.outerHeight();
            offsetElemY = offsetElem.offset().top;
            targetElem = jQuery("#" + targetElemName);

            if (targetElem.length === 0) {
                targetElem = jQuery("a[name=" + targetElemName + "]");
            }

            if (!targetElem.is("visible")) {
                targetElem = targetElem.parent();
            }

            targetElemOffset = targetElem.offset().top;

        if (targetElem.length > 0 && (jQuery(window).scrollTop() > offsetElemY + offsetElemHeight)) {
            targetScroll = targetElemOffset - 30 - offsetElemHeight;
            if (jQuery.browser.safari) {
                jQuery(function () {
                    window.setTimeout(function () {
                        jQuery(window).scrollTop(targetScroll);
                    }, 100);
                });
            } else {
                jQuery(window).scrollTop(targetScroll);
            }
            currentTargetName = targetElemName;
        }
    };

    if (/#.+/.test(window.location.href)) {
        jQuery(window).one("scroll", offsetScroll);
    }

    jQuery(document).click(function () {
        isClick = true;
        jQuery(window).one("scroll", offsetScroll);
        window.setTimeout(function () {
            jQuery("html,body").unbind("scroll", offsetScroll);
            isClick = null;
        }, 20);
    });

    jQuery.fn.offsetAnchors = function () {
        throw "@method jQuery.fn.offsetAnchors: Anchors can only be offset from a single element. Current offset elem is: " + offsetElemSelector;
    };
};