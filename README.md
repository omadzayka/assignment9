Reading List (Assignment 9)

Express 5 REST API (in-memory books) plus a React/Vite client. No database, no login: a server restart resets the data.

Run
bash
# terminal 1: server (port 3000)
cd server && npm install && npm start      # npm run dev = node --watch

# terminal 2: client (port 5173)
cd client && cp .env.example .env && npm install && npm run dev
Variable	Where	Default
PORT	server	3000
CLIENT_ORIGIN	server	http://localhost:5173 (the single CORS origin)
VITE_API_URL	client .env	http://localhost:3000

Restart Vite after editing .env. No Vite proxy is used. GET /api/crash is kept on purpose to prove the 500 handler works.

Files
server/  server.js (app, CORS, routes, 404, error middleware) · booksStore.js (async data access, no mutation)
         validate.js (hand-written validation) · package.json · package-lock.json
client/  src/api/books.js (all fetch calls) · src/components/ (Filters, StatsPanel, BookForm, BookItem)
         src/App.jsx (state, loading, mutations) · src/main.jsx · .env.example · index.html · package.json
Testing evidence

curl --include, with Date/ETag/Connection headers trimmed.

1. 200 list, two query parameters

$ curl --include "http://localhost:3000/api/books?genre=fantasy&sort=rating&order=desc"
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 231

