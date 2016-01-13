var intCounter=1;
var intHandler;
function setCrossRefNote() {
		intCounter++;
		if(intCounter>120 || j$('#abstractCitations #crossRefNote').length>0){
			window.clearInterval(intHandler);
		}
		if(j$('#abstractCitations #crossRefNote').length>0){
			j$('#abstractCitations #crossRefNote').html("Citations to this article as recorded by CrossRef");
		}
}

function showCitationsButterFly(){
	var arnumber = j$(this).attr('href');
	var url = '/xpl/mwCitations.jsp?arnumber='+ arnumber;
	var feModal = jQuery(':focus');
	j$.colorbox({href:url,scrolling:false,opacity:0.6,overlayClose:false,close:"", returnFocus:true,
		onClosed:function() {
			feModal.focus();
		}
	});
	jQuery('#cboxContent').prepend('<a id="mdCloseButton" class="" href="javascript:Modal.hide()" title="Close this window"><i class="fa fa-lg fa-close"></i></a>');
	j$('#mdCloseButton').keypress(function(e) {
	if (e.keyCode == 13){
		j$.colorbox.close();
		}
	});
	j$('#mdCloseButton').click(function(e) {
		e.preventDefault();
		j$.colorbox.close();
	});
	return false;
}

function windowPrint() {
	window.print();
	return false;
}

function writeIndexTermLink(authorTerm) {

	// get index term from dom node
	var keyword = jQuery(this).data('keyword'),
		link;

	// Wrap in quotes and encode special characters
	keyword = getFilteredTerms('"' + keyword + '"');

	// construct a url string from object
	link = jQuery.param({
		matchBoolean: true,
		queryText: '"Index Terms":' + keyword
	});

	window.location = '/search/searchresult.jsp?' + link;
}

function writeIcsTermLink() {
	var icsTerm = j$(this).attr("data-icsterm");
	var filteredTerm = getFilteredTerms(icsTerm);
	var link = '/search/searchresult.jsp?'
		+ searchPropertiesParamQueryText + '="' + searchIcsTermProperty + '":'
		+ filteredTerm + '&'+searchPropertiesParamMatchBoolean+'=true' +
		'&'+ searchPropertiesParamSearchField + '=Search_All';
	window.location = link;
}

function showAbstract(articleNumber) {
	oqs = removeParameter(xpl.properties.details.oqs, 'arnumber');
	oqs = removeParameter(oqs, 'contentType');
	oqs += '&'+ searchPropertiesParamArticleNumber+'='+articleNumber;
	var  url_string = '/xpl/articleDetails.jsp?' + oqs;
	if (url_string.indexOf('&resultAction=ABSTRACT') < 0) {
		url_string += '&resultAction=ABSTRACT';
	}
	//url_string = encodeURI(url_string);
	window.location = url_string;	
}

function removeParameter(queryString, paramKey) {
	var start = queryString.indexOf(paramKey + '=');
	if (start > -1) {
		var end = queryString.indexOf('&', start);
		
		// Ignore if & is last character.
		if ((end+1) == queryString.length) {
			end = -1;
		} 
		queryString = (end > start) ? queryString.substring(0, start) + queryString.substring(end+1) : queryString.substring(0, start);
	}
	return queryString;
}

function BackToSearchresults(articleNumber) {
	var oqs = removeParameter(xpl.properties.details.oqs, 'arnumber');
	var url_string = '/search/searchresult.jsp?history=no&' + oqs;
	url_string = Xplore.utils4url.queryStrWithEncodedCombineQueryValue(url_string);	// ensure 'combineQuery' value is encoded so ui router does not parse its value
	url_string = Xplore.utils4url.stripOPENDatEnd(url_string);	// if '.OPEND.' is at the end backend returns no results. So strip it from end.
	window.location = url_string;
}

function mapSize(obj)
{
	var L=0;
    j$.each(obj, function(i, elem) {
        L++;
    });
    return L;
}


function searchInventor(inventor) {
	var searchLink = "/search/searchresult.jsp?action=search&matchBoolean=true&queryText=" +
		"(\"Authors\":" + getFilteredTerms(inventor) + ")";
	window.location = searchLink;
	return;
}

