package main

// Tests for operations on the fake database simulator because I'm a tryhard

import "testing"

var cookiesArticle, cupsArticle, placesArticle Document
var testingDatabase Database

func setupTests() {
	cookiesArticle = Document{"cool cookie recipe"}
	cupsArticle = Document{"boring cups to avoid"}
	placesArticle = Document{"how to use good place settings to fool your relatives into thinking you have your life together"}
	testingDatabase = MakeDatabase([]*Document{&cookiesArticle, &cupsArticle, &placesArticle})
}

func TestDbFindDocument(t *testing.T) {
	setupTests()

	cups := sampleDatabase.FindDocument("boring cups to avoid")
	failure := sampleDatabase.FindDocument("this isnt a real article")

	if *cups != cupsArticle {
		t.Errorf("Could not find an article that exists, instead found this: %v", cups)
	}
	if failure != nil {
		t.Errorf("Did not come back with nil for article that doesnt exist, instead found this: %v", failure)
	}
}

func TestDbGetFaves(t *testing.T) {
	setupTests()

	if len(testingDatabase.GetFaves()) != 0 {
		t.Errorf("there was already a fave maybe ?")
	}

	testingDatabase.AddFave(&cupsArticle)

	favesList := testingDatabase.GetFaves()

	if len(favesList) != 1 {
		t.Errorf("the list of faves is the wrong length, got %v", len(favesList))
	}
	if favesList[0] != &cupsArticle {
		t.Errorf("the wrong article is in the list, expected %v and got %v", &cupsArticle, favesList[0])
	}
}

func TestCollectionAdd(t *testing.T) {
	setupTests()
	collection := Collection{Name: "faves"}
	if len(collection.Docs) != 0 {
		t.Error("collection is not empty on creation")
	}
	collection.AddDoc(&cupsArticle)
	if len(collection.Docs) != 1 {
		t.Error("collection size did not increase by 1")
	}
	if collection.Docs[0] != &cupsArticle {
		t.Errorf("didn't add the right thing, looks like this: %v", collection.Docs)
	}
	collection.AddDoc(&cupsArticle)
	if len(collection.Docs) != 1 {
		t.Error("collection did not filter out duplicates")
	}
}

func TestCollectionRemove(t *testing.T) {
	setupTests()
	collection := Collection{Name: "faves"}
	collection.AddDoc(&cupsArticle)
	collection.AddDoc(&placesArticle)
	if len(collection.Docs) != 2 {
		t.Error("problem with the setup")
	}

	err := collection.RemoveDoc(&cupsArticle)
	if len(collection.Docs) != 1 {
		t.Error("didn't decrease the length the proper amount")
	}
	if err != nil {
		t.Error("it errored out when it shouldnt have")
	}
	if collection.Docs[0] != &placesArticle {
		t.Error("the other article isn't in there anymore")
	}

	err2 := collection.RemoveDoc(&Document{"I'm not real"})
	if err2 == nil {
		t.Error("it didn't throw an error when it should have")
	}
	if len(collection.Docs) != 1 {
		t.Error("it removed something")
	}
}
