function showFigures(element, e) {
    if (!e) var e= $.event;
    initViewer(element, e);
    /* Atypon change */
    //Added a delay to ensure correct overlay sizing. This should be best done with
    // either a promise/defered object or with a callback.
    $('#figureViewer-wrap').delay(100).fadeIn("fast", function () {
        if ($('#figureCanvas').height() + 10 > $(window).height()) {
            $('#figureCanvas').css({
                'overflow-y': 'scroll',
                'height': $(window).height() - 40 + 'px'
            });
        }
        $('body').css({
            'overflow': 'hidden'
        });
    });
}

function initViewer(element, e) {

    if (!window.figureViewer) return false;

    var figures = window.figureViewer.figures;

    /* clear up figures that were not rendered */
    for (var i = figures.length - 1; i >= 0; i--) {
        var figureMeta = figures[i];
        if (!figureMeta || !$(figureMeta.i)) figures.splice(i, 1);
    }

    if (figures.length == 0) {
        window.figureViewer = null;
        return false;
    }

    var fvw = $("<div>", {id: "figureViewer-wrap"}).hide();

    $(fvw).html(
        '<div id="figureViewer">\
            <div id="figureCanvas">\
            <i class="closeButton fa fa-times-circle figureViewerSprite figureViewerSprite_close_32" title="Close Figure Viewer" onclick="closeFigureViewer();"></i>\
                <div id="figTools">\
                </div>\
                <div id="figureDescriptionPart">\
                     <div id="figureViewerTopArticleInfo" class="figureViewerTopArticleInfo"></div>\
                    <div id="figureViewerDescription"></div>\
                </div>\
                <div class="imageControlContainer">\
                <a class="prev figureViewerSprite figureViewerSprite_back_arrow_32" title="Previous Figure" href="#" class="disabled"></a>\
                <div class="figBox">\
                </div>\
                <a class="next figureViewerSprite figureViewerSprite_next_arrow_32" title="Next Figure" href="#" class="disabled"></a>\
                </div>\
                <div id="figureViewer-footer" class="figureViewer-footer">\
                     \
                </div>\
            </div>\
        </div>');

    $('body').append(fvw);

    var index = 0,
        figureElement = $("#" + $(element).closest(".figure").attr("id"));
    if (figureElement && figureElement.attr('id')) {
        var figureId = figureElement.attr('id').indexOf('ref-') > -1 ? figureElement.attr('id').substring('ref-'.length) : figureElement.attr('id');
        while (index < figures.length && figures[index].i != figureId) index++;
    }

    showImage(index, e);
}


