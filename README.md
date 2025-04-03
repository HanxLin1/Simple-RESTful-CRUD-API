# Simple-RESTful-CRUD-API
Books API :
A simple CRUD API for managing books using Node.js, Express, and Swagger.

Features:
Get a list of books
Filter books by author
Add new books
Update books
Delete books
API documentation via Swagger

Installation:
git clone <repo-url>
cd <project-folder>
npm install
node app.js

Usage:
Start the server: node app.js
Open the API docs: http://localhost:3000/api-docs

Endpoints:

Method		Endpoint		Description

GET			  /books	    Get all books

GET			  /books/:id	Get a book by ID

POST		  /books		  Add a new book

PUT			  /books/:id	Update a book

DELETE		/books/:id  Delete a book
