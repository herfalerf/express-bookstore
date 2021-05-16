process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let book_isbn;

beforeEach(async function () {
  let result = await db.query(
    `INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES ('010101', 'http://amazon.com/testbook', 'Test Author', 'testLang', 1000, 'Test Publisher', 'Test Title', 2017 )
    RETURNING isbn`
  );

  book_isbn = result.rows[0].isbn;
});

// GET /books returns array of book objects

describe("GET /books", function () {
  test("returns a list of books", async function () {
    const response = await request(app).get(`/books`);
    expect(response.statusCode).toBe(200);
    expect(response.body.books[0]).toEqual({
      isbn: "010101",
      amazon_url: "http://amazon.com/testbook",
      author: "Test Author",
      language: "testLang",
      pages: 1000,
      publisher: "Test Publisher",
      title: "Test Title",
      year: 2017,
    });
  });
});

//GET /books/:isbn returns single book object

describe("GET /books/:isbn", function () {
  test("returns a specific book", async function () {
    const response = await request(app).get(`/books/${book_isbn}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.book).toEqual({
      isbn: "010101",
      amazon_url: "http://amazon.com/testbook",
      author: "Test Author",
      language: "testLang",
      pages: 1000,
      publisher: "Test Publisher",
      title: "Test Title",
      year: 2017,
    });
  });
});

//POST /books creates a book object when valid data is sent, fails if data invalid

describe("POST /books", function () {
  test("creates a book", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "1111",
      amazon_url: "http://amazon.com/newtest",
      author: "Test",
      language: "English",
      pages: 100,
      publisher: "New Pub",
      title: "My Story",
      year: 2007,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body.book).toEqual({
      isbn: "1111",
      amazon_url: "http://amazon.com/newtest",
      author: "Test",
      language: "English",
      pages: 100,
      publisher: "New Pub",
      title: "My Story",
      year: 2007,
    });
  });

  test("does not create a book when data missing", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "1111",
      amazon_url: "http://amazon.com/newtest",
      author: "Test",
      language: "English",
      pages: 100,
      publisher: "New Pub",
      title: "My Story",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error.error).toContain(
      'instance requires property "year"'
    );
  });

  test("does not create a book when data is incorrect", async function () {
    const response = await request(app).post(`/books`).send({
      isbn: "1111",
      amazon_url: "http://amazon.com/newtest",
      author: "Test",
      language: "English",
      pages: 100,
      publisher: "New Pub",
      title: "My Story",
      year: "2007",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error.error).toContain(
      "instance.year is not of a type(s) integer"
    );
  });
});

describe("PUT /books/:isbn", function () {
  test("updates a book", async function () {
    const response = await request(app).put(`/books/${book_isbn}`).send({
      isbn: "010101",
      amazon_url: "http://amazon.com/testbook",
      author: "New Name",
      language: "newLang",
      pages: 500,
      publisher: "New Pub",
      title: "New Title",
      year: 2020,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.book).toEqual({
      isbn: "010101",
      amazon_url: "http://amazon.com/testbook",
      author: "New Name",
      language: "newLang",
      pages: 500,
      publisher: "New Pub",
      title: "New Title",
      year: 2020,
    });
  });

  test("will not update book with missing data", async function () {
    const response = await request(app).put(`/books/${book_isbn}`).send({
      isbn: "010101",
      amazon_url: "http://amazon.com/testbook",
      author: "New Name",
      language: "newLang",
      pages: 500,
      publisher: "New Pub",
      title: "New Title",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error.error).toContain(
      'instance requires property "year"'
    );
  });

  test("will not update book with incorrect data types", async function () {
    const response = await request(app).put(`/books/${book_isbn}`).send({
      isbn: "010101",
      amazon_url: "http://amazon.com/testbook",
      author: "New Name",
      language: "newLang",
      pages: 500,
      publisher: "New Pub",
      title: "New Title",
      year: "2020",
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.error.error).toContain(
      "instance.year is not of a type(s) integer"
    );
  });
});

describe("DELETE /books/:isbn", function () {
  test("will delete a book", async function () {
    const response = await request(app).delete(`/books/${book_isbn}`);
    expect(response.statusCode).toBe(200);
    console.log(response.body.message);
    expect(response.body.message).toEqual("Book deleted");
  });
});

afterEach(async function () {
  //delete data created by test
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  //close db connection
  await db.end();
});
