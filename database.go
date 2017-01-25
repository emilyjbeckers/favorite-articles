// Simulates getting responses from the database

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
)

// A Document represents a document
type Document struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Body  string `json:"body"`
}

// A Collection represents a named collection of documents
type Collection struct {
	Name string      `json:"name"`
	Slug string      `json:"slug"`
	Docs []*Document `json:"docs"`
}

// MakeCollection creates an empty collection with the given name and an appropriate slug
func MakeCollection(name string) Collection {
	// Slug calculation code stolen shamelessly from StackOverflow
	regex, err := regexp.Compile("[^A-Za-z0-9]+")
	if err != nil {
		fmt.Println(err.Error())
	}
	slug := regex.ReplaceAllString(name, "-")
	slug = strings.ToLower(strings.Trim(slug, "-"))
	return Collection{Name: name, Slug: slug}
}

// FindDoc finds the index of the given document, or -1 if it does not exist
func (c *Collection) FindDoc(doc *Document) int {
	for i, entry := range c.Docs {
		if doc == entry {
			return i
		}
	}
	return -1
}

// AddDoc adds a new document to the colleciton, prevents duplicates
func (c *Collection) AddDoc(doc *Document) {
	if c.FindDoc(doc) == -1 {
		c.Docs = append(c.Docs, doc)
	} // Else it's already in there, don't add duplicates
}

// RemoveDoc removes a dociment from the collection or throws an error if it does not exist
func (c *Collection) RemoveDoc(doomed *Document) error {
	i := c.FindDoc(doomed)
	if i != -1 {
		// Delete operation stolen from golang wiki
		copy(c.Docs[i:], c.Docs[i+1:])
		c.Docs[len(c.Docs)-1] = nil // or the zero value of T
		c.Docs = c.Docs[:len(c.Docs)-1]
		return nil
	}
	return errors.New("Document not in this collection")
}

// Database represents a database containing documents and collections
type Database struct {
	Docs        []*Document  `json:"docs"`
	Faves       Collection   `json:"faves"`
	Collections []Collection `json:"collections"`
}

// MakeDatabase creates a new Database with faves initialized
func MakeDatabase(docs []*Document) Database {
	return Database{Docs: docs, Faves: MakeCollection("Favorites")}
}

// DocsAsJSON returns a JSON representation of the documents in this database
func (db *Database) DocsAsJSON() ([]byte, error) {
	return json.Marshal(db.Docs)
}

// FindDocument finds the first Document with the given title and returns a reference to that Document, or nil if it does not exist
func (db *Database) FindDocument(title string) *Document {
	for _, doc := range db.Docs {
		if title == doc.Title {
			return doc
		}
	}
	return nil
}

// GetFaves returns a slice of pointers to all favorited Documents
func (db *Database) GetFaves() []*Document {
	faves := []*Document{}
	for _, doc := range db.Faves.Docs {
		faves = append(faves, doc)
	}
	return faves
}

// AddFave adds an existing document to the list of favorites
func (db *Database) AddFave(doc *Document) error {
	if doc == nil {
		return errors.New("Document does not exist. Add it to the database first")
	}
	db.Faves.AddDoc(doc)
	return nil
}

// RemoveFave removes a document from favorites list (but not from the database)
func (db *Database) RemoveFave(doc *Document) error {
	err := db.Faves.RemoveDoc(doc)
	if err != nil {
		return errors.New("Document not in favorites")
	}
	return nil
}

// FindCollection returns the index of the collection with the given name or -1 if it does not exist
func (db *Database) FindCollection(name string) int {
	for i, collection := range db.Collections {
		if collection.Name == name {
			return i
		}
	}
	return -1 // Not found
}

// GetCollection returns a reference to the collection with the given name, or returns an error if there is no such collection
func (db *Database) GetCollection(name string) (*Collection, error) {
	i := db.FindCollection(name)
	if i == -1 {
		return nil, errors.New("Collection does not exist")
	}
	return &db.Collections[i], nil
}

// AddCollection adds a collection with the given name to the database (does nothing if the collection already exists)
func (db *Database) AddCollection(name string) {
	if db.FindCollection(name) == -1 {
		db.Collections = append(db.Collections, MakeCollection(name))
	}
	// else it already exists, do nothing
}

// RemoveCollection removes the given collection from the database or returns an error if it does not exist
func (db *Database) RemoveCollection(name string) error {
	i := db.FindCollection(name)
	if i != -1 {
		// Delete operation stolen from golang wiki
		copy(db.Collections[i:], db.Collections[i+1:])
		db.Collections[len(db.Collections)-1] = Collection{} // or the zero value of T
		db.Collections = db.Collections[:len(db.Collections)-1]
		return nil
	}
	return errors.New("Collection not in database")
}

// Initialize a sample database
// Initializes the database
func setupSampleDatabase() Database {
	cookies := Document{ID: 0, Title: "cool cookie recipe", Body: "First, you have to buy ingredients, so flour (not flower) and sugar and also any little doodads that you want to put on top. Then you have to put all the stuff in a bowl (not the doodads) and mix it up, trying to avoid making a big mess. Then you put that into your oven and set a timer on your phone so that you dont forget about it. Once your timer goes off, remove the cookies from the oven safely and put the doodads on top. Take a picture of them and post it on social media so that everyone can compliment you on them and make you feel better about the fact that they're misshapen and kind of gross."}

	cups := Document{ID: 1, Title: "boring cups to avoid", Body: "We all know how frustrating it is to have your friends come over and then leave because your cups are too boring. In this article, we will examine how to tell if a cup is boring. If a cup is just one color, then it is probable boring. If the cup has a straw that is straight then the cup is probably boring, unless that straw is part of the character that the cup is supposed to look like. In fact, that's a better rule. If a cup is made to look like a character from a children's movie, then the cup is not boring. If you have any cups that do not fit this criterion, then they are boring and you must throw them out immediately and purchase cups that are not boring."}

	placeSettings := Document{ID: 2, Title: "how to use good place settings to fool your relatives into thinking you have your life together", Body: "Everybody knows that having good place settings is the easiest way to show your relatives that you have your life together, but what if you don't? Like many people your age, you are probably thinking, 'I do not have my life together, but I would like my relatives to think I do. Wearing a t-shirt that says 'I HAVE MY LIFE TOGETHER' every time they come over doesn't seem to be working. How can I trick them into thinking that I have my life together without lying to them?' The answer is that you cannot do this without a little bit of subterfuge, but only a small amount. The key is to set your table with placemats, plates, bowls, and a minimum of four glasses and three of each type of silverware at each place. If you cannot fit them all, purchase smaller china and utensils (do NOT uninvite relatives). With your place settings perfectly laid out, your relatives will focus on questions about politics and racism instead of asking about when you will get a boyfriend or a job."}
	db := MakeDatabase([]*Document{&cookies, &cups, &placeSettings})
	db.AddFave(&placeSettings)
	db.AddCollection("cool collection")
	c, _ := db.GetCollection("cool collection")
	c.AddDoc(&placeSettings)
	return db
}
