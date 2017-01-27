// Renders the list of articles
function loadArticles() {
  $("#articles").append("Loading articles...");
  faves = updateFavesList();
  $.ajax({
    type: "GET",
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

// Manage collections
function manageCollections() {
  console.log("manage collections fired");
  var closeButton = "<button type='button' onclick='closeCollectionsManager()'>Close Collection Manager</button>";

  $("#collections-button").empty();
  $("#collections-button").append(closeButton);
  //placeEditCollection();
  placeAddCollection();
  placeRemoveCollection();
  return;
}

// close the collection manager
function closeCollectionsManager() {
  console.log("close collections fired");
  var manageButton = '<button type="button" onclick="manageCollections()">Manage Collections</button>';
  $("#edit-collection").empty();
  $("#add-collection").empty();
  $("#remove-collection").empty();
  $("#collection-status").empty();
  $("#collections-button").empty();
  $("#collections-button").append(manageButton);
}

function placeEditCollection() {
  var editCollection =
    '<div id="edit-collection-button"></div>';
  $("#edit-collection").empty();
  $("#edit-collection").append(editCollection);
  placeEditCollectionButton();
}

function placeAddCollection() {
  var addCollection =
    '<div id="add-collection-button"></div>'.concat(
    '<div id="add-collection-form"></div>',
    '<div id="close-add-collection-button"></div>');
  $("#add-collection").empty();
  $("#add-collection").append(addCollection);
  placeAddCollectionButton();
}

function placeRemoveCollection() {
  var removeCollection =
    '<div id="remove-collection-button"></div>'.concat(
    //'<div id="remove-collection-form"></div>',
    '<div id="collection-dropdown"></div>',
    //'<div id="remove-collection-submit"></div>',
    '<div id="collection-dropdown-submit"></div>',
    '<div id="close-remove-collection-button"></div>');
  $("#remove-collection").empty();
  $("#remove-collection").append(removeCollection);
  placeRemoveCollectionButton();
}

function placeEditCollectionButton() {
  var button = '<button type="button" onclick="editCollectionsViewer()">Edit Collection</button>';
  $("#edit-collection-button").empty();
  $("#edit-collection-button").append(button);
}

function placeAddCollectionButton() {
  var collectionButton = '<button type="button" onclick="addCollectionsViewer()">Add Collection</button>';
  $("#add-collection-button").empty();
  $("#add-collection-button").append(collectionButton);
}

function placeRemoveCollectionButton() {
  var removeCollectionButton = '<button type="button" onclick="removeCollectionViewer()">Remove Collection</button>';
  $("#remove-collection-button").empty();
  $("#remove-collection-button").append(removeCollectionButton);
}


// ADD COLLECTIONS

// View the Add collections editor
function addCollectionsViewer() {
  console.log("add collections viewer fired");
  var form =
    "<p>Adding Collection...</p>".concat(
      "<p>Collection name: <input type='text' name='collection-name' id='input-collection-name'><br/>",
      "<input type='button' value='Submit' onclick='submitAddCollection()'><br/></p>");
  var closeButton = '<button type="button" onclick="closeAddCollectionViewer()">Nevermind, I have all the collections I need</button>';

  $("#add-collection-button").empty();
  $("#edit-collection-button").empty();
  $("#remove-collection-button").empty();
  $("#add-collection-form").append(form);
  $("#close-add-collection-button").append(closeButton);
}

// submission of new collection
function submitAddCollection() {
  console.log("submit add collection fired");

  var collectionButton = '<button type="button" onclick="addCollectionsViewer()">Add Another Collection</button>';

  var collectionName = document.getElementById("input-collection-name").value.trim();

  if (collectionName !== "") {
    addCollection(collectionName, "list");
  } else {
    return;
  }

  closeAddCollectionViewer();
  $("#add-collection-button").empty();
  $("#add-collection-button").append(collectionButton);
}

// Close the add collections viewer
function closeAddCollectionViewer() {
  console.log("close add collection viewer fired");
  //placeEditCollection();
  placeAddCollection();
  placeRemoveCollectionButton();
}

// REMOVE COLLECTIONS

// View the remove collections menu
function removeCollectionViewer() {
  console.log("remove collection viewer fired");
  getCollections("dropdown"); // Modifies #remove-collection-form

  var submitButton = '<button type="button" onclick="submitRemoveCollection()">Submit</button>';
  var closeButton = '<button type="button" onclick="closeRemoveCollectionViewer()">Nevermind, I like all my collections</button>';
  var prompt = '<p>Select a collection to remove</p>';

  $("#edit-collection-button").empty();
  $("#add-collection-button").empty();
  $("#remove-collection-button").empty();
  $("#collection-dropdown").prepend(prompt);
  $("#collection-dropdown-submit").append(submitButton);
  $("#close-remove-collection-button").append(closeButton);
}

function submitRemoveCollection() {
  console.log("submit remove collection fired");
  var sure = confirm("Are you sure you'd like to remove this collection? This action cannot be undone.");
  if (sure) {
    var remove = document.getElementById("collection-dropdown-list").value;
    console.log(remove);
    removeCollection(remove);
  }
  closeRemoveCollectionViewer();

}

function closeRemoveCollectionViewer() {
  console.log("close remove collection viewer fired");
  placeRemoveCollection();
  placeEditCollectionButton();
  placeAddCollectionButton();
}
