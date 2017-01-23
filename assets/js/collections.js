// Convert collections into html to be viewed
function viewCollections(collections) {
  console.log("view collections fired");

  var collectionsHtml = "";
  if (collections !== null) {
    for (var i = 0; i < collections.length; i += 1) {
      collectionsHtml = collectionsHtml.concat(collections[i].name, "<ul>");
      if (collections[i].docs !== null) {
        for (var j = 0; j < collections[i].docs.length; j += 1) {
          collectionsHtml = collectionsHtml.concat("<li>", collections[i].docs[j].title, "</li>");
        }
      }
      collectionsHtml = collectionsHtml.concat("</ul>");
    }
  }
  if (collectionsHtml !== "") {
    collectionsHtml = "<p>Collections:</p>".concat( collectionsHtml);
  } else {
    collectionsHtml = "<p>No collections yet! Try adding some:</p>";
  }

  return collectionsHtml;
}

// Manage collections
function manageCollections() {
  console.log("managecollections fired");
  var closeButton = "<button type='button' onclick='closeCollections()'>Close Collection Manager</button>";
  var addCollection = '<div id="add-collection-button"><button type="button" onclick="addCollectionsViewer()">Add New Collection</button></div><div id="add-collection"></div>';

  $("#collections-button").empty();
  $("#manage-collections").append(addCollection);
  $("#collections-button").append(closeButton);
  return;
}

// close the collection manager
function closeCollections() {
  console.log("close collections fired");
  var manageButton = '<button type="button" onclick="manageCollections()">Manage Collections</button>';
  $("#manage-collections").empty();
  $("#collections-button").empty();
  $("#collections-button").append(manageButton);
}

// View the Add collections editor
function addCollectionsViewer() {
  console.log("add collections viewer fired");
  var form = "<p>Adding Collection...</p><p>Collection name: <input type='text' name='collection-name' id='input-collection-name'><br/><input type='button' value='Submit' onclick='submitAddCollection()'><br/></p><div id='collection-added'></div>";
  $("#add-collection-button").empty();
  $("#add-collection").append(form);
}

// submission of new collection
function submitAddCollection() {
  console.log("submit add collection fired");

  var collectionButton = '<button type="button" onclick="addCollectionsViewer()">Add Another Collection</button></div><div id="add-collection">';

  collectionName = document.getElementById("input-collection-name").value.trim();

  if (collectionName !== "") {
    addCollection(collectionName);
  } else {
    return;
  }

  console.log("submit add collections modifying");
  $("#add-collection").empty();
  $("#add-collection-button").append(collectionButton);

}

// REQUESTS

// Get the current collections from the server
function getCollections() {
  console.log("get collections fired");
  $.ajax({
    type: "POST",
    url: "/collection/list",
    dataFilter: function(data) { return JSON.parse(data); },
    success: function(data) {
      var collections = viewCollections(data);
      console.log("get modified");
      $("#collections-list").empty();
      $("#collections-list").append(collections);
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
      var addedCollection = '<p>Collection '.concat(collectionName, ' added.</p>');

      $("#add-collection").empty();
      $("#add-collection").append(addedCollection);
      getCollections();
    }
  });
}
