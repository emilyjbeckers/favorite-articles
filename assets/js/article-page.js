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
  placeCollectionViewer();
}

// Create menu to add this article to a collection
function placeCollectionViewer() {
  console.log("add viewer");
  var bones =
    '<div id="collection-prompt"></div>'.concat(
    '<div id="collection-checklist"></div>',
    '<div id="add-collection-button"></div>',
    '<div id="add-collection"></div>');
  $("#article-collection").empty();
  $("#article-collection").append(bones);

  var text = '<p>Add to custom collection:</p>';
  var addCollectionButton = '<button type="button" onclick="addCollectionViewer()">Add New Collection</button>';

  getCollections('checklist', getTitle());
  $("#collection-prompt").append(text);
  $("#add-collection-button").append(addCollectionButton);
}

// Create menu to add new collection
function addCollectionViewer() {
  var bones =
    '<div id="add-collection-form"></div>'.concat(
    '<div id="close-add-collection"></div>');
  var form =
    "<p>Adding Collection...</p>".concat(
    "<p>Collection name: <input type='text' name='collection-name' id='input-collection-name'><br/>",
    "<input type='button' value='Submit' onclick='submitAddCollection()'><br/></p>");
  var closeButton = '<button type="button" onclick="closeAddCollectionViewer()">Nevermind, I have all the collections I need</button>';

  $("#add-collection-button").empty();
  $("#add-collection").append(bones);
  $("#add-collection-form").append(form);
  $("#close-add-collection").append(closeButton);
}

// Submit adding the new collection
function submitAddCollection() {
  var collectionButton = '<button type="button" onclick="addCollectionViewer()">Add Another Collection</button>';

  var collectionName = document.getElementById("input-collection-name").value.trim();

  if (collectionName !== "") {
    addCollection(collectionName, "checklist", getTitle());
    addToCollection(getTitle(), collectionName, true, "checklist");
  } else {
    return;
  }

  closeAddCollectionViewer();
  $("#add-collection-button").empty();
  $("#add-collection-button").append(collectionButton);
}

// Closes the add collection viewer
function closeAddCollectionViewer() {
  var addCollectionButton = '<button type="button" onclick="addCollectionViewer()">Add New Collection</button>';
  $("#add-collection").empty();
  $("#add-collection-button").append(addCollectionButton);
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

// Determine the title of the article
function getTitle() {
  return document.getElementById("article-title").textContent;
}
