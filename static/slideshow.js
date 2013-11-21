var pollInterval = 2000;

$(function () {
	var showFrame = document.getElementById("show");

	(function poll() {
		xurl = pollServer + "/show/" + slideshowID + "/poll"

		setTimeout(function() {
			console.log("polling");

			if (! slideshowID) {
				slideshowID = window.frames[0].slideshowID;
			}

			if (slideshowID) {
				$.ajax({
					url: xurl,
					type: "GET",
					success: function(data) {
						if (data['msg'] == 'update') {
							showFrame.src = data['url'];
						}
						pollInterval=500;
					},
					error: function() {
						pollInterval=2000;
					},

					complete: function () {
						poll();
					},
					dataType: "json",
					timeout: 30000
				})
			} else {
				poll();
			}
		}, pollInterval);
	})();

});

