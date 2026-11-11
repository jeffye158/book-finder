// Book data helpers.
// Main source:   Google Books API  — https://developers.google.com/books/docs/v1/using
// Backup source: Open Library API  — https://openlibrary.org/developers/api
// The app always tries Google Books first. If Google refuses the request
// (for example error 429 "too many requests") or cannot be reached,
// the same search is sent to Open Library, which is free and needs no key.

const GOOGLE_URL = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_URL = 'https://openlibrary.org';

// Optional Google Books API key, read from the .env file (VITE_GOOGLE_BOOKS_API_KEY).
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';

function keyParam() {
  return API_KEY ? `&key=${encodeURIComponent(API_KEY)}` : '';
}

// Maps the search type chosen in the form to the Google Books query prefix.
const GOOGLE_PREFIX = {
  title: 'intitle:',
  author: 'inauthor:',
  isbn: 'isbn:',
};

// Removes dashes and spaces from an ISBN, e.g. "978-0-14-118776-1" -> "9780141187761".
export function cleanIsbn(value) {
  return value.replace(/[-\s]/g, '').toUpperCase();
}

// An ISBN is valid if it has 10 characters (last one may be X) or 13 digits.
export function isValidIsbn(value) {
  const isbn = cleanIsbn(value);
  return /^\d{9}[\dX]$/.test(isbn) || /^\d{13}$/.test(isbn);
}

// Open Library work IDs look like "OL82563W". Google IDs never do.
function isOpenLibraryId(id) {
  return /^OL\d+W$/.test(id);
}

// Descriptions sometimes contain HTML tags (<p>, <b>, <br>) or Markdown links.
// This keeps the line breaks and removes the tags.
function cleanText(text) {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [text](link) -> text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Fetches JSON. Returns null when the server answers with an error status,
// and throws only when the network itself fails.
async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, status: response.status, data: await response.json() };
}

const DEFAULT_ERROR = 'Sorry, the book services are not available right now. Please try again in a moment.';

/* ---------------- Google Books ---------------- */

// Turns one Google Books "item" into a simple object the app can display.
// Any missing field gets a safe default so the page never breaks.
export function fromGoogle(item) {
  const info = item.volumeInfo || {};
  const image = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
  return {
    id: item.id,
    source: 'Google Books',
    title: info.title || 'Untitled',
    subtitle: info.subtitle || '',
    authors: info.authors || ['Unknown author'],
    publisher: info.publisher || 'Unknown publisher',
    publishedDate: info.publishedDate || 'Unknown date',
    description: info.description ? cleanText(info.description) : 'No description available.',
    pageCount: info.pageCount || null,
    categories: info.categories || [],
    // Google sometimes returns http links; use https so the browser does not block them.
    image: image.replace('http://', 'https://'),
    infoLink: info.infoLink || `https://books.google.com/books?id=${item.id}`,
  };
}

async function searchGoogle(query, type) {
  const term = type === 'isbn' ? cleanIsbn(query) : query;
  const url = `${GOOGLE_URL}?q=${encodeURIComponent(GOOGLE_PREFIX[type] + term)}&maxResults=20${keyParam()}`;
  const result = await getJson(url);
  if (!result.ok) return null; // let the caller fall back to Open Library
  return (result.data.items || []).map(fromGoogle);
}

/* ---------------- Open Library ---------------- */

const OL_FIELDS = 'key,title,subtitle,author_name,publisher,first_publish_year,number_of_pages_median,subject,cover_i';

function coverUrl(coverId, size = 'M') {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg` : '';
}

// Turns one Open Library search result ("doc") into the same shape as fromGoogle().
export function fromOpenLibrary(doc) {
  const id = doc.key.replace('/works/', '');
  return {
    id,
    source: 'Open Library',
    title: doc.title || 'Untitled',
    subtitle: doc.subtitle || '',
    authors: doc.author_name || ['Unknown author'],
    publisher: doc.publisher?.[0] || 'Unknown publisher',
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : 'Unknown date',
    description: 'No description available. Open the book for more details.',
    pageCount: doc.number_of_pages_median || null,
    categories: (doc.subject || []).slice(0, 3),
    image: coverUrl(doc.cover_i),
    infoLink: `${OPEN_LIBRARY_URL}/works/${id}`,
  };
}

async function searchOpenLibrary(query, type) {
  const param = type === 'isbn' ? 'isbn' : type; // title, author or isbn
  const term = type === 'isbn' ? cleanIsbn(query) : query;
  const url = `${OPEN_LIBRARY_URL}/search.json?${param}=${encodeURIComponent(term)}&limit=20&fields=${OL_FIELDS}`;
  const result = await getJson(url);
  if (!result.ok) throw new Error(DEFAULT_ERROR);
  return (result.data.docs || []).filter((doc) => doc.key).map(fromOpenLibrary);
}

// Book Details for an Open Library work: the work, its authors and one edition.
async function getOpenLibraryBook(id) {
  const work = await getJson(`${OPEN_LIBRARY_URL}/works/${id}.json`);
  if (work.status === 404) throw new Error('This book could not be found.');
  if (!work.ok) throw new Error(DEFAULT_ERROR);
  const w = work.data;

  const authorKeys = (w.authors || []).map((a) => a.author?.key).filter(Boolean).slice(0, 3);
  const [authors, editions] = await Promise.all([
    Promise.all(authorKeys.map((key) => getJson(`${OPEN_LIBRARY_URL}${key}.json`).catch(() => null))),
    getJson(`${OPEN_LIBRARY_URL}/works/${id}/editions.json?limit=1`).catch(() => null),
  ]);
  const edition = editions?.ok ? editions.data.entries?.[0] || {} : {};
  const description = typeof w.description === 'string' ? w.description : w.description?.value;
  const authorNames = authors.filter((a) => a?.ok).map((a) => a.data.name);

  return {
    id,
    source: 'Open Library',
    title: w.title || 'Untitled',
    subtitle: w.subtitle || '',
    authors: authorNames.length ? authorNames : ['Unknown author'],
    publisher: edition.publishers?.[0] || 'Unknown publisher',
    publishedDate: w.first_publish_date || edition.publish_date || 'Unknown date',
    description: description ? cleanText(description) : 'No description available.',
    pageCount: edition.number_of_pages || null,
    categories: (w.subjects || []).slice(0, 3),
    image: coverUrl(w.covers?.find((c) => c > 0), 'L'),
    infoLink: `${OPEN_LIBRARY_URL}/works/${id}`,
  };
}

/* ---------------- Used by the pages ---------------- */

// Searches books. type is "title", "author" or "isbn".
export async function searchBooks(query, type) {
  const term = query.trim();
  try {
    const googleResults = await searchGoogle(term, type);
    if (googleResults) return googleResults;
  } catch {
    // Google could not be reached; try Open Library below.
  }
  return searchOpenLibrary(term, type);
}

// Gets one book for the Book Details page.
export async function getBookById(id) {
  if (isOpenLibraryId(id)) return getOpenLibraryBook(id);

  const result = await getJson(`${GOOGLE_URL}/${encodeURIComponent(id)}${keyParam().replace('&', '?')}`);
  if (result.status === 404) throw new Error('This book could not be found.');
  if (!result.ok) {
    throw new Error('Google Books is busy right now, so the details of this book cannot be shown. Please try again in a moment.');
  }
  return fromGoogle(result.data);
}
