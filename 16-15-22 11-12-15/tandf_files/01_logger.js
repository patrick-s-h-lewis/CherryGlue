var CWlogger={outterDiv:null,button:null,innerDiv:null,textArea:null,headingArea:null,init:function(a){0<CwZ("#CWDailogOverlay").length?(CWlogger.outterDiv=CwZ("#CWDailogOverlay"),CWlogger.button=CWlogger.outterDiv.find("#btnCancel"),CWlogger.innerDiv=CWlogger.outterDiv.find(".cw-dailog"),CWlogger.headingArea=CWlogger.outterDiv.find("h1"),CWlogger.textArea=CWlogger.outterDiv.find("p"),CWlogger.button.off("click").on("click",CWlogger.close),a&&a()):setTimeout(function(){CWlogger.init()},3E3)},logConsole:function(a,
b,c){c&&CWlogger.dialog(a,b)},dialog:function(a,b){if(CWlogger.outterDiv&&0<CWlogger.outterDiv.length)CWlogger.reset(),b&&CWlogger.headingArea.text(b),a&&CWlogger.textArea.text(a),"Sign up Successful"==b||"Log in Successful"==b?CWlogger.innerDiv.removeClass("cw-error").addClass("cw-success"):CWlogger.innerDiv.removeClass("cw-success").addClass("cw-error"),0==CwZ("#CWDailogOverlay").is(":visible")&&CWlogger.outterDiv.show();else{var c=CWHtmlStructure.getSignupDialog();CwZ("body").append(c);CWlogger.init(function(){CWlogger.reset();
CWlogger.dialog(a,b)})}},reset:function(){CWlogger.headingArea.text("");CWlogger.textArea.text("")},close:function(){0<CWlogger.outterDiv.length&&(CWlogger.outterDiv.hide(),CWlogger.reset())}};CWlogger.init();
