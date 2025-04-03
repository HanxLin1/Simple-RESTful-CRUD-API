const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

// --------------------------------------------------
// In-Memory "Database"
// --------------------------------------------------
let books = [];
let nextId = 1; // Auto-increment ID

// --------------------------------------------------
// Swagger/OpenAPI Setup
// --------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Books API',
      version: '1.0.0',
      description: 'A simple CRUD API for managing books',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./app.js'], // Points to where we have our OpenAPI annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the book
 *         title:
 *           type: string
 *           description: The title of the book
 *         author:
 *           type: string
 *           description: The author of the book
 *         publishedYear:
 *           type: integer
 *           description: The year the book was published
 *       required:
 *         - title
 *         - author
 *       example:
 *         id: 1
 *         title: "Effective JavaScript"
 *         author: "David Herman"
 *         publishedYear: 2013
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

// --------------------------------------------------
// Routes
// --------------------------------------------------

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a list of all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
app.get('/books', (req, res) => {
  let { author, page, size } = req.query;
  let filtered = books;

  // Optional filtering by author
  if (author) {
    filtered = filtered.filter((book) =>
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  // Optional pagination
  if (page && size) {
    page = parseInt(page, 10);
    size = parseInt(size, 10);
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    filtered = filtered.slice(startIndex, endIndex);
  }

  return res.json(filtered);
});

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Retrieve a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: The book data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find((b) => b.id === parseInt(id, 10));
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.json(book);
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       201:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 */
app.post('/books', (req, res) => {
  const { title, author, publishedYear } = req.body;

  // Basic validation
  if (!title || !author) {
    return res
      .status(400)
      .json({ message: 'Title and author are required fields.' });
  }

  const newBook = {
    id: nextId++,
    title,
    author,
    publishedYear: publishedYear || null,
  };

  books.push(newBook);
  return res.status(201).json(newBook);
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The updated book
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Book not found
 */
app.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, publishedYear } = req.body;

  // Basic validation
  if (!title || !author) {
    return res
      .status(400)
      .json({ message: 'Title and author are required fields.' });
  }

  const index = books.findIndex((b) => b.id === parseInt(id, 10));
  if (index === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  books[index] = {
    id: parseInt(id, 10),
    title,
    author,
    publishedYear: publishedYear || null,
  };

  return res.json(books[index]);
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The book ID
 *     responses:
 *       204:
 *         description: The book was deleted
 *       404:
 *         description: Book not found
 */
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const index = books.findIndex((b) => b.id === parseInt(id, 10));
  if (index === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  books.splice(index, 1);
  return res.status(204).send();
});

// --------------------------------------------------
// Start the Server
// --------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});