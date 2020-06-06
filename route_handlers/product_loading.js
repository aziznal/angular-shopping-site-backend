const env_var = require("../metadata.json");
const lib = require("../lib");
const products = require("../handler_logic/products");

// TODO: send total page number in response to product page load request

const create_handler = (express_app, database_) => {
    // Basic Search Query (for loading products, either singular product page or in forms)
    express_app.post("/", (req, res) => {
        products.productQuery(database_, req.body, (err, search_results) => {
            if (err) {
                console.log("No documents were found");
                res.status(404).send({ msg: "No documents were found" });
            } else {
                if (req.query.for_product_page) {
                    /*
                    Requesting for a single product (hopefully) means that the query is being made
                    with an ID field, in which case only a single result can be found
                     */

                    return res.send({
                        results: search_results[0],
                        msg: "found product with id " + search_results[0]._id,
                    });
                } else {
                    console.log("Found " + search_results.length + " Documents\n");
                    return res.send({ results: search_results });
                }
            }
        });
    }); // End of Basic Query

    // a more advanced query for loading a pagefull of products
    // POST Handler for Loading Products
    express_app.post("/browse", (req, res) => {
        products.advancedSearchQuery(database_, req.body, req.query, (search_results) => {
            const response = {
                results: search_results,
                msg: `Got ${search_results.length} Results in the advanced query`,
            };

            res.status(200).send(response);
        });
    }); // End of Advnaced Query
};

module.exports = {
    create_handler,
};
