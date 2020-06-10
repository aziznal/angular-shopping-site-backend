const env_var = require("../metadata.json");
const users = require("./users");

// ### Item Adder Logic
const add = (user, product, database_, callback) => {
    // Adding an item means adding its _id field to the user's cart field (which is an array of ids)

    return new Promise(async (resolve, reject) => {
        const collection = database_.collection(env_var.DB_USERS);

        // Check that user actually exists in database
        const userExists = await users.alreadyExists(user, collection);
        if (!userExists) callback(404);

        // if user already has a cart then directly add product
        if (user.cart) {
            user.cart.push(product._id);
        }

        // If user didn't already have a cart, then create one for them, then add product
        else {
            user.cart = [];
            user.cart.push(product._id);
        }

        // Update user in database
        users.updateUser(database_, user, (results) => {
            if (results.result.n == 1) {
                console.log("\nEverything seems to be in order\n");
                callback(200);
                resolve();
            } else {
                callback(500);
                reject("Bad number for updated users: " + results.result.n);
            }
        });
    }); // End of Promise
};

// ### Item Remover Logic
const remove = (user, product, database_, callback) => {

    // NOTE: this is unfinished

    return new Promise(async (resolve, reject) => {
        const collection = database_.collection(env_var.DB_USERS);

        // Check that user actually exists in database
        const userExists = await users.alreadyExists(user, collection);
        if (!userExists) callback(404);

        // Check that product exists in user's cart before removing
        if (!user.cart.includes(product)) callback(400);

        // Remove (only a single instance) of item from user cart
        

    }); // End of promise
};

// ### Get All Items method
const getAll = (user, database_, callback) => {};

module.exports = {
    add,
    remove,
    getAll,
};
