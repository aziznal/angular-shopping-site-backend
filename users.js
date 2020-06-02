const lib = require('./lib.js');
const env_var = require('./metadata.json');
const bcrypt = require('bcrypt');


const alreadyExists = async (query, collection) => {
    // returns true if query matches a doc in the collection

    return new Promise((resolve, reject) => {

        collection.countDocuments(query, (err, docCount) => {
            if (err) throw Error;
            console.log("Found " + docCount + " docs matching query");
            
            resolve(docCount > 0);
        });
    })
}

// Method to Create new user
const createNewUser = async (db, user, callback) => {
    const collection = db.collection(env_var.DB_USERS);

    // make sure user email isn't already in the system

    const query_ = {email: user.user_email};
    const accountAlreadyExists = await alreadyExists(query_, collection);
    console.log(accountAlreadyExists);
    if (accountAlreadyExists){
        console.log("Found Duplicated, Suspending Account Creation");
        return callback(-1);
    }

    // encrypt user's password
    const hash = bcrypt.hashSync(user.user_password, 10);
    console.log("\nHashed User Password: ");
    console.log(hash + "\n");
    
    // finally, add user to database
    const finalUser = {
        "email": user.user_email,
        "password": hash
    }

    collection.insertOne(finalUser, (err, results) => {
        if (err) throw Error;
        callback(results);
    });
}

// Method to find user
const findUser = async (db, query, callback) => {
    return new Promise((resolve, reject) => {
        const collection = db.collection(env_var.DB_USERS);

        // If present, convert id fields to ObjectID
        try {
            if (query._id) query._id = lib.convertID(query._id);
        } catch (err){
            callback(err, null);
            return;
        }

        collection.find(query).toArray( async (err, results) => {
            if (err) {
                console.log("Something went wrong");
            }
            await callback(null, results[0]);
            resolve(true);
        })
    })
}

// Method to Update User Info
const updateUser = (db, user, callback) => {

    const collection = db.collection(env_var.DB_USERS);

    // Only find users by ID so weird things don't happen (technically emails are also unique..)
    const query = {
        "_id": convertID(user._id)
    }

    // id is deleted to not mess with the mongo query
    delete user._id;

    // Some mongo semantics
    const update_set = {
        $set: user
    }

    // Finally, send the query
    collection.updateOne(query, update_set, (err, results) => {
        if (err) throw err;
        callback(results);
    });
}

// Method to Delete User
const deleteUser = (db, user, callback) => {
    const collection = db.collection(env_var.DB_USERS);

    // Convert ID to ObjectId
    try {
        user._id = convertID(query._id)
    } catch (err) {
        console.log("No users found with given ID");
        return callback(null, err);
    }

    // more effecient to use deleteOne in the case of an id
    collection.deleteOne({"_id": user._id}, (err, results) => {
        if (err) throw err;
        callback(results, null);
    });
}

// Method to log user in
const logUserIn = async (db, user, callback) => {
    const collection = db.collection(env_var.DB_USERS);
    
    // Make sure account exists
    const query_ = { email: user.user_email };
    const accountExists = await alreadyExists(query_, collection);
    if (!accountExists) return callback(404);

    let user_hash;
    let user_;  // to use in generating a session token later

    const user_query = { email: user.user_email };
    await findUser(db, user_query, (err, results) => {
        if (err) throw Error;

        user_ = results;
        user_hash = results.password;
        console.log(results);

    });

    valid_password = bcrypt.compareSync(user.user_password, user_hash);

    if (valid_password){
        console.log("\nPassword matches hash!");
        callback(200, user_);  // OK
    } else {
        console.log("\nPassword does not match hash");
        callback(401, null);  // Unauthorized
    }

}

// Generate a token to keep the user logged in throughout website
const generateToken = (user) => {
    return new Promise((resolve, reject) => {
        const hash_body = user._id + user.email;
        const user_token = bcrypt.hashSync(hash_body, 10);
        resolve(user_token);
    })
}

const validateToken = (user, token) => {
    return new Promise((resolve, reject) => {
        const hash_body = user._id + user.email;
        const tokenIsValid = bcrypt.compareSync(hash_body, token);

        if (tokenIsValid) resolve(tokenIsValid);
        else reject("Bad Token");
    });
}

const checkIsLoggedIn = async (user, token) => {
    
    return new Promise( async (resolve, reject) => {

        // if no token was provided then obviously user isn't logged in
        if (!token){
            console.log("\nNo Token was provided. User must be logged out");
            resolve(false);
        } else {
            const isValid = await validateToken(user, token);
            resolve(isValid);
        }

    })

}

module.exports = {
    createNewUser,
    logUserIn,
    deleteUser,
    updateUser,
    findUser,

    generateToken,
    validateToken,
    checkIsLoggedIn

}
