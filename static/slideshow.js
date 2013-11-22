var pollInterval = 2000;

var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
var eventer = window[eventMethod];
var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
var poller;

var controller = {
	"state": 0,
	"id": null,
	"url": null,
};

function update_location() {
	/* XXX: On Chrome, this works even though
	 * window.f_show.src generates a SecurityError.
	 */
	document.getElementById('f_show').src = controller.url;

	locationFrame = document.getElementById('f_location');
	if (locationFrame) {
		$("#location", locationFrame.contentDocument).html(
			'<a href="' + controller.url + '">' + controller.url + '</a>'
		);
	}
}

function poll() {
	xurl = pollServer + "/show/" + controller.id + "/poll";

	console.log("polling");

	if ( ! (controller && controller.id)) {
		setTimeout(poll, 2000);
		return;
	}

	console.log("checking (" + controller.id + ")");

	poller = $.ajax({
		url: xurl,
	       type: "GET",
	       success: function(data) {
		       if (data['msg'] == 'update') {
			       controller.url = data['url'];
			       update_location();
		       }
		       controller.state = 1;
	       },
	       error: function() {
		       controller.state = 0;
		       pollInterval=2000;
	       },
	       complete: function () {
		       poller = null;
		       if (controller.state) {
			       poll();
		       } else {
			       setTimeout(poll, 2000);
		       }
	       },
	       dataType: "json",
	       timeout: 60000
	})
}


$(function () {

  eventer(messageEvent,function(e) {
    console.log('parent received message!:  ',e.data);
    if (poller) poller.abort();
    update_location();
  },false);

  poll();
});

