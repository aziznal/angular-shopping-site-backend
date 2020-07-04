const lib = require("../lib");
const env_var = require("../metadata.json");

let productCounts = {};  // Save products counts in this object

// ### Counting Logic for updateProductCount
const updateCategory = (collection, category) => {
    return new Promise((resolve, reject) => {
        const query = { category: category }
        resolve(collection.countDocuments(query));
    })
}

// ### Main productCountUpdate function
const updateProductCountMain = async (db) => {

    console.log("\nUpdating Product Counts..");
    const collection = db.collection(env_var.DB_PRODUCTS);

    for (category of env_var.productCategories) {
        let newCount = await updateCategory(collection, category);
        productCounts[category] = newCount;
    }

    console.log("Current Product Counts: ");
    console.log(JSON.stringify(productCounts, null, 2) + "\n");

}

// ### Update number of items per category every five minutes
const updateProductCount = (db) => {

    // Update counts when server is first started, then set interval
    updateProductCountMain(db);

    setInterval(updateProductCountMain, 300000, db);
};

// ### Search for products with a given query (used in single product page and in product forms)
const productQuery = (db, query, callback) => {
    // if present, _id field needs to be converted to an ObjectID.
    try {
        if (query._id) query._id = lib.convertID(query._id);
    } catch (err) {
        callback(err, null);
        return;
    }

    const collection = db.collection(env_var.DB_PRODUCTS);

    collection.find(query).toArray((err, search_results) => {
        if (err) throw err;
        callback(null, search_results);
    });
};

// ### Product Creation Function (used in forms)
const createProduct = (db, doc, callback) => {
    const collection = db.collection(env_var.DB_PRODUCTS);

    collection.insertOne(doc, (err, results) => {
        if (err) throw err;
        callback(results);
    });
};

// ### Update Product (used in forms)
const updateProduct = (db, doc, callback) => {
    // Id is only needed for the query
    const query = {
        _id: lib.convertID(doc._id),
    };

    // So then it's deleted to not mess with the PUT request
    delete doc._id;

    // Some mongo semantics

    const update_set = {
        $set: doc,
    };

    // Finally, send the query
    const collection = db.collection(env_var.DB_PRODUCTS);

    collection.updateOne(query, update_set, (err, results) => {
        if (err) throw err;
        callback(results);
    });
};

// ### Delete Product (used in forms)
const deleteQuery = (db, query, callback) => {
    const collection = db.collection(env_var.DB_PRODUCTS);

    // Convert ID to ObjectId
    if (query._id) {
        query._id = lib.convertID(query._id);

        // more effecient to use deleteOne in the case of an id
        collection.deleteOne({ _id: query._id }, (err, results) => {
            if (err) throw err;
            callback(results);
        });
    } else {
        collection.deleteMany(query, (err, results) => {
            if (err) throw err;
            callback(results);
        });
    }
};

// ### Get group of products filtered by settings (used in multiple products page)
const advancedSearchQuery = (db, query, settings, callback) => {
    const skip_amount = settings.page * env_var.VIEW_LIMIT;

    // Get total available

    var query_options = {
        limit: env_var.VIEW_LIMIT,
        skip: skip_amount,
    };

    // Checking to see if any special sorting was requested
    if (settings.sort_by) {
        switch (settings.sort_by) {
            case "price":
                query_options["sort"] = { price: -1 }; // -1 for descending
                break;
            case "rating":
                query_options["sort"] = { rating: -1 };
                break;
            case "sold":
                query_options["sort"] = { sold: -1 };
                break;
            default:
                break;
        }
    }

    // Finally, do the query
    const collection = db.collection(env_var.DB_PRODUCTS);

    return collection.find(query, query_options).toArray( async (err, search_results) => {
        if (err) throw err;
        const totalPageCount = Math.floor(productCounts[query["category"]] / env_var.VIEW_LIMIT);
        callback(search_results, totalPageCount);
    });
};

module.exports = {
    updateProductCount,

    productQuery,
    createProduct,
    deleteQuery,
    updateProduct,

    advancedSearchQuery,
};
