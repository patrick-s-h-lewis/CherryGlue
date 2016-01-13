var ppct = {
		init: function() {
			ppct.bindEvents();
		},
		config: {
			ppctUrl: '/rest/search/export/'
		
		},
		el: {
			exportPpctDetailsBtn: j$('.export-ppct-details'),
		
		},

		
        succExportCall: function(responseData) {	
         	console.log(responseData);
         	var msg =  responseData.message;
         	msg = jQuery.parseJSON(msg);
         	var totalSuccess = msg.totalSucceeded + msg.totalDuplicates;
         	var totalFailed = msg.totalFailed;
         	var notification = '<div class="Notification-collabratec">';
         	if(totalSuccess > 0)
				notification += '<span class="Notification-collabratec-total">' + totalSuccess + (totalSuccess > 1 ? ' records' : ' record') + ' successfully exported.</span>';
			if(totalFailed > 0)
				notification += '<span class="Notification-collabratec-total Notification-collabratec-total-failed">' + totalFailed + (totalFailed > 1 ? ' records' : ' record') + ' failed to export.</span>'; 
			notification += '<a href="' + xpl.properties.collabratec.url + '" class="Notification-collabratec-link stats-ppct-notification">View in IEEE Collabratec&trade;</a></div>';
         	
         	this.displayNotification(notification);
		},
		
		displayNotification: function(msg) {
			var notification = Xplore.component.globalNotification;
			notification.options.autoHide=false;
			notification.show(msg);
			
		},
    
		bindEvents: function() {
			var cf = ppct.config,
				el = this.el,
				_this = this;
			
				
			j$(el.exportPpctDetailsBtn).on('click', function() {
				j$.ajax({
					url:  cf.ppctUrl,
					type: 'post',
					data: {id:el.exportPpctDetailsBtn.attr('data-arnumber')},
					dataType: 'json',
					success:function(res) {					
						_this.succExportCall(res);
					},
					error: function(errorMsg) {	
						console.log(errorMsg);
						_this.displayNotification('<div class="Notification-collabratec"><span class="Notification-collabratec-total-failed">IEEE Collabratec&trade; is currently unavailable. Please try again later.</span></div>');
						return;
					}
				});
				return false;
			});

		

		}
	
	};
	


jQuery(function() {
	ppct.init();
}); //doc ready