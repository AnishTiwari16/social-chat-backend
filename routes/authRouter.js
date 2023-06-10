const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');

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

                return res
                    .status(200)
                    .send({
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

module.exports = router;
