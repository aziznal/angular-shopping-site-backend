const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const MongoClient = require("mongodb").MongoClient;

const env_var = require("./metadata.json");

// Handlers
const ROOT_HANDLER = require("./route_handlers/root");
const PRODUCT_FORMS_HANDLER = require("./route_handlers/product_forms");
const PRODUCT_LOADING_HANDLER = require("./route_handlers/product_loading");
const USER_HANDLER = require("./route_handlers/user");

//#region EXPRESS_APP_SETUP
const app = express();

// To allow CORs
app.use(cors(env_var.preflightOptions));

// To Parse JSON request bodies
app.use(express.json());

// To Parse urlencoded variables
app.use(express.urlencoded({ extended: true }));

// For Cookies
app.use(cookieParser());

app.listen(env_var.EXPRESS_PORT, () => {
    console.log(`Server is listening on localhost:${env_var.EXPRESS_PORT}`);
});

//#endregion EXPRESS_APP_SETUP

MongoClient.connect(env_var.DB_URL, { useUnifiedTopology: true }, (err, client) => {
    if (err) throw err;

    const db = client.db(env_var.DB_NAME);
    console.log(`Connected to database '${env_var.DB_NAME}' on port ${env_var.DB_PORT}`);

    ROOT_HANDLER.create_handler(app);

    PRODUCT_FORMS_HANDLER.create_handler(app, db);

    PRODUCT_LOADING_HANDLER.create_handler(app, db);

    USER_HANDLER.create_handler(app, db, cors);
});