function showImage(index, e) {

    $( ".imageControlContainer, .figureViewer-footer" ).hover(
        function() {
            $("#figureViewer-footer").addClass("visible");
        }, function() {
            $("#figureViewer-footer").removeClass("visible");
        }
    );
    var figures = window.figureViewer.figures
    figureMeta = figures[index];

    if (!figureMeta) figureMeta = figures[index = 0];

    var graphics = figureMeta.g,
        figureElement = $("#" + figureMeta.i),
        fvw = $('#figureViewer-wrap');

    $("#figureViewerTopArticleInfo").html($("#figureViewerArticleInfo").html());
    $("#figureViewerDescription").html( "<div id=\"figureCount\"><h3>Figure <span class=\"index\">1</span> of " +figures.length +" </h3></div>"+$("#fig-description-" + figureMeta.i).html());

    /* image and caption */
    var html = "";
    for (var i = 0; i < graphics.length; i++) {
        html += '<img id="imgFig" alt="Figure" src="' + window.figureViewer.path + '/images/large/' + graphics[i].l + '"/>';
    }

    $(".figBox", fvw).html(html);

    var captionElement = $(".caption", figureElement);

    $(".caption", fvw).html(captionElement.html());
    $(".caption p", fvw).css("display", "block");

    /* navigation */
    var pLink = $('.prev', fvw);

    if (index == 0) {
        pLink.addClass("disabled");
    } else {
        pLink.removeClass("disabled");
        pLink.attr("href", "JavaScript:showImage(" + (index - 1) + ")");
    }

    index++;

    var nLink = $('.next', fvw);

    if (index == figures.length) {
        nLink.addClass("disabled");
    } else {
        nLink.removeClass("disabled");
        nLink.attr("href", "JavaScript:showImage(" + index + ")");
    }

    $('.index', fvw).html(index);

    /* figure tools */
    var ftHtml = '';

    if (figureMeta.weo) {
        for (var i = 0; i < figureMeta.weo.length; i++) {
            var weo = figureMeta.weo[i];
            if (weo && weo.h) {
                ftHtml += '<div class="weo"><a title="View this Web Enhanced Object'
                if (weo.t) {
                    ftHtml += ': ' + weo.t;
                }
                ftHtml += '" href="' + weo.h + '" target="_blank"><span>Web Enhanced Object</span></a></div>';
            }
        }
    }

    var articleDOI = window.figureViewer.doi;

    html = '';
    var imgSrc = document.getElementById('imgFig').getAttribute('src');

    for (var i = 0; i < graphics.length; i++) {
        if (graphics[i].l) {

            var originalSize = $("#originalFileSize"+figureMeta.i).text();

            if (html) html += '<br />'; // is not first link

            if($(e).parents(".tableView").length == 1){
                html += '' +
                    '<div class="bottomLeft">\
                    <a class="fwButton" href="#">CSV</a>\
                    <a class="fwButton" href="#">PDF</a>\
                </div>';
            }else {
                html += '' +
                    '<div class="figureDownloadOptions">\
                        <a class="downloadBtn" href="/action/downloadFigures?doi=' + articleDOI + '&id=' + figureMeta.i + '">PowerPoint slide</a>\
                        <a class="downloadBtn" download href="'+imgSrc+'">'+  originalSize + '</a>\
                    </div>';
            }

        }
    }
    if (html) {
        ftHtml += '<div class="highRes">' + html + '</div>';
    }

    $('#figureViewer-footer').html(ftHtml);

    var largeImage = $("<img src='"+imgSrc+"'/>");
    $(largeImage).load(function(){
        if ($('#figureCanvas').height() + 60 > $(window).height()) {
            $('#figureCanvas').css({
                'overflow-y': 'scroll',
                'max-height': $(window).height() - 40 + 'px'
            });
        }else{
            $('#figureCanvas').css({
                'overflow-y': 'visible'
            });
        }
    });
}

function closeFigureViewer() {
    $('#figureViewer-wrap').fadeOut('fast', function () {
        $(this).remove();
        $('body').css({
            'overflow': 'auto'
        });
    })
}

function showTables(id,element,e) {
    if (!e) var e= $.event;
    initTableViewer(id,element,e);  /* Atypon change */
    displayWithEffect('#tableViewer-wrap', e, offClickFigViewer);
}


function closeTableViewer(e) {
    if (!e) var e= $.event;
    initTableViewer(null,null,e);  /* Atypon change */
    displayWithEffect('#tableViewer-wrap', e, offClickFigViewer);
}



function initTableViewer(id, element,e) {

    if (!window.tableViewer) return false;
    var fvw = $('#tableViewer-wrap');
    var tables = window.tableViewer.tables;
    /* clear up figures that were not rendered */
    if (tables.length == 0) {
        window.tableViewer = null;
        return false;
    }

    var tableDOI = window.tableViewer.doi;

    if (!fvw.length) {
        var c = $('#tandf_content');
        if(!c.length)
            c = $('#container');
        if (!c.length)
            c = $('#content');
        if (c.length) {
            fvw = $(document.createElement("div"));
            fvw.attr('id','tableViewer-wrap');
            fvw.css("display",'none');
            c.append(fvw);
            $(fvw).html(
                '<div id="tableViewer">\
                        <div id="tableViewerNav">\
                            <i title="Close Table Viewer" href="#" onclick="closeTableViewer(event); return false;" class="closeButton fa fa-times-circle"></i>\
                            <div class="tableNav">\
                                <a class="prev" title="Previous Table" href="#" class="disabled"></a>\
                  <a class="next" title="Next Table" href="#" class="disabled"></a>\
                </div>\
              </div>\
               <div id="tableDescriptionPart">\
                     <div id="tableViewerTopArticleInfo" class="tableViewerTopArticleInfo"></div>\
                </div>\
                        <div id="tableCanvas">\
                            <div id="tableTools">\
                            </div>\
                            <div class="tableBox">\
                            </div>\
                            <a class="next" title="Next Table" href="#" class="disabled"></a>\
                            <div class="caption">&nbsp;\
                            </div>\
                            <div class="tableDownloadOption">\
                            <a id="CSVdownloadButton" class="downloadButton" href="/action/downloadTable?id=' + id + '&doi=' + tableDOI +'&downloadType=CSV'+ '">CSV</a>\
                            <a id="PDFdownloadButton" class="downloadButton" href="/action/downloadTable?id=' + id + '&doi=' + tableDOI +'&downloadType=PDF'+ '">PDF</a>\
                            </div>\
                            <div id="tableViewer-footer">\
                                <img alt="" src="/templates/jsp/images/figureViewer-bg3.gif"/>\
                            </div>\
                        </div>\
                </div>');
            fvw = $(fvw);
        }
    }

    var index = 0;
    var tableElement =$("#" +id);
    index = window.tableIDIndexMap[id];
    showTable(index -1);
}


