const test_json = require('./test_data.json');

const sendTestData = (res) => {
    test_json['test_field'] = "Testies";
    res.send(test_json);
}

const logRequestBody = (body) => {
    Object.keys(body).map((val, _) => {
        console.log(`${val}: ${body[val]}`);
    })
}

module.exports = {
    sendTestData,
    logRequestBody
}
