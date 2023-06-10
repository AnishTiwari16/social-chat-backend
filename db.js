const mongoose = require('mongoose');
require('dotenv').config();

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log('connection successfull to db');
    })
    .catch((err) => {
        console.log('error connecting to db', err);
    });