function showPurchaseOptions()
{	  
	  var $article_page_hdr = j$('#article-page-hdr');
	  var $hdr_btn_set = $article_page_hdr.find('div.button-set');
	  var $full_txt_menu = j$('#full-txt-menu-wrap');
	  hdr_btn_set_off = Math.floor($hdr_btn_set.offset().top);
	  hdr_btn_set_h = $hdr_btn_set.innerHeight();
	  $full_txt_menu.css('top', hdr_btn_set_off + hdr_btn_set_h);
	  $article_page_hdr.toggleClass('menu-open');
      if ($article_page_hdr.hasClass('menu-open')) {
        j$(document).one('click', function() {
          $article_page_hdr.removeClass('menu-open');
        });  
      }
      $full_txt_menu.click(function(e) {
          e.stopPropagation();
        });

}

j$.fn.doOnce = function(func) { 
    this.length && func.apply(this); 
    return this; 
 }

j$(document).ready(function() {
	
	j$('#action-download-document-citations').find('a').doOnce(function(){
		    this.actionBar({
		      layout : 'vertical',
		      actionId : 'action-download-document-citations'
		    });
		  
	});
		
	j$('#action-document-email').find('a').doOnce(function(){
	    this.actionBar({
	      layout : 'vertical',
	      actionId : 'action-document-email'
	    });
	});
	
	j$('#save-to-project').bind('click',function(evt){
		Modal.show(ADD_DOCUMENTS_FORM_URL+"?"+ PARAM_SELECTED_DOCUMENTS +"="+ recordId);
	});
		  
	j$('#purchase-options #qualify-price-ad').bind('click',function(evt){	
		j$("#purchase-options #qualify-price-ad-overlay").css("display","inline");
	     return false;
	});
	j$('#purchase-other-formats #qualify-price-ad').bind('click',function(evt){	
		j$("#purchase-other-formats #qualify-price-ad-overlay").css("display","inline");
	     return false;
	});
	
	j$('#ftm-purchase-other').delegate('#qualify-price-ad-other','click',function(evt){	
		//Do nothing for now , keep it like in production code , commented during Open Access
	    //Development, if required uncomment the line below and qualify-price-ad-overlay need to be 
		//displayed in the other formats purchase tab, if uncommented with out move over lay still comes
		//show in the regular purchase tab.
		//j$("#qualify-price-ad-overlay").css("display","inline");
	     return false;
	});
	
	j$('#article-page-bdy').delegate("#biblyear","click",function(){
			j$.ajax('/xpl/biblMetrics.ajax?'+xpl.properties.details.oqs+"&bbyear="+ j$(this).children(":first-child").text(), {
	  		success: function(data) {
	  			j$('.article-views-container #biblioMetrics-container').html(data);
	  		}
		  });
	 });

	j$('#article-page-bdy').delegate("#articles_crossref_anchor","click",function(){
			var crossRefCount = j$(this).children(".num").html();
			if(crossRefCount=='0'){
			}else{
				j$('#nav-article #abstract-citedby-tab').trigger('click');
				if(j$('#abstractCitations #crossRefNote').length<1){
					intHandler = window.setInterval(setCrossRefNote,1000);
				}else{
					j$('#abstractCitations #crossRefNote').html("Citations to this article as recorded by CrossRef");
				}
			}
		});

/* end best price module */  

/** close button for the price ad module */
	//j$('#product-purchase-options').delegate('a.close-module','click',function(evt){
	j$('#purchase-options #qualify-price-ad-overlay').delegate('a.close-module','click',function(evt){
		j$('#purchase-options #qualify-price-ad-overlay').hide();
		
		evt.preventDefault();
		return false;
	});
/** end close button for the price ad module */


	/** close button for the price ad module */
	//j$('#product-purchase-options').delegate('a.close-module','click',function(evt){
	j$('#purchase-other-formats #qualify-price-ad-overlay').delegate('a.close-module','click',function(evt){
		j$('#purchase-other-formats #qualify-price-ad-overlay').hide();
		
		evt.preventDefault();
		return false;
	});
/** end close button for the price ad module */

  
  
  j$("#add-to-cart-button").bind('click',addItemsToCart);
  //j$("#puchase-from-partner-button").bind('click',function(){alert('hello');return false;});
  j$('#ftm-purchase').delegate('#puchase-from-partner-button','click',doPurchaseFromPartner);


  j$('#tabs-main').delegate('#btn-cite-map','click',showCitationsButterFly);
  j$('#article-page-bdy').delegate("#tabs-main #abstractReferences .article-blk .article .docs .links .popup-acm","click",acmPopup);
  j$('#article-page-bdy').delegate("#tabs-main #abstractKeywords .article-blk .art-keywords a","click keydown",writeIndexTermLink);
  j$('#article-page-bdy #tabs-main #articleDetails .article-blk .article-ftr .ics-terms a').bind("click",writeIcsTermLink);
  j$('#articles_author_anchor').bind('click',
		  function(){j$('#nav-article #abstract-authors-tab').trigger('click'); });
  

  j$('div.tabbed-blk').doOnce(function(){
    this.tabify({
     target_el : 'div.subsection'
    });
  });
  if (isFunction("mc_initMiniCart"))
  {
	  mc_initMiniCart(toggleAddToCart,errorInitMiniCart);
  }


  var $article_page_hdr = j$('#article-page-hdr');
  var $btn_full_txt = j$('#btn-full-txt, .js-purchase');
  
  
  
  
  if ($btn_full_txt.length) {
    var $hdr_btn_set = $article_page_hdr.find('div.button-set');
    var $full_txt_menu = j$('#full-txt-menu-wrap');
    hdr_btn_set_off = Math.floor($hdr_btn_set.offset().top);
    hdr_btn_set_h = $hdr_btn_set.innerHeight();
    $full_txt_menu.css('top', hdr_btn_set_off + hdr_btn_set_h);
    $btn_full_txt.click(function(e) {
      e.stopPropagation();
      $article_page_hdr.toggleClass('menu-open');
      if ($article_page_hdr.hasClass('menu-open')) {
        j$(document).one('click', function() {
          $article_page_hdr.removeClass('menu-open');
        });
      }
    });
    $full_txt_menu.click(function(e) {
      e.stopPropagation();
    });
  }

  var from_page = '';
  if (j$('#from-page').length)
	  from_page=j$('#from-page').val();
  
  if(from_page == 'noDownLoadsLeft'){
	  //j$('#full-text-pdf').get(0).click();
	  if ( !j$.browser.msie)
	  {
	    	var href = removeParameter(this.URL, 'fromPage');
	    	history.pushState( null, null, href );
	  }
	  var $hdr_btn_set = $article_page_hdr.find('div.button-set');
	  var $full_txt_menu = j$('#full-txt-menu-wrap');
	  hdr_btn_set_off = Math.floor($hdr_btn_set.offset().top);
	  hdr_btn_set_h = $hdr_btn_set.innerHeight();
	  $full_txt_menu.css('top', hdr_btn_set_off + hdr_btn_set_h);
	  $article_page_hdr.toggleClass('menu-open');
      if ($article_page_hdr.hasClass('menu-open')) {
        j$(document).one('click', function() {
          $article_page_hdr.removeClass('menu-open');
        });  
      }
      $full_txt_menu.click(function(e) {
          e.stopPropagation();
        });
  }
  
  
   j$('#Patent_citations').delegate(".patent-cite-blk .inventor","click",function(){
	  var inventor = j$(this).html();
	  searchInventor(inventor);
  });
  
  //Standards Bundle Modal Window
	j$('#purchase-options').delegate(".moreLink","click",function(e){
	  	var elementID = j$(this).attr('href');
	  	var $element = "#" + elementID;
	  	   j$.colorbox({href:$element,scrolling:false,inline:true,opacity:0.6,overlayClose:false,transition:"none",close:"",
	  			onCleanup:function() {
            		$article_page_hdr.addClass('menu-open');
          			j$(document).one('click', function() {
          				$article_page_hdr.removeClass('menu-open');
        			});
        		}
	        });
	  	jQuery('#cboxContent').prepend('<a id="mdCloseButton" class="" href="javascript:Modal.hide()" title="Close this window"><i class="fa fa-lg fa-close"></i></a>');
	  return false;
	  });
});

