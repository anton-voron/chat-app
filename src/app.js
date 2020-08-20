
const express = require('express');
const path = require('path');
const publicRouter = require('./routers/public');
const app = express();

const publicPath = path.join(__dirname, '../public');
app.use(publicRouter);

module.exports = app;