[{"id":5,"title":"The Name of the Wind","author":"Patrick Rothfuss","year":2007,"genre":"fantasy","read":true,"rating":5},{"id":2,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":4}]

2. 200 one book

$ curl --include http://localhost:3000/api/books/1
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 101

{"id":1,"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction","read":true,"rating":5}

3. Stats before the changes

$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 127

{"total":7,"read":4,"unread":3,"averageRating":4.5,"byGenre":{"fiction":1,"fantasy":2,"science":2,"history":1,"non-fiction":1}}

4. 201 with Location

$ curl --include -X POST http://localhost:3000/api/books -H 'Content-Type: application/json' -d '{"title":"Neuromancer","author":"William Gibson","year":1984,"genre":"fiction"}'
HTTP/1.1 201 Created
Access-Control-Allow-Origin: http://localhost:5173
Location: /api/books/8
Content-Type: application/json; charset=utf-8
Content-Length: 113

{"title":"Neuromancer","author":"William Gibson","year":1984,"genre":"fiction","read":false,"rating":null,"id":8}

5. 400 invalid body

$ curl --include -X POST http://localhost:3000/api/books -H 'Content-Type: application/json' -d '{"title":"","author":"X","year":3000,"genre":"nope"}'
HTTP/1.1 400 Bad Request
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 182

{"error":"title must be a string of 1 to 100 characters; year must be an integer between 1000 and 2026; genre must be one of: fiction, non-fiction, science, history, fantasy, other"}

6. 400 repeated query parameter

$ curl --include "http://localhost:3000/api/books?genre=fiction&genre=history"
HTTP/1.1 400 Bad Request
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 58

{"error":"Query parameter \"genre\" must not be repeated"}

7. 404 missing book

$ curl --include http://localhost:3000/api/books/999
HTTP/1.1 404 Not Found
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 30

{"error":"Book 999 not found"}

8. 409 duplicate

$ curl --include -X POST http://localhost:3000/api/books -H 'Content-Type: application/json' -d '{"title":"dune","author":"FRANK HERBERT","year":1965,"genre":"fiction"}'
HTTP/1.1 409 Conflict
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 67

{"error":"A book with this title and author already exists (id 1)"}

9. PUT book 4 (full replace: read/rating reset)

$ curl --include -X PUT http://localhost:3000/api/books/4 -H 'Content-Type: application/json' -d '{"title":"Sapiens","author":"Yuval Noah Harari","year":2011,"genre":"history"}'
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 112

{"title":"Sapiens","author":"Yuval Noah Harari","year":2011,"genre":"history","read":false,"rating":null,"id":4}

10. PATCH book 4 (only sent fields change)

$ curl --include -X PATCH http://localhost:3000/api/books/4 -H 'Content-Type: application/json' -d '{"read":true,"rating":3}'
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 108

{"title":"Sapiens","author":"Yuval Noah Harari","year":2011,"genre":"history","read":true,"rating":3,"id":4}

11. Stats after the changes

$ curl --include http://localhost:3000/api/stats
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 127

{"total":8,"read":5,"unread":3,"averageRating":4.2,"byGenre":{"fiction":2,"fantasy":2,"science":2,"history":1,"non-fiction":1}}

12. 204 delete

$ curl --include -X DELETE http://localhost:3000/api/books/8
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173

13. Same delete again: 404

$ curl --include -X DELETE http://localhost:3000/api/books/8
HTTP/1.1 404 Not Found
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 28

{"error":"Book 8 not found"}

14. /api/crash: async throw becomes 500

$ curl --include http://localhost:3000/api/crash
HTTP/1.1 500 Internal Server Error
Access-Control-Allow-Origin: http://localhost:5173
Content-Type: application/json; charset=utf-8
Content-Length: 32

{"error":"Something went wrong"}

15. Preflight by hand

$ curl --include -X OPTIONS http://localhost:3000/api/books/4 -H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: PATCH' -H 'Access-Control-Request-Headers: content-type'
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
Content-Length: 0

Preflight (browser Network tab). For PATCH/PUT/DELETE the browser first sends OPTIONS /api/books/<id> with Origin, Access-Control-Request-Method and Access-Control-Request-Headers. The server answers 204 with Access-Control-Allow-Origin: http://localhost:5173, Access-Control-Allow-Methods and Access-Control-Allow-Headers; only then does the real request go out. Item 15 reproduces it.

Reasoning questions
Parameters. id names one resource, so it goes in the path and the method says what to do with it. genre and sort only filter or order a collection, so they are query parameters. With ?id=3 the URL would look like a list filter, and it would be unclear whether the result is one book or an array.
Body parsing. With express.json() below the routes, req.body was undefined and the POST returned 400, even though the JSON was valid.
One response. Without return, the handler sent the 404 and then tried to send another response. Node threw ERR_HTTP_HEADERS_SENT. return stops the handler after the first response.
PUT and PATCH. PATCH suits the read checkbox and rating dropdown, which change one field. PUT suits the edit form, which sends the whole book and resets any omitted optional field to its default.
CORS. The console showed "blocked by CORS policy". The server still received a simple GET (and logged it), but the browser hid the response; for PUT/PATCH/DELETE only the preflight arrived. curl still works because only browsers enforce CORS.
Validation. Client checks are a convenience and can be bypassed (curl, other apps). Only the server can enforce the rules for everyone, including duplicates and existing ids.
State. After a restart all changes were gone and the seed data returned. The data lives only in the server's memory, so keeping it needs a file or a database.
Self-study notes
URLSearchParams: builds and encodes the query string safely (client/src/api/books.js).
localeCompare: alphabetical, case-insensitive sorting; multiplied by -1 for descending (server.js).
import.meta.env: Vite exposes only VITE_-prefixed variables to the browser, read at startup.
204: has no body, so res.status(204).end(); the client helper returns null instead of parsing JSON.
AbortController: the effect cleanup aborts the old fetch; I ignore the resulting AbortError so old responses never overwrite new ones (App.jsx).
Challenges
npm init in the wrong folder gave an empty lock file and a CommonJS package.json; I moved it into server/ and set "type": "module".
A misnamed BookStore.js caused ERR_MODULE_NOT_FOUND; a missing => and a missing const set line caused a syntax error and a blank page.
The template App.jsx imported deleted assets until I replaced it.
A missing client/.env made the API URL undefined, so the client received HTML instead of JSON.