'use strict';

function main() {

  // Status div
  var statusDiv = $("#status");

  // Load
  $.getJSON("api/load", {})
  .done(function(response) {
    $.each(response.data, function(id, row) {
      setStatus(statusDiv, row.status);
    });
  });

  // Handle clicks
  statusDiv.click(function() {
    // Toggle
    var status;
    statusDiv = $(this);
    if (statusDiv.hasClass("selected")) status = "Bad";
    else status = "Good";
    setStatus(statusDiv, status);

    // Save
    $.getJSON("api/save", {"status": status}).done(function(data) {
        //console.log(data);
      });
  });
}

// Set status
function setStatus(statusDiv, status) {
  if (status == "Good") statusDiv.addClass("selected");
  else statusDiv.removeClass("selected");
  statusDiv.html(status);
}

// Run on page load
$(function() {
    main();
});