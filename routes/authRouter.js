const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');

async function mailer(recieveremail, code) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.NodeMailer_Email,
            pass: process.env.NodeMailer_Password,
        },
    });

    let info = await transporter.sendMail({
        from: 'Social Chat',
        to: `${recieveremail}`,
        subject: 'Social Chat Email Verification',
        text: `Your Verification Code is ${code}`,
        html: `<b>Your Verification Code is ${code}</b>`,
    });

    console.log(info);
}
router.get('/test', (req, res) => {
    res.send('testing is working fine, LGTM');
});
router.post('/verify', (req, res) => {
    const { email, screen } = req.body;
    if (!email) {
        return res
            .status(422)
            .send({ error: true, message: 'Please enter email' });
    } else {
        User.findOne({ email: email }).then(async (savedUser) => {
            if (savedUser && screen === 'verifyOtp') {
                return res
                    .status(422)
                    .send({ error: true, message: 'Email already registered' });
            }
            try {
                let VerificationCode = Math.floor(
                    100000 + Math.random() * 900000
                );
                await mailer(email, VerificationCode); //wait here

                return res.status(200).send({
                    error: false,
                    VerificationCode,
                    email,
                });
            } catch (err) {
                return res.status(422).send({
                    error: true,
                    message: 'Please enter valid email address',
                });
            }
        });
    }
});
router.post('/verifyfp', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res
            .status(422)
            .send({ error: true, message: 'Please enter email' });
    } else {
        User.findOne({ email: email }).then(async (savedUser) => {
            if (savedUser) {
                try {
                    let VerificationCode = Math.floor(
                        100000 + Math.random() * 900000
                    );
                    await mailer(email, VerificationCode); //wait here

                    return res.status(200).send({
                        error: false,
                        VerificationCode,
                        email,
                    });
                } catch (err) {
                    return res.status(422).send({
                        error: true,
                        message: 'Please enter valid email address',
                    });
                }
            } else {
                return res
                    .status(422)
                    .send({ error: true, message: 'Invalid credentials' });
            }
        });
    }
});
router.post('/checkusername', (req, res) => {
    const { email, username } = req.body;
    if (!username) {
        return res
            .status(422)
            .send({ error: true, message: 'Please enter username' });
    }
    User.find({ username }).then(async (savedUsername) => {
        if (savedUsername.length > 0) {
            return res
                .status(422)
                .send({ error: true, message: 'Username already exists' });
        } else {
            return res.status(200).send({ email, username });
        }
    });
});
router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;

    const user = new User({ username, email, password });
    try {
        await user.save();
        //save the user to the db
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        return res
            .status(200)
            .send({ message: 'Registration successfull', token });
    } catch (err) {
        return res.status(422).send({ error: err });
    }
});
module.exports = router;
