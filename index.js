const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const lib = require("./lib.js");
const env_var = require("./metadata.json");

// region EXPRESS SETTINGS
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(env_var.EXPRESS_PORT, () => {
    console.log("Express is running on port " + env_var.EXPRESS_PORT);
});

// endregion EXPRESS SETTINGS

MongoClient.connect(env_var.DB_URL, { useUnifiedTopology: true }, (err, client) => {
    if (err) throw err;

    const db = client.db(env_var.DB_NAME);
    console.log("Connected to '", env_var.DB_NAME, "' database on port", env_var.DB_PORT);

    // region REQUEST HANDLERS
    console.log("You can start handling them requests now!");
    // endregion REQUEST HANDLERS

})