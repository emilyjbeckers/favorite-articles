// REQUEST: Load metainformation about the article
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
  $("#article-collection").empty();
  $("#article-favorite").empty();
  $("#article-favorite").append(unfavoriteButton);
  placeAddToCollectionViewer();
}


// Create menu to add this article to a collection
function placeAddToCollectionViewer() {
  console.log("add viewer");
  var bones =
    '<div id="collection-prompt"></div>'.concat(
    '<div id="collection-checklist"></div>');
  $("#article-collection").empty();
  $("#article-collection").append(bones);

  var text = '<p>Add to custom collection:</p>';

  getCollections('checklist', getTitle());
  $("#collection-prompt").append(text);
}

// Add the named article to favorites
function favoriteArticle(title) {
  console.log("favorite fired");
  changeFave(title, true);
  placeUnfavoriteButton();
  placeAddToCollectionViewer();
}

// Remove the named article from favorites
function unfavoriteArticle(title) {
  console.log("unfavorite fired");
  changeFave(title, false);
  placeFavoriteButton();
  $("#article-collection").empty();
}

// Update whether or not the article is in the checked/unchecked collection
function updateInCollection(checkbox) {
  article = getTitle();
  collection = checkbox.parentNode.textContent.trim();
  toAdd = checkbox.checked;
  kind = "checklist";
  addToCollection(article, collection, toAdd, kind);
}

// REQUEST: Send the change in favorite status to the server
function changeFave(title, favoriting) {
  var changedArticle = {
    title: title.trim(),
    fave: favoriting
  };
  $.ajax({
    type: "POST",
    url: "/faves/changes",
    dataType: "text",
    data: JSON.stringify(changedArticle)
  });
}


function getTitle() {
  return document.getElementById("article-title").textContent;
}
