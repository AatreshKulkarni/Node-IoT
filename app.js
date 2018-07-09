"use strict";

const documentClient = require("documentdb").DocumentClient;
const uriFactory = require('documentdb').UriFactory;
const config = require("./config");
const express = require("express");
const app = express();
const router = express.Router();
const path  = require("path");
const route = require('./routes/route')(router);

app.use(express.static(__dirname + '/angular/dist/angular/'));
//app.use('/', route);

app.get("/", (req, res) => {
    let item = queryCollection().then(function(result) {
        console.log('data 1: ', result);
        return result[0];
    });

    console.log('data 2: ', item.json());
    res.send(item.json());
})

app.get("*",( req, res) => {
    res.sendFile(path.join(__dirname + '/angular/dist/angular/index.html'));
});

app.listen(8080, console.log("Port listening at 8080"));

var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseId = config.database.id;
var collectionId = config.collection.id;

function getDatabase() {
    console.log (`Getting database:\n${databaseId}\n`);
    let databaseUrl = uriFactory.createDatabaseUri(databaseId);
    return new Promise((resolve, reject) => {
        client.readDatabase(databaseUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase({ id: databaseId }, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

function getCollection() {
    console.log (`Getting collection:\n${collectionId}\n`);
    let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
    return new Promise((resolve, reject) => {
        client.readCollection(collectionUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    let databaseUrl = uriFactory.createDatabaseUri(databaseId);
                    client.createCollection(databaseUrl, { id: collectionId }, { offerThroughput: 400 }, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

function getTemperatureDocument(document) {
    console.log (`Getting document:\n${document.id}\n`);
    let documentUrl = uriFactory.createDocumentUri(databaseId, collectionId, document.id);
    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
                    client.createDocument(collectionUrl, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

function queryCollection() {
    console.log(`Querying collection through index:\n${collectionId}`);
    let collectionUrl = uriFactory.createDocumentCollectionUri(databaseId, collectionId);
    return new Promise((resolve, reject) => {
        client.queryDocuments(
            collectionUrl,
            'SELECT { "Temp": t.Temperature,"Humidity": t.Humidity } AS Temperature_Details FROM TemperatureDB t WHERE t.id="device.1"'
        ).toArray((err, results) => {
            if (err) reject(err);
            else {
                // for (var queryResult of results) {
                //     let resultString = JSON.stringify(queryResult);
                //     return (`\tQuery returned ${resultString}`);
                // }
                console.log(results);
               // return (results);
                console.log();
                resolve(results);
            }
        });
    });
    // let item = client.queryDocuments(
    //             collectionUrl,
    //             'SELECT { "Temp": t.Temperature,"Humidity": t.Humidity } AS Temperature_Details FROM TemperatureDB t WHERE t.id="device.1"'
    //         );
    // console.log(item);
    //return {name: 'amit'};
};

function exit(message) {
    console.log(message);
    console.log('Press any key to exit\n');
   // process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
};

getDatabase()
    .then(() => getCollection())
    .then(() => getTemperatureDocument(config.documents.Device1))
    .then(() => getTemperatureDocument(config.documents.Device2))
    .then(() => queryCollection())
    .then(() => { exit(`Completed successfully`); })
    .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });


// app.post('/',(req, res) => {
//     res.send(getDatabase());
   
// })
