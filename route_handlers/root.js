const path = require("path");

const create_handler = (express_app) => {
    express_app.get("/", (req, res) => {
        res.status(200).sendFile(path.join(__dirname + "/root_response.html"));
    });
};

module.exports = {
    create_handler,
};
