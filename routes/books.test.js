process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBook;

beforeEach(async function () {
  await db.query(
    `INSERT INTO books VALUES ('010101', 'http://amazon.com/testbook', 'Test Author', 'testLang', 1000, 'Test Publisher', 'Test Title', 2017 )`
  );
});

afterEach(async function () {
  //delete data created by test
  await db.query("DELETE FROM books");
});

afterAll(async function () {
  //close db connection
  await db.end();
});
