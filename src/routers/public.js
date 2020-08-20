const express = require('express');
const path = require('path');
const router = express.Router();

const publicPath = path.join(__dirname, '../../public');
router.use(express.static(publicPath));
// router.get('/', (req, res) => {
//     const filePath = '/index.html';
//     res.sendFile(filePath)
// });

module.exports = router;
