# Reading List (Assignment 9)

## Run

```bash
# server (terminal 1)
cd server && npm install && npm start          # http://localhost:3000

# client (terminal 2)
cd client && cp .env.example .env && npm install && npm run dev   # http://localhost:5173
```

Environment: server uses `PORT` (default 3000) and `CLIENT_ORIGIN` (default `http://localhost:5173`); client uses `VITE_API_URL`.

## Reasoning questions

1. **Parameters.** The `id` identifies one specific resource, so it belongs in the path (`/api/books/3`). That also lets the HTTP method say what to do with it (`GET`, `PUT`, `PATCH`, `DELETE`). `genre` and `sort` are optional ways to filter or order the collection, so they go in the query string. If `id` were a query parameter (`/api/books?id=3`), the URL would no longer name a single resource. It would look like a list filter, and the route would be unclear about whether it returns one book or an array, and what a missing id means.

2. **Body parsing.** With `express.json()` after the routes, the body is never parsed before the handler runs, so `req.body` is `undefined` (in Express 5). My `POST` then returned **400**, with an error saying `title`, `author` and the other fields are invalid, even though the request body was valid JSON.

3. **One response.** Without the `return`, the handler sends the `404`, then keeps running and tries to send a second response (`res.json(book)`). Node throws `ERR_HTTP_HEADERS_SENT` ("Cannot set headers after they are sent"). The client still gets the 404, but the server logs an error. A route must send exactly one response, and `return` stops the function after the first one.

4. **PUT and PATCH.** `PATCH` fits when the user changes one thing. The "read" checkbox or the rating dropdown sends only `{ "read": true }` or `{ "rating": 4 }`, and the server keeps everything else. `PUT` fits the edit form, which sends the complete book and replaces the old one. Any optional field left out resets to its default (`read: false`, `rating: null`).

5. **CORS.** With a wrong `CLIENT_ORIGIN`, the console shows an error like "Access to fetch at 'http://localhost:3000/api/books' from origin 'http://localhost:5173' has been blocked by CORS policy". The server still receives and processes a simple `GET`, and the browser just refuses to give the response to the page. For `PUT`, `PATCH` and `DELETE`, only the `OPTIONS` preflight reaches the server and the real request is never sent. `curl` still works because CORS is enforced by the browser, not the server, and `curl` doesn't check those headers.

6. **Validation.** Client-side checks are only for convenience and can be bypassed with `curl`, Postman, another app, or edited browser code. The server is the only place that can enforce the rules for everyone, and it also owns checks the client can't make alone, such as duplicates and which `id` exists. Without server validation, bad data would get into the store.

7. **State.** After restarting, every change was gone: added books disappeared, deleted books came back, and the seed data returned. The data lives only in the server process's memory (RAM), so it dies when the process stops. To keep it, we need persistent storage, such as a file or a database.

> - `URLSearchParams` — used in `client/src/api/books.js` (`listBooks`)
> - `String.prototype.localeCompare` — used in `server/server.js` (`compare`)
> - `import.meta.env` / `VITE_` prefix — `client/src/api/books.js`
> - Express 5 `204` — `res.status(204).end()`
> - `AbortController` / `AbortError` — `client/src/App.jsx`