(function(j$){
  j$.fn.tabify = function(options) { 
    defaults = {
      target_el : 'div.section'
    };
    var options = j$.extend(defaults, options);
    return this.each(function() {
      var $this = j$(this);
      var $tabs_nav = $this.find('div.nav-tabs');
      var $tabs = $tabs_nav.find('li');
      var $tab_secs = $this.find(options.target_el);
      //$tabs.eq(0).addClass('active');
      //$tab_secs.hide();
      //$tab_secs.eq(0).show();
      $tabs_nav.delegate('a', 'click', function(e) {
        e.preventDefault();
        var $this_lnk = j$(this);    
        var this_href = $this_lnk.attr('href');
        $tab_secs.hide();
        j$(this_href).show();
        $tabs.removeClass('active');
        $this_lnk.closest('li').addClass('active');
      });
    });
  };
})(jQuery);


// Abstract Tabs (ajax & history AP!)
j$(function() {

  /*
  function formated to work with polyfill:
  history API JavaScript Library v3.2.5
  https://github.com/devote/HTML5-History-API
  */

  //map to keep track if ajax method already called 
  var ajaxCallMap = new Object();
  var target_selector = '#tabs-main';
  var $target = j$(target_selector);
  var $nav_el = j$('#nav-article');
  var $nav_lnks = $nav_el.find('a');
  if ($target.length == 0 || $nav_lnks.length == 0) { return false; }
  var default_html = $target.html();
  var default_title = document.title;
  var default_section = $target.data('section');
  $nav_el.on('click', 'a', function(e) {
	  
    var a = j$(this);
    e.preventDefault();
    // keep the link in the browser history.  IE does not support method
    if ( !j$.browser.msie)
    	history.pushState( null, null, this.href );
    var url=window.location.href;
    
    var queryString=url.substring(url.indexOf('?'));
    var dsUrl=j$(this).attr('data-section');
    dataSection = j$(this).attr('data-section');
	  var tabvalue=" ("+j$(this).find('b').html()+")";
	  var end=dataSection.indexOf(".");
	  if(end>-1){

		  var curtitle=document.title;
		  var artitle=curtitle.substring(curtitle.indexOf(' - ')+3);
		  document.title="IEEE Xplore Abstract"+tabvalue+" - "+artitle;		  
	  }

    if(dsUrl.indexOf("?")>0){
    	queryString = queryString.replace('?','&');
    }
    var url= "/xpl/"+dsUrl+queryString;
    showProductDetailsTab(j$(this), url, dataSection);

  });


  var showProductDetailsTab = function(eventOriginatorTab, url, dataSection ){
	 
	  var ajax_load = "<div class='tab-content'> <div id='spinning' class='article-blk'><img src='"+ ASSETS_RELATIVE_PATH +"/img/processing_information.gif' alt='Loading Data...'/>Loading Data...</div></div>";  
	  var closestLiElem= eventOriginatorTab.closest('li');
	  closestLiElem.siblings().removeClass('active');
	  closestLiElem.addClass('active');	 
	  //hide existing ta content and remove any spinning indicators
	  j$(target_selector).children().hide();
	  j$('#spinning').remove();
	  if(dataSection.indexOf("abstractCitations.ajax")==-1){
		  j$('#abstractCitations #crossRefNote').html("");
	  }
	  var divTabId =  dataSection.split(".");
	  var $tabContent = j$('#'+divTabId[0]);
	  //check if tab content previously loaded, then show div content and return;
 
	  if ($tabContent.length > 0)
	  {
		  $tabContent.show();
		  return;
	  }
	  var ajaxCalled = ajaxCallMap[dataSection];
	  //if true, then first ajax call is still executing.  Thus, set spinning indicator and return;
	  if (ajaxCalled != undefined)
	  {
		  j$(target_selector).append(ajax_load);
		  return;
	  }
	  
	  j$(target_selector).append(ajax_load);
	  j$.ajax(url, {
	  		success: function(data) {
	  		j$('#spinning').remove();
	  		j$(target_selector).append(data);
			citedByData.init();
	  	}
	  });
	  //store ajax call history in map.  The map is checked in future tab invocations to insure
	  //same ajax call is not made a second time while the existing call is still executing

	 
	  //alert(dataSection.indexOf(dataSection.indexOf(),))
	  ajaxCallMap[dataSection]=dataSection;
 }; 
 
  // hang on popstate event triggered by pressing back/forward in browser
  j$(window).bind( "popstate", function(e) {
	  
	  //temporary fix to clear the ajax call history stored in ajaxCallMap when the backbutton is clicked
	  if (ajaxCallMap != undefined && mapSize(ajaxCallMap) > 0)
	  {
		  ajaxCallMap= new Object();
		  //alert(Object.keys(ajaxCallMap).length);
	  }
	 
    // we get a normal Location object

    /*
    * Note, this is the only difference when using this library,
    * because the object document.location cannot be overriden,
    * so library the returns generated "location" object within
    * an object window.history, so get it out of "history.location".
    * For browsers supporting "history.pushState" get generated
    * object "location" with the usual "document.location".
    */
    var returnLocation = history.location || document.location;
    
    /*
    * ISSUE: browsers using polyfill failing to update fragment, title & nav when navigating to 'original state' with back button
    * FIX: cache original fragment, title & nav state and use those if ajax returns no fragment
    */
    j$.ajax({
      url: returnLocation,
      data: {},
      success: function (data) {
        var frag = j$(data).find(target_selector);
        if (frag.html() !== undefined) {
          j$(target_selector).replaceWith(frag);
          document.title = stripTitle(data);
          updateNav(frag.data('section')); 
		citedByData.init();		  
        } else {
          j$(target_selector).replaceWith(default_html);
          document.title = default_title;
          updateNav(default_section);
		  citedByData.init();
        }
        //_gaq.push(['_trackPageview', location.pathname+location.search]);        
      },
      dataType: 'html'
    });
  });
  
  var stripTitle = function(data) {
    return data.toString().substring(data.toString().indexOf("<title", 0) + 7, data.toString().indexOf("</title", 0))
  };
  
  var updateNav = function(section) {
    $nav_el.find('li.active').removeClass('active');
    $nav_el.find('a[data-section="' + section + '"]').closest('li').addClass('active');
  };

});


