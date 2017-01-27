package main

// Not relevant to Go, but heres how the flux / react model works:
// https://facebook.github.io/react/blog/2014/07/30/flux-actions-and-the-dispatcher.html
// And heres some stuff about ajax http://api.jquery.com/jquery.ajax/

// The approach to requests that I took in this case was to have different functions for sending and recieving, but you can recieve data and send it back in the same handler/request.
// Some things are annotated in extreme detail to explain how this all works
// Occasionally, when making changes to a javascript file that you haven't touched in a bit, the new version doesn't get uploaded to the server. The easiest way that I've found to combat this is simply change the port number, this forces it to upload a new copy

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"text/template"
)

// A sample 'database' of articles
var sampleDatabase = setupSampleDatabase()

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

// Handler for articles getting favorited/unfavorited
// See annotations in the checkboxHandler function in favorites.js for client side explanation
func changesHandler(w http.ResponseWriter, r *http.Request) {
	// Receive from what was sent out by the data: field in the ajax call
	data, err := ioutil.ReadAll(r.Body)
	check(err, w)

	// Unmarshal the json into a struct that we can use
	var report DocumentReport
	check(json.Unmarshal(data, &report), w)

	// Change the database
	if report.Fave { // It was favorited
		check(sampleDatabase.AddFave(sampleDatabase.FindDocument(report.Title)), w)
	} else { // It was unfavorited
		check(sampleDatabase.RemoveFave(sampleDatabase.FindDocument(report.Title)), w)
	}
	// You don't need to include a call to w.Write in order for it to terminate and send back
}

// Handler for sending the list of favorites back to the application
// See the updateFavesList function in favorites.js for annotations on the client side
func favesHandler(w http.ResponseWriter, r *http.Request) {
	// Get the data from the database that we want to send to the client
	faves := sampleDatabase.GetFaves()
	// Convert it into a JSON so that the client can do something with
	newData, err2 := json.Marshal(faves)
	check(err2, w)

	// Send back to the request
	// The argument to this function is what goes into the data filter (or directly to the success function)
	w.Write(newData)
}

// recieve new collection from application
func newCollectionHandler(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	check(err, w)

	var newCollection string
	check(json.Unmarshal(data, &newCollection), w)

	sampleDatabase.AddCollection(newCollection)
}

// recieve collection to remove from application and remove it
func removeCollectionHandler(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	check(err, w)

	var doomedCollection string
	check(json.Unmarshal(data, &doomedCollection), w)

	check(sampleDatabase.RemoveCollection(doomedCollection), w)
}

// A CollectionReport represents a report from the application with an article, a collection, and whether to add or add that article to that collection
type CollectionReport struct {
	Article    string `json:"article"`
	Collection string `json:"collection"`
	// If ToAdd is false, then the article is to be removed
	ToAdd bool `json:"toAdd"`
}

// Add or remove articles from a collection
func collectionChangesHandler(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	check(err, w)

	var report CollectionReport
	check(json.Unmarshal(data, &report), w)

	collection, err2 := sampleDatabase.GetCollection(report.Collection)
	check(err2, w)
	doc := sampleDatabase.FindDocument(report.Article)

	if report.ToAdd {
		collection.AddDoc(doc)
	} else {
		check(collection.RemoveDoc(doc), w)
	}
}

// send list of collections to application
func collectionListHandler(w http.ResponseWriter, r *http.Request) {
	data, err := json.Marshal(sampleDatabase.Collections)
	check(err, w)
	w.Write(data)
}

// Handler for the main page (the one with the article list)
func defaultHandler(w http.ResponseWriter, r *http.Request) {
	// Parse in the html page
	tmpl, err := template.ParseFiles("templates/page.html")
	check(err, w)
	// This prints your page, second argument is the file name of the template you want to use (not path)
	// Third argument is the data that you want to be printed into the template (for more information, check out the docs for html/template and text/template)
	err2 := tmpl.ExecuteTemplate(w, "page.html", nil)
	check(err2, w)
}

// HandlerLambda is a funtion that returns a Lambda to be used as a handler
type HandlerLambda func(w http.ResponseWriter, r *http.Request)

// Set up a page and handler to render that page for each article
func articlesHandler() {

	tmpl, err := template.ParseFiles("templates/article.html")
	if err != nil {
		fmt.Println(err.Error())
	}

	// For each article that we have
	for i := range sampleDatabase.Docs {
		// this is the url that the page is going to display on
		url := "/articles/" + strconv.Itoa(i)
		// We need to create a function that will return the correct handler function
		handler := func(docId int) HandlerLambda {
			return func(w http.ResponseWriter, r *http.Request) {
				// In this case, we want to set up the template with the data from whatever article we're on in the loop, so we pass in that document as the third argument.
				// This is why we needed to do this function returning a function mess
				check(tmpl.ExecuteTemplate(w, "article.html", sampleDatabase.Docs[docId]), w)
			}
		}
		// Call our temporary handler function on this article id
		http.HandleFunc(url, handler(i))
	}
}

func main() {
	// These two lines put any external files referenced by the html so that they can be seen. Using vanilla Golang, your file structure can be whatever you want as long as you get these right (note where the slashes are)
	staticPath := http.FileServer(http.Dir("assets"))
	http.Handle("/assets/", http.StripPrefix("/assets", staticPath))

	// This loads in the html for the homepage
	http.HandleFunc("/", defaultHandler)
	articlesHandler()

	// These listen for requests sent over the server
	http.HandleFunc("/load/articles", loadArticles)
	// Example of handler that recieves data from the client
	http.HandleFunc("/faves/changes", changesHandler)
	// Example of handler that sends data to the client
	http.HandleFunc("/faves/list", favesHandler)
	http.HandleFunc("/collection/add", newCollectionHandler)
	http.HandleFunc("/collection/remove", removeCollectionHandler)
	http.HandleFunc("/collection/list", collectionListHandler)
	http.HandleFunc("/collection/changes", collectionChangesHandler)

	// This is what actually puts the pages onto the browser
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println(err.Error())
	}
}

// Convenience function to check for errors
func check(err error, w http.ResponseWriter) {
	if err != nil {
		// Print to stdout
		fmt.Println(err.Error())
		// Print to web console
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
