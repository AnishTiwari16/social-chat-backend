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

router.post('/verify', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(422).json({ error: 'Please enter email' });
    } else {
        User.findOne({ email: email }).then(async (savedUser) => {
            if (savedUser) {
                return res.status(422).send({ error: 'Invalid Credentials' });
            }
            try {
                let VerificationCode = Math.floor(
                    100000 + Math.random() * 900000
                );
                await mailer(email, VerificationCode);

                return res.status(200).send({
                    message: 'Verification code sent to your email',
                    VerificationCode,
                    email,
                });
            } catch (err) {
                return res.status(422).send({ error: 'Error sending email' });
            }
        });
    }
});
router.post('/changeusername', (req, res) => {
    const { username } = req.body;
    User.find({ username }).then(async (savedUsername) => {
        if (savedUsername.length > 0) {
            return res.status(422).send({ error: 'Username already exists' });
        } else {
            return res
                .status(200)
                .send({ message: 'Username available', username });
        }
    });
});
router.post('/signup', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return res.status(422).send({ error: 'Please enter all the fields' });
    } else {
        const user = new User({ username, email, password });
        try {
            await user.save();
            //save the user to the db
            const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
            return res.status(200).send({message: 'User registered successfully', token})
        } catch (err) {
            return res.status(422).send({error: err})
        }
    }
});
module.exports = router;
