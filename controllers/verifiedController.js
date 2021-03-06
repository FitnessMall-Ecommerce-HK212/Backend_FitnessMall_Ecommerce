'use strict';

const firebase = require('firebase');
const firestore = require('../configure/firestore');
const randtoken = require('rand-token');
const nodemailer = require('nodemailer');
const path = require('path');
const User = require('../models/users');

async function sendEmail(from, subject, html, email) {
    var from = from;
    var subject = subject;
    var html = html;
    var email = email;

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

    const result = await mail.sendMail(mailOptions);

    if (result.messageId !== undefined) {
        return 1;
    } else {
        return result;
    }
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

                    verifiedLink = `${process.env.HOST_URL}api/verify_email?token=`;
                    from = 'Email Verification <noreply@gmail.com>';
                    subject = `X??c th???c email cho Fitness Mall`;
                    html = `<p> Xin ch??o ${displayName}, </p>
                            <p> Nh???n v??o li??n k???t n??y ????? x??c th???c email c???a b???n. </p>
                            <p> <a href="${verifiedLink + token}"> ${verifiedLink + token} </a> </p>
                            <p> N???u b???n kh??ng y??u c???u x??c th???c, b???n c?? th??? b??? qua email n??y. </p>
                            <p> Tr??n tr???ng, </p>
                            <p> ?????i ng?? Fitness Mall </p>`;

                    var sent = await sendEmail(from, subject, html, email, token, displayName);
                    if (sent === 1) {
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
                        msg = sent;
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

            if (token.empty) res.sendFile(path.resolve('pages/email_already_verified.html'));
            else {
                token.forEach(doc => {
                    expired = +new Date((doc.data().verified_inform.expired).toDate());
                    id = doc.id;
                })


                if (+new Date() > expired) res.sendFile(path.resolve('pages/email_failed.html'));
                else {
                    await firestore.collection('users').doc(id).update({
                        verified: true,
                        verified_inform: firebase.firestore.FieldValue.delete()
                    });
                    res.sendFile(path.resolve('pages/email_success.html'));
                }
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}
const changeUserPass = async (req, res, next) => {
    try {
        if (req.body.username === undefined || req.body.username ==='') res.send('Missing username value');
        else {
            const user = await firestore.collection('users')
                .where("username", "==", req.body.username)
                .get();

            var id, password;

            user.forEach((doc) => {
                id = doc.id;
                password = doc.data().password;
            });

            await firestore.collection('users').doc(id).update(req.body);
            res.send('Update password successfully');
            
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}
const sendEmailChangePassword = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing Username Value");
        else {
            const user = await firestore.collection("users").where("username", "==", req.params.username).get();

            if (user.empty) res.send("User doesn't exists!");
            else {
                var userInform;

                user.forEach(doc => {
                    const data = doc.data();
                    userInform = new User(
                        doc.id,
                        data.username,
                        data.pwd,
                        data.name,
                        data.avatar,
                        data.role,
                        data.date,
                        data.nation,
                        data.sex,
                        data.phone,
                        data.height,
                        data.weiht,
                        data.email
                    );
                });

                const verifiedCode = Math.floor(Math.random() * 1000000);

                await firestore.collection("users").doc(userInform.id).update({
                    changePasswordCode: verifiedCode
                });

                var from, subject, html, email;

                from = 'Password Reset <noreply@gmail.com>';
                subject = `?????t l???i m???t kh???u cho Fitness Mall`;
                email = userInform.email;
                html = `<p> Xin ch??o ${userInform.name}, </p>
                            <p> Nh???p m?? d?????i ????y ????? ?????t l???i m???t kh???u Fitness Mall cho t??i kho???n ${email} c???a b???n. </p>
                            <p> M?? ????? ?????t l???i m???t kh???u l?? ${verifiedCode}. </p>
                            <p> N???u b???n kh??ng y??u c???u ?????t l???i m???t kh???u, vui l??ng b??? qua email n??y. </p>
                            <p> Tr??n tr???ng, </p>
                            <p> ?????i ng?? Fitness </p>`;

                var sent = sendEmail(from, subject, html, email);
                if (sent != '0') {
                    res.send('The verification code has been sent to your email address. Please get your code within 30 minutes');
                } else {
                    res.send('Something goes to wrong. Please try again');
                }
            }

        }
    } catch (e) {
        res.status(400).send(e.message);
    }
}

const getCode = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing Username Value");
        else if (req.query.code === undefined) res.send("Missing Code Value");
        else {
            const code = await firestore.collection("users").where("username", "==", req.params.username)
                .where("changePasswordCode", "==", parseInt(req.query.code)).get();

            if (code.empty) res.send({ check: false, msg: "Wrong Code" });
            else res.send({ check: true, msg: "Match Code" });
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = {
    sendEmailVerifed,
    verifiedEmail,changeUserPass,
    sendEmailChangePassword,
    getCode,
    sendEmail
}