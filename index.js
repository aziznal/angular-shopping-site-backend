const express = require("express");
const cors = require('cors');
const MongoClient = require("mongodb").MongoClient;

const lib = require("./lib.js");
const env_var = require("./metadata.json");

//#region EXPRESS SETTINGS
const app = express();

// To allow CORs
app.use(cors());

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

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
        console.log(
            "Connected to '",
            env_var.DB_NAME,
            "' database on port",
            env_var.DB_PORT
        );

        //#region REQUEST HANDLERS

        //#region ROOT HANDLER

        // for POST, PUT, and DELETE. note: Allow header MUST be defined accordingt to code 405
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

                res.send("got POST request on ROOT/test");
            })

            // PUT Handler
            .put((req, res) => {
                res.set(test_headers);

                console.log("PUT recieved on ROOT/test");

                res.send("got PUT request on ROOT/test");
            })

            // DELETE Hanlder
            .delete((req, res) => {

                res.set(test_headers);

                console.log("DELETE recieved on ROOT/test");

                res.send("got DELETE request on ROOT/test");
            });
        //#endregion TEST HANDLER

        //#endregion REQUEST HANDLERS
    }
);
