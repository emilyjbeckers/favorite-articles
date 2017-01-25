// REQUEST: Converts the data from the page into a json so that the backend can handle it
// Goes to changesHandler in fave.go
function checkboxHandler(checkbox) {
  // Set up the data so that the server can handle it. The server is expecting a JSON that can be unmarshalled into the form of a DocumentReport.
  var changedArticle = {};
  changedArticle.title = checkbox.parentNode.textContent.trim();
  changedArticle.fave = checkbox.checked;

  $.ajax({
    type: "POST", // POST is for most cases, it sends and recieves data securely
    url: "/faves/changes", // This url needs to match up with the url in the first argument of the HandleFunc that links to the correct handler
    dataType: "text", // Go can't handle real JSONs, so we give it a stringified version of one (that happens to be text)
    data: JSON.stringify(changedArticle), // This is what sends to the handler
    success: function(data) {
      // Now that the server has updated which articles are favorited, we need to update our favorites list through another call.
      updateFavesList();
    }
  });
}

// REQUEST: Function for retrieving the list of favorites from the server
// Goes to the favesHandler function in faves.go
function updateFavesList() {
  var favorites = [];
  $.ajax({
    type: "GET", // GET is only for sending data, and it can only handle lightweight amounts of data. It sends the data over the url, which means that its less secure
    url: "/faves/list",
    dataFilter: function(data) { // data that comes back goes through the dataFilter before getting to the success function
      return JSON.parse(data);
    },
    success: function(data) {
      // Do what we need to do with the data that came back from the server (in this case, prepare it to be printed)
      var faves = "";

      for (var i = 0; i < data.length; i += 1) {
        faves = faves.concat(data[i].title, "<br/>");
        favorites.push(data[i].title);
      }

      // And rewrite the list
      $("#fave-list").empty();
      $("#fave-list").append(faves);
    }
  });
  return favorites;
}