j$(function() {
	citedByData.init();
});	

var citedByData ={
	init: function() {
		citedByData.handleEvents();
		citedByData.handlePatentEvents();
	},
	loadMoreCitations: function(elem, apath, section) {	
		var ajxUrl = '/xpl/'+ apath +'.ajax?'+xpl.properties.details.oqs;
		var spinner = "<img src='"+ ASSETS_RELATIVE_PATH + "/img/move-spinner.gif' />"; 
		var $moreLink = elem.parent('.showAll');
		$moreLink.find('.showAllLink').hide();
		$moreLink.append(spinner);
		j$.ajax(ajxUrl, {
   	  		success: function(data) {
   	  			$moreLink.css('height','10').find('img').remove();
   	  			j$('#' + section).html(data);
				if(section === 'Patent_citations'){
				citedByData.handlePatentEvents();
				}
   	  		},
			error: function(xhr, status, error, req) {
				$moreLink.find('img').remove();
				var alert = '<div class="alert-message">Citations could not be retrieved. If the problem persists please contact Online Support at <a href="mailto:onlinesupport@ieee.org">onlinesupport@ieee.org</a></div>';
				$moreLink.append(alert);
				$moreLink.find('.alert-message').hide().fadeIn(1000).delay(5000).fadeOut(1000, function() {$moreLink.find('.showAllLink').show();j$(this).remove();});
			}
		  });
	},
 	handleEvents: function() {
	/** Scroll to Citation Sections*/ 
  		j$('.art-docs-hdr ul li a').unbind("click").on("click", function(e){
      		e.preventDefault();
      		$this = j$(this);
      		citedByData.smoothSectionScroll($this, e, 10);
       		return false;
  		});
    	j$('.article-blk .backToTop').on("click", function(e){
      		e.preventDefault();
      		j$('html, body').animate({
      		scrollTop: j$("#article-page").offset().top
      	} , 500);
		});
	/** End Scroll to Citation Sections*/

	/** Load more Citations*/
		j$('#abstractCitations .showAllLink').unbind("click").on("click",function(){
			var $this = j$(this),
			id = $this.attr('id').split('all'),
			ids = id[0].split('_'),
			path = 'abstractCitations' + ids[0],
			div =  ids[0] + '_' + ids[1];		
			citedByData.loadMoreCitations($this, path, div); 
		}); 
	},
	handlePatentEvents: function() {
		//More Link
		j$(".citPatents .more").on("click", function(event){
			var $el = j$(this),
			$content = $el.parent().find('.patent-cite-blk');
			if($content.hasClass('hideContent')){ //close
				$content.removeClass('hideContent').slideDown(2000);
				$el.css({
				'background-image': 'url("../assets/img/btn.quick-abstract.expanded.gif")'
				}).attr('title', 'Close Patent Abstract'); 
			}else{ //open
				$content.addClass('hideContent').slideUp(2000);
				$el.css({
				'background-image': 'url("../assets/img/btn.quick-abstract.collapsed.gif")'
				}).attr('title', 'Show Patent Abstract');
			}
		});
	/** End Patent Citations */
	},
	smoothSectionScroll: function(a, e, m) {
		$citations = j$('#article-main .article');
        x = a.attr('href');
        y = x.substring(1);
        j$('html, body').animate({
			scrollTop: j$("div[id='"+y+"']").offset().top - m
		} , 500);
	}
}
