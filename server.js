//sets up express app, imports necessary packages
import compression from "compression";
import express from "express";
import morgan from "morgan";
import mysql from "mysql2";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/index.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");
//creates express server (app), enable JSON parsing for handling request 
const app = express();
app.use(express.json()); // built-in middleware json parser

//connect to MySQL DB
const db = mysql.createConnection({
  host: 't14mysqldb.mysql.database.azure.com',
  user: 'Team14',
  password: 'Cosc3380',
  database: 'mydb'
});

db.connect()
//handles API request
//inserts new memeber
app.post('/api/insert', (req, res) => {
  const {name, email} = req.body;
  const classID = 0;

  // Insert the request body into the database
  const query = `INSERT INTO Members (MemberName, MemberEmail, ClassID) VALUES (?, ?, ?)`;
  db.query(query, [name, email, classID]);

  res.json({ success: true, message: "Data inserted successfully" });

  console.log(name);
  console.log(email);
  return;
})

// RETURNS/retrives ALL MEMBERS
app.get('/api/members', (req,res) => {
  db.query('SELECT * FROM Members', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching users');
          return;
      }
      res.json(results);
  });
});
//retrieve member provleges
// RETURNS MEMBER ID, NAME, THEIR CLASSIFICATION, AND LENDING PRIVILEGES
app.get('/api/memberprivileges', (req, res) => {
  db.query('SELECT Members.MemberID, Members.MemberName, MemberClass.ClassName, MemberClass.LendingPeriod, MemberClass.ItemLimit, MemberClass.MediaItemLimit FROM Members INNER JOIN MemberClass ON Members.ClassID=MemberClass.ClassID', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching user privleges');
          return;
      }
      res.json(results);
  });
});

// RETURNS ALL ITEMS AND THEIR TYPE
app.get('/api/items', (req, res) => {
  db.query('SELECT Items.ItemID, Items.ItemTitle, ItemTypes.TypeName, Items.ItemStatus, Items.LastUpdated, Items.CreatedAt, Items.TimesBorrowed FROM Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching items');
          return;
      }
      res.json(results);
  });
});

// RETURNS ALL BOOKS
app.get('/api/books', (req, res) => {
  db.query('SELECT Items.ItemID, Items.ItemTitle, Books.BookAuthor, ItemTypes.BookISBN, Genres.GenreName FROM (((Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID AND ItemTypes.TypeName="Book") INNER JOIN Books ON ItemTypes.BookISBN=Books.BookISBN) INNER JOIN Genres ON Books.GenreID=Genres.GenreID)', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching books');
          return;
      }
      res.json(results);
  });
});

// RETURNS ALL FILMS
app.get('/api/films', (req, res) => {
  db.query('SELECT Items.ItemID, Items.ItemTitle, Films.FilmYear, ItemTypes.FilmID, Genres.GenreName FROM (((Items INNER JOIN ItemTypes ON ItemTypes.ItemID=Items.ItemID AND ItemTypes.TypeName="Film") INNER JOIN Films ON ItemTypes.FilmID=Films.FilmID) INNER JOIN Genres ON Films.GenreID=Genres.GenreID)', (err, results) => {
      if (err) {
          console.error('Error executing query: ' + err.stack);
          res.status(500).send('Error fetching films');
          return;
      }
      res.json(results);
  });
});

app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
  //production mode, serves static files
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
  );
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(await import(BUILD_PATH).then((mod) => mod.app));
}
//starts server
app.use(morgan("tiny"));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
