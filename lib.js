const env_var = require("./metadata.json");
const ObjectId = require("mongodb").ObjectID;

// ### Logs
const logObject = (body) => {
    console.log(JSON.stringify(body, null, 2));
};

// ### Convert _id <string> -> ObjectId for use with queries
const convertID = (_id) => {
    return ObjectId(_id);
};

// ### Remove a single item from a given array
const removeItemFromArray = (val, given_array) => {
    // Removes from the array a single item matching array[i] == item
    for (let i = 0; i < given_array.length; i++) {
        if (given_array[i] == val) {
            given_array.splice(i, 1);
            break;
        }
    }
};

// ### Remove a single OBJECT from a given array by attribute
const removeObjectFromArray = (key, val, given_array) => {
    // Removes from the array a single object matching key == val
    for (let i = 0; i < given_array.length; i++) {
        if (array[i][key] == val) {
            given_array.splice(i, 1);
            break;
        }
    }
};

module.exports = {
    logObject,
    convertID,
    removeItemFromArray,
    removeObjectFromArray,
};
