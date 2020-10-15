const express = require("express");
var cors = require('cors');

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



var allowlist = process.env.CORS_ALLOWED_LIST;
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false } // disable CORS for this request
  }
  callback(null, corsOptions) // callback expects two parameters: error and options
}




// db init
db.initialize(
  dbName,
  collectionName,
  function (dbCollection) {

    // POST
    server.post("/loadtimes", cors(corsOptionsDelegate), (request, response) => {
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
    server.get("/loadtimes", cors(corsOptionsDelegate), (request, response) => {
      dbCollection.find().toArray((_error, _result) => {
        if (_error) throw _error;
        response.json(_result);
      });
    });

    // GET BY ID
    server.get("/loadtimes/:id", cors(corsOptionsDelegate), (request, response) => {
      const itemId = request.params.id;
      dbCollection.findOne({ _id: ObjectId(itemId) }, (error, result) => {
        if (error) throw error;
        response.json(result);
      });
    });

    // DELETE BY ID
    server.delete("/loadtimes/:id", cors(corsOptionsDelegate), (request, response) => {
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
