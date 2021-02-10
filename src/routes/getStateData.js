// var cors = require('cors');
var express = require('express');
// var app = express();
var dataRouter = express.Router();
var configMongo = require('../config/configmongo.js');
var MongoClient = require('mongodb').MongoClient;

// console.log(configMongo.url);

// var results = null;

var getData = function() {
    // dataRouter.all('*', cors());

    dataRouter.route('/')
        .get((req, res) => {
            // if (!results) {
            MongoClient.connect(configMongo.url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            },
            (err, db) => {
            if (err) {
                console.log(err);
            } else {
                var collection = db.db().collection('collection');
                collection.find().toArray((err, results) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.send({
                            result: 'error',
                            err: err.code
                        });
                    } else {
                        console.log("Website Accessed")
                        res.send(results);
                    }    
                });
            };
        });
    // } else {
    //     res.send(results);
    // }
        });
    return dataRouter;
};

module.exports = {
    "getData" : getData
};