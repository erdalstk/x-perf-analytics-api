const express = require("express");
const server = express();

const body_parser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;

// config
server.use(body_parser.json());

const port = process.env.PORT;

// db setup
const db = require("./db");
const dbName = "performance";
const collectionName = "loadtimes";

// db init
db.initialize(
  dbName,
  collectionName,
  function (dbCollection) {

    // POST
    server.post("/loadtimes", (request, response) => {
      const item = request.body;
      dbCollection.insertOne(item, (error, result) => {
        if (error) throw error;
        dbCollection.find().toArray((_error, _result) => {
          if (_error) throw _error;
          response.json(_result);
        });
      });
    });

    // GET ALL
    server.get("/loadtimes", (request, response) => {
      dbCollection.find().toArray((_error, _result) => {
        if (_error) throw _error;
        response.json(_result);
      });
    });

    // GET BY ID
    server.get("/loadtimes/:id", (request, response) => {
      const itemId = request.params.id;
      dbCollection.findOne({ _id: ObjectId(itemId) }, (error, result) => {
        if (error) throw error;
        response.json(result);
      });
    });

    // DELETE BY ID
    server.delete("/loadtimes/:id", (request, response) => {
      const itemId = request.params.id;

      dbCollection.deleteOne({ id: itemId }, function (error, result) {
        if (error) throw error;
        dbCollection.find().toArray(function (_error, _result) {
          if (_error) throw _error;
          response.json(_result);
        });
      });
    });


  },
  function (err) {
    throw err;
  }
);

// Static Files
server.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Listen
server.listen(port, () => {
  console.log(`Server listening at ${port}`);
});
