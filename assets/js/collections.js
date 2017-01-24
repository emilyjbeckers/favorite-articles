// Manage collections
function manageCollections() {
  console.log("manage collections fired");
  var closeButton = "<button type='button' onclick='closeCollectionsManager()'>Close Collection Manager</button>";
  var addCollection =
    '<div id="add-collection-button">'.concat(
      '<button type="button" onclick="addCollectionsViewer()">Add New Collection</button>',
    '</div>',
    '<div id="add-collection-form"></div>',
    '<div id="close-add-collection-button"></div>');
  var removeCollection =
    '<div id="remove-collection-button">'.concat(
      '<button type="button" onclick="removeCollectionViewer()">Remove Collection</button>',
    '</div>',
    '<div id="remove-collection-form"></div>',
    '<div id="remove-collection-submit"></div>',
    '<div id="close-remove-collection-button"></div>');

  $("#collections-button").empty();
  $("#collections-button").append(closeButton);
  $("#add-collection").append(addCollection);
  $("#remove-collection").append(removeCollection);
  return;
}

// close the collection manager
function closeCollectionsManager() {
  console.log("close collections fired");
  var manageButton = '<button type="button" onclick="manageCollections()">Manage Collections</button>';
  $("#add-collection").empty();
  $("#remove-collection").empty();
  $("#collection-status").empty();
  $("#collections-button").empty();
  $("#collections-button").append(manageButton);
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
    addCollection(collectionName);
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
  var addCollection =
    '<div id="collection-added"></div>'.concat(
    '<div id="add-collection-button">',
      '<button type="button" onclick="addCollectionsViewer()">Add New Collection</button>',
    '</div>',
    '<div id="add-collection-form"></div>',
    '<div id="close-add-collection-button"></div>');
  var removeCollectionButton = '<button type="button" onclick="removeCollectionViewer()">Remove Collection</button>';
  $("#add-collection").empty();
  $("#add-collection").append(addCollection);
  $("#remove-collection-button").append(removeCollectionButton);
}

// REMOVE COLLECTIONS

// View the remove collections menu
function removeCollectionViewer() {
  console.log("remove collection viewer fired");
  getCollections("dropdown"); // Modifies #remove-collection-form

  var submitButton = '<button type="button" onclick="submitRemoveCollection()">Submit</button>';
  var closeButton = '<button type="button" onclick="closeRemoveCollectionViewer()">Nevermind, I like all my collections</button>';

  $("#remove-collection-button").empty();
  $("#add-collection-button").empty();
  $("#remove-collection-submit").append(submitButton);
  $("#close-remove-collection-button").append(closeButton);
}


function submitRemoveCollection() {
  console.log("submit remove collection fired");
  var sure = confirm("Are you sure you'd like to remove this collection? This action cannot be undone.");
  if (sure) {
    var remove = document.getElementById("remove-collection-list").value;
    console.log(remove);
    removeCollection(remove);
  }
  closeRemoveCollectionViewer();
  
}

function closeRemoveCollectionViewer() {
  console.log("close remove collection viewer fired");
  var removeCollection =
    '<div id="collection-removed"></div>'.concat(
    '<div id="remove-collection-button">',
      '<button type="button" onclick="removeCollectionViewer()">Remove Collection</button>',
    '</div>',
    '<div id="remove-collection-form"></div>',
    '<div id="remove-collection-submit"></div>',
    '<div id="close-remove-collection-button"></div>');
  var addCollectionButton = '<button type="button" onclick="addCollectionsViewer()">Add New Collection</button>';
  $("#remove-collection").empty();
  $("#remove-collection").append(removeCollection);
  $("#add-collection-button").append(addCollectionButton);
}

// REQUESTS

// Get the current collections from the server and render them in some way
function getCollections(kind) {
  console.log("get collections fired");
  $.ajax({
    type: "POST",
    url: "/collection/list",
    dataFilter: function(data) { return JSON.parse(data); },
    success: function(data) {
      if (kind === "list") {
        viewCollectionsList(data);
      } else if (kind === "dropdown") {
        viewCollectionsDropdown(data);
      }
    }
  });
}

// Ask the server to add the given collection
function addCollection(name) {
  console.log("add collection fired");
  $.ajax({
    type: "POST",
    url: "/collection/add",
    datatype: "text",
    data: JSON.stringify(name),
    success: function(data) {
      var addedCollection = '<p>Collection '.concat(name, ' added.</p>');
      $("#collection-status").empty();
      $("#collection-status").append(addedCollection);
      getCollections("list");
    }
  });
}

// Ask the server to remove the given collection
function removeCollection(name) {
  console.log("remove collection fired");
  $.ajax({
    type: "POST",
    url: "/collection/remove",
    datatype: "text",
    data: JSON.stringify(name),
    success: function(data) {
      var removedCollection = '<p>Collection '.concat(name, ' successfully removed.</p>');
      $("#collection-status").empty();
      $("#collection-status").append(removedCollection);
      getCollections("list");
    }
  });
}

// RENDER COLLECTIONS

// Render collections in list view
function viewCollectionsList(collections) {
  console.log("view collections list fired");
  var collectionsHtml = "";

  if (collections === null) {
    $("#collections-list").empty();
    $("#collections-list").append("<p>No collections yet! Try adding some:</p>");
    return;
  }

  collectionsHtml = collectionsHtml.concat("<p>Collections:</p>");

  for (var i = 0; i < collections.length; i += 1) {
    collectionsHtml = collectionsHtml.concat(collections[i].name, "<ul>");

    if (collections[i].docs === null) {
      collectionsHtml = collectionsHtml.concat("</ul>");
      continue; // If there's no documents in this collection, skip ahead to the next one
    }

    for (var j = 0; j < collections[i].docs.length; j += 1) {
      collectionsHtml = collectionsHtml.concat("<li>", collections[i].docs[j].title, "</li>");
    }

    collectionsHtml = collectionsHtml.concat("</ul>");
  }

  $("#collections-list").empty();
  $("#collections-list").append(collectionsHtml);
}

// Render collections in dropdown
function viewCollectionsDropdown(collections) {
  console.log("view collections dropdown fired");

  var html = "";

  if (collections === null) {
    $("#remove-collection-form").append("You have no collections! Try adding some.");
    return;
  }

  html = html.concat(
    '<p>Select a collection to remove</p>',
    '<select id="remove-collection-list">');

  for (var i = 0; i < collections.length; i += 1) {
    var numArticles = 0;

    if (collections[i].docs !== null) {
      numArticles = collections[i].docs.length;
    }

    html = html.concat('<option value="', collections[i].name, '">', collections[i].name, ' (', numArticles, ')</option>');
  }
  html = html.concat('</select>');

  $("#remove-collection-form").empty();
  $("#remove-collection-form").append(html);

}
