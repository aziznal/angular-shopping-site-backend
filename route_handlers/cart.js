const lib = require("../lib");
const cart = require("../handler_logic/cart_logic");

const create_handler = (express_app, database_) => {
    // ### Cart Update Handler
    express_app.post("/cart-update", async (req, res) => {
        // NOTE: unteseted

        console.log("Received POST on /cart-update");

        // Check request includes necessary data
        if (!req.body.user) throw Error("User not defined");

        const user = req.body.user;

        await cart.update(user, database_, (status) => {
            switch (status) {
                case 200:
                    res.status(200).send({ msg: "Successfully Updated Product" });
                    break;

                case 404:
                    res.status(404).send({ msg: "No user was found" });
                    break;

                case 500:
                    res.status(500).send({ msg: "Internal Server Error" });
                    break;
            }
        });
    });

};

module.exports = {
    create_handler,
};
