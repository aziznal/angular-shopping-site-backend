const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const MongoClient = require("mongodb").MongoClient;

const lib = require("./lib.js");
const users = require('./users.js');
const env_var = require("./metadata.json");


// TODO: refactor the F##K out of this file. Put every section of handlers into its own file

//#region EXPRESS SETTINGS
const app = express();

// To allow CORs

// Using these solves {withCredentials = true} cors issue
userLoginPreflightOptions = {
    "Access-Control-Allow-Origin": "http://localhost:4200/", 
    "Access-Control-Allow-Methods":"POST, GET, DELETE, PUT",
    credentials:true,
    origin: true,
}

app.use(cors(userLoginPreflightOptions));

// To Parse JSON request bodies
app.use(express.json());

// To Parse urlencoded variables
app.use(express.urlencoded({ extended: true }));

// For Cookies
app.use(cookieParser());

app.listen(env_var.EXPRESS_PORT, () => {
    console.log("Express is running on port " + env_var.EXPRESS_PORT);
});

const test_headers = {
    "Content-Type": "text/plain",
    "Access-Control-Allow-Origin": "http://localhost:4200",
    "Vary": "http://localhost:4200",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": true
}

//#endregion EXPRESS SETTINGS

MongoClient.connect( env_var.DB_URL, { useUnifiedTopology: true }, (err, client) => {
        if (err) throw err;

        const db = client.db(env_var.DB_NAME);
        console.log("Connected to '", env_var.DB_NAME, "' database on port", env_var.DB_PORT);

        //#region REQUEST HANDLERS

        //#region ROOT HANDLER

        // for PUT, and DELETE. note: Allow header MUST be defined according to http code 405 rules
        res_headers = {
            "Content-Type": "text/plain",
            Allow: "GET",
        };

        app.route("/")

            .get((req, res) => {
                // OK code to make sure server is responding
                console.log("Received GET request on ROOT!");

                // Must include ACAO to stop CORs from generating an error.
                res.set({
                    "Content-Type": "text/plain",
                    "Access-Control-Allow-Origin": "*",
                });
                // lib.sendTestData(res);
                res.status(200).send("You Found Me!");
            })
            .put((req, res) => {
                // method not supported
                console.log("Received POST request on ROOT!");
                res.set(res_headers);
                res.status(405).send("Unsupported Method");
            })
            .delete((req, res) => {
                // method not supported
                console.log("Received POST request on ROOT!");
                res.set(res_headers);
                res.status(405).send("Unsupported Method");
            });
        //#endregion ROOT HANDLER

        //#region TEST HANDLER
        app.route("/test")

            // GET Handler
            .get((req, res) => {
                res.set(test_headers);

                console.log("GET recieved on ROOT/test");

                res.send("got GET request on ROOT/test");
            })

            // POST Handler
            .post((req, res) => {

                res.set(test_headers);

                console.log("POST recieved on ROOT/test");
                lib.logRequestBody(req.body);

                res.send("got POST request on ROOT/test");
            })

            // PUT Handler
            .put((req, res) => {
                res.set(test_headers);

                console.log("PUT recieved on ROOT/test");
                lib.logRequestBody(req.body);

                res.send("got PUT request on ROOT/test");
            })

            // DELETE Handler
            .delete((req, res) => {

                res.set(test_headers);

                console.log("DELETE recieved on ROOT/test");

                res.send("got DELETE request on ROOT/test");
            });

        // Cookie Tester GET Handler
        app.get('/cookie_tester', (req, res) => {

            let client_cookies = req.cookies;

            console.log(client_cookies);

            // res.cookie("Number_1", "Hey");
            // res.cookie("Number_2", "Now");
            // res.cookie("Number_3", "You're");
            // res.cookie("Number_4", "A");
            // res.cookie("Number_5", "Rockstar");

            if (client_cookies.session_id){
                res.send("I see your cookie!");
            } else {
                res.cookie("session_id", "0x084698454asda98s4d684w", {'maxAge': 10000});
                res.send("Looks like you're missing a cookie. Here, have one! This Cookie expires in Ten Seconds");
            }


        })

        //#endregion TEST HANDLER
        
        //#region PRODUCT_FORMS 
        // POST Handler for Search Query
        app.post("/forms/get", (req, res) => {

            console.log("\nGot the following as request body: ");
            lib.logRequestBody(req.body);

            lib.searchQuery(db, req.body, (err, search_results) => {

                if (err) {
                    console.log("No documents were found")
                    res.status(404).send("No documents were found");
                }
                else {
                    console.log("Found " + search_results.length + " Documents\n");
                    res.send(search_results);
                }
            });
        });

        // POST Handler for Adding Documents
        app.post("/forms", (req, res) => {
            lib.createProduct(db, req.body, (results) => {

                console.log("\nCreated Document with ID = " + results.insertedId);
                console.log("ID has been sent back as response\n");

                // Server sends back ID of inserted Document as response
                res.set({'Content-Type': 'plain/text'});
                res.send(results.insertedId);

            });
        });

        // PUT Handler for updating documents
        app.put("/forms", (req, res) => {

            lib.logRequestBody(req.body);

            lib.updateProduct(db, req.body, (results) => {
                console.log("\nUpdated " + results.result.n + " Documents\n");
                res.send("\nUpdated " + results.result.n + " Documents\n");
            })
        });

        // POST Handler for Deleting Documents
        app.post("/forms/delete", (req, res) => {
            lib.deleteQuery(db, req.body, (results) => {
                console.log("\nDeleted " + results.result.n + " documents\n");
                res.send("Deleted " + results.result.n + " documents");

            })
        })

        //#endregion PRODUCT_FORMS

        //#region BASIC_QUERIES

        // Basic Search Query
        app.post('/', (req, res) => {
            console.log("\nGot the following as request body: ");
            lib.logRequestBody(req.body);

            lib.searchQuery(db, req.body, (err, search_results) => {

                if (err) {
                    console.log("No documents were found")
                    res.status(404).send("No documents were found");
                }
                else {
                    if (req.query.for_product_page) {
                        console.log("Got param for_product_page = " + req.query.for_product_page);

                        /*
                        Requesting for a single product (hopefully) means that the query is being made
                        with an ID field, in which case only a single result can be found
                         */

                        if (search_results.length > 1){
                            console.log("More than 1 product was found. Check Your Query");
                            return res.status(400).send("More than 1 product was found. Check Your Query");
                        } else {
                            console.log("Found " + search_results.length + " Documents\n");
                            return res.send(search_results[0]);
                        }

                    } else {
                        console.log("Found " + search_results.length + " Documents\n");
                        return res.send(search_results);
                    }

                }
            });
        });

        //#endregion BASIC_QUERIES

        //#region ADVANCED_QUERIES

        // POST Handler for Loading Products
        app.post('/browse', (req, res) => {

            // TODO: delete all logging related to debug 

            console.log("\nRecieved the following Request Body in /browse:")
            console.log(JSON.stringify(req.body, null, 2) + "\n");

            console.log("\nRecieved the following Query Params in /browse:")
            console.log(JSON.stringify(req.query, null, 2) + "\n");

            lib.advancedSearchQuery(db, req.body, req.query, (search_results) => {
                
                console.log(`Got ${search_results.length} Results in the advanced query`);
                res.status(200).send(search_results);

            });

        });

        //#endregion ADVANCED_QUERIES
        
        //#region USER LOGIN HANDLER

        // Check if user is still logged in (used whenever navigating from page to page)
        app.post('/user/login-validate', cors(userLoginPreflightOptions), async (req, res) => {

            console.log("\nRecieved login validation request on /user/login-validate\n");

            // validate user token
            const query_ = { email: req.cookies.user_email };
            const user_token = req.cookies.session_id;

            users.findUser(db, query_, async (err, user_db) => {
                if (err) throw err;

                console.log("\nFound the following user: ");
                console.log(user_db);


                const isValid = await users.validateToken(user_db, user_token);

                if (isValid) {
                    // Send back the user's info, but don't give away the id or password
                    delete user_db._id;
                    delete user_db.password;

                    return res.status(200).send({ msg: "User is still logged in", user: {user_email: user_db.email}});
                }

                else {
                    return res.status(401).send("Session Expired");
                }

            })

        });

        // User Login Handler
        app.post('/user/login', cors(userLoginPreflightOptions), async (req, res) => {
            
            if (req.cookies){
                console.log("\nClient sent following cookies: ");
                console.log(req.cookies);
            }

            // TODO: Stop logging plain text password to the console (eventually)
            console.log("Got the following information from frontend: ");
            console.log(JSON.stringify(req.body, null, 2));

            // Check if user is already logged in
            if (req.cookies.session_id){

                // First, get the user with the _id field from the db
                let user_;
                await users.findUser(db, {email: req.body.user_email}, (err, results) => {
                    if (err) throw Error;
                    console.log("\n\nlogging results of user search");
                    console.log(results);
                    user_ = results;
                });

                // Execute login check
                const isLoggedIn = await users.checkIsLoggedIn(user_, req.cookies.session_id);

                // Bob's ur uncle
                if (isLoggedIn) {
                    console.log("User is already logged in");
                    return res.status(200).send("User is already logged in");
                } else {
                    console.log("Unhandled Case: Session probably expired");
                    return res.status(500).send("Unhandled Case: session probably expired");
                }

            // Else, If user wasn't already logged in
            } else {
                users.logUserIn(db, req.body, async (results, user_) => {

                    switch(results){
    
                        case 200:   // Success
    
                            // Generating Token for current session
                            const token = await users.generateToken(user_);
    
                            // Sending Token as cookie
                            res.cookie("session_id", token, { sameSite:"lax", maxAge:3600000 });
                            res.cookie("user_email", req.body.user_email, {sameSite:"lax", maxAge: 3600000});

                            res.status(200).send({ msg: "Successfully Identified User"});
                            break;
    
                        case 401:   // Wrong Password
                            res.status(401).send("Bad Password");
                            break;
    
                        case 404:   // No Such acccount exists
                            res.status(404).send("No account were found");
                            break;
    
                        default:
                            res.status(500).send("Unknown Error Occured");
                    }
                });
            }
        });

        // User Finder Handler
        app.post('/user/find', (req, res) => {

            console.log("Trying to find user with following credentials: ");
            console.log(JSON.stringify(req.body, null, 2));

            users.findUser(db, req.body, (err, results) => {

                if (err) {
                    console.log("No Documents were found");
                    return res.status(404).send("No Documents were found");
                } else {
                    console.log("Found " + results.length+ " Documents");
                    return res.send(results);
                }
            });

        });

        // User Creation Handler
        app.post('/user/create', (req, res) => {

            // TODO: Stop logging plain text password to the console
            console.log("\nGot the following information from frontend: ");
            console.log(JSON.stringify(req.body, null, 2));

            users.createNewUser(db, req.body, (results) => {

                // 409 = conflict, where form resubmission may resolve the issue
                if (results == -1){
                    return res.status(409).send("\nAn account with this email already exists");
                }

                // 201 = created
                if (results.result.n == 1){
                    console.log("\nAccount successfully created");
                    return res.status(201).send(results);
                }
            })
        });

        // User Update Handler
        app.put('/user/update', (req, res) => {

            users.updateUser(db, req.body, (results) => {
                console.log("\nUpdated " + results.result.n + " Documents\n");
                res.send("\nUpdated " + results.result.n + " Documents\n");
            })

        });

        // User Delete Handler
        app.post('user/delete', (req, res) => {
            users.deleteUser(db, req.body, (results, err) => {

                if (err) {
                    return res.status(404).send("No users found with given ID");
                } else {
                    console.log("\nDeleted " + results.result.n + " Documents\n");
                    res.send("\nDeleted " + results.result.n + " Documents\n");
                }
            })
        });

        //#endregion USER LOGIN HANDLER

        //#endregion REQUEST HANDLERS
    }
);