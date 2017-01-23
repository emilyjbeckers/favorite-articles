// Renders the list of articles
function loadArticles() {
  $("#articles").append("Loading articles...");
  faves = updateFavesList();
  $.ajax({
    type: "GET", // GET (from what i understand) is for recieving lightweight amounts of data. cannot send, cannot handle Large amounts
    url: "/load",
    dataFilter: function(data) { // This thing pipes its answer directly into the success function
      return JSON.parse(data);
    },
    success: function(answer) {
      var entries = "";
      for (var i = 0; i < answer.length; i += 1) {
        entries = entries.concat('<p class="article-entry">',
          answer[i].title,
          ' <input type="checkbox" onchange="checkboxHandler(this)"',
          (faves.includes(answer[i].title) ? "checked" : ""),
          '></p>\n');
      }
      $("#articles").empty();
      $("#articles").append(entries);
    }
  });
}

// Converts the data from the page into a json so that the backend can handle it
function checkboxHandler(checkbox) {
  var changedArticle = {};
  // Must unmarshal into DocumentReport struct
  changedArticle.title = checkbox.parentNode.textContent.trim();
  changedArticle.fave = checkbox.checked;

  $.ajax({
    type: "POST",
    url: "/changes",
    dataType: "text",
    data: JSON.stringify(changedArticle),
    dataFilter: function(data) { return JSON.parse(data); }
  });

  updateFavesList();
}

function updateFavesList() {
  var favorites = [];
  $.ajax({
    type: "GET",
    url: "/faves",
    dataFilter: function(data) { return JSON.parse(data); },
    success: function(data) {
      var faves = "";

      for (var i = 0; i < data.length; i += 1) {
        faves = faves.concat(data[i].title, "<br/>");
        favorites.push(data[i].title);
      }
      // And rewrite the list
      $("#faveList").empty();
      $("#faveList").append(faves);
    }
  });
  return favorites;
}
