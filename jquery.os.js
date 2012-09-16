jQuery.os = {};
var jQueryOSplatform = navigator.platform.toLowerCase();
jQuery.os.windows = (jQueryOSplatform.indexOf("win") != -1);
jQuery.os.mac = (jQueryOSplatform.indexOf("mac") != -1);
jQuery.os.linux = (jQueryOSplatform.indexOf("linux") != -1);