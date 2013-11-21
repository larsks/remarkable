var slideNumber;

function update(url) {
	$.ajax({
		url: "/show/" + window.parent.slideshowID,
		type: "PUT",
		data: {
			"url": url,
			"secret": $("#secret").val(),
		},
		success: function(data) {
			$('#cururl').val(data['url']);
		},
		dataType: "json",
	})
}

function message(msg) {
	$('#message').text(msg);
	$('#message').effect('highlight', {}, 3000);
}

function registerSlideshow() {
	window.parent.slideshowID = $("#showname").val();

	$.ajax({
		url: "/show/" + window.parent.slideshowID,
		type: "POST",
		data: {
			"url": $("#baseurl").val(),
			"secret": $("#secret").val(),
		},
		success: function(data) {
			if (data['status'] == "created") {
				message("Created slideshow " + window.parent.slideshowID);
			} else {
				message("Unexpected error creating " + window.parent.slideshowID);
			}
		},
		error: function () {
				message("Failed to create slideshow " + window.parent.slideshowID);
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
			$('#baseurl').val(data['base']);
			$('#cururl').val(data['url']);
			update(data['url']);
			message("Resumed slideshow " + window.parent.slideshowID);
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
	slideNumber=1;
	$("#curslide").val(slideNumber);
	baseurl=$("#baseurl").val();
	update(baseurl + "#1");
}

function goForward(num) {
	baseurl=$("#baseurl").val();

	if (! slideNumber) {
		slideNumber = 0;
	}

	slideNumber += num;
	$("#curslide").val(slideNumber);
	update(baseurl + "#" + slideNumber);
}

function goBackward(num) {
	if (! slideNumber)
		return;

	slideNumber = Math.max(1, slideNumber-num);
	$("#curslide").val(slideNumber);
	update(baseurl + "#" + slideNumber);
}


$(function() {
	$('#create').click(registerSlideshow);
	$('#delete').click(unregisterSlideshow);
	$('#resume').click(resumeSlideshow);
	$('#sync_url').click(syncURL);
	$('#sync_slide').click(syncSlide);
	$('#start').click(gotoStart);
	$('#f1').click(function() {goForward(1);});
	$('#b1').click(function() {goBackward(1);});
	$('#f5').click(function() {goForward(5);});
	$('#b5').click(function() {goBackward(5);});
});

