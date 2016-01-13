var CwZ, CwH;
var cPDF = {
    initErrors: [],
    domain: "www.colwiz.com",
    staticDomainURL: "https://cdn.colwiz.com/static",
    version: "15.12.22-270-40",
    js: [
        "js/webpdf/lib/jquery_ireader.js",
        "js/webpdf/lib/fileSaver.js",
        "js/webpdf/lib/handlebars.runtime.js",    
        "js/webpdf/main/00_config.js",
        "js/webpdf/main/01_logger.js",
        "js/webpdf/main/03_utilities.js",    
        "js/webpdf/extension/template.js",
        "js/webpdf/extension/html_structure.js",
        "js/extraction/parsers.js",
        "js/webpdf/publisher/pdfreader_pub.js",
        "js/extraction/authortooltip/js/00_main.js",
        "js/webpdf/main/11_fileupload.js",
        "js/webpdf/lib/citation.converter.js",
        "js/webpdf/lib/xmldom.js",
        "js/webpdf/main/cwcsl.js",
        "js/webpdf/lib/citeproc.js"
    ],
    disabled: function() {
        return false; //(colwizOptions.appId == "0e0b586e543f892807b8acc848dd5377");
    },
    init: function() {
        //console.log("===========================================");
        //console.log("ireader.js");
        try {
            //if(cPDF.disabled()) return;
            var bHTML5Support = cPDF.supports_canvas_text();
            var isMobile = cPDF.check_mobile_browser();
            var isIE10 = cPDF.check_for_ie();
            if (bHTML5Support && !isMobile && isIE10) {
                var appID = colwizOptions.appId;
                /*if (appID === "34000f34a146a2017e2b5acad48d6b07") {
                    cPDF.addScript("js/webpdf/filter/" + appID + ".js", function() {
                        var CWFilter = eval("CW_" + appID);
                        if (CWFilter.isValidPage()) {
                            cPDF.loadJs(0);
                            cPDF.addCSS("css/webpdf/button_web.css" + "?v=" + cPDF.version);
                        }
                    });
                } else {
                    cPDF.loadJs(0);
                    cPDF.addCSS("css/webpdf/button_web.css" + "?v=" + cPDF.version);
                }*/
                cPDF.loadJs(0);
                cPDF.addCSS("css/webpdf/button_web.css" + "?v=" + cPDF.version);
                cPDF.addCSS("js/extraction/authortooltip/css/author-tooltip.css");
            } else {
                //cPDF.addScript("tracking/nosupport?appId="+colwizOptions.appId+"&ts="+new Date().getTime());      //commented tracking
            }
        }
        catch (e) {
            cPDF.initErrors.push(e);
        }
    },
    loadJs: function(ind) {
        var Config = Config || {};
        try {
            if (ind < cPDF.js.length) {
                if (cPDF.js[ind] === "js/webpdf/main/00_config.js" && typeof Config.isBmkLoaded == "undefined")
                {
                    if (typeof(CWPDFReaderConfig) === "undefined") {
                        var file = cPDF.js[ind] + "?v=" + cPDF.version;
                        cPDF.addScript(file, function() {
                            cPDF.loadJs(ind + 1);
                        });
                    }
                    else
                        cPDF.loadJs(ind + 1);
                }
                else if (cPDF.js[ind] === "js/extraction/parsers.js")
                {
                    if (typeof (CWParser) === "undefined") {
                        var file = cPDF.js[ind] + "?v=" + cPDF.version;
                        cPDF.addScript(file, function() {
                            cPDF.loadJs(ind + 1);
                        });
                    }
                    else
                        cPDF.loadJs(ind + 1);
                }
                else if (cPDF.js[ind] === "js/webpdf/lib/handlebars.runtime.js")
                {
                    var file = cPDF.js[ind] + "?v=" + cPDF.version;
                    cPDF.addScript(file, function() {
                        try{
                            CwH = Handlebars; //Assign the Handlebars instance to custom variable
                            Handlebars.noConflict(); //Removes this Handlebars instance from the global space
                        }
                        catch(ex){}
                        cPDF.loadJs(ind + 1);
                    });
                }
                else
                {
                    var file = cPDF.js[ind] + "?v=" + cPDF.version;
                    cPDF.addScript(file, function() {
                        cPDF.loadJs(ind + 1);
                    });
                }
            }
        }
        catch (e) {
            cPDF.initErrors.push(e);
        }
    },
    addScript: function(path, callback) {
        try {
            var sc = document.createElement("script");
            var s = document.getElementsByTagName('script')[0];
            if (callback)
                sc.onload = callback;
            sc.type = 'text/javascript';
            var domain = cPDF.staticDomainURL;

            if(domain.indexOf("http")>=0)
                sc.src = domain + "/" + path;
            else
                sc.src = ('https:' === document.location.protocol ? 'https://' : 'http://') + domain + "/" + path;
            //s.parentNode.insertBefore(sc, s.nextSibling);
            s.parentNode.appendChild(sc);
        }
        catch (e) {
            cPDF.initErrors.push(e);
        }
    },
    addCSS: function(path) {
        try {
            var sc = document.createElement("link"),
                s = document.getElementsByTagName("head")[0];
            var filename;
            if(cPDF.staticDomainURL.indexOf("http")>=0)
                filename = cPDF.staticDomainURL + "/" + path;
            else
                filename = ('https:' === document.location.protocol ? 'https://' : 'http://') + cPDF.staticDomainURL + "/" + path;
            sc.setAttribute("rel", "stylesheet");
            sc.setAttribute("type", "text/css");
            sc.setAttribute("href", filename);
            s.appendChild(sc);
        }
        catch (e) {
            cPDF.initErrors.push(e);
        }
    },
    supports_canvas: function() {
        return !!document.createElement('canvas').getContext;
    },
    supports_canvas_text: function() {
        if (!cPDF.supports_canvas()) {
            return false;
        }
        var dummy_canvas = document.createElement('canvas');
        var context = dummy_canvas.getContext('2d');
        return typeof context.fillText === 'function';
    },
    check_mobile_browser: function() {
        var isMobile = false;
        var a = navigator.userAgent || navigator.vendor || window.opera;
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            isMobile = true;
        }
        return isMobile;
    },
    check_for_ie: function() {
        var a = navigator.userAgent;
        if (a.indexOf("MSIE") < 0)
            return true;
        else if (a.indexOf("MSIE 10") >= 0)
            return true;
        return false;
    }
};
if(typeof CWPDFReaderConfig !== "undefined")
    cPDF.init();
else{
	function initScript(){
		if(document.readyState == "complete" || document.readyState == "loaded")
			cPDF.init();
		else{
			setTimeout(function(){
				initScript();
			},1000);
		}
	}
	initScript();
}
