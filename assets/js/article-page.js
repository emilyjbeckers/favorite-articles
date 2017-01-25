// Load metainformation about the article
function loadArticle(id) {
  $.ajax({
    type: "GET",
    url: "/faves/list",
    dataFilter: function(data) { return JSON.parse(data); },
    success: function(data) {
      for (var i = 0; i < data.length; i += 1) {
        if (data[i].id == id) {
          placeUnfavoriteButton();
          return;
        }
      }
      // Else, it's not in the list of favorites
      placeFavoriteButton();
    }
  });
}

function getTitle() {
  return document.getElementById("article-title").textContent;
}

// Put a favorite button in the correct location
function placeFavoriteButton() {
  var title = getTitle();
  var favoriteButton = '<button type="button" onclick="favoriteArticle(\''.concat(title, '\')">Save this article</button>');
  $("#article-favorite").empty();
  $("#article-favorite").append(favoriteButton);
}

// Put an unfavorite button in the correct location
function placeUnfavoriteButton() {
  var title = getTitle();
  var unfavoriteButton = '<button type="button" onclick="unfavoriteArticle(\''.concat(title, '\')">Remove this article from saved</button>');
  $("#article-favorite").empty();
  $("#article-favorite").append(unfavoriteButton);
}

// Add the named article to favorites
function favoriteArticle(title) {
  console.log("favorite fired");
  changeFave(title, true);
  placeUnfavoriteButton();
}

// Remove the named article from favorites
function unfavoriteArticle(title) {
  console.log("unfavorite fired");
  changeFave(title, false);
  placeFavoriteButton();
}

// Send the change in favorite status to the server
function changeFave(title, favoriting) {

  var changedArticle = {
    title: title.trim(),
    fave: favoriting
  };

  $.ajax({
    type: "POST",
    url: "/faves/changes",
    dataType: "text",
    data: JSON.stringify(changedArticle),
    success: function(data) {
      console.log("success");
    }
  });

}
