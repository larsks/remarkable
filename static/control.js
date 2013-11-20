var slideshowID;
var slideshowBaseURL;
var slideNumber;

function update(url) {
	slideshowID = $("#showname").val();

	$.ajax({
		url: "/show/" + slideshowID,
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

function registerSlideshow() {
	slideshowID = $("#showname").val();

	$.ajax({
		url: "/show/" + slideshowID,
		type: "POST",
		data: {
			"url": $("#baseurl").val(),
			"secret": $("#secret").val(),
		},
		success: function(data) {
			$('#message').text(data['status']);
		},
		dataType: "json",
	})
}
function unregisterSlideshow() {
	slideshowID = $("#showname").val();

	$.ajax({
		url: "/show/" + slideshowID,
		type: "DELETE",
		data: {
			"secret": $("#secret").val(),
		},
		success: function(data) {
			$('#message').text(data['status']);
		},
		dataType: "json",
	})

	slideshowID = null;
}

function resumeSlideshow() {
	slideshowID = $("#showname").val();

	$.ajax({
		url: "/show/" + slideshowID,
		type: "GET",
		success: function(data) {
			$('#baseurl').val(data['base']);
			$('#cururl').val(data['url']);
			update(data['url']);
		},
		dataType: "json",
	})
}

function syncURL() {
	slideshowID = $("#showname").val();
	update($("#cururl").val());
}

function syncSlide() {
	baseurl=$("#baseurl").val();
	slideNumber=Number($("#curslide").val());
	update(baseurl + "#" + slideNumber);
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

