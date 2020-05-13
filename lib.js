const test_json = require('./test_data.json');

const sendTestData = (res) => {
    test_json['test_field'] = "Testies";
    res.send(test_json);
}

module.exports = {
    sendTestData
}