function showTable(index) {

    var tables = window.tableViewer.tables;
    var tableMeta = tables[index];
    if (!tableMeta) tableMeta = tables[index=0];
    //TODO: Look suspicious ...
    var tableElement = $("#"+tableMeta.i);

    var tableContent = $("#table-content-" + tableMeta.i);
    var tbl = tableContent.find('table');
    if(tbl.find('caption').length <= 0) {
        tbl.prepend('<caption><h3> </h3></caption>')
    }

    var fvw = $('#tableViewer-wrap');
    var html = tableContent.html();
    $(".tableBox",fvw).html("<div id=\"tableCount\"><h3>Table <span class=\"index\">1</span> of " +tables.length +" </h3></div>"+html) ;

    /* navigation */
    var pLink = $('.prev',fvw);
    if (index == 0) {
        pLink.addClass("disabled");
        pLink.attr("href","#");
    } else {
        pLink.removeClass("disabled");
        pLink.attr("href","JavaScript:showTable(" + (index - 1) + ")");
    }

    index++;
    var nLink = $('.next',fvw);
    if (index == tables.length) {
        nLink.addClass("disabled");
        nLink.attr("href","#");
    } else {
        nLink.removeClass("disabled");
        nLink.attr("href","JavaScript:showTable(" + index + ")");
    }

    $('.index',fvw).html(index);

    /* figure tools */

    var ftHtml = $(tableContent).find('.footnote .paragraph').text();
    $('#tableViewer-footer').html(ftHtml);

    $("#tableViewerTopArticleInfo").html($("#tableViewerArticleInfo").html());


}

function displayWithEffect(viewerId, e, funct)
{
    if (!e) var e= $.event;
    var n=0;
    var viewer=$(viewerId);
    if (!viewer) return; // It may take some time till document gets ready
    if (viewer.css('display') != 'block') {
        bg= new Array(); /* Atypon change */
        bg[0]=$('header');
        bg[1]=$('mainBody');
        bg[2]=$('pageFooter-wrap');

        while (bg[n]) {
            $(bg[n]).css("MozOpacity","0.70");
            $(bg[n]).css("KHTMLOpacity","0.70");
            $(bg[n]).css("opacity","0.70");
            n++;
        }
        $(viewerId).show("slow");
        var top = 0;
        if (window.pageXOffset !== undefined) {
             top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
        }else{
             top = document.documentElement.scrollLeft + document.documentElement.scrollTop;
        }

        viewer.css("position", "absolute");
        viewer.css("top",top+"px");
        viewer.mouseSelectionFixed = true;
        // clicking off the viewer hides the viewer

    }
    else {
        while (bg[n]) {
            $(bg[n]).css("MozOpacity","1");
            $(bg[n]).css("KHTMLOpacity","1");
            $(bg[n]).css("opacity","1");
            n++;
        }
        $(viewerId).hide("slow");
    }
}

// Figure Viewer
offClickFigViewer=function(event, elementId) {
    var target = $(elementId);
    var fvw = $('figureViewer-wrap');
    if (fvw.css("display") !="none" && target != fvw ) {
        fvw.css("display","none");
    }
};


$(document).mouseup(function (e) {
    var fvw = $('#figureViewer');
    if (!fvw.is(e.target) && fvw.has(e.target).length === 0) {
        closeFigureViewer();
    }
});
$(document).ready(function () {
    $('body').keyup(function (e) {

        if (e.keyCode == 27) {
            closeFigureViewer();
            $('#tableViewer-wrap').fadeOut('fast', function () {
                $(this).remove();
                $('body').css({
                    'overflow': 'auto'
                });
            })
        }
    });
});

function FormatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}