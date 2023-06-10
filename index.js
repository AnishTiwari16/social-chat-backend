const bodyParser = require('body-parser');
const express = require('express');
const app = express();
require('dotenv').config();
require('./db');
require('./models/User');
const authRoutes = require('./routes/authRouter');
const port = process.env.PORT || 4000;
app.use(bodyParser.json());
app.use(authRoutes);
app.listen(port, () => {
    console.log('listening on port', port);
});
