const env_var = require("../metadata.json");
const users = require("./users");
const lib = require("../lib");

// ### Cart Update
const update = (user, database_, callback) => {
    // Frontend has added item to cart, update it in database as well.

    return new Promise(async (resolve, reject) => {
        const collection = database_.collection(env_var.DB_USERS);

        // Check user exists so no extra records are created
        const userExists = await users.alreadyExists({ _id: user._id }, collection);
        if (!userExists) {
            callback(404);
            return resolve();
        }

        users.updateUser(database_, user, (res) => {
            if (res.result.n == 1) {
                callback(200);
                return resolve();
            } else {
                callback(500);
                return resolve();
            }
        });
    });
};

module.exports = {
    update,
};
