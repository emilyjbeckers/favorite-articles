package main

// Tests for operations on the fake database simulator because I'm a tryhard

import "testing"

var cookiesArticle, cupsArticle, placesArticle Document
var testingDatabase Database

func setupTests() {
	cookiesArticle = Document{ID: 0, Title: "cool cookie recipe", Body: "First, you have to buy ingredients, so flour (not flower) and sugar and also any little doodads that you want to put on top. Then you have to put all the stuff in a bowl (not the doodads) and mix it up, trying to avoid making a big mess. Then you put that into your oven and set a timer on your phone so that you dont forget about it. Once your timer goes off, remove the cookies from the oven safely and put the doodads on top. Take a picture of them and post it on social media so that everyone can compliment you on them and make you feel better about the fact that they're misshapen and kind of gross.", Image: "cookies.png"}
	cupsArticle = Document{ID: 1, Title: "boring cups to avoid", Body: "We all know how frustrating it is to have your friends come over and then leave because your cups are too boring. In this article, we will examine how to tell if a cup is boring. If a cup is just one color, then it is probable boring. If the cup has a straw that is straight then the cup is probably boring, unless that straw is part of the character that the cup is supposed to look like. In fact, that's a better rule. If a cup is made to look like a character from a children's movie, then the cup is not boring. If you have any cups that do not fit this criterion, then they are boring and you must throw them out immediately and purchase cups that are not boring.", Image: "cups.jpg"}
	placesArticle = Document{ID: 2, Title: "how to use good place settings to fool your relatives into thinking you have your life together", Body: "Everybody knows that having good place settings is the easiest way to show your relatives that you have your life together, but what if you don't? Like many people your age, you are probably thinking, 'I do not have my life together, but I would like my relatives to think I do. Wearing a t-shirt that says 'I HAVE MY LIFE TOGETHER' every time they come over doesn't seem to be working. How can I trick them into thinking that I have my life together without lying to them?' The answer is that you cannot do this without a little bit of subterfuge, but only a small amount. The key is to set your table with placemats, plates, bowls, and a minimum of four glasses and three of each type of silverware at each place. If you cannot fit them all, purchase smaller china and utensils (do NOT uninvite relatives). With your place settings perfectly laid out, your relatives will focus on questions about politics and racism instead of asking about when you will get a boyfriend or a job.", Image: "place-setting.png"}
	testingDatabase = MakeDatabase([]*Document{&cookiesArticle, &cupsArticle, &placesArticle})
}

func TestDbFindDocument(t *testing.T) {
	setupTests()

	cups := testingDatabase.FindDocument("boring cups to avoid")
	failure := testingDatabase.FindDocument("this isnt a real article")

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

func TestDbCollections(t *testing.T) {
	setupTests()

	if len(testingDatabase.Collections) != 0 {
		t.Errorf("length of collections list at init is not zero")
	}

	if result := testingDatabase.FindCollection("nonexistent"); result != -1 {
		t.Errorf("found nonexistent database at index %v", result)
	}

	testingDatabase.AddCollection("cool collection")

	if len(testingDatabase.Collections) != 1 {
		t.Errorf("length of collections after adding just one is not 1")
	}
	if result := testingDatabase.FindCollection("cool collection"); result != 0 {
		t.Errorf("thought it found collection at index %v", result)
	}

	testingDatabase.AddCollection("cool collection")

	if len(testingDatabase.Collections) != 1 {
		t.Errorf("length of collections after trying to add a duplicate is not 1")
	}
}

func TestDbFaves(t *testing.T) {
	setupTests()

	err := testingDatabase.AddFave(&Document{Title: "i'm not real"})
	if err == nil {
		t.Errorf("didn't throw an error when it should have")
	}

	err = testingDatabase.AddFave(&cookiesArticle)
	if err != nil {
		t.Errorf("threw an error on favoriting article that exists")
	}
	if len := len(testingDatabase.Faves.Docs); len != 1 {
		t.Errorf("length of faves is not 1, instead got %v", len)
	}

	testingDatabase.AddCollection("test")
	c, _ := testingDatabase.GetCollection("test")
	c.AddDoc(&cookiesArticle)

	if len := len(c.Docs); len != 1 {
		t.Errorf("length of collection is not 1, instead got %v", len)
	}

	err = testingDatabase.RemoveFave(&cookiesArticle)
	//err = c.RemoveDoc(&cookiesArticle)
	if err != nil {
		t.Errorf("threw an error on unfavoritng article in favorites")
	}
	if len := len(testingDatabase.Faves.Docs); len != 0 {
		t.Errorf("length after removing all faves was %v", len)
	}
	if len := len(c.Docs); len != 0 {
		t.Errorf("collection with unfavorited article in it had a problem, looks like %v", c)
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
	if len(collection.Docs) != 1 {
		t.Error("problem with the setup")
	}

	err2 := collection.RemoveDoc(&Document{Title: "I'm not real"})
	if err2 == nil {
		t.Error("it didn't throw an error when it should have")
	}
	if len(collection.Docs) != 1 {
		t.Error("it removed something")
	}
	if collection.Docs[0] != &cupsArticle {
		t.Error("the other article isn't in there anymore")
	}

	err := collection.RemoveDoc(&cupsArticle)
	if len(collection.Docs) != 0 {
		t.Error("didn't decrease the length the proper amount")
	}
	if err != nil {
		t.Error("it errored out when it shouldnt have")
	}

}
