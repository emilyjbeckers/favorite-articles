// Simulates getting responses from the database

package main

import "encoding/json"
import "errors"

// A Document represents a document
type Document struct {
	Title string `json:"title"`
}

// A Collection represents a named collection of documents
type Collection struct {
	Name string      `json:"name"`
	Docs []*Document `json:"docs"`
}

// FindDoc finds the index of the given document, or -1 if it does not exist
func (collection *Collection) FindDoc(doc *Document) int {
	for i, entry := range collection.Docs {
		if doc == entry {
			return i
		}
	}
	return -1
}

// AddDoc adds a new document to the colleciton, prevents duplicates
func (collection *Collection) AddDoc(doc *Document) {
	if collection.FindDoc(doc) == -1 {
		collection.Docs = append(collection.Docs, doc)
	} // Else it's already in there, don't add duplicates
}

// RemoveDoc removes a dociment from the collection or throws an error if it does not exist
func (collection *Collection) RemoveDoc(doomed *Document) error {
	i := collection.FindDoc(doomed)
	if i != -1 {
		// Delete operation stolen from golang wiki
		copy(collection.Docs[i:], collection.Docs[i+1:])
		collection.Docs[len(collection.Docs)-1] = nil // or the zero value of T
		collection.Docs = collection.Docs[:len(collection.Docs)-1]
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
	return Database{Docs: docs, Faves: Collection{Name: "Favorites"}}
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
