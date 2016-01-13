/**
 * Funtion used by abstract
 * @returns {Boolean}
 */
function rightsLinkPopup(){
	var publisher = body_publisher,
	rightsLinkUrl = ("IBM" === publisher) ? 'http://www.research.ibm.com/journal/rdauth.html' : body_rightsLink;  
	//rightsLinkUrl = encodeURI(rightsLinkUrl);    
	window.open(rightsLinkUrl,  'Rightslink', 'location=no,toolbar=no,directories=no,status=no, menubar=no,scrollbars=yes,resizable=yes,width=650,height=550');
	return false;
}

j$(document).ready(function() {
	//bind for abstract page
	j$('#article-actions').delegate(".article-tools .tools .tl-permission a","click",rightsLinkPopup);

	 j$('.showRightsLinkPopup').bind("click" ,function() {
			var rightsLink = j$(this).find("#rightsLink").attr("class");
			var publisher = j$(this).find("#publisher").attr("class");
			var rightsLinkUrl = ("IBM" === publisher) ? 'http://www.research.ibm.com/journal/rdauth.html' : rightsLink;  
			window.open(rightsLinkUrl,  'Rightslink', 'location=no,toolbar=no,directories=no,status=no, menubar=no,scrollbars=yes,resizable=yes,width=650,height=550');
			return false;
	    });
	
});