var MODE_CONFIG = 0;
var MODE_CONTROL = 1;

var controller = {
	'base': null,
	'slide': 0,
}

function update_location() {
	$.ajax({
		url: "/show/" + controller.id,
		type: "PUT",
		data: {
			"url": controller.base + '#' + controller.slide,
			"secret": controller.secret,
		},
		success: function(data) {
			$('#curslide').val(controller.slide);
		},
		dataType: "json",
	})
}

function message(msg) {
	$('#message').text(msg);
	$('#message').effect('highlight', {}, 3000);
}

function switch_mode(mode) {
	if (mode == MODE_CONFIG) {
		$("#config_panel").css("display", "block");
		$("#navigation_panel").css("display", "none");
	} else {
		$("#config_panel").css("display", "none");
		$("#navigation_panel").css("display", "block");
	}
	$("#message").text("");
}

function register_presentation(show_id, show_pass, base_url) {
	presentation = window.parent.controller;

	$.ajax({
		url: "/show/" + show_id,
		type: "POST",
		data: {
			"url": base_url,
			"secret": show_pass,
		},
		success: function(data) {
			if (data['status'] == "created") {
				controller.id = show_id;
				controller.base = base_url;
				controller.slide = 1;
				controller.secret = show_pass;

				switch_mode(MODE_CONTROL);
				update_location();

				presentation.id = show_id;
				presentation.url = base_url;
				parent.postMessage("start", "*");
			} else {
				message("Unexpected error creating presentation." );
			}
		},
		error: function () {
				message("Failed to create slideshow.");
		},
		dataType: "json",
	})
}
function unregisterSlideshow() {
	if (! window.parent.slideshowID) {
		return;
	}

	$.ajax({
		url: "/show/" + window.parent.slideshowID,
		type: "DELETE",
		data: {
			"secret": $("#secret").val(),
		},
		success: function(data) {
			if (data['status'] == "deleted") {
				message("Removed slideshow " + window.parent.slideshowID);
			} else {
				message("Unexpected error removing " + window.parent.slideshowID);
			}
		},
		error: function () {
			message("Failed to remove slideshow " + window.parent.slideshowID);
		},
		complete: function () {
			window.parent.slideshowID = null;
		},
		dataType: "json",
	})
}

function resumeSlideshow() {
	window.parent.slideshowID = $("#showname").val();

	if (! window.parent.slideshowID) {
		return;
	}

	$.ajax({
		url: "/show/" + window.parent.slideshowID,
		type: "GET",
		success: function(data) {
			url = data['url'];

			$('#baseurl').val(data['base']);
			$('#cururl').val(url);

			update(url);
			message("Resumed slideshow " + data['id']
				+ ". Your participant URL is: "
				+ "http://" + window.location.hostname + "/watch/" + data['id']);
			
			if (url.indexOf('#') != -1) {
				curslide = url.split('#')[1];
				$("#curslide").val(curslide);
				syncSlide();
			} else {
				gotoStart();
			}
		},
		error: function () {
			message("Failed to resume slideshow " + window.parent.slideshowID);
		},
		dataType: "json",
	})
}

function syncURL() {
	update($("#cururl").val());
}

function syncSlide() {
	baseurl=$("#baseurl").val();
	slideNumber=Number($("#curslide").val());

	if (slideNumber) {
		update(baseurl + "#" + slideNumber);
	}
}

function gotoStart() {
	controller.slide = 1;
	update_location();
}

function goForward(num) {
	controller.slide+=num;
	update_location();
}

function goBackward(num) {
	controller.slide = Math.max(1, controller.slide-num);
	update_location();
}

function show_error_field (id) {
	$('#' + id).effect('highlight', {"color": "#FF3D3D"}, 3000);
}

function handle_start() {
	var show_id = $("#showid").val();
	var show_pass = $("#password").val();
	var base_url = $("#baseurl").val();

	if (! show_id) {
		message("Missing presentation ID.");
		show_error_field("showid");
		return;
	}

	if (! base_url) {
		message("Missing base URL.");
		show_error_field("baseurl");
		return;
	}

	register_presentation(show_id, show_pass, base_url);
}

function handle_sync() {
	controller.slide = Number($("#curslide").val());
	update_location();
}

$(function() {
	$("#start").click(handle_start);
	$("#config").click(function () {
		switch_mode(MODE_CONFIG);
	});
	$("#control").click(function () {
		switch_mode(MODE_CONTROL);
	});

	$("#sync").click(handle_sync);
	$("#first").click(gotoStart);
	$("#f1").click(function () {goForward(1)});
	$("#f5").click(function () {goForward(5)});
	$("#b1").click(function () {goBackward(1)});
	$("#b5").click(function () {goBackward(5)});

	$("#navigation_panel").css("display", "none");
	message("Welcome to Remarkable.");
});

