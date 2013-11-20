$(function () {
    var showFrame = document.getElementById("show");

    (function poll() {
        setTimeout(function() {
            console.log("polling");

            if (! slideshowID)
                slideshowID = window.frames[0].slideshowID;

            if (slideshowID) {
                $.ajax({
                    url: "/show/" + slideshowID + "/poll",
                    type: "GET",
                    success: function(data) {
                        showFrame.src = data['url'];
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
        }, 2000);
    })();

});

