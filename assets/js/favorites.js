// Converts the data from the page into a json so that the backend can handle it
function checkboxHandler(checkbox) {
  var changedArticle = {};
  // Must unmarshal into DocumentReport struct
  changedArticle.title = checkbox.parentNode.textContent.trim();
  changedArticle.fave = checkbox.checked;

  $.ajax({
    type: "POST",
    url: "/faves/changes",
    dataType: "text",
    data: JSON.stringify(changedArticle),
    success: function(data) {
      updateFavesList();
    }
  });
}

function updateFavesList() {
  var favorites = [];
  $.ajax({
    type: "GET",
    url: "/faves/list",
    dataFilter: function(data) { return JSON.parse(data); },
    success: function(data) {
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

// Manage collections
function manageCollections() {
  $("#collections-button").empty();
  $("#manage-collections").append("managing collections");
  $("#collections-button").append("<button type='button' onclick='closeCollections()'>Close Collection Manager</button>");
  return;
}

// close the collection manager
function closeCollections() {
  $("#manage-collections").empty();
  $("#collections-button").empty();
  $("#collections-button").append('<button type="button" onclick="manageCollections()">Manage Collections</button>');
}
