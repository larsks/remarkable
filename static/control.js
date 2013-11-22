var MODE_CONFIG = 0;
var MODE_CONTROL = 1;

var controller = {
	'base': null,
	'slide': 0,
	'url': null,
}

function update_location() {
	controller.url = controller.base + '#' + controller.slide;

	$.ajax({
		url: "/show/" + controller.id,
		type: "PUT",
		data: {
			"url": controller.url,
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

function start_presentation(show_id, show_pass, base_url, slide) {
	presentation = window.parent.controller;

	controller.id = show_id;
	controller.base = base_url;
	controller.slide = slide;
	controller.secret = show_pass;

	switch_mode(MODE_CONTROL);
	update_location();

	presentation.id = show_id;
	presentation.url = controller.url;
	parent.postMessage("start", "*");
}

function register_presentation(show_id, show_pass, base_url) {
	$.ajax({
		url: "/show/" + show_id,
		type: "POST",
		data: {
			"url": base_url,
			"secret": show_pass,
		},
		success: function(data) {
			if (data['status'] == "created") {
				start_presentation(show_id, show_pass, base_url, 1);
			} else {
				message("Unexpected response creating presentation." );
			}
		},
		error: function () {
				message("Failed to create slideshow.");
		},
		dataType: "json",
	})
}

function unregister_presentation(show_id, show_pass) {
	presentation = window.parent.controller;

	$.ajax({
		url: "/show/" + controller.id,
		type: "DELETE",
		data: {
			"secret": show_pass,
		},
		success: function(data) {
			if (data['status'] == "deleted") {
				message("Removed presentation.");
				presentation.id = null;
				controller.id = null;
			} else {
				message("Unexpected error removing presentation.");
			}
		},
		error: function () {
			message("Failed to remove slideshow.");
		},
		dataType: "json",
	})
}

function resume_presentation(show_id, show_pass) {
	presentation = window.parent.controller;

	$.ajax({
		url: "/show/" + show_id,
		type: "GET",
		success: function(data) {
			if (data['msg'] == 'info') {
				url = data['url']
				base_url = data['base']

				if (url.indexOf('#') != -1) {
					curslide = Number(url.split('#')[1]);
				} else {
					curslide = 1;
				}

				start_presentation(show_id, show_pass, base_url,
					curslide ? curslide : 1);
			
			} else {
				message("Unexpected response resuming presentation." );
			}
		},
		error: function () {
			message("Failed to resume slideshow.");
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

function handle_delete() {
	var show_id = $("#showid").val();
	var show_pass = $("#password").val();

	if (! show_id) {
		message("Missing presentation ID.");
		show_error_field("showid");
		return;
	}

	unregister_presentation(show_id, show_pass);
}

function handle_resume() {
	var show_id = $("#showid").val();
	var show_pass = $("#password").val();
	var base_url = $("#baseurl").val();

	if (! show_id) {
		message("Missing presentation ID.");
		show_error_field("showid");
		return;
	}

	resume_presentation(show_id, show_pass);

}

function handle_sync() {
	controller.slide = Number($("#curslide").val());
	update_location();
}

$(function() {
	$("#start").click(handle_start);
	$("#resume").click(handle_resume);
	$("#delete").click(handle_delete);

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

