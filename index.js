'use strict';
const express = require('express');
const morgan = require('morgan');
const pg = require('pg');



var port = 4000;
const app = express();

const pool = new pg.Pool({
    host: "localhost",
    user: "postgres",
    password: "api",
    database: "api",
});

/** @type pg.PoolClient */
let client;

(async () => {
    client = await pool.connect();

    /* Create basic tables.  */

    let query = `
    CREATE TABLE IF NOT EXISTS "serie" (
      "Id"    SERIAL PRIMARY KEY,
      "Title" TEXT NOT NULL,
      "Genre" TEXT NOT NULL,
      "Description" TEXT NOT NULL,
      "Poster" TEXT NOT NULL
    );`;
    await client.query(query);

    /* Add extra tables from now on...  */
})();


// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// List series
app.get('/api/series', async function (req, res) {
    try {
        const query = `
      SELECT *
        FROM "serie";`;
        const result = await client.query(query)
        res.send(result.rows)
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

// List one serie
app.get('/api/series/:Id', async function(req, res) {
  try {
    const query = `
    SELECT *
      FROM "serie"
    WHERE "Id" = $1;`;
    const id = req.params["Id"];
    const result = await client.query(query, [id])
    const user = result.rows[0];
    if (!serie) {
      res.status(404).send({ "message": "not found record with id " + id });
      return;
    }
    res.send(serie)
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

// Crear un serie
app.post('/api/series', async function (req, res) {
    try {
        const query = `
      INSERT INTO "serie" ("Title", "Genre", "Description", "Poster")
           VALUES (trim (BOTH ' ' FROM $1), trim (BOTH ' ' FROM $2), trim (BOTH ' ' FROM $3), trim (BOTH ' ' FROM $4))
        RETURNING "Id";`;
        const Title = req.body["Title"];
        const Genre = req.body["Genre"];
        const Description = req.body["Description"];
        const Poster = req.body["Poster"];
        const result = await client.query(query, [Title, Genre, Description, Poster]);
        res.send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

// Actualizar una serie
app.put('/api/series/:Id', async function (req, res) {
    try {
        const query = `
      UPDATE "serie"
         SET "Title" = COALESCE (NULLIF (trim (BOTH ' ' FROM $2), ''), "Title"),
             "Genre" = COALESCE (NULLIF (trim (BOTH ' ' FROM $3), ''), "Genre"),
             "Description" = COALESCE (NULLIF (trim (BOTH ' ' FROM $4), ''), "Description"),
             "Poster" = COALESCE (NULLIF (trim (BOTH ' ' FROM $5), ''), "Poster")
       WHERE "Id" = $1
   RETURNING *;`;
        const id = req.params["Id"];
        const Title = req.body["Title"];
        const Genre = req.body["Genre"];
        const Description = req.body["Description"];
        const Poster = req.body["Poster"];
        const result = await client.query(query, [id, Title, Genre, Description, Poster]);
        if (0 == result.rowCount) {
            res.status(404).send({ "message": "not found record with id " + id });
            return;
        }
        res.send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});


// Delete serie
app.delete('/api/series/:Id', async function (req, res) {
    try {
        const query = `
      DELETE FROM "serie" a
            WHERE a."Id" = $1;`;
        const id = req.params["Id"];
        const result = await client.query(query, [id]);
        res.send({ "deleted": result.rowCount });
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});



app.listen(port, () => {
    console.log('listening on port ' + port)
})