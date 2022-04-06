'use strict';

const firebase = require('firebase');
const firestore = require('../configure/firestore');
const randtoken = require('rand-token');
const nodemailer = require('nodemailer');
const path = require('path');

function sendEmail(from, subject, html, email, token, displayName, verifiedLink) {
    var from = from;
    var subject = subject;
    var html = html;
    var email = email;
    var token = token;
    var displayName = displayName;
    var verifiedLink = verifiedLink;

    var mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your email id
            pass: process.env.GMAIL_PASS // Your password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: from,
        to: email,
        subject: subject,
        html: html
    };

    mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            return 1
        } else {
            return 0
        }
    });
}

const sendEmailVerifed = async (req, res, next) => {
    try {
        if (req.body.email === undefined) res.send('Missing email value');
        else if (!req.body.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) res.send("Email doesn't match instruction");
        else {
            var email = req.body.email;

            const user = await firestore.collection('users')
                .where('email', '==', email)
                .get();

            const user_verified = await firestore.collection('users')
                .where('email', '==', email)
                .where('verified', '==', true)
                .get();

            var type = 'Success';
            var msg = 'Email already verified';

            if (user.empty) res.send("User doesn't exist");
            else {
                if (user_verified.empty) {
                    var token = randtoken.generate(20);
                    var displayName, verifiedLink, id, from, subject, html;

                    user.forEach(doc => {
                        displayName = doc.data().name;
                        id = doc.id;
                    });

                    verifiedLink = `http://localhost:8080/api/verify_email?token=`;
                    from = 'Email Verification';
                    subject = `Verify your email for Fitness Mall`;
                    html = `<p> Hello ${displayName}, </p>
                            <p> Follow this link to verify your email address. </p>
                            <p> <a href="${verifiedLink + token}"> ${verifiedLink + token} </a> </p>
                            <p> If you didn't ask to verify this address, you can ignore this email. </p>
                            <p> Thanks, </p>
                            <p> Your Fitness Mall team </p>`;

                    var sent = sendEmail(from, subject, html, email, token, displayName, verifiedLink);
                    if (sent != '0') {
                        var data = {
                            token: token,
                            expired: new Date(+new Date() + 30 * 60 * 1000)
                        }
                        await firestore.collection('users').doc(id).update({
                            verified_inform: data
                        });
                        type = 'Success';
                        msg = 'The verification link has been sent to your email address. Please verify within 30 minutes';
                    } else {
                        type = 'Error';
                        msg = 'Something goes to wrong. Please try again';

                    }
                }
                res.send({ type: type, msg: msg });
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const verifiedEmail = async (req, res, next) => {
    try {
        if (req.query.token === undefined)
            res.send("Missing token value");
        else {
            const token = await firestore.collection('users')
                .where('verified_inform.token', '==', req.query.token)
                .get();

            var expired, id;
            console.log(req.query.token);

            token.forEach(doc => {
                expired = +new Date((doc.data().verified_inform.expired).toDate());
                id = doc.id;
            })


            if (+new Date() > expired) res.sendFile(path.resolve('templates/email_failed.html'));
            else {
                await firestore.collection('users').doc(id).update({
                    verified: true,
                    verified_inform: firebase.firestore.FieldValue.delete()
                });
                res.sendFile(path.resolve('templates/email_success.html'));
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    sendEmailVerifed,
    verifiedEmail
}