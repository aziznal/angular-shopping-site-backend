// BUG: data can't be properly queried because numerical types have been converted to string.

const express = require("express");
const cors = require('cors');
const MongoClient = require("mongodb").MongoClient;

const lib = require("./lib.js");
const env_var = require("./metadata.json");

//#region EXPRESS SETTINGS
const app = express();

// To allow CORs
app.use(cors());

// To Parse JSON request bodies
app.use(express.json());

// To Parse urlencoded variables
app.use(express.urlencoded({ extended: true }));

app.listen(env_var.EXPRESS_PORT, () => {
    console.log("Express is running on port " + env_var.EXPRESS_PORT);
});

const test_headers = {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "http://localhost:4200",
    "Vary": "http://localhost:4200",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": true
}

//#endregion EXPRESS SETTINGS

MongoClient.connect( env_var.DB_URL, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;

        const db = client.db(env_var.DB_NAME);
        console.log("Connected to '", env_var.DB_NAME, "' database on port", env_var.DB_PORT);

        //#region REQUEST HANDLERS

        //#region ROOT HANDLER

        // for POST, PUT, and DELETE. note: Allow header MUST be defined according to code 405
        res_headers = {
            "Content-Type": "text/plain",
            Allow: "GET",
        };

        app.route("/")

            .get((req, res) => {
                // OK code to make sure server is responding
                console.log("Received GET request on ROOT!");

                // Must include ACAO to stop CORs from generating an error.
                res.set({
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                });
                // lib.sendTestData(res);
                res.status(200).send("You Found Me!");
            })
            .post((req, res) => {
                // method not supported
                console.log("Received POST request on ROOT!");
                res.set(res_headers);
                res.status(405).send("Unsupported Method");
            })
            .put((req, res) => {
                // method not supported
                console.log("Received POST request on ROOT!");
                res.set(res_headers);
                res.status(405).send("Unsupported Method");
            })
            .delete((req, res) => {
                // method not supported
                console.log("Received POST request on ROOT!");
                res.set(res_headers);
                res.status(405).send("Unsupported Method");
            });
        //#endregion ROOT HANDLER

        //#region TEST HANDLER
        app.route("/test")

            // GET Handler
            .get((req, res) => {
                res.set(test_headers);

                console.log("GET recieved on ROOT/test");

                res.send("got GET request on ROOT/test");
            })

            // POST Handler
            .post((req, res) => {

                res.set(test_headers);

                console.log("POST recieved on ROOT/test");
                lib.logRequestBody(req.body);

                res.send("got POST request on ROOT/test");
            })

            // PUT Handler
            .put((req, res) => {
                res.set(test_headers);

                console.log("PUT recieved on ROOT/test");
                lib.logRequestBody(req.body);

                res.send("got PUT request on ROOT/test");
            })

            // DELETE Hanlder
            .delete((req, res) => {

                res.set(test_headers);

                console.log("DELETE recieved on ROOT/test");

                res.send("got DELETE request on ROOT/test");
            });
        //#endregion TEST HANDLER
        
        //#region PRODUCT_FORMS 
        // POST Handler for Search Query
        app.post("/forms/get", (req, res) => {

            console.log("\nGot the following as request body: ");
            lib.logRequestBody(req.body);

            lib.searchQuery(db, req.body, (err, search_results) => {

                if (err) {
                    console.log("No documents were found")
                    res.status(404).send("No documents were found");
                }
                else {
                    console.log("Found " + search_results.length + " Documents\n");
                    res.send(search_results);
                }
            });
        });

        // POST Handler for Adding Documents
        app.post("/forms", (req, res) => {
            lib.createProduct(db, req.body, (results) => {

                console.log("\nCreated Document with ID = " + results.insertedId);
                console.log("ID has been sent back as response\n");

                // Server sends back ID of inserted Document as response
                res.set({'Content-Type': 'plain/text'});
                res.send(results.insertedId);

            });
        });

        // PUT Handler
        app.put("/forms", (req, res) => {

            lib.logRequestBody(req.body);

            lib.updateProduct(db, req.body, (results) => {
                console.log("\nUpdated " + results.result.n + " Documents\n");
                res.send("\nUpdated " + results.result.n + " Documents\n");
            })
        });

        // POST Handler for Deleting Documents
        app.post("/forms/delete", (req, res) => {
            lib.deleteQuery(db, req.body, (results) => {
                console.log("\nDeleted " + results.result.n + " documents\n");
                res.send("Deleted " + results.result.n + " documents");

            })
        })

        //#endregion PRODUCT_FORMS

        //#region ADVANCED_QUERIES

        // POST Handler for Loading Products
        app.post('/browse', (req, res) => {

            // TODO: delete all logging related to debug 

            console.log("\nRecieved the following Request Body in /browse:")
            console.log(JSON.stringify(req.body, null, 2) + "\n");

            console.log("\nRecieved the following Query Params in /browse:")
            console.log(JSON.stringify(req.query, null, 2) + "\n");

            lib.advancedSearchQuery(db, req.body, req.query, (search_results) => {
                
                console.log(`Got ${search_results.length} Results in the advanced query`);
                res.status(200).send(search_results);

            });

        });

        //#endregion ADVANCED_QUERIES
    
        //#endregion REQUEST HANDLERS
    }
);