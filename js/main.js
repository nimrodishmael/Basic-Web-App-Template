'use strict';

function main() {

  // Handle clicks
  $("#title").click(function() {
    // Toggle
    var status = 0;
    if ($(this).find(".title").hasClass("selected")) {
      $(this).find(".title").removeClass('selected');
      status = 0;
    }
    else {
      $(this).find(".title").addClass('selected');
      status = 1;
    }

    // Save
    $.getJSON("api/save", {"status": status}).done(function(data) {
        console.log(data);
      });
  });
}

$(function() {
    main();
});