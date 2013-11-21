var pollInterval = 2000;

function update_location(url) {
	window.f_show.src = url;

	if (window.f_location) {
		$("#location", window.f_location.contentDocument).html(
			'<a href="' + url + '">' + url + '</a>'
		);
	}

}

$(function () {

	(function poll() {
		xurl = pollServer + "/show/" + slideshowID + "/poll"

		setTimeout(function() {
			if (slideshowID) {
				console.log("polling");

				$.ajax({
					url: xurl,
					type: "GET",
					success: function(data) {
						if (data['msg'] == 'update') {
							update_location(data['url']);
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
					timeout: 60000
				})
			} else {
				poll();
			}
		}, pollInterval);
	})();

	/* XXX: We can't call update_location() immediately because the frames
	 * might not have loaded yet.  Calling $(window.f_show).load() results
	 * in an error.  So instead we just wait a second.
	 */
	setTimeout(function () {
		update_location(window.f_show.src);
	}, 1000);

});

