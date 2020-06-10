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
const removeItemFromArray  = (arr, item, attr_name) => {
    for (let i = 0; i < arr.length; i++){
        if (arr[i][attr_name] === item[attr_name]){
            arr.splice(i, 1);
            break;
        }
    }
}

module.exports = {
    logObject,
    convertID,
};
