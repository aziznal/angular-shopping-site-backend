const { findUser } = require("../handler_logic/users");
const lib = require("../lib");
const cart = require("../handler_logic/cart_logic");

const create_handler = (express_app, database_) => {

    // ### Item Add handler
    express_app.post("/cart-add", async (req, res) => {

        console.log("\nReceived item-add request on /cart-add\n");

        // Check request includes necessary data
        if (!req.body.user || !req.body.product) {
            throw Error("User or Item not defined");
        }

        const user = req.body.user;
        const product = req.body.product;

        await cart.add(user, product, database_, (status) => {
            switch (status) {
                case 200:
                    res.status(200).send({ msg: "Successfully added item to user's cart" });
                    break;

                case 404:
                    res.status(404).send({ msg: "Bad Query, no users were found" });

                default:
                    res.status(500).send({ msg: "Internal Server Error" });
            }
        });
    });

    // ### Item Remove handler
    express_app.post("/cart-remove", async (req, res) => {

        console.log("\nReceived item-remove request on /cart-remove\n");

        // Check request includes necessary data
        if (!req.body.user || !req.body.product){
            throw Error("User or Item not defined");
        }

        

    });

    // ### Get All Cart Items handler
    express_app.post("/cart-get-all", async (req, res) => {

        console.log("\nReceived get-all-items request on /cart-get-all\n");
        
        
    });
};

module.exports = {
    create_handler,
};
