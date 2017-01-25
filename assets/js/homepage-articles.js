// Renders the list of articles
function loadArticles() {
  $("#articles").append("Loading articles...");
  faves = updateFavesList();
  $.ajax({
    type: "GET", // GET (from what i understand) is for recieving lightweight amounts of data. cannot send, cannot handle Large amounts
    url: "/load/articles",
    dataFilter: function(data) { // This thing pipes its answer directly into the success function
      return JSON.parse(data);
    },
    success: function(answer) {
      var entries = "";
      for (var i = 0; i < answer.length; i += 1) {
        entries = entries.concat('<p class="article-entry">',
          '<input type="checkbox" onchange="checkboxHandler(this)"',
          (faves.includes(answer[i].title) ? " checked> " : "> "),
          '<a href="/articles/', answer[i].id, '">',
          answer[i].title,
          '</a></p>\n');
      }
      $("#articles").empty();
      $("#articles").append(entries);
    }
  });
}
