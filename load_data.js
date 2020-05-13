
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

const resetCollection = (db, collection_to_reset, callback) => {
    const collection = db.collection(collection_to_reset);

    collection.deleteMany({}, (err, result) => {

        if (err) throw err;

        console.log("Deleted " + result.result.n + " Documents from '" + collection_to_reset + "' Collection");

        callback();

    })

}

const cleanSchema = (data) => {

    // Delete _sub keys
    Object.keys(data).map((key, _) => {
        if (/.*_sub\d*/.test(key)) delete data[key];
    });

}

const loadLaptopData = (db, callback) => {
    console.log("Loading all LAPTOP products into database...\n");

    const collection = db.collection(env_var.DB_PRODUCTS);

    console.log("Cleaning Data...");

    for (item of LAPTOP_DATA){
        cleanSchema(item);
    }

    collection.insertMany(LAPTOP_DATA, (err, res) => {
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

    loadLaptopData(db, () => { client.close(); });


});

//#endregion DB CONNECTION
