'use strict';

const firestore = require('../configure/firestore');

const { google } = require('googleapis');
const urlParse = require('url-parse');
const queryParse = require('query-string');
const axios = require('axios');

const getGoogleFitData = async (req, res, next) => {
    try {
        const oauth2Client = new google.auth.OAuth2(
            // client id
            "330742137381-i7453q3dod5ptf8c73drfsrcmoehg5qf.apps.googleusercontent.com",
            // client secret
            "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",
            // redirect
            "http://localhost:8080/api/google_fit_return"
        )
        const scopes = ["https://www.googleapis.com/auth/fitness.activity.read",
            "https://www.googleapis.com/auth/fitness.location.read",
            "https://www.googleapis.com/auth/fitness.body.read"
        ]

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
    } catch (e) {
        console.log(e);
    }
}

const getGoogleFitDataReturn = async (req, res, next) => {
    const queryURL = new urlParse(req.url);
    const code = queryParse.parse(queryURL.query).code;

    const oauth2Client = new google.auth.OAuth2(
        // client id
        "330742137381-i7453q3dod5ptf8c73drfsrcmoehg5qf.apps.googleusercontent.com",
        // client secret
        "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",
        // redirect
        "http://localhost:8080/api/google_fit_return"
    )

    const tokens = await oauth2Client.getToken(code);

    let stepArray = [];
    let caloArray = [];
    let distanceArray = [];

    try {
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            data: {
                aggregateBy: [{
                    dataTypeName: "com.google.step_count.delta",
                    dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                }],
                bucketByTime: { durationMillis: 86400000 },
                startTimeMillis: + new Date((new Date()).toDateString()) - 7 * 24 * 60 * 60 * 1000,
                endTimeMillis: + new Date((new Date()).toDateString())
            }
        })
        stepArray = result.data.bucket;
    } catch (e) {
        console.log(e);
    }

    try {
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            data: {
                aggregateBy: [{
                    dataTypeName: "com.google.calories.expended",
                    dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended"
                }],
                bucketByTime: { durationMillis: 86400000 },
                startTimeMillis: + new Date((new Date()).toDateString()) - 7 * 24 * 60 * 60 * 1000,
                endTimeMillis: + new Date((new Date()).toDateString())
            }
        })
        caloArray = result.data.bucket;
    } catch (e) {
        console.log(e);
    }

    try {
        const result = await axios({
            method: "POST",
            headers: {
                authorization: "Bearer " + tokens.tokens.access_token
            },
            "Content-Type": "application/json",
            url: "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            data: {
                aggregateBy: [{
                    dataTypeName: "com.google.distance.delta",
                    dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta"
                }],
                bucketByTime: { durationMillis: 86400000 },
                startTimeMillis: + new Date((new Date()).toDateString()) - 7 * 24 * 60 * 60 * 1000,
                endTimeMillis: + new Date((new Date()).toDateString())
            }
        })
        distanceArray = result.data.bucket;
    } catch (e) {
        console.log(e);
    }

    var stepValues = [], caloValues = [], distanceValues = [];

    try {
        for (const dataSet of stepArray) {
            for (const points of dataSet.dataset) {
                for (const steps of points.point) {
                    const start_time = new Date(steps.startTimeNanos / 1000000);
                    const end_time = new Date(steps.endTimeNanos / 1000000)
                    stepValues.push({
                        "start_time": start_time.toLocaleDateString(),
                        "end_time": end_time.toLocaleDateString(),
                        "steps_value": steps.value[0].intVal
                    })
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    try {
        for (const dataSet of caloArray) {
            for (const points of dataSet.dataset) {
                for (const steps of points.point) {
                    const start_time = new Date(steps.startTimeNanos / 1000000);
                    const end_time = new Date(steps.endTimeNanos / 1000000)
                    caloValues.push({
                        "start_time": start_time.toLocaleDateString(),
                        "end_time": end_time.toLocaleDateString(),
                        "calories_value": steps.value[0].fpVal
                    })
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    try {
        for (const dataSet of distanceArray) {
            for (const points of dataSet.dataset) {
                for (const steps of points.point) {
                    const start_time = new Date(steps.startTimeNanos / 1000000);
                    const end_time = new Date(steps.endTimeNanos / 1000000)
                    distanceValues.push({
                        "start_time": start_time.toLocaleDateString(),
                        "end_time": end_time.toLocaleDateString(),
                        "distances_value": steps.value[0].fpVal
                    })
                }
            }
        }
    } catch (e) {
        console.log(e);
    }

    res.status(200).send({
        step: stepValues,
        calo: caloValues,
        distance: distanceValues
    })
}

const getUserGoogleFitData = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing Username Value")
        else {
            const user = await firestore.collection("google_fit_data")
                .where("username", "==", req.params.username)
                .get();

            if (user.empty) res.send("Not Found Data");
            else {
                var id;
                user.forEach(doc => {
                    id = doc.id
                })

                const snapshot = await firestore.collection("google_fit_data").doc(id);
                res.send(snapshot);
            }
        }
    } catch (e) {
        console.log(e);
    }
}

const createGoogleFitData = async (req, res, next) => {
    try {
        if (req.body.username === undefined) res.send("Missing Username Value")
        else {
            const user = await firestore.collection("google_fit_data")
                .where("username", "==", req.body.username)
                .get();

            if (user.empty) {
                await firestore.collection("google_fit_data").add({
                    username: req.body.username,
                    data: req.body.data
                });
            }
            else {
                var id;
                user.forEach(doc => {id = doc.id;});

                await firestore.collection("google_fit_data").doc(id).update({
                    username: req.body.username,
                    data: req.body.data
                });
            }

            res.send('<script> window.close() </script>');
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    getGoogleFitData,
    getGoogleFitDataReturn,
    getUserGoogleFitData,
    createGoogleFitData
}