# Book Finder

Book Finder is a web application for book club groups. Members can search for books by title, author or ISBN, see the details of each book, open the book's Google Books or Open Library page, view the books the club has already read, and save books to a wish list.

Built for the Dalwin College Web Development Capstone Project 2.

## Features

- **Search** by Title, Author or ISBN using the Google Books API (up to 20 results).
- **Backup data source** — if Google Books refuses the request (for example error 429, too many requests), the app automatically searches Open Library instead. Each results list shows which source it came from.
- **Result cards** with cover, title, authors, publisher, date, page count, category and description.
- **More Info** link on every book that opens its Google Books or Open Library page in a new tab.
- **Book Details** page with the full description.
- **Club Reading List** — books the club has already read (stored in `src/data/clubBooks.json`).
- **Wish List** — add and remove books; saved in the browser's localStorage; duplicates are blocked.
- **Input validation** — empty searches are blocked and ISBNs must have 10 or 13 digits.
- **Responsive design** — 1 card per row on phones, 2 on tablets, 4 on desktops; hamburger menu on small screens.

## Pages

| Route | Page |
| --- | --- |
| `/` | Search |
| `/book/:id` | Book Details |
| `/club-reads` | Club Reading List |
| `/wishlist` | Wish List |
| any other URL | Page not found |

## Tech stack

React 18, Vite, React Router 6, Google Books API and Open Library API (Fetch API), localStorage, CSS3 (Flexbox, Grid, media queries).

## Run it locally

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install
npm run dev
```

Then open the address shown in the terminal (usually http://localhost:5173).

## Build and deploy

```bash
npm run build
```

The finished site is in the `dist` folder.

- **Netlify:** build command `npm run build`, publish directory `dist`. The `public/_redirects` file makes page refreshes work on every route.
- **Render (Static Site):** build command `npm install && npm run build`, publish directory `dist`, and add a rewrite rule `/*` → `/index.html`.

## Project structure

```
src/
  api/googleBooks.js        Google Books + Open Library calls and ISBN validation
  components/               NavBar, SearchForm, BookCard, BookCover
  context/WishlistContext   Wish list state saved in localStorage
  data/clubBooks.json       Club Reading List dataset
  pages/                    Search, Book Details, Club Reads, Wish List, Not Found
  App.jsx                   Routes
  App.css                   Styles and media queries
```

## Editing the club's reading list

Open `src/data/clubBooks.json` and add an entry:

```json
{ "id": 11, "title": "Book title", "author": "Author name", "monthRead": "November 2026", "suggestedBy": "Name" }
```

## Optional: Google Books API key

Without a key, Google Books sometimes answers with error 429. The app then uses Open Library automatically. To use Google Books more reliably, copy `.env.example` to `.env`, paste a free key from the Google Cloud Console, and run `npm run build` again.
