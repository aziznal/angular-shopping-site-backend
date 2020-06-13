const env_var = require("../metadata.json");
const users = require("../handler_logic/users");

const create_handler = (express_app, database_, cors) => {
    // ### Check if user is still logged in (used whenever navigating from page to page)
    express_app.post("/user/login-validate", cors(env_var.preflightOptions), async (req, res) => {
        console.log("\nLogin Validation Request Received\n");

        // validate user token
        const query_ = { email: req.cookies.user_email };
        const user_token = req.cookies.session_id;

        // fetch the user from the database
        users.findUser(database_, query_, async (err, user_db) => {
            if (err) throw err;

            const isValid = await users.validateToken(user_db, user_token);

            if (isValid) {
                // Send back the user's info, but don't give away password
                delete user_db.password;

                // email field needs a key change
                user_db.user_email = user_db.email;

                delete user_db.email;

                return res.status(200).send({
                    msg: "User is still logged in",
                    user: user_db,
                });
            } else {
                return res.status(401).send("Session Expired");
            }
        });
    });

    // ### User Login Handler
    express_app.post("/user/login", cors(env_var.preflightOptions), async (req, res) => {
        users.logUserIn(database_, req.body, async (results, user_) => {
            switch (results) {
                case 200: // Success
                    /* TODO: Generate better way of handling the session_id situation
                    * Create two seperate cookies:
                        - A session-only cookie to keep user logged in for current session, terminates with the session
                        - A stays-behind the scenes cookie to keep the user from having to login again if they close thesite
                            and open it again later (with a maxage ofcourse)
                    */

                    // Generating Token for current session
                    const token = await users.generateToken(user_);

                    //#region SETTING_COOKIES

                    // Session ID cookie
                    res.cookie("session_id", token, {
                        sameSite: "lax",
                        maxAge: 3600000,
                    });

                    // User Email
                    // TODO: Find out why this cookie is being used and maybe delete it
                    res.cookie("user_email", req.body.user_email, {
                        sameSite: "lax",
                        maxAge: 3600000,
                    });

                    //#endregion SETTING_COOKIES

                    res.status(200).send({ msg: "Successfully Identified User" });
                    break;

                case 401: // Wrong Password
                    res.status(401).send({ msg: "Bad Password" });
                    break;

                case 404: // No Such acccount exists
                    res.status(404).send({ msg: "No accounts were found" });
                    break;

                default:
                    res.status(500).send({ msg: "Unknown Error Occured" });
            }
        });
    });

    // ### User Finder Handler
    express_app.post("/user/find", (req, res) => {
        // NOTE: this is not being used anywhere yet (Maybe used after a frontend implementation)
        // TODO: test after implementation on frontend
        users.findUser(database_, req.body, (err, results) => {
            if (err) {
                return res.status(404).send({ msg: "No account was found" });
            } else {
                console.log("Found " + results.length + " Documents");
                return res.send({ results: results });
            }
        });
    });

    // ### User Creation Handler
    express_app.post("/user/create", (req, res) => {
        users.createNewUser(database_, req.body, (results) => {
            // 409 = conflict, where form resubmission may resolve the issue
            if (results == -1) {
                return res.status(409).send({ msg: "An account with this email already exists" });
            }

            // 201 = created
            if (results.result.n == 1) {
                console.log("\nAccount successfully created");

                const response = {
                    msg: "Account created successfully",
                    results: results,
                };

                return res.status(201).send(response);
            } else {
                console.log("Something went wrong");

                const response = {
                    msg: "Something went wrong",
                };

                return res.status(500).send(response);
            }
        });
    });

    // ### User Update Handler
    express_app.put("/user/update", (req, res) => {
        console.log("Recieved user update request on /user/update");
        console.log("Logging request body.. ");
        console.log(JSON.stringify(req.body, null, 2));

        users.updateUser(database_, req.body, (results) => {
            if (results == 404)
                return res.status(404).send({ msg: "No users were found with the given query" });

            console.log("\nUpdated " + results.result.n + " Documents\n");
            res.send({ msg: "User info successfully updated" });
        });
    });

    // ### User Delete Handler
    express_app.post("user/delete", (req, res) => {
        // NOTE: this is not being used yet
        // REFACTOR to send a response with a msg object instead
        users.deleteUser(database_, req.body, (results, err) => {
            if (err) {
                return res.status(404).send("No users found with given ID");
            } else {
                console.log("\nDeleted " + results.result.n + " Documents\n");
                res.send("\nDeleted " + results.result.n + " Documents\n");
            }
        });
    });
};

module.exports = {
    create_handler,
};
