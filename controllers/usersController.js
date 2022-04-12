'use strict';

const firestore = require('../configure/firestore');
const firebase = require('firebase');
const User = require('../models/users');

const { google } = require('googleapis');
const urlParse = require('url-parse');
const queryParse = require('query-string');
const axios = require('axios');

const signIn = async (req, res, next) => {
    try {
        console.log(req.sessionID);
        if (req.query.username === undefined) res.send('Missing username value');
        else if (req.query.password === undefined) res.send('Missing password value');
        else {
            const session = await firestore.collection('session_data')
                .where("session_id", "==", req.sessionID).get();

            if (session.empty) {
                const user = await firestore.collection('users')
                    .where('username', '==', req.query.username)
                    .get();

                if (user.empty) res.send('Wrong information');
                else {
                    var password, role, verified;
                    user.forEach(doc => {
                        password = doc.data().password;
                        role = doc.data().role;
                        verified = doc.data().verified;
                    });

                    if (verified === false || verified === undefined) res.send("Account hasn't been verified yet");
                    else if (password !== req.query.password) res.send('Wrong information');
                    else {
                        await firestore.collection("session_data").add({
                            session_id: req.sessionID,
                            session_data: {
                                username: req.query.username,
                                role: role
                            },
                            expired_date: +new Date() + 24 * 60 * 60 * 1000
                        })
                        res.send(req.sessionID);
                    }
                }
            } else res.send("Please sign out before sign in again");
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getSession = async (req, res, next) => {
    try {
        if (req.params.sessionID === undefined) res.send("Missing Session ID Value")
        else {
            const sessions = await firestore.collection("session_data")
                .where("session_id", "==", req.params.sessionID)
                .get();

            if (sessions.empty) {
                res.send({ username: "", role: "" });
            } else {
                var id, session_data, expired_date;
                sessions.forEach(doc => {
                    id = doc.id;
                    session_data = doc.data().session_data,
                        expired_date = doc.data().expired_date
                });


                const currentDate = + new Date();
                if (currentDate > expired_date) {
                    await firestore.collection("session_data").doc(id).delete();
                    res.send({ username: "", role: "" });
                } else {
                    await firestore.collection("session_data").doc(id).update({
                        expired_date: currentDate
                    });
                    res.send(session_data);
                }
            }
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

const author = async (req, res, next) => {
    try {
        if (req.params.sessionID === undefined) res.send("Missing Session ID Value")
        else {
            const sessions = await firestore.collection("session_data")
                .where("session_id", "==", req.params.sessionID)
                .get();

            if (sessions.empty) {
                res.send("Not Author");
            } else {
                res.send("OK");
            }
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

const signOut = async (req, res, next) => {
    if (req.params.sessionID === undefined) res.send("Missing Session ID Value");
    else {
        req.session.destroy();
        const sessions = await firestore.collection("session_data")
            .where("session_id", "==", req.params.sessionID)
            .get();

        if (sessions.empty) {
            res.send('Sign Out Successfully');
        } else {
            var id;
            sessions.forEach(doc => {
                id = doc.id;
            });
            await firestore.collection("session_data").doc(id).delete();
            res.send('Sign Out Successfully');
        }

    }
}

const signUp = async (req, res, next) => {
    try {
        if (req.body.username === undefined) res.send('Missing username value');
        else if (req.body.password === undefined) res.send('Missing password value');
        else if (req.body.name === undefined) res.send('Missing name value');
        else if (req.body.email === undefined) res.send('Missing email value');
        else {
            const user = await firestore.collection('users')
                .where("username", "==", req.body.username)
                .get();
            const gmail = await firestore.collection('users')
                .where("email", "==", req.body.email)
                .get();
            if (user.empty && gmail.empty) {
                await firestore.collection('users').add({ ...req.body, role: 'member', verified: false });
                res.send('Sign up successfully! Please verify email to sign in');
            } else if (!user.empty) {
                res.send('Sign up failed ! Account has existed already');
            } else res.send('Sign up failed ! Email has existed already');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const Users = await firestore.collection('users');
        const data = await Users.get();
        const UsersArray = [];
        if (data.empty) {
            res.status(404).send('No User record found');
        } else {
            data.forEach(async doc => {
                const user = new User(
                    doc.id,
                    doc.data().username,
                    doc.data().password,
                    doc.data().name,
                    doc.data().avatar,
                    doc.data().role,
                    doc.data().height,
                    doc.data().weight
                );
                UsersArray.push(user);
            });
            res.send(UsersArray);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getUser = async (req, res, next) => {
    try {
        const username = req.params.username;
        const Users = await firestore.collection('users').where('username', "==", username).get();

        if (Users.empty) {
            res.status(404).send('User with the given username not found');
        } else {
            const user = []
            Users.forEach(doc => {
                const data = doc.data();
                user.push(new User(
                    doc.id,
                    data.username,
                    data.password,
                    data.name,
                    data.avatar,
                    data.role,
                    data.height,
                    data.weight,
                    data.email
                ))
            })
            res.send(user[0]);
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateUser = async (req, res, next) => {
    try {
        if (req.body.username === undefined) res.send('Missing username value');
        // else if (req.body.password !== undefined) res.send('Can not update password via this method');
        // else if (req.body.name === undefined) res.send('Missing name value');
        // else if (req.body.email !== undefined) res.send("Email can't be update via this method");
        // else if (req.body.avatar === undefined) res.send('Missing avatar value');
        // else if (req.body.height === undefined) res.send('Missing height value');
        // else if (req.body.weight === undefined) res.send('Missing weight value');
        else {
            const user = await firestore.collection('users')
                .where("username", "==", req.body.username)
                .get();

            var id, email;

            user.forEach((doc) => {
                id = doc.id;
                email = doc.data().email;
            });

            // console.log(email, " ", id);

            // const gmail = await firestore.collection('users')
            //     .where("email", "==", req.body.email)
            //     .get();

            // if (email === req.body.email) {
            if (req.body.email === undefined || req.body.email === email) {
                await firestore.collection('users').doc(id).update(req.body);
                res.send('Update information successfully');
            }
            else {
                const email = await firestore.collection("users").where("email", "==", req.body.email).get();
                if (email.empty) {
                    await firestore.collection("users").doc(id).update({ ...req.body, verified: false });
                    res.send('Update information successfully');
                } else {
                    res.send("Update failed! Email has existed already");
                }
            }

            // } else res.send('Update failed! Email has existed already');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const userGoogle = async (req, res, next) => {
    try {
        const session = await firestore.collection('session_data')
            .where("session_id", "==", req.sessionID).get();

        if (session.empty) {
            const oauth2Client = new google.auth.OAuth2(
                // client id
                "330742137381-i7453q3dod5ptf8c73drfsrcmoehg5qf.apps.googleusercontent.com",
                // client secret
                "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",
                // redirect
                "http://localhost:8080/api/user_signin_signup/google_return"
            )

            const scopes = ["https://www.googleapis.com/auth/userinfo.profile email openid"]

            const url = oauth2Client.generateAuthUrl({
                // 'online' (default) or 'offline' (gets refresh_token)
                access_type: 'offline',
                /** Pass in the scopes array defined above.
                  * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
                scope: scopes,
                // Enable incremental authorization. Recommended as a best practice.
                include_granted_scopes: true
            })

            res.status(200).send(url);
        } else res.send("Please sign out before sign in again");
    } catch (e) {
        req.status(500).send(e);
    }
}

const userGoogleReturn = async (req, res, next) => {
    const queryURL = new urlParse(req.url);
    const code = queryParse.parse(queryURL.query).code;
    const oauth2Client = new google.auth.OAuth2(
        // client id
        "330742137381-i7453q3dod5ptf8c73drfsrcmoehg5qf.apps.googleusercontent.com",
        // client secret
        "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",
        // redirect
        "http://localhost:8080/api/user_signin_signup/google_return"
    )

    const tokens = await oauth2Client.getToken(code);

    let userInform;

    try {
        const result = await axios({
            method: "GET",
            headers: {
                authorization: "Bearer " + tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
        })
        userInform = result.data;
    } catch (e) {
        console.log(e);
    }

    try {
        const user = await firestore.collection('users')
            .where('email', '==', userInform.email)
            .get();

        if (user.empty) {
            await firestore.collection('users').add({
                "avatar": userInform.picture,
                "email": userInform.email,
                "height": 0,
                "weight": 0,
                "name": userInform.name,
                "role": "member",
                "username": userInform.email,
                "verified": true
            });
        }

        await firestore.collection("session_data").add({
            session_id: req.sessionID,
            session_data: {
                username: userInform.email,
                role: "member"
            },
            expired_date: +new Date() + 24 * 60 * 60 * 1000
        })

        res.send(req.sessionID);

    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    signUp,
    getSession,
    signIn,
    signOut,
    getAllUsers,
    getUser,
    updateUser,
    author,
    userGoogle,
    userGoogleReturn
}