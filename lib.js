const env_var = require("./metadata.json");
const ObjectId = require("mongodb").ObjectID;

// Logs
const logObject = (body) => {
    console.log(JSON.stringify(body, null, 2));
};

// Convert _id <string> -> ObjectId for use with queries
const convertID = (_id) => {
    return ObjectId(_id);
};

module.exports = {
    logObject,
    convertID,
};
