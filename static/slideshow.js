var pollInterval = 2000;

$(function () {
	var showFrame = document.getElementById("show");

	(function poll() {
		setTimeout(function() {
			console.log("polling");

			if (! slideshowID) {
				slideshowID = window.frames[0].slideshowID;
			}

			if (slideshowID) {
				$.ajax({
					url: "/show/" + slideshowID + "/poll",
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

