
// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
// #                                                                 #
// # This script loads all the data found in the mockdata directory  #
// #                                                                 #
// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #


//#region imports

const MongoClient = require('mongodb');

const lib = require('./lib.js');
const env_var = require('./metadata.json');

const LAPTOP_DATA = require('./mockdata/products/laptops.json');

//#endregion imports


//#region Functions

// This method can be used to reset any given collection to 0 documents
const resetCollection = (db, collection_to_reset, callback) => {
    const collection = db.collection(collection_to_reset);

    collection.deleteMany({}, (err, result) => {

        if (err) throw err;

        console.log("Deleted " + result.result.n + " Documents from '" + collection_to_reset + "' Collection");

        callback();

    })

}

// Clean objects from _sub fields
const cleanSchema = (data) => {

    // Delete _sub keys
    Object.keys(data).map((key, _) => {
        if (/.*_sub\d*/.test(key)) delete data[key];
    });

}


// loads data <Object> -> load_to <string: collection name> 
const loadCollectionData = (db, data, load_to, callback) => {
    console.log("Loading all LAPTOP products into database...\n");

    const collection = db.collection(load_to);

    console.log("Cleaning Data...");

    for (item of data){
        cleanSchema(item);
    }

    collection.insertMany(data, (err, res) => {
        if (err) throw err;
        console.log("Successfully Added " + res.result.n + " Documents to Database");

        callback();
    });
}
//#endregion Functions


//#region DB CONNECTION

MongoClient.connect(env_var.DB_URL, { useUnifiedTopology: true }, (err, client) => {
    const db = client.db(env_var.DB_NAME);
    console.log("Connected to " + env_var.DB_NAME + " on port " + env_var.DB_PORT);

    // resetCollection(db, env_var.DB_PRODUCTS, () => { client.close(); });

    loadCollectionData(db,LAPTOP_DATA, env_var.DB_PRODUCTS, () => { client.close(); });


});

//#endregion DB CONNECTION
