const lib = require("../lib");
const products = require("../handler_logic/products");

const create_handler = (express_app, database_) => {
    // POST Handler for simple product search query
    express_app.post("/forms/get", (req, res) => {
        console.log("\nGot the following as request body: ");
        lib.logObject(req.body);

        products.productQuery(database_, req.body, (err, search_results) => {
            if (err) {
                console.log("No documents were found");
                res.status(404).send({ msg: "No documents were found"});
            } else {
                console.log("Found " + search_results.length + " Documents\n");
                res.send({results: search_results});
            }
        });
    });

    // POST Handler for product creation
    express_app.post("/forms", (req, res) => {
        products.createProduct(database_, req.body, (results) => {
            console.log("\nCreated Product with ID = " + results.insertedId);

            // Server sends back ID of inserted Document as response
            res.status(200).send({inserted_id: results.insertedId});
        });
    });

    // PUT Handler for updating documents
    express_app.put("/forms", (req, res) => {
        lib.logObject(req.body);

        products.updateProduct(database_, req.body, (results) => {
            console.log("\nUpdated " + results.result.n + " Documents\n");
            res.send({ msg: "Updated " + results.result.n + " Documents"});
        });
    });

    // POST Handler for Deleting Documents
    express_app.post("/forms/delete", (req, res) => {
        products.deleteQuery(database_, req.body, (results) => {
            console.log("\nDeleted " + results.result.n + " documents\n");
            res.status(200).send({ msg: "Deleted " + results.result.n + " documents"});
        });
    });
};

module.exports = {
    create_handler,
};
