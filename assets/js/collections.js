// REQUEST: Get the current collections from the server and render them in some way
// Title argument only required if kind === "checklist"
function getCollections(kind, title) {
  console.log("get collections fired");
  $.ajax({
    type: "POST",
    url: "/collection/list",
    dataFilter: function(data) { return JSON.parse(data); },
    success: function(data) {
      // There is probably some really nice dynamic dispatch way of doing this
      if (kind === "list") {
        viewCollectionsList(data);
      } else if (kind === "dropdown") {
        viewCollectionsDropdown(data);
      } else if (kind === "checklist") {
        viewCollectionsChecklist(data, title);
      }
    }
  });
}

// REQUEST: Ask the server to add the given collection, with optional kind and title arguments to render after server has completed the operation
function addCollection(name, kind, title) {
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
      if (kind !== undefined) {
        getCollections(kind, title);
      }
    }
  });
}

// REQUEST: Ask the server to remove the given collection
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

// REQUEST: Ask the server to add the given article to the given collection, with an optional kind to display the new information when done
function addToCollection(article, collection, toAdd, kind) {
  // Must unmarshal into CollectionReport
  var toSend = {article: article.trim(), collection: collection.trim(), toAdd: toAdd};
  console.log(toSend);
  $.ajax({
    type: "POST",
    url: "/collection/changes",
    datatype: "text",
    data: JSON.stringify(toSend),
    success: function(data) {
      if (kind !== undefined) {
        getCollections(kind, article);
      }
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
      if (collections[i].docs[j] === null) {
        continue;
      }
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
    $("#collection-dropdown").append("You have no collections! Try adding some.");
    return;
  }

  html = html.concat('<select id="collection-dropdown-list">');

  for (var i = 0; i < collections.length; i += 1) {
    var numArticles = 0;

    if (collections[i].docs !== null) {
      numArticles = collections[i].docs.length;
    }

    html = html.concat('<option value="', collections[i].name, '">', collections[i].name, ' (', numArticles, ')</option>');
  }
  html = html.concat('</select>');

  $("#collection-dropdown").append(html);

}

// Render collections in a checklist
function viewCollectionsChecklist(collections, title) {
  console.log("view collections checklist fired");

  var html = "";

  if (collections === null) {
    $("#collection-checklist").append("You have no collections! Try adding some.");
    return;
  }

  for (var i = 0; i < collections.length; i += 1) {
    var alreadyIn = false;

    if (collections[i].docs !== null) {
      for (var j = 0; j < collections[i].docs.length; j += 1) {
        if (collections[i].docs[j] === null) {
          continue;
        }
        alreadyIn = alreadyIn || collections[i].docs[j].title === title;
      }
    }

    html = html.concat(
      '<p><input type="checkbox" onchange="updateInCollection(this)"',
      alreadyIn ? ' checked>' : '>',
      collections[i].name, '</p>');
  }
  console.log(html);
  $("#collection-checklist").empty();
  $("#collection-checklist").append(html);
}
