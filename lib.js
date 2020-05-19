const env_var = require('./metadata.json');
const test_json = require('./test_data.json');
const ObjectId = require('mongodb').ObjectID;

// TODO: delete the two functions below
const sendTestData = (res) => {
    test_json['test_field'] = "Testies";
    res.send(test_json);
}

const logRequestBody = (body) => {
    Object.keys(body).map((val, _) => {
        console.log(`${val}: ${body[val]}`);
    })
}
// TODO: delete the two functions above

// Convert _id <string> -> ObjectId for use with queries
const convertID = (_id) => { return ObjectId(_id) }

// Main Query Function
const searchQuery = (db, query, callback) => {

    // if present, _id field needs to be converted to an ObjectID.
    try {
        if (query._id) query._id = convertID(query._id);
        console.log(query._id);
    } catch(err){
        callback(err, null);
        return;
    }

    const collection = db.collection(env_var.DB_PRODUCTS);

    collection.find(query).toArray((err, search_results) => {
        if (err) throw err;
        callback(null, search_results);
    });
}

// Product Creation Function
const createProduct = (db, doc, callback) => {
    const collection = db.collection(env_var.DB_PRODUCTS);

    collection.insertOne(doc, (err, results) => {
        if (err) throw err;
        callback(results);
    });
}

// Update Product Function
const updateProduct = (db, doc, callback) => {
    // Id is only needed for the query
    const query = {
        "_id": convertID(doc._id)
    }

    
    console.log("\nLOGGING DOC\n");
    console.log(doc);

    // So then it's deleted to not mess with the PUT request
    delete doc._id;

    // Some mongo semantics

    console.log("\nLOGGING DOC\n");
    console.log(doc);

    const update_set = {
        $set: doc
    }

    // Finally, send the query
    const collection = db.collection(env_var.DB_PRODUCTS);

    collection.updateOne(query, update_set, (err, results) => {
        if (err) throw err;
        callback(results);
    })

}

// Delete Query
const deleteQuery = (db, query, callback) => {
    const collection = db.collection(env_var.DB_PRODUCTS);

    // Convert ID to ObjectId
    if (query._id) {
        query._id = convertID(query._id)

        // more effecient to use deleteOne in the case of an id
        collection.deleteOne({"_id": query._id}, (err, results) => {
            if (err) throw err;
            callback(results);
        });
    } 
    
    else {
        collection.deleteMany(query, (err, results) => {
            if (err) throw err;
            callback(results);
        });
    }
}

//#region ADVANCED_QUERIES
const advancedSearchQuery = (db, query, settings, callback) => {

    const skip_amount = settings.page * env_var.VIEW_LIMIT;

    var query_options = {
        limit: env_var.VIEW_LIMIT,
        skip: skip_amount,
    }

    const collection = db.collection(env_var.DB_PRODUCTS);

    return collection.find(query, query_options).toArray((err, search_results) => {
        if (err) throw err;
        callback(search_results);
    });
    
}
//#endregion ADVANCED_QUERIES


module.exports = {
    sendTestData,
    logRequestBody,

    searchQuery,
    createProduct,
    deleteQuery,
    updateProduct,

    advancedSearchQuery
}
