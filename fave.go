package main

// Not relevant to Go, but heres how the flux / react model works:
// https://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html
// And heres some stuff about ajax http://api.jquery.com/jquery.ajax/

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"text/template"
)

// A sample 'database' of articles
var sampleDatabase = setupDatabase()

// Initializes the database
func setupDatabase() Database {
	placeSettings := Document{"how to use good place settings to fool your relatives into thinking you have your life together"}
	db := MakeDatabase(
		[]*Document{&Document{"cool cookie recipe"},
			&Document{"boring cups to avoid"},
			&placeSettings})
	db.AddFave(&placeSettings)
	db.AddCollection("cool collection")
	c, _ := db.GetCollection("cool collection")
	c.AddDoc(&placeSettings)
	return db
}

// Handler for loading the articles into the page
func loadArticles(w http.ResponseWriter, r *http.Request) {
	db, _ := sampleDatabase.DocsAsJSON()
	w.Write(db)
}

// DocumentReport is a data structure representing the format that the report back from the client about what documents were favorited
type DocumentReport struct {
	Title string `json:"title"`
	Fave  bool   `json:"fave"`
}

// handler for the state changes
func changesHandler(w http.ResponseWriter, r *http.Request) {
	// recieves from "data" option in $.ajax
	data, err := ioutil.ReadAll(r.Body)
	check(err, w)

	// convert json back into something helpful
	var report DocumentReport
	check(json.Unmarshal(data, &report), w)

	// Change the database
	if report.Fave { // It was favorited
		check(sampleDatabase.AddFave(sampleDatabase.FindDocument(report.Title)), w)
	} else { // It was unfavorited
		check(sampleDatabase.RemoveFave(sampleDatabase.FindDocument(report.Title)), w)
	}

	w.Write([]byte("success"))
}

// Send favorites to application
func favesHandler(w http.ResponseWriter, r *http.Request) {
	faves := sampleDatabase.GetFaves()
	newData, err2 := json.Marshal(faves)
	check(err2, w)
	// Send back to the ajax request
	w.Write(newData)
}

// recieve new collection from application
func newCollectionHandler(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	check(err, w)

	var newCollection string
	check(json.Unmarshal(data, &newCollection), w)

	sampleDatabase.AddCollection(newCollection)

	w.Write([]byte("Success"))
}

// send list of collections to application
func collectionListHandler(w http.ResponseWriter, r *http.Request) {
	data, err := json.Marshal(sampleDatabase.Collections)
	check(err, w)
	w.Write(data)
}

// Handler for the main page
func defaultHandler(w http.ResponseWriter, r *http.Request) {
	// Write the html data into the page
	tmpl, err := template.ParseFiles("templates/page.html")
	check(err, w)
	check(tmpl.ExecuteTemplate(w, "page.html", nil), w)
}

func main() {
	staticPath := http.FileServer(http.Dir("assets/js"))
	http.Handle("/assets/js/", http.StripPrefix("/assets/js", staticPath))
	http.HandleFunc("/", defaultHandler)
	http.HandleFunc("/load/articles", loadArticles)
	// You need to have the "/faves" here and also in the "url" option in $.ajax or else they wont talk to each other
	http.HandleFunc("/faves/changes", changesHandler)
	http.HandleFunc("/faves/list", favesHandler)
	http.HandleFunc("/collection/add", newCollectionHandler)
	http.HandleFunc("/collection/list", collectionListHandler)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println(err.Error())
	}
}

func check(err error, w http.ResponseWriter) {
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